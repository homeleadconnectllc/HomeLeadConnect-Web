/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { getContractor, listContractors } from "../../api/contractors";
import {
  createCommunityPost, createCommunityReview, createReferral, createReport,
  listCommunityPosts, listCommunityReviews, listCompletedJobs, listProviderAvailability,
  listReferrals, listReports, listSavedProviderIds, listServiceAreas, resolveReport,
  saveProviderAvailability, saveServiceArea, setProviderSaved,
  type CommunityPost,
} from "../../api/ecosystemRecords";
import {
  createCommunityGroup, createProviderService, createResidentProperty,
  getSystemHealth, getWorkspaceAnalytics, listCommunityGroups, listOwnerAttention,
  listProviderServices, listResidentProperties, listWorkspaceTeam,
} from "../../api/ecosystemExtra";
import { errorMessage } from "../../lib/errorMessage";
import type { Contractor } from "../../lib/types/database";

export type LaunchSurfaceKey =
  | "network" | "map" | "profiles" | "providers" | "matching"
  | "community" | "discussions" | "reviews" | "referrals" | "events"
  | "moderation" | "groups" | "help" | "tutorials" | "rules"
  | "serviceAreas" | "availability" | "saved" | "providerDetail"
  | "properties" | "team" | "services" | "analytics" | "approvals" | "systemHealth";

const titles: Record<LaunchSurfaceKey, string> = {
  network:"HLC Network", map:"Provider map & list", profiles:"Participant profiles", providers:"Provider directory",
  matching:"Matching & eligibility", community:"HLC Community", discussions:"Community discussions",
  reviews:"Completion-linked reviews", referrals:"Referrals", events:"Events & updates", moderation:"Community moderation",
  groups:"Community groups", help:"Help Center", tutorials:"Tutorials", rules:"Rules & safety",
  serviceAreas:"Provider service areas", availability:"Provider availability", saved:"Saved providers",
  providerDetail:"Provider profile", properties:"My properties", team:"Team & permissions", services:"Provider services",
  analytics:"Workspace analytics", approvals:"Owner attention & approvals", systemHealth:"System health",
};

export default function LaunchSurface({ page }: { page: LaunchSurfaceKey }) {
  return <main style={pageStyle}>
    <header style={heroStyle}>
      <h1 style={{ margin: 0 }}>{titles[page]}</h1>
    </header>
    <Surface page={page} />
  </main>;
}

function Surface({ page }: { page: LaunchSurfaceKey }) {
  if (page === "community" || page === "discussions" || page === "events") {
    return <Posts kind={page === "events" ? "event" : page === "discussions" ? "discussion" : undefined} />;
  }
  if (page === "reviews") return <Reviews />;
  if (page === "referrals") return <Referrals />;
  if (page === "moderation") return <Moderation />;
  if (page === "groups") return <Groups />;
  if (page === "properties") return <Properties />;
  if (page === "team") return <Team />;
  if (page === "services") return <Services />;
  if (page === "analytics") return <Analytics />;
  if (page === "approvals") return <Approvals />;
  if (page === "systemHealth") return <SystemHealth />;
  if (["network","map","profiles","providers","matching","serviceAreas","availability","saved","providerDetail"].includes(page)) {
    return <ProviderSurface page={page} />;
  }
  return <Reference page={page} />;
}

function Posts({ kind }: { kind?: CommunityPost["kind"] }) {
  const [items,setItems]=useState<CommunityPost[]>([]);
  const [title,setTitle]=useState(""); const [body,setBody]=useState(""); const [eventAt,setEventAt]=useState("");
  const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  const chosen = kind ?? "discussion";
  async function load(){ try { setItems(await listCommunityPosts(kind)); } catch (e) { setError(errorMessage(e,"Unable to load Community.")); } }
  useEffect(()=>{ void load(); },[kind]);
  async function submit(e:FormEvent){ e.preventDefault(); setBusy(true); setError(""); try { await createCommunityPost({kind:chosen,title,body,eventAt:eventAt||undefined}); setTitle("");setBody("");setEventAt(""); await load(); } catch(r){setError(errorMessage(r,"Unable to publish."));} finally{setBusy(false);} }
  return <>
    <form onSubmit={submit} style={cardStyle}><h2>Publish {chosen}</h2>
      <label>Title<input required maxLength={160} value={title} onChange={e=>setTitle(e.target.value)}/></label>
      <label>Body<textarea required maxLength={5000} rows={5} value={body} onChange={e=>setBody(e.target.value)}/></label>
      {chosen === "event" && <label>Date and time<input type="datetime-local" required value={eventAt} onChange={e=>setEventAt(e.target.value)}/></label>}
      <button disabled={busy}>{busy?"Publishing…":"Publish"}</button>{error&&<p role="alert">{error}</p>}
    </form>
    <section style={gridStyle}>{items.map(item=><article key={item.id} style={cardStyle}><small>{item.kind.toUpperCase()}</small><h2>{item.title}</h2><p>{item.body}</p>{item.event_at&&<p>{new Date(item.event_at).toLocaleString()}</p>}</article>)}{items.length===0&&<p>No Community items yet.</p>}</section>
  </>;
}

function Reviews(){
  const [reviews,setReviews]=useState<any[]>([]); const [jobs,setJobs]=useState<any[]>([]); const [jobId,setJobId]=useState(""); const [rating,setRating]=useState("5"); const [body,setBody]=useState(""); const [error,setError]=useState("");
  async function load(){try{const[r,j]=await Promise.all([listCommunityReviews(),listCompletedJobs()]);setReviews(r);setJobs(j);}catch(e){setError(errorMessage(e,"Unable to load reviews."));}}
  useEffect(()=>{void load();},[]);
  async function submit(e:FormEvent){e.preventDefault();try{await createCommunityReview({jobId,rating:Number(rating),body});setBody("");await load();}catch(r){setError(errorMessage(r,"Review requires an eligible completed HLC job."));}}
  return <><form onSubmit={submit} style={cardStyle}><h2>Write a verified review</h2><label>Completed job<select required value={jobId} onChange={e=>setJobId(e.target.value)}><option value="">Choose job</option>{jobs.map(j=><option key={j.id} value={j.id}>{j.name}</option>)}</select></label><label>Rating<select value={rating} onChange={e=>setRating(e.target.value)}>{[5,4,3,2,1].map(n=><option key={n}>{n}</option>)}</select></label><label>Review<textarea required rows={4} value={body} onChange={e=>setBody(e.target.value)}/></label><button>Publish review</button>{error&&<p role="alert">{error}</p>}</form><section style={gridStyle}>{reviews.map(r=><article key={r.id} style={cardStyle}><strong>{"★".repeat(r.rating)}</strong><p>{r.body}</p><small>Job {r.job_id}</small></article>)}{reviews.length===0&&<p>No eligible reviews yet.</p>}</section></>;
}

function Referrals(){const[items,setItems]=useState<any[]>([]);const[email,setEmail]=useState("");const[note,setNote]=useState("");const[error,setError]=useState("");async function load(){try{setItems(await listReferrals())}catch(e){setError(errorMessage(e,"Unable to load referrals."))}}useEffect(()=>{void load()},[]);async function submit(e:FormEvent){e.preventDefault();try{await createReferral(email,note);setEmail("");setNote("");await load()}catch(r){setError(errorMessage(r,"Unable to record referral."))}}return <><form onSubmit={submit} style={cardStyle}><h2>Record referral intent</h2><p>This records attribution only and does not automatically message or enroll another person.</p><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Note<textarea value={note} onChange={e=>setNote(e.target.value)}/></label><button>Record referral</button>{error&&<p role="alert">{error}</p>}</form><section style={cardStyle}>{items.map(x=><p key={x.id}><strong>{x.referred_email}</strong> · {x.status}</p>)}{items.length===0&&<p>No referrals recorded.</p>}</section></>}

function Moderation(){const[items,setItems]=useState<any[]>([]);const[postId,setPostId]=useState("");const[reason,setReason]=useState("");const[error,setError]=useState("");async function load(){try{setItems(await listReports())}catch(e){setError(errorMessage(e,"Moderation queue is restricted."))}}useEffect(()=>{void load()},[]);async function submit(e:FormEvent){e.preventDefault();try{await createReport({postId,reason});setPostId("");setReason("");await load()}catch(r){setError(errorMessage(r,"Unable to submit report."))}}async function close(id:string,status:"resolved"|"dismissed"){try{await resolveReport(id,status);await load()}catch(r){setError(errorMessage(r,"Only an authorized workspace owner may resolve reports."))}}return <><form onSubmit={submit} style={cardStyle}><h2>Report Community content</h2><label>Post ID<input required value={postId} onChange={e=>setPostId(e.target.value)}/></label><label>Reason<textarea required value={reason} onChange={e=>setReason(e.target.value)}/></label><button>Submit report</button>{error&&<p role="alert">{error}</p>}</form><section style={gridStyle}>{items.map(x=><article key={x.id} style={cardStyle}><strong>{x.status}</strong><p>{x.reason}</p>{x.status==="open"&&<div style={rowStyle}><button onClick={()=>void close(x.id,"resolved")}>Resolve</button><button onClick={()=>void close(x.id,"dismissed")}>Dismiss</button></div>}</article>)}{items.length===0&&<p>No reports visible.</p>}</section></>}

function Groups(){const[items,setItems]=useState<any[]>([]);const[name,setName]=useState("");const[description,setDescription]=useState("");const[error,setError]=useState("");async function load(){try{setItems(await listCommunityGroups())}catch(e){setError(errorMessage(e,"Unable to load groups."))}}useEffect(()=>{void load()},[]);async function submit(e:FormEvent){e.preventDefault();try{await createCommunityGroup(name,description);setName("");setDescription("");await load()}catch(r){setError(errorMessage(r,"Unable to create group."))}}return <><form onSubmit={submit} style={cardStyle}><h2>Create group</h2><label>Name<input required value={name} onChange={e=>setName(e.target.value)}/></label><label>Description<textarea value={description} onChange={e=>setDescription(e.target.value)}/></label><button>Create</button>{error&&<p role="alert">{error}</p>}</form><section style={gridStyle}>{items.map(g=><article key={g.id} style={cardStyle}><h2>{g.name}</h2><p>{g.description||"No description."}</p></article>)}{items.length===0&&<p>No groups yet.</p>}</section></>}

function Properties(){const[items,setItems]=useState<any[]>([]);const[form,setForm]=useState({label:"",address:"",city:"",state:"PA",zip:""});const[error,setError]=useState("");async function load(){try{setItems(await listResidentProperties())}catch(e){setError(errorMessage(e,"Unable to load properties."))}}useEffect(()=>{void load()},[]);async function submit(e:FormEvent){e.preventDefault();try{await createResidentProperty(form);setForm({label:"",address:"",city:"",state:"PA",zip:""});await load()}catch(r){setError(errorMessage(r,"Unable to save property."))}}return <><form onSubmit={submit} style={cardStyle}><h2>Add property/service location</h2><label>Label<input required value={form.label} onChange={e=>setForm({...form,label:e.target.value})}/></label><label>Address<input value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></label><label>City<input value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/></label><label>State<input value={form.state} onChange={e=>setForm({...form,state:e.target.value})}/></label><label>ZIP<input value={form.zip} onChange={e=>setForm({...form,zip:e.target.value})}/></label><button>Save property</button>{error&&<p role="alert">{error}</p>}</form><section style={gridStyle}>{items.map(p=><article key={p.id} style={cardStyle}><h2>{p.label}</h2><p>{[p.address,p.city,p.state,p.zip].filter(Boolean).join(", ")||"Address not provided"}</p></article>)}{items.length===0&&<p>No properties saved.</p>}</section></>}

function Team(){const[items,setItems]=useState<any[]>([]);const[error,setError]=useState("");useEffect(()=>{void listWorkspaceTeam().then(setItems).catch(e=>setError(errorMessage(e,"Unable to load team.")))},[]);return <section style={gridStyle}>{error&&<p role="alert">{error}</p>}{items.map(p=><article key={p.user_id} style={cardStyle}><h2>{p.full_name||"Unnamed member"}</h2><p><strong>Role:</strong> {p.role}</p><p>Onboarding: {p.onboarding_completed?"complete":"in progress"}</p></article>)}{items.length===0&&!error&&<p>No authorized team profiles.</p>}</section>}

function Services(){const[providers,setProviders]=useState<Contractor[]>([]);const[items,setItems]=useState<any[]>([]);const[contractorId,setContractorId]=useState("");const[name,setName]=useState("");const[error,setError]=useState("");async function load(){try{const[p,s]=await Promise.all([listContractors({}),listProviderServices()]);setProviders(p);setItems(s)}catch(e){setError(errorMessage(e,"Unable to load provider services."))}}useEffect(()=>{void load()},[]);async function submit(e:FormEvent){e.preventDefault();try{await createProviderService(Number(contractorId),name);setName("");await load()}catch(r){setError(errorMessage(r,"Unable to save provider service."))}}return <><form onSubmit={submit} style={cardStyle}><h2>Add service capability</h2><label>Provider<select required value={contractorId} onChange={e=>setContractorId(e.target.value)}><option value="">Choose</option>{providers.map(p=><option key={p.id} value={p.id}>{p.company_name||p.contact_name||p.id}</option>)}</select></label><label>Service<input required value={name} onChange={e=>setName(e.target.value)}/></label><button>Save service</button>{error&&<p role="alert">{error}</p>}</form><section style={cardStyle}>{items.map(s=><p key={s.id}>{s.service_name} · provider {s.contractor_id}</p>)}{items.length===0&&<p>No service capabilities recorded.</p>}</section></>}

function Analytics(){const[data,setData]=useState<Record<string,number>|null>(null);const[error,setError]=useState("");useEffect(()=>{void getWorkspaceAnalytics().then(setData).catch(e=>setError(errorMessage(e,"Unable to load analytics.")))},[]);if(error)return <p role="alert">{error}</p>;if(!data)return <p role="status">Loading analytics…</p>;return <section style={gridStyle}>{Object.entries(data).map(([key,value])=><article key={key} style={cardStyle}><strong style={{fontSize:32}}>{value}</strong><p>{key}</p></article>)}</section>}
function Approvals(){const[items,setItems]=useState<any[]>([]);const[error,setError]=useState("");useEffect(()=>{void listOwnerAttention().then(setItems).catch(e=>setError(errorMessage(e,"Owner attention is restricted.")))},[]);return <section style={gridStyle}>{error&&<p role="alert">{error}</p>}{items.map(x=><article key={x.id} style={cardStyle}><strong>{x.status}</strong><p>{x.reason}</p><small>{x.related_entity_type||"system"} {x.related_entity_id||""}</small></article>)}{items.length===0&&!error&&<p>No owner-attention items.</p>}</section>}
function SystemHealth(){const[data,setData]=useState<any>(null);const[error,setError]=useState("");useEffect(()=>{void getSystemHealth().then(setData).catch(e=>setError(errorMessage(e,"Unable to read system health.")))},[]);if(error)return <p role="alert">{error}</p>;if(!data)return <p role="status">Loading health…</p>;return <section style={gridStyle}><article style={cardStyle}><h2>Communications</h2>{data.providers.map((p:any,i:number)=><p key={i}>{p.provider_name} · {p.channel} · <strong>{p.status}</strong></p>)}{data.providers.length===0&&<p>No provider connections recorded.</p>}</article><article style={cardStyle}><h2>Subscription</h2><p>{data.subscription?.status||"not configured"}</p></article><article style={cardStyle}><h2>Notifications</h2><p>{data.notificationCount} records</p></article><article style={cardStyle}><h2>Recent AI runs</h2><p>{data.recentAgentRuns.length} recorded</p></article></section>}

type ServiceAreaDraft = { city: string; state: string; zip: string; radiusMiles: string };

function ProviderSurface({page}:{page:LaunchSurfaceKey}){
  const {providerId}=useParams(); const[providers,setProviders]=useState<Contractor[]>([]); const[areas,setAreas]=useState<any[]>([]); const[availability,setAvailability]=useState<any[]>([]); const[saved,setSaved]=useState<Set<number>>(new Set()); const[detail,setDetail]=useState<Contractor|null>(null); const[error,setError]=useState(""); const[areaDrafts,setAreaDrafts]=useState<Record<number,ServiceAreaDraft>>({});
  async function load(){try{const[p,a,v,s]=await Promise.all([listContractors({}),listServiceAreas(),listProviderAvailability(),listSavedProviderIds()]);setProviders(p);setAreas(a);setAvailability(v);setSaved(s)}catch(e){setError(errorMessage(e,"Unable to load provider network."))}}
  useEffect(()=>{void load();if(page==="providerDetail"&&providerId){void getContractor(Number(providerId)).then(setDetail).catch(e=>setError(errorMessage(e,"Provider not found."))) }},[page,providerId]);
  const visible=useMemo(()=>page==="saved"?providers.filter(p=>saved.has(p.id)):providers,[page,providers,saved]);
  function areaDraft(provider:Contractor):ServiceAreaDraft{return areaDrafts[provider.id]??{city:provider.city||"",state:provider.state||"",zip:provider.zip||"",radiusMiles:""}}
  function updateAreaDraft(provider:Contractor,field:keyof ServiceAreaDraft,value:string){setAreaDrafts(current=>({...current,[provider.id]:{...areaDraft(provider),...current[provider.id],[field]:value}}))}
  async function toggle(id:number){try{await setProviderSaved(id,!saved.has(id));await load()}catch(r){setError(errorMessage(r,"Unable to update saved provider."))}}
  async function addArea(provider:Contractor){const draft=areaDraft(provider);if(!draft.city.trim()&&!draft.state.trim()&&!draft.zip.trim()){setError("Enter a city, state, or ZIP before saving a service area.");return}const radius=draft.radiusMiles.trim()?Number(draft.radiusMiles):undefined;if(radius!==undefined&&(!Number.isFinite(radius)||radius<=0)){setError("Radius must be a positive number of miles.");return}try{setError("");await saveServiceArea({contractorId:provider.id,city:draft.city,state:draft.state,zip:draft.zip,radiusMiles:radius});await load()}catch(r){setError(errorMessage(r,"Unable to save service area."))}}
  async function setAvail(id:number,available:boolean){try{setError("");await saveProviderAvailability({contractorId:id,available,note:available?"Available":"Unavailable"});await load()}catch(r){setError(errorMessage(r,"Unable to update availability."))}}
  if(page==="providerDetail") return <>{error&&<p role="alert">{error}</p>}{detail?<article style={cardStyle}><h2>{detail.company_name||detail.contact_name||`Provider ${detail.id}`}</h2><p>{detail.specialty||"Trade not recorded"}</p><p>{[detail.city,detail.state,detail.zip].filter(Boolean).join(", ")||"Location not recorded"}</p><p>Status: {detail.status||"not recorded"}</p>{detail.phone&&<a href={`tel:${detail.phone}`}>Call provider</a>}{detail.email&&<a href={`mailto:${detail.email}`}>Email provider</a>}</article>:!error&&<p>Loading provider…</p>}</>;
  return <>
    <div style={rowStyle}><Link to="/network/service-areas">Service areas</Link><Link to="/network/availability">Availability</Link><Link to="/network/saved">Saved</Link><Link to="/contractor-portal/services">Services</Link></div>
    {error&&<p role="alert">{error}</p>}
    <section style={gridStyle}>
      {visible.map(p=>{
        const providerAreas=areas.filter((x:any)=>x.contractor_id===p.id); const av=availability.find((x:any)=>x.contractor_id===p.id); const place=[p.city,p.state,p.zip].filter(Boolean).join(", "); const availabilityLabel=av?(av.available?"available":"unavailable"):"not declared"; const draft=areaDraft(p);
        return <article key={p.id} style={cardStyle}><h2><Link to={`/providers/${p.id}`}>{p.company_name||p.contact_name||`Provider ${p.id}`}</Link></h2><p>{p.specialty||"Trade not recorded"}</p><p>{place||"Location not recorded"}</p><p>Availability: {availabilityLabel}</p>{providerAreas.map((x:any)=><small key={x.id}>Area: {[x.city,x.state,x.zip].filter(Boolean).join(", ")||"unspecified"}{x.radius_miles?` · ${x.radius_miles} mi`:""}</small>)}{page==="serviceAreas"&&<div style={territoryStyle}><strong>Add service territory</strong><label>City<input value={draft.city} onChange={e=>updateAreaDraft(p,"city",e.target.value)}/></label><label>State<input value={draft.state} maxLength={32} onChange={e=>updateAreaDraft(p,"state",e.target.value)}/></label><label>ZIP<input value={draft.zip} inputMode="numeric" onChange={e=>updateAreaDraft(p,"zip",e.target.value)}/></label><label>Radius miles<input type="number" min="1" step="1" value={draft.radiusMiles} onChange={e=>updateAreaDraft(p,"radiusMiles",e.target.value)}/></label><button type="button" onClick={()=>void addArea(p)}>Save service area</button></div>}<div style={rowStyle}><button type="button" onClick={()=>void toggle(p.id)}>{saved.has(p.id)?"Unsave":"Save"}</button>{page==="availability"&&<button type="button" onClick={()=>void setAvail(p.id,!av?.available)}>{av?.available?"Mark unavailable":"Mark available"}</button>}{page==="map"&&place&&<a target="_blank" rel="noreferrer" href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(place)}`}>Open map</a>}</div></article>;
      })}
      {visible.length===0&&!error&&<p>No provider records match this view.</p>}
    </section>
    {page==="matching"&&<section style={cardStyle}><h2>Matching</h2><p>Review service area and availability, then choose the provider you want to contact or offer work to.</p><Link to="/jobs">Continue to jobs and offers →</Link></section>}
  </>;
}

function Reference({page}:{page:LaunchSurfaceKey}){const copy:Record<string,string[]>={help:["Residents: requests, portals, appointments, messages and privacy.","Professionals: applications, profiles, offers, jobs, documents and subscriptions.","Workspace teams: CRM, LeadScope, Call Center, agents, permissions and recovery."],tutorials:["Resident: request service → portal → appointment → job → review/referral.","Professional: profile → services/areas → offer → assignment → schedule → completion.","Operator: lead → LeadScope → job → provider → appointment → follow-up."],rules:["Keep tenant and private data inside authorized workspace/portal boundaries.","Communication requires consent and suppression checks before automated delivery.","AI agents respect capability and approval gates.","Community prohibits fraud, harassment, fabricated reviews and private-data disclosure."]};return <section style={gridStyle}>{(copy[page]||[]).map((text,i)=><article key={i} style={cardStyle}><p>{text}</p></article>)}</section>}

const pageStyle={width:"min(1120px,calc(100% - 32px))",margin:"40px auto",display:"grid",gap:20};
const heroStyle={display:"grid",gap:10,padding:"clamp(22px,5vw,40px)",borderRadius:22,color:"#f8fafc",background:"linear-gradient(135deg,#081426,#12365f)"};
const gridStyle={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,260px),1fr))",gap:14};
const cardStyle={display:"grid",gap:10,padding:20,border:"1px solid #cbd5e1",borderRadius:16,background:"#fff",lineHeight:1.55};
const rowStyle={display:"flex",flexWrap:"wrap" as const,gap:10,alignItems:"center"};
const territoryStyle={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10,padding:"12px 0",borderTop:"1px solid #e2e8f0",borderBottom:"1px solid #e2e8f0"};
