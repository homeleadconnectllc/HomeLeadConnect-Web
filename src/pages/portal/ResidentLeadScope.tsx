import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { listResidentProperties, type ResidentProperty } from "../../api/ecosystemExtra";
import {
  createLeadScopeProject,
  hasResidentLeadScopeEntitlement,
  listLeadScopeProjects,
  updateLeadScopeProject,
  type LeadScopeProject,
  type SaveLeadScopeProjectInput,
} from "../../api/leadscope";
import { calculateEvidenceQuality, createEvidence, type EvidenceState } from "../../lib/leadscope/domain";
import { calculateResidentEstimateRange, measurementUnitLabel, type LeadScopeMeasurementUnit } from "../../lib/leadscope/estimate";
import { errorMessage } from "../../lib/errorMessage";

const evidenceOptions: Array<{ value: EvidenceState; label: string }> = [
  { value: "known", label: "Known / measured" },
  { value: "assumption", label: "Assumption" },
  { value: "unknown", label: "Unknown" },
  { value: "unverifiable", label: "Unable to verify" },
];

const emptyForm = {
  propertyId: "",
  title: "",
  projectType: "",
  unit: "sq_ft" as LeadScopeMeasurementUnit,
  quantity: "",
  measurementState: "known" as EvidenceState,
  measurementSource: "resident entry",
  measurementNote: "",
  siteConditions: "",
  siteState: "known" as EvidenceState,
  siteSource: "resident observation",
  siteNote: "",
  scopeDescription: "",
  scopeState: "known" as EvidenceState,
  scopeSource: "resident description",
  scopeNote: "",
  rateLow: "",
  rateHigh: "",
  currency: "USD",
};

function formatMoney(value: number, currency: string) {
  const code = currency.trim().toUpperCase();
  try { return new Intl.NumberFormat(undefined, { style: "currency", currency: code }).format(value); }
  catch { return `${value.toFixed(2)} ${code || "currency"}`; }
}

export default function ResidentLeadScope() {
  const [entitled, setEntitled] = useState<boolean | null>(null);
  const [properties, setProperties] = useState<ResidentProperty[]>([]);
  const [projects, setProjects] = useState<LeadScopeProject[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [allowed, propertyRows, projectRows] = await Promise.all([
        hasResidentLeadScopeEntitlement(),
        listResidentProperties(),
        listLeadScopeProjects(),
      ]);
      setEntitled(allowed);
      setProperties(propertyRows);
      setProjects(projectRows);
      setForm((current) => current.propertyId || !propertyRows[0] ? current : { ...current, propertyId: propertyRows[0].id });
    } catch (reason) {
      setError(errorMessage(reason, "Unable to load LeadScope."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const quantity = Number(form.quantity);
  const rateLow = Number(form.rateLow);
  const rateHigh = Number(form.rateHigh);
  const canEstimate = (form.measurementState === "known" || form.measurementState === "assumption")
    && Number.isFinite(quantity) && quantity > 0
    && form.rateLow !== "" && form.rateHigh !== "";

  const range = useMemo(() => {
    if (!canEstimate) return null;
    try { return calculateResidentEstimateRange({ quantity, rateLow, rateHigh }); } catch { return null; }
  }, [canEstimate, quantity, rateLow, rateHigh]);

  const quality = useMemo(() => calculateEvidenceQuality([
    createEvidence(form.measurementState === "known" || form.measurementState === "assumption" ? { quantity } : null, form.measurementState),
    createEvidence(form.siteState === "known" || form.siteState === "assumption" ? form.siteConditions.trim() || "Not described" : null, form.siteState),
    createEvidence(form.scopeState === "known" || form.scopeState === "assumption" ? form.scopeDescription.trim() || "Not described" : null, form.scopeState),
  ]), [form.measurementState, form.siteConditions, form.siteState, form.scopeDescription, form.scopeState, quantity]);

  function openProject(project: LeadScopeProject) {
    setSelectedId(project.id);
    setForm({
      propertyId: project.property_id,
      title: project.title,
      projectType: project.project_type,
      unit: project.measurement_unit,
      quantity: project.measurements?.quantity != null ? String(project.measurements.quantity) : "",
      measurementState: project.measurements_state,
      measurementSource: project.measurements_source ?? "",
      measurementNote: project.measurements_note ?? "",
      siteConditions: project.site_conditions ?? "",
      siteState: project.site_conditions_state,
      siteSource: project.site_conditions_source ?? "",
      siteNote: project.site_conditions_note ?? "",
      scopeDescription: project.scope_description ?? "",
      scopeState: project.scope_description_state,
      scopeSource: project.scope_description_source ?? "",
      scopeNote: project.scope_description_note ?? "",
      rateLow: project.estimate_rate_low != null ? String(project.estimate_rate_low) : "",
      rateHigh: project.estimate_rate_high != null ? String(project.estimate_rate_high) : "",
      currency: project.estimate_currency?.toUpperCase() || "USD",
    });
    setMessage("Saved LeadScope project reopened.");
  }

  function newProject() {
    setSelectedId("");
    setForm({ ...emptyForm, propertyId: properties[0]?.id ?? "" });
    setMessage("");
    setError("");
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!entitled) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const hasMeasurement = form.measurementState === "known" || form.measurementState === "assumption";
      const hasSite = form.siteState === "known" || form.siteState === "assumption";
      const hasScope = form.scopeState === "known" || form.scopeState === "assumption";
      const currency = form.currency.trim().toUpperCase();
      if (!/^[A-Z]{3}$/.test(currency)) throw new Error("Enter a three-letter ISO currency code such as USD, CAD, EUR, or GBP.");
      if (hasMeasurement && (!Number.isFinite(quantity) || quantity <= 0)) throw new Error("Enter a project quantity greater than zero or mark the measurement unknown/unverifiable.");
      let estimate = null;
      if (form.rateLow !== "" || form.rateHigh !== "") {
        if (!hasMeasurement) throw new Error("A cost range cannot be calculated while measurements are unknown or unverifiable.");
        estimate = calculateResidentEstimateRange({ quantity, rateLow, rateHigh });
      }
      const input: SaveLeadScopeProjectInput = {
        property_id: form.propertyId,
        title: form.title.trim(),
        project_type: form.projectType.trim(),
        measurement_unit: form.unit,
        measurements: hasMeasurement ? { quantity } : null,
        measurements_state: form.measurementState,
        measurements_source: form.measurementSource.trim() || null,
        measurements_note: form.measurementNote.trim() || null,
        site_conditions: hasSite ? form.siteConditions.trim() || "Not described" : null,
        site_conditions_state: form.siteState,
        site_conditions_source: form.siteSource.trim() || null,
        site_conditions_note: form.siteNote.trim() || null,
        scope_description: hasScope ? form.scopeDescription.trim() || "Not described" : null,
        scope_description_state: form.scopeState,
        scope_description_source: form.scopeSource.trim() || null,
        scope_description_note: form.scopeNote.trim() || null,
        estimate_rate_low: estimate ? rateLow : null,
        estimate_rate_high: estimate ? rateHigh : null,
        estimate_low: estimate?.low ?? null,
        estimate_high: estimate?.high ?? null,
        estimate_currency: currency.toLowerCase(),
        estimate_method: estimate?.method ?? null,
        status: "saved",
      };
      const saved = selectedId ? await updateLeadScopeProject(selectedId, input) : await createLeadScopeProject(input);
      setSelectedId(saved.id);
      await load();
      setMessage("LeadScope project saved.");
    } catch (reason) {
      setError(errorMessage(reason, "Unable to save LeadScope project."));
    } finally { setBusy(false); }
  }

  if (loading) return <main className="hlc-portal-workspace is-resident"><p role="status">Loading LeadScope…</p></main>;

  return <main className="hlc-portal-workspace is-resident">
    <header className="hlc-portal-header"><div><p className="hlc-account-kicker">RESIDENT · LEADSCOPE</p><h1>Measure, review, and save a project estimate</h1><p>LeadScope keeps your measurements, assumptions, and unknowns visible. It does not replace an on-site inspection or a binding professional quote.</p></div><div className="hlc-portal-summary"><span><strong>{projects.length}</strong><small>Saved projects</small></span><span><strong>{Math.round(quality.knownRatio * 100)}%</strong><small>Known evidence</small></span></div></header>
    <nav aria-label="Resident LeadScope actions" className="hlc-portal-actions"><Link to="/homeowner-portal">Resident portal</Link><Link to="/homeowner-portal/properties">Properties</Link><button type="button" onClick={newProject}>New LeadScope project</button></nav>
    {error && <p role="alert" className="hlc-account-status is-error">{error}</p>}{message && <p role="status" className="hlc-account-status is-success">{message}</p>}

    {entitled === false ? <section className="hlc-portal-project"><div className="hlc-account-section-head"><div><span>RESIDENT PLUS</span><h2>LeadScope requires a premium capability entitlement</h2></div></div><p>Your resident account remains fully usable for requests, appointments, jobs, Messages, documents, payments, reviews, referrals, and Resources. LeadScope is the separate premium project-estimating capability.</p><p>Resident Plus enrollment and pricing are not being invented here. Access stays closed until HomeLead Connect has a valid LeadScope entitlement for this account.</p><div className="hlc-portal-actions"><Link to="/homeowner-portal">Return to resident portal</Link></div></section> : <>
      {!properties.length ? <section className="hlc-portal-project"><h2>Add a property first</h2><p>LeadScope attaches projects to your existing resident property record instead of creating a duplicate property identity.</p><Link to="/homeowner-portal/properties">Open Properties</Link></section> : <form className="hlc-portal-project" onSubmit={save}>
        <div className="hlc-account-section-head"><div><span>{selectedId ? "REOPENED PROJECT" : "NEW PROJECT"}</span><h2>Project facts & evidence</h2></div></div>
        <label>Property<select required value={form.propertyId} onChange={(event)=>setForm({...form,propertyId:event.target.value})}>{properties.map((property)=><option key={property.id} value={property.id}>{property.label}</option>)}</select></label>
        <label>Project name<input required maxLength={160} value={form.title} onChange={(event)=>setForm({...form,title:event.target.value})} placeholder="Kitchen floor, bedroom paint, fence…" /></label>
        <label>Project type<input required maxLength={120} value={form.projectType} onChange={(event)=>setForm({...form,projectType:event.target.value})} placeholder="Flooring, painting, roofing…" /></label>

        <div className="hlc-portal-subsection"><h3>Measurement evidence</h3><p>Use your phone or measuring tool to gather dimensions, then enter the resulting project quantity. LeadScope records whether that number is measured, assumed, unknown, or unverifiable.</p>
          <label>Evidence state<select value={form.measurementState} onChange={(event)=>setForm({...form,measurementState:event.target.value as EvidenceState})}>{evidenceOptions.map((option)=><option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          {(form.measurementState === "known" || form.measurementState === "assumption") && <><label>Project quantity<input required type="number" min="0.01" step="0.01" value={form.quantity} onChange={(event)=>setForm({...form,quantity:event.target.value})} /></label><label>Unit<select value={form.unit} onChange={(event)=>setForm({...form,unit:event.target.value as LeadScopeMeasurementUnit})}><option value="sq_ft">Square feet</option><option value="linear_ft">Linear feet</option><option value="each">Items</option><option value="custom">Custom units</option></select></label></>}
          <label>Measurement source<input value={form.measurementSource} onChange={(event)=>setForm({...form,measurementSource:event.target.value})} placeholder="Tape measure, phone reference, plan…" /></label><label>Measurement note<textarea rows={2} value={form.measurementNote} onChange={(event)=>setForm({...form,measurementNote:event.target.value})} /></label>
        </div>

        <div className="hlc-portal-subsection"><h3>Project scope</h3><label>Scope evidence state<select value={form.scopeState} onChange={(event)=>setForm({...form,scopeState:event.target.value as EvidenceState})}>{evidenceOptions.map((option)=><option key={option.value} value={option.value}>{option.label}</option>)}</select></label>{(form.scopeState === "known" || form.scopeState === "assumption") && <label>What work are you considering?<textarea required rows={4} value={form.scopeDescription} onChange={(event)=>setForm({...form,scopeDescription:event.target.value})} /></label>}<label>Scope source<input value={form.scopeSource} onChange={(event)=>setForm({...form,scopeSource:event.target.value})} /></label><label>Scope note<textarea rows={2} value={form.scopeNote} onChange={(event)=>setForm({...form,scopeNote:event.target.value})} /></label></div>

        <div className="hlc-portal-subsection"><h3>Site conditions</h3><label>Site evidence state<select value={form.siteState} onChange={(event)=>setForm({...form,siteState:event.target.value as EvidenceState})}>{evidenceOptions.map((option)=><option key={option.value} value={option.value}>{option.label}</option>)}</select></label>{(form.siteState === "known" || form.siteState === "assumption") && <label>Conditions that may affect the work<textarea rows={3} value={form.siteConditions} onChange={(event)=>setForm({...form,siteConditions:event.target.value})} /></label>}<label>Site source<input value={form.siteSource} onChange={(event)=>setForm({...form,siteSource:event.target.value})} /></label><label>Site note<textarea rows={2} value={form.siteNote} onChange={(event)=>setForm({...form,siteNote:event.target.value})} /></label></div>

        <div className="hlc-portal-subsection"><h3>Informational self-estimate</h3><p>HomeLead Connect does not invent market pricing here. Enter the low and high cost-per-{measurementUnitLabel(form.unit)} assumptions you want LeadScope to use. The result is arithmetic from your assumptions, not contractor pricing.</p><label>Currency code<input required maxLength={3} pattern="[A-Za-z]{3}" value={form.currency} onChange={(event)=>setForm({...form,currency:event.target.value.toUpperCase()})} aria-describedby="leadscope-currency-help" /></label><p id="leadscope-currency-help">Use the three-letter currency for your project, such as USD, CAD, EUR, or GBP.</p><label>Low rate assumption<input type="number" min="0" step="0.01" value={form.rateLow} onChange={(event)=>setForm({...form,rateLow:event.target.value})} /></label><label>High rate assumption<input type="number" min="0" step="0.01" value={form.rateHigh} onChange={(event)=>setForm({...form,rateHigh:event.target.value})} /></label>{range && <article className="hlc-portal-row"><div><strong>{formatMoney(range.low, form.currency)} – {formatMoney(range.high, form.currency)}</strong><span>Informational range based only on {quantity} {measurementUnitLabel(form.unit)} × your entered rate assumptions.</span><p>Not a quote, offer, guaranteed project cost, or substitute for professional inspection and pricing.</p></div></article>}</div>

        <button disabled={busy || !form.propertyId || !form.title.trim() || !form.projectType.trim()} type="submit">{busy ? "Saving…" : "Save LeadScope project"}</button>
      </form>}

      <section className="hlc-portal-project"><div className="hlc-account-section-head"><div><span>SAVED RESULTS</span><h2>Your LeadScope projects</h2></div><strong>{projects.length}</strong></div>{!projects.length ? <p>No saved LeadScope projects yet.</p> : projects.map((project)=><article className="hlc-portal-row" key={project.id}><div><strong>{project.title}</strong><span>{project.project_type} · {project.measurements?.quantity ?? "Quantity unavailable"} {project.measurements ? measurementUnitLabel(project.measurement_unit) : ""}</span>{project.estimate_low != null && project.estimate_high != null ? <p>Saved informational range: {formatMoney(project.estimate_low, project.estimate_currency)} – {formatMoney(project.estimate_high, project.estimate_currency)}</p> : <p>No cost range saved.</p>}<small>Updated {new Date(project.updated_at).toLocaleString()}</small></div><button type="button" onClick={()=>openProject(project)}>Reopen</button></article>)}</section>
    </>}
  </main>;
}
