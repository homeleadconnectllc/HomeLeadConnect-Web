import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { submitProfessionalApplication } from "../api/professionalApplications";
import { errorMessage } from "../lib/errorMessage";
import "../styles/public-premium.css";

export default function ProfessionalApplication() {
  const [requestId] = useState(() => crypto.randomUUID());
  const [form, setForm] = useState({
    organizationName: "", contactName: "", email: "", phone: "", tradeCategories: "",
    serviceTerritory: "", experienceSummary: "", communicationConsent: false, honeypot: "",
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

  if (submitted) return <main className="hlc-public-page hlc-public-success"><div className="hlc-public-shell">
    <header className="hlc-public-hero"><div className="hlc-public-brand"><img className="hlc-public-logo" src="/hlc-logo-final.png" alt="HomeLead Connect" /></div><p className="hlc-public-kicker">Professional network</p><h1>Application received.</h1><p className="hlc-public-hero-copy">Your professional application was saved for HomeLead Connect review. This confirmation is not approval, verification, an invitation, or an offer of work.</p><div className="hlc-public-actions"><Link className="hlc-public-primary" to="/professionals">Back to professional overview</Link><Link className="hlc-public-secondary" to="/contact">Contact HLC</Link></div></header>
  </div></main>;

  return <main className="hlc-public-page"><div className="hlc-public-shell">
    <header className="hlc-public-hero">
      <div className="hlc-public-brand"><img className="hlc-public-logo" src="/hlc-logo-final.png" alt="HomeLead Connect" /></div>
      <p className="hlc-public-kicker">Professional network</p>
      <h1>Bring your business into the HLC service network.</h1>
      <p className="hlc-public-hero-copy">Apply once as a business, contractor, subcontractor, or service trade. HomeLead Connect reviews each application before creating provider access.</p>
    </header>

    <section className="hlc-public-form-wrap">
      <aside className="hlc-public-sidecard">
        <p className="hlc-public-card-label" style={{ color: "#93c5fd" }}>What happens next</p>
        <h2>Review before access.</h2>
        <p>Submitting this application creates a review record. HLC does not silently approve providers, assign work, or promise opportunities.</p>
        <ul>
          <li>Tell us who you are and what you do.</li>
          <li>Define the territory you actually serve.</li>
          <li>Share relevant experience and qualifications.</li>
          <li>HLC reviews the application before provider access.</li>
        </ul>
        <p>Application contact permission is limited to this application and does not enroll you in unrelated marketing.</p>
      </aside>

      <div>
        {error && <p role="alert" className="hlc-public-alert">{error}</p>}
        <form onSubmit={submit} className="hlc-public-form">
          <label className="hlc-trap" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" name="company_website" value={form.honeypot} onChange={(event) => setForm({ ...form, honeypot: event.target.value })} /></label>
          <label>Organization or business name<input required minLength={2} maxLength={160} autoComplete="organization" value={form.organizationName} onChange={(event) => setForm({ ...form, organizationName: event.target.value })} /></label>
          <label>Primary contact<input required minLength={2} maxLength={160} autoComplete="name" value={form.contactName} onChange={(event) => setForm({ ...form, contactName: event.target.value })} /></label>
          <label>Email<input required type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label>Phone<input required type="tel" autoComplete="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
          <label>Trades or services<input required minLength={2} maxLength={500} placeholder="Painting, HVAC, cleaning, roofing…" value={form.tradeCategories} onChange={(event) => setForm({ ...form, tradeCategories: event.target.value })} /></label>
          <label>Service territory<input required minLength={2} maxLength={500} placeholder="Cities, ZIP codes, counties, or service radius" value={form.serviceTerritory} onChange={(event) => setForm({ ...form, serviceTerritory: event.target.value })} /></label>
          <label>Experience and qualifications<textarea required minLength={10} maxLength={4000} rows={6} value={form.experienceSummary} onChange={(event) => setForm({ ...form, experienceSummary: event.target.value })} /></label>
          <label className="hlc-public-consent"><input required type="checkbox" checked={form.communicationConsent} onChange={(event) => setForm({ ...form, communicationConsent: event.target.checked })} /><span>I agree that HomeLead Connect may contact me about this application. This does not consent to unrelated marketing.</span></label>
          <button disabled={busy} type="submit">{busy ? "Submitting application…" : "Submit professional application"}</button>
        </form>
      </div>
    </section>
  </div></main>;
}
