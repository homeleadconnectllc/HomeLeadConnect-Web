import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { getPortalIdentityProfile, savePortalIdentityProfile, type PortalParticipantType } from "../../api/portalIdentity";
import { errorMessage } from "../../lib/errorMessage";

const participantOptions: Array<{ value: PortalParticipantType; label: string }> = [
  { value: "homeowner", label: "Homeowner" },
  { value: "renter", label: "Renter" },
  { value: "mover", label: "Mover / moving customer" },
  { value: "community_member", label: "Community member" },
];

export default function ResidentProfile() {
  const [form, setForm] = useState({
    participantType: "homeowner" as PortalParticipantType,
    fullName: "",
    avatarUrl: "",
    phone: "",
    preferredContact: "" as "email" | "phone" | "sms" | "",
    language: "en",
    accessibilityNotes: "",
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    getPortalIdentityProfile()
      .then((profile) => {
        if (!active) return;
        setForm({
          participantType: profile.participant_type,
          fullName: profile.full_name || "",
          avatarUrl: profile.avatar_url || "",
          phone: profile.phone || "",
          preferredContact: profile.preferred_contact || "",
          language: profile.language || "en",
          accessibilityNotes: profile.accessibility_notes || "",
        });
      })
      .catch((reason: unknown) => { if (active) setError(errorMessage(reason, "Unable to load your resident profile.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    try {
      const saved = await savePortalIdentityProfile(form);
      setForm((current) => ({
        ...current,
        participantType: saved.participant_type,
        fullName: saved.full_name || "",
        avatarUrl: saved.avatar_url || "",
        phone: saved.phone || "",
        preferredContact: saved.preferred_contact || "",
        language: saved.language || "en",
        accessibilityNotes: saved.accessibility_notes || "",
      }));
      setMessage("Resident profile settings saved.");
    } catch (reason) {
      setError(errorMessage(reason, "Unable to save your resident profile."));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <main style={pageStyle}><p role="status">Loading your profile…</p></main>;

  return <main style={pageStyle}>
    <header style={heroStyle}>
      <p style={eyebrowStyle}>Resident identity and preferences</p>
      <h1 style={{ margin: 0 }}>My profile & settings</h1>
      <p style={{ marginBottom: 0 }}>Homeowner, renter and mover labels describe your HLC experience only. They never grant workspace, provider, billing or owner permissions.</p>
    </header>

    <nav aria-label="Resident portal sections" style={navStyle}>
      <Link to="/homeowner-portal">Overview</Link>
      <Link to="/homeowner-portal/requests">Requests</Link>
      <Link to="/homeowner-portal/appointments">Appointments</Link>
      <Link to="/homeowner-portal/jobs">Jobs</Link>
      <Link to="/messages">Messages</Link>
      <Link to="/homeowner-portal/documents">Documents</Link>
      <Link to="/homeowner-portal/profile" aria-current="page">Profile & settings</Link>
    </nav>

    {error && <p role="alert" style={errorStyle}>{error}</p>}
    {message && <p role="status" style={successStyle}>{message}</p>}

    <form onSubmit={submit} style={cardStyle}>
      <section style={identityRowStyle}>
        <div style={avatarFrameStyle}>
          {form.avatarUrl ? <img src={form.avatarUrl} alt="Your profile avatar" style={avatarStyle} /> : <span aria-hidden="true" style={avatarFallbackStyle}>{initials(form.fullName)}</span>}
        </div>
        <div><h2 style={{ margin: 0 }}>{form.fullName || "Your HLC profile"}</h2><p style={{ marginBottom: 0 }}>{participantOptions.find((option) => option.value === form.participantType)?.label}</p></div>
      </section>

      <label style={fieldStyle}>Profile type
        <select value={form.participantType} onChange={(event) => setForm({ ...form, participantType: event.target.value as PortalParticipantType })}>
          {participantOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
      <p style={boundaryStyle}><strong>Renter boundary:</strong> HLC preserves renter identity, request context, appointments and communications. Landlord/property-manager authorization, payer, repair approval, estimate visibility and completion authority are not inferred by this profile setting.</p>

      <label style={fieldStyle}>Full name<input autoComplete="name" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} /></label>
      <label style={fieldStyle}>Avatar URL<input type="url" value={form.avatarUrl} onChange={(event) => setForm({ ...form, avatarUrl: event.target.value })} placeholder="https://…" /></label>
      <label style={fieldStyle}>Phone<input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
      <label style={fieldStyle}>Preferred contact
        <select value={form.preferredContact} onChange={(event) => setForm({ ...form, preferredContact: event.target.value as typeof form.preferredContact })}>
          <option value="">No preference</option><option value="email">Email</option><option value="phone">Phone</option><option value="sms">SMS</option>
        </select>
      </label>
      <label style={fieldStyle}>Language<input value={form.language} onChange={(event) => setForm({ ...form, language: event.target.value })} /></label>
      <label style={fieldStyle}>Accessibility notes<textarea rows={4} value={form.accessibilityNotes} onChange={(event) => setForm({ ...form, accessibilityNotes: event.target.value })} /></label>
      <button type="submit" disabled={busy} style={primaryButtonStyle}>{busy ? "Saving…" : "Save profile & settings"}</button>
    </form>

    <section style={cardStyle}>
      <h2>Privacy and access boundary</h2>
      <p>Your profile preferences are self-owned. They do not alter portal invitations, workspace membership, provider access, billing authority, RLS, or service authorization.</p>
      <div style={navStyle}><Link to="/rules">Rules & safety</Link><Link to="/privacy">Privacy</Link><Link to="/contact">Contact HLC</Link></div>
    </section>
  </main>;
}

function initials(value: string) {
  const letters = value.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
  return letters || "HLC";
}

const pageStyle = { width: "min(900px, calc(100% - 32px))", margin: "40px auto", display: "grid", gap: 18 };
const heroStyle = { padding: "clamp(22px, 5vw, 40px)", borderRadius: 22, color: "#f8fafc", background: "linear-gradient(135deg,#081426,#12365f)" };
const eyebrowStyle = { margin: 0, color: "#60a5fa", fontWeight: 900, textTransform: "uppercase" as const, letterSpacing: ".04em" };
const navStyle = { display: "flex", flexWrap: "wrap" as const, gap: 14 };
const cardStyle = { display: "grid", gap: 14, padding: 20, border: "1px solid #cbd5e1", borderRadius: 16, background: "#fff" };
const fieldStyle = { display: "grid", gap: 6, fontWeight: 700 };
const identityRowStyle = { display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" as const };
const avatarFrameStyle = { width: 72, height: 72, borderRadius: 999, overflow: "hidden", border: "2px solid #cbd5e1", background: "#e2e8f0", display: "grid", placeItems: "center" };
const avatarStyle = { width: "100%", height: "100%", objectFit: "cover" as const };
const avatarFallbackStyle = { fontWeight: 900, color: "#334155" };
const boundaryStyle = { padding: 14, border: "1px solid #bfdbfe", borderRadius: 12, background: "#eff6ff", color: "#1e3a8a" };
const primaryButtonStyle = { minHeight: 44, width: "fit-content", padding: "10px 18px", borderRadius: 10, border: "1px solid #0f172a", background: "#0f172a", color: "#fff", fontWeight: 900 };
const errorStyle = { color: "#b91c1c", padding: 14, border: "1px solid #fecaca", borderRadius: 12 };
const successStyle = { color: "#166534", padding: 14, border: "1px solid #bbf7d0", borderRadius: 12 };
