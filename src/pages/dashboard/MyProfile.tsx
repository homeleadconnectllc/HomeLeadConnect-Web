import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { getMyProfile, updateMyProfile } from "../../api/settings";
import { getParticipantPreferences, saveParticipantPreferences, type ParticipantPreferences } from "../../api/ecosystemRecords";
import { errorMessage } from "../../lib/errorMessage";

export default function MyProfile(){
 const[form,setForm]=useState({fullName:"",avatarUrl:"",role:""});
 const[prefs,setPrefs]=useState<ParticipantPreferences>({phone:null,preferred_contact:null,accessibility_notes:null,language:"en",network_visibility:"workspace"});
 const[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(""),[message,setMessage]=useState("");
 useEffect(()=>{Promise.all([getMyProfile(),getParticipantPreferences()]).then(([p,x])=>{setForm({fullName:p.full_name||"",avatarUrl:p.avatar_url||"",role:p.role});setPrefs(x)}).catch(r=>setError(errorMessage(r,"Unable to load your profile."))).finally(()=>setLoading(false))},[]);
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError("");setMessage("");try{const[p,x]=await Promise.all([updateMyProfile(form),saveParticipantPreferences(prefs)]);setForm(c=>({...c,fullName:p.full_name||"",avatarUrl:p.avatar_url||""}));setPrefs(x);setMessage("Profile and preferences saved.")}catch(r){setError(errorMessage(r,"Unable to save your profile."))}finally{setBusy(false)}}
 if(loading)return <main className="hlc-account-workspace"><p role="status">Loading profile…</p></main>;
 return <main className="hlc-account-workspace">
  <header className="hlc-account-header"><div><p className="hlc-account-kicker">ACCOUNT · PROFILE</p><h1>My profile</h1><p>Your authenticated identity, contact preferences, language preference, and visibility settings are reused across authorized HomeLead Connect surfaces. Workspace role remains server-controlled.</p></div><div className="hlc-account-summary"><span><strong>{form.role}</strong><small>Workspace role</small></span><span><strong>{prefs.language || "en"}</strong><small>Language preference</small></span><span><strong>{prefs.network_visibility}</strong><small>Visibility</small></span></div></header>
  {error&&<p role="alert" className="hlc-account-status is-error">{error}</p>}{message&&<p role="status" className="hlc-account-status is-success">{message}</p>}
  <div className="hlc-account-console">
   <form onSubmit={submit} className="hlc-account-form">
    <div className="hlc-account-section-head"><div><span>IDENTITY</span><h2>Profile & preferences</h2></div><small>Role is read-only</small></div>
    <div className="hlc-account-field-grid"><label>Full name<input autoComplete="name" value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})}/></label><label>Avatar URL<input type="url" value={form.avatarUrl} onChange={e=>setForm({...form,avatarUrl:e.target.value})}/></label><label>Phone<input type="tel" value={prefs.phone||""} onChange={e=>setPrefs({...prefs,phone:e.target.value||null})}/></label><label>Preferred contact<select value={prefs.preferred_contact||""} onChange={e=>setPrefs({...prefs,preferred_contact:e.target.value||null})}><option value="">No preference</option><option value="email">Email</option><option value="phone">Phone</option><option value="sms">SMS</option></select></label><label>Language preference<input aria-describedby="profile-language-note" value={prefs.language} onChange={e=>setPrefs({...prefs,language:e.target.value})}/></label><label>Network visibility<select value={prefs.network_visibility} onChange={e=>setPrefs({...prefs,network_visibility:e.target.value})}><option value="private">Private</option><option value="workspace">Workspace</option><option value="network">HomeLead Connect network</option></select></label><label className="is-wide">Accessibility notes<textarea rows={4} value={prefs.accessibility_notes||""} onChange={e=>setPrefs({...prefs,accessibility_notes:e.target.value||null})}/></label></div>
    <p id="profile-language-note" className="hlc-account-form-note">This saves your language preference. Interface translation and read-aloud availability are handled by the shared HomeLead Connect language and accessibility layer as those capabilities are connected.</p>
    <div className="hlc-account-form-actions"><span>Current workspace role: <strong>{form.role}</strong></span><button disabled={busy}>{busy?"Saving…":"Save profile"}</button></div>
   </form>
   <aside className="hlc-account-boundary"><span>AUTHORIZATION BOUNDARY</span><h2>Profile boundaries</h2><p>Visibility affects HomeLead Connect product presentation only; it never overrides workspace membership, portal links, RLS, or other authorization controls.</p><nav><Link to="/settings">Account settings</Link><Link to="/team">Team & workspace access</Link><Link to="/profiles">Participant directory</Link><Link to="/rules">Privacy and safety rules</Link></nav></aside>
  </div>
 </main>
}
