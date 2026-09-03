import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MATERIAL_STATES, RESOURCE_CATEGORIES, RESOURCE_TRUTH_BOUNDARY, SUPPLIER_RESOURCES, type MaterialState, type ResourceCategory } from "../../data/resourceCatalog";
import { loadResourceWorkspace, saveMaterialPlanItem, setResourceSaved, type MaterialPlanItem } from "../../lib/resourceData";

function titleCase(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }

export default function ResourcesWorkspace() {
  const { pathname } = useLocation();
  const mode = pathname.endsWith("/materials") ? "materials" : pathname.endsWith("/map") ? "map" : pathname.endsWith("/suppliers") ? "suppliers" : "home";
  const [category, setCategory] = useState<ResourceCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [materials, setMaterials] = useState<MaterialPlanItem[]>([]);
  const [runtime, setRuntime] = useState<"loading"|"ready"|"staged"|"saving">("loading");
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState({ name:"", category:"maintenance", quantity:"", state:"needed" as MaterialState, supplierId:"", notes:"" });

  async function refresh() {
    try { const data = await loadResourceWorkspace(); setSavedIds(data.saves.map((item) => item.resource_id)); setMaterials(data.materials); setRuntime("ready"); }
    catch { setRuntime("staged"); }
  }
  useEffect(() => {
    let active=true;
    void loadResourceWorkspace().then((data)=>{if(!active)return;setSavedIds(data.saves.map((item)=>item.resource_id));setMaterials(data.materials);setRuntime("ready");}).catch(()=>{if(active)setRuntime("staged");});
    return()=>{active=false;};
  }, []);

  const suppliers = useMemo(() => SUPPLIER_RESOURCES.filter((item) => {
    const categoryMatch = category === "all" || item.categories.includes(category);
    const search = `${item.name} ${item.summary} ${item.categories.join(" ")}`.toLowerCase();
    return categoryMatch && search.includes(query.trim().toLowerCase());
  }), [category, query]);

  async function toggleSave(id: string) {
    const saved = savedIds.includes(id); setRuntime("saving"); setMessage("");
    try { await setResourceSaved(id, !saved); await refresh(); setMessage(saved ? "Removed from saved resources." : "Saved to your sourcing workspace."); }
    catch { setRuntime("staged"); setMessage("Saved-resource persistence is staged on this protected branch and unavailable in this runtime."); }
  }

  async function addMaterial(event: React.FormEvent) {
    event.preventDefault(); setRuntime("saving"); setMessage("");
    try { await saveMaterialPlanItem({ name:draft.name.trim(), category:draft.category, quantity:draft.quantity ? Number(draft.quantity) : null, state:draft.state, supplierId:draft.supplierId || null, notes:draft.notes.trim() || null }); setDraft({name:"",category:"maintenance",quantity:"",state:"needed",supplierId:"",notes:""}); await refresh(); setMessage("Material plan item saved."); }
    catch { setRuntime("staged"); setMessage("Material persistence is staged on this protected branch and unavailable in this runtime."); }
  }

  return <main className="hlc-sourcing-workspace" data-live-price={String(RESOURCE_TRUTH_BOUNDARY.livePriceData)}>
    <header className="hlc-sourcing-hero"><div><p>DION SOURCING DESK</p><h1>{mode === "materials" ? "Material planning" : mode === "map" ? "Supplier map & routing" : mode === "suppliers" ? "Supplier discovery" : "Professional resources"}</h1><span>Use supplier research, material planning, routing, saved resources, forms, and the HomeLead Connect playbook without mixing external merchant information with verified platform data.</span></div><aside><strong>CHECK CURRENT DETAILS</strong><small>HomeLead Connect does not receive live merchant price or inventory data. Confirm specifications, price, stock, delivery, returns, and route details with the supplier.</small></aside></header>
    <nav className="hlc-sourcing-nav" aria-label="Resources navigation"><Link className={mode==="home"?"is-active":""} to="/resources">Resources</Link><Link to="/resources/playbook">Playbook & scripts</Link><Link className={mode==="suppliers"?"is-active":""} to="/resources/suppliers">Suppliers</Link><Link className={mode==="map"?"is-active":""} to="/resources/suppliers/map">Map & routing</Link><Link className={mode==="materials"?"is-active":""} to="/resources/materials">Materials</Link><Link to="/resources/forms">Forms</Link><Link to="/documents">Documents</Link></nav>

    {mode === "home" && <><section className="hlc-sourcing-categories">{RESOURCE_CATEGORIES.map((item) => <Link key={item.id} to={`/resources/suppliers?category=${item.id}`} onClick={() => setCategory(item.id)}><span>{item.label}</span><strong>{item.prompt}</strong><b>Explore resources →</b></Link>)}</section><section className="hlc-sourcing-dion"><div><p>DION GUIDANCE</p><h2>Build the sourcing trail before buying.</h2></div><ol><li>Define the work and specifications.</li><li>Compare legitimate supplier information.</li><li>Confirm current price and availability externally.</li><li>Track the chosen material state and evidence.</li><li>Attach receipts or photos to the authorized job or Documents.</li></ol></section></>}

    {(mode === "suppliers" || mode === "map") && <><section className="hlc-sourcing-filters"><label>Search suppliers<input type="search" value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search category or supplier"/></label><label>Project category<select value={category} onChange={(e)=>setCategory(e.target.value as ResourceCategory|"all")}><option value="all">All categories</option>{RESOURCE_CATEGORIES.map((item)=><option key={item.id} value={item.id}>{item.label}</option>)}</select></label></section>{mode === "map" && <section className="hlc-sourcing-map"><div><p>ROUTING VIEW</p><h2>Choose a supplier, then use its official locator.</h2><span>No location pin is shown without a verified address source. HomeLead Connect does not infer your precise location or rank locations.</span></div><strong>{suppliers.length} official locator paths</strong></section>}<section className="hlc-supplier-grid">{suppliers.map((item)=><article key={item.id}><header><span>{item.scope.toUpperCase()}</span><button type="button" onClick={()=>void toggleSave(item.id)} aria-pressed={savedIds.includes(item.id)}>{savedIds.includes(item.id)?"Saved":"Save"}</button></header><h2>{item.name}</h2><p>{item.summary}</p><div className="hlc-supplier-tags">{item.categories.map((tag)=><span key={tag}>{titleCase(tag)}</span>)}</div><small>Source: {item.evidence}</small><footer><a href={item.website} target="_blank" rel="noopener noreferrer">Check current price & availability ↗</a><a href={item.locator} target="_blank" rel="noopener noreferrer">{mode === "map" ? "Open official locator & routing ↗" : "Find official locations ↗"}</a></footer></article>)}</section></>}

    {mode === "materials" && <><section className="hlc-material-state"><p>AUTHORIZED MATERIAL STATE</p><div>{MATERIAL_STATES.map((state,index)=><span key={state}><b>{index+1}</b>{titleCase(state)}</span>)}</div></section><section className="hlc-material-layout"><form onSubmit={addMaterial}><h2>Add a project material</h2><label>Material name<input required maxLength={120} value={draft.name} onChange={(e)=>setDraft({...draft,name:e.target.value})}/></label><label>Category<select value={draft.category} onChange={(e)=>setDraft({...draft,category:e.target.value})}>{RESOURCE_CATEGORIES.map((item)=><option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label>Quantity<input inputMode="decimal" type="number" min="0" step="0.01" value={draft.quantity} onChange={(e)=>setDraft({...draft,quantity:e.target.value})}/></label><label>State<select value={draft.state} onChange={(e)=>setDraft({...draft,state:e.target.value as MaterialState})}>{MATERIAL_STATES.map((state)=><option key={state} value={state}>{titleCase(state)}</option>)}</select></label><label>Supplier<select value={draft.supplierId} onChange={(e)=>setDraft({...draft,supplierId:e.target.value})}><option value="">Not selected</option>{SUPPLIER_RESOURCES.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Notes<textarea maxLength={1000} rows={4} value={draft.notes} onChange={(e)=>setDraft({...draft,notes:e.target.value})}/></label><button disabled={runtime==="saving"}>{runtime==="saving"?"Saving…":"Save material"}</button></form><div className="hlc-material-list"><h2>Material plan</h2>{materials.map((item)=><article key={item.id}><header><strong>{item.name}</strong><span>{titleCase(item.state)}</span></header><p>{titleCase(item.category)}{item.quantity?` · Qty ${item.quantity}`:""}</p><small>{item.supplier_id?SUPPLIER_RESOURCES.find((supplier)=>supplier.id===item.supplier_id)?.name:"Supplier not selected"}{item.job_id?" · Linked job":" · No job link"}</small>{item.notes&&<p>{item.notes}</p>}</article>)}{!materials.length&&<p>No persisted material items yet.</p>}</div></section></>}
    {message && <p className="hlc-sourcing-message" role="status">{message}</p>}
  </main>;
}
