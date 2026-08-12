import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { getMyProfile, updateMyProfile } from "../../api/settings";
import { errorMessage } from "../../lib/errorMessage";

export default function MyProfile() {
  const [form, setForm] = useState({ fullName: "", avatarUrl: "", role: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    getMyProfile().then((profile) => setForm({ fullName: profile.full_name || "", avatarUrl: profile.avatar_url || "", role: profile.role }))
      .catch((reason: unknown) => setError(errorMessage(reason, "Unable to load your profile.")))
      .finally(() => setLoading(false));
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const profile = await updateMyProfile(form);
      setForm((current) => ({ ...current, fullName: profile.full_name || "", avatarUrl: profile.avatar_url || "" }));
      setMessage("Profile saved.");
    } catch (reason) { setError(errorMessage(reason, "Unable to save your profile.")); }
    finally { setBusy(false); }
  }

  if (loading) return <main style={pageStyle}><p role="status">Loading profile…</p></main>;
  return <main style={pageStyle}>
    <header style={heroStyle}><p style={eyebrowStyle}>One HLC identity</p><h1 style={{ margin: 0 }}>My profile</h1><p>Your authenticated identity is reused across every authorized workspace and portal. Role access comes from explicit relationships—not editable profile text.</p></header>
    {error && <p role="alert" style={errorStyle}>{error}</p>}{message && <p role="status" style={successStyle}>{message}</p>}
    <form onSubmit={submit} style={cardStyle}>
      <h2>Personal identity</h2>
      <label>Full name<input autoComplete="name" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })}/></label>
      <label>Avatar URL<input type="url" value={form.avatarUrl} onChange={(event) => setForm({ ...form, avatarUrl: event.target.value })}/></label>
      <p><strong>Current workspace role:</strong> {form.role}</p>
      <button disabled={busy}>{busy ? "Saving…" : "Save profile"}</button>
    </form>
    <section style={cardStyle}><h2>Profile boundaries</h2><p>Contact preferences, public/network visibility, accessibility preferences and participant-specific profile fields are not yet persisted. They remain disabled until reviewed schema and RLS are deployed.</p><div style={linksStyle}><Link to="/settings">Business and workspace settings</Link><Link to="/profiles">Participant profile model</Link><Link to="/rules">Privacy and safety rules</Link></div></section>
  </main>;
}

const pageStyle={width:"min(820px,calc(100% - 32px))",margin:"40px auto",display:"grid",gap:18};
const heroStyle={padding:"clamp(22px,5vw,40px)",borderRadius:20,color:"#f8fafc",background:"linear-gradient(135deg,#081426,#12365f)"};
const eyebrowStyle={margin:0,color:"#60a5fa",fontWeight:900,textTransform:"uppercase" as const};
const cardStyle={display:"grid",gap:12,padding:20,border:"1px solid #cbd5e1",borderRadius:16,background:"#fff"};
const linksStyle={display:"flex",flexWrap:"wrap" as const,gap:12}; const errorStyle={color:"#b91c1c"}; const successStyle={color:"#166534"};
