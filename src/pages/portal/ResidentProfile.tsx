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

  if (loading) return <main className="hlc-ui-page-79f12a"><p role="status">Loading your profile…</p></main>;

  return <main className="hlc-ui-page-79f12a">
    <header className="hlc-ui-hero-340ab8">
      <p className="hlc-ui-eyebrow-2aae40">Resident identity and preferences</p>
      <h1 className="hlc-ui-margin-ab79ea">My profile & settings</h1>
      <p className="hlc-ui-margin-bottom-fa769a">Homeowner, renter and mover labels describe your HLC experience only. They never grant workspace, provider, billing or owner permissions.</p>
    </header>

    <nav aria-label="Resident portal sections" className="hlc-ui-nav-c3daa7">
      <Link to="/homeowner-portal">Overview</Link>
      <Link to="/homeowner-portal/requests">Requests</Link>
      <Link to="/homeowner-portal/appointments">Appointments</Link>
      <Link to="/homeowner-portal/jobs">Jobs</Link>
      <Link to="/messages">Messages</Link>
      <Link to="/homeowner-portal/documents">Documents</Link>
      <Link to="/homeowner-portal/profile" aria-current="page">Profile & settings</Link>
    </nav>

    {error && <p role="alert" className="hlc-ui-error-260ca0">{error}</p>}
    {message && <p role="status" className="hlc-ui-success-a1fdef">{message}</p>}

    <form onSubmit={submit} className="hlc-ui-card-3215d5">
      <section className="hlc-ui-identityRow-7630fe">
        <div className="hlc-ui-avatarFrame-37272c">
          {form.avatarUrl ? <img src={form.avatarUrl} alt="Your profile avatar" className="hlc-ui-avatar-3f368a" /> : <span aria-hidden="true" className="hlc-ui-avatarFallback-10d813">{initials(form.fullName)}</span>}
        </div>
        <div><h2 className="hlc-ui-margin-ab79ea">{form.fullName || "Your HLC profile"}</h2><p className="hlc-ui-margin-bottom-fa769a">{participantOptions.find((option) => option.value === form.participantType)?.label}</p></div>
      </section>

      <label className="hlc-ui-field-082906">Profile type
        <select value={form.participantType} onChange={(event) => setForm({ ...form, participantType: event.target.value as PortalParticipantType })}>
          {participantOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
      <p className="hlc-ui-boundary-783431"><strong>Renter boundary:</strong> HLC preserves renter identity, request context, appointments and communications. Landlord/property-manager authorization, payer, repair approval, estimate visibility and completion authority are not inferred by this profile setting.</p>

      <label className="hlc-ui-field-082906">Full name<input autoComplete="name" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} /></label>
      <label className="hlc-ui-field-082906">Avatar URL<input type="url" value={form.avatarUrl} onChange={(event) => setForm({ ...form, avatarUrl: event.target.value })} placeholder="https://…" /></label>
      <label className="hlc-ui-field-082906">Phone<input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
      <label className="hlc-ui-field-082906">Preferred contact
        <select value={form.preferredContact} onChange={(event) => setForm({ ...form, preferredContact: event.target.value as typeof form.preferredContact })}>
          <option value="">No preference</option><option value="email">Email</option><option value="phone">Phone</option><option value="sms">SMS</option>
        </select>
      </label>
      <label className="hlc-ui-field-082906">Language<input value={form.language} onChange={(event) => setForm({ ...form, language: event.target.value })} /></label>
      <label className="hlc-ui-field-082906">Accessibility notes<textarea rows={4} value={form.accessibilityNotes} onChange={(event) => setForm({ ...form, accessibilityNotes: event.target.value })} /></label>
      <button type="submit" disabled={busy} className="hlc-ui-primaryButton-d28d3b">{busy ? "Saving…" : "Save profile & settings"}</button>
    </form>

    <section className="hlc-ui-card-3215d5">
      <h2>Privacy and access boundary</h2>
      <p>Your profile preferences are self-owned. They do not alter portal invitations, workspace membership, provider access, billing authority, RLS, or service authorization.</p>
      <div className="hlc-ui-nav-c3daa7"><Link to="/rules">Rules & safety</Link><Link to="/privacy">Privacy</Link><Link to="/contact">Contact HLC</Link></div>
    </section>
  </main>;
}

function initials(value: string) {
  const letters = value.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
  return letters || "HLC";
}
