import { useState, type FormEvent } from "react";
import { submitProfessionalApplication } from "../api/professionalApplications";
import { errorMessage } from "../lib/errorMessage";

export default function ProfessionalApplication() {
  const [requestId] = useState(() => crypto.randomUUID());
  const [form, setForm] = useState({
    organizationName: "", contactName: "", email: "", phone: "", tradeCategories: "",
    serviceTerritory: "", experienceSummary: "", communicationConsent: false,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await submitProfessionalApplication({ requestId, ...form });
      if (!result?.accepted) throw new Error("The application could not be accepted.");
      setSubmitted(true);
    } catch (reason) {
      setError(errorMessage(reason, "Unable to submit your application."));
    } finally {
      setBusy(false);
    }
  }

  if (submitted) return <main style={pageStyle}>
    <h1>Application received</h1>
    <p>Your professional application was saved for HomeLead Connect review.</p>
    <p>This confirmation is not approval, verification, an invitation, or an offer of work.</p>
  </main>;

  return <main style={pageStyle}>
    <h1>Professional application</h1>
    <p>Apply once as a business, contractor, subcontractor, or service trade. HomeLead Connect reviews each application before creating provider access.</p>
    {error && <p role="alert" style={errorStyle}>{error}</p>}
    <form onSubmit={submit} style={formStyle}>
      <label>Organization or business name<input required minLength={2} maxLength={160} autoComplete="organization" value={form.organizationName} onChange={(event) => setForm({ ...form, organizationName: event.target.value })} /></label>
      <label>Primary contact<input required minLength={2} maxLength={160} autoComplete="name" value={form.contactName} onChange={(event) => setForm({ ...form, contactName: event.target.value })} /></label>
      <label>Email<input required type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
      <label>Phone<input required type="tel" autoComplete="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
      <label>Trades or services<input required minLength={2} maxLength={500} value={form.tradeCategories} onChange={(event) => setForm({ ...form, tradeCategories: event.target.value })} /></label>
      <label>Service territory<input required minLength={2} maxLength={500} value={form.serviceTerritory} onChange={(event) => setForm({ ...form, serviceTerritory: event.target.value })} /></label>
      <label>Experience and qualifications<textarea required minLength={10} maxLength={4000} rows={6} value={form.experienceSummary} onChange={(event) => setForm({ ...form, experienceSummary: event.target.value })} /></label>
      <label style={consentStyle}><input required type="checkbox" checked={form.communicationConsent} onChange={(event) => setForm({ ...form, communicationConsent: event.target.checked })} /> I agree that HomeLead Connect may contact me about this application. This does not consent to unrelated marketing.</label>
      <button disabled={busy} type="submit">{busy ? "Submitting application…" : "Submit professional application"}</button>
    </form>
  </main>;
}

const pageStyle = { width: "min(760px, calc(100% - 32px))", margin: "40px auto" };
const formStyle = { display: "grid", gap: 14, padding: 22, border: "1px solid #cbd5e1", borderRadius: 16, background: "#fff" };
const consentStyle = { display: "flex", gap: 10, alignItems: "flex-start" };
const errorStyle = { color: "#b91c1c", padding: 14, border: "1px solid #fecaca", borderRadius: 12, background: "#fef2f2" };
