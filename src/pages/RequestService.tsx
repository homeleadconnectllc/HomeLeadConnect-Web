import { useState, type FormEvent } from "react";
import { trackAnalyticsEvent } from "../api/analytics";
import { submitServiceRequest } from "../api/publicIntake";
import { errorMessage } from "../lib/errorMessage";

export default function RequestService() {
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", projectDetails: "", honeypot: "" });
  const [requestId] = useState(() => crypto.randomUUID());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    trackAnalyticsEvent("service_request_started");
    setBusy(true);
    setError("");
    try {
      const result = await submitServiceRequest({ requestId, ...form });
      if (!result?.accepted) throw new Error("The request could not be accepted.");
      trackAnalyticsEvent("service_request_submitted");
      setSubmitted(true);
    } catch (reason) {
      setError(errorMessage(reason, "Unable to submit your request."));
    } finally {
      setBusy(false);
    }
  }

  if (submitted) return <main style={pageStyle}>
    <h1>Request received</h1>
    <p>Your service request was saved. HomeLead Connect can now review it in the CRM.</p>
    <p>This confirmation does not mean a provider has been assigned or an appointment has been scheduled.</p>
  </main>;

  return <main style={pageStyle}>
    <h1>Request home service</h1>
    <p>Tell HomeLead Connect what you need. Submitting this form creates a service request for review.</p>
    {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
    <form onSubmit={submit} style={formStyle}>
      <label style={trapStyle} aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" name="website" value={form.honeypot} onChange={(e) => setForm({ ...form, honeypot: e.target.value })} /></label>
      <label>Full name<input style={fieldStyle} required minLength={2} autoComplete="name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></label>
      <label>Best phone number<input style={fieldStyle} required type="tel" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
      <label>Email (optional)<input style={fieldStyle} type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <label>What home service or project do you need?<textarea style={fieldStyle} required minLength={10} rows={6} value={form.projectDetails} onChange={(e) => setForm({ ...form, projectDetails: e.target.value })} /></label>
      <p style={{ color: "#475569" }}>We will use your information to review and respond to this service request. This form does not enroll you in marketing messages.</p>
      <button disabled={busy} type="submit">{busy ? "Sending request…" : "Send request to HomeLead Connect"}</button>
    </form>
  </main>;
}

const pageStyle = { width: "min(700px, calc(100% - 32px))", margin: "40px auto", fontFamily: "system-ui, sans-serif" };
const formStyle = { display: "grid", gap: 14, padding: 20, border: "1px solid #e2e8f0", borderRadius: 14 };
const fieldStyle = { fontSize: 16, maxWidth: "100%" };
const trapStyle = { position: "absolute" as const, left: "-10000px", width: 1, height: 1, overflow: "hidden" };
