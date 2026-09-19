import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PublicSiteNav from "../components/PublicSiteNav";
import "../styles/public-owner-visual-final-20260918.css";
import { trackAnalyticsEvent } from "../api/analytics";
import { submitServiceRequest } from "../api/publicIntake";
import { errorMessage } from "../lib/errorMessage";

type ResidentType = "Renter" | "Homeowner" | "Property manager" | "Other";

const serviceLabels: Record<string, string> = {
  repairs: "Repairs",
  painting: "Painting",
  roofing: "Roofing",
  hvac: "HVAC",
  cleaning: "Cleaning",
  moving: "Moving",
  "general-home-help": "General Home Help",
};

export default function RequestService() {
  const [searchParams] = useSearchParams();
  const selectedService = serviceLabels[searchParams.get("service") || ""] || "";
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    residentType: "Renter" as ResidentType,
    projectDetails: selectedService ? `Service category: ${selectedService}\n` : "",
    honeypot: "",
  });
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
      const { residentType, ...requestFields } = form;
      const result = await submitServiceRequest({
        requestId,
        ...requestFields,
        projectDetails: `[Resident type: ${residentType}]\n${form.projectDetails.trim()}`,
      });
      if (!result?.accepted) throw new Error("The request could not be accepted.");
      trackAnalyticsEvent("service_request_submitted");
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch (reason) {
      setError(errorMessage(reason, "Unable to submit your request."));
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return <>
      <PublicSiteNav />
      <main className="hlc-request-complete">
        <section className="hlc-request-complete-card" aria-live="polite">
          <div className="hlc-request-complete-icon" aria-hidden="true">✓</div>
          <p className="hlc-request-kicker">REQUEST RECEIVED</p>
          <h1>You’re done for now.</h1>
          <p className="hlc-request-complete-lead">HomeLead Connect received your service request. You do not need to submit anything else right now.</p>
          <div className="hlc-request-next">
            <strong>What happens next</strong>
            <span>We’ll review your request and use the contact information you provided to reach you about the next step.</span>
          </div>
          <p className="hlc-request-note">A provider, price, or appointment is not confirmed until HomeLead Connect contacts you and confirms it.</p>
          <div className="hlc-request-actions">
            <Link to="/" className="hlc-request-primary">Back to HomeLead Connect</Link>
            <Link to="/contact" className="hlc-request-secondary">I need help</Link>
          </div>
        </section>
      </main>
    </>;
  }

  return <>
    <PublicSiteNav />
    <main className="hlc-request-service">
      <section className="hlc-request-intro" aria-labelledby="request-service-title">
        <p className="hlc-request-kicker">SERVICE REQUEST</p>
        <h1 id="request-service-title">Start your request</h1>
        <p>Tell us what you need and how to reach you. We’ll contact you about the next step.</p>
      </section>

      <section className="hlc-request-grid">
        <div id="request-form" className="hlc-request-form-card">

          {error && <p role="alert" className="hlc-request-error">{error}</p>}

          <form onSubmit={submit}>
            <label className="hlc-request-trap" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" name="website" value={form.honeypot} onChange={(e) => setForm({ ...form, honeypot: e.target.value })} /></label>
            <label><span>Full name <b>Required</b></span><input required minLength={2} autoComplete="name" placeholder="Your name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></label>
            <label><span>Best phone number <b>Required</b></span><input required type="tel" autoComplete="tel" placeholder="(717) 555-0123" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
            <label><span>Resident / customer type <b>Required</b></span><select value={form.residentType} onChange={(e) => setForm({ ...form, residentType: e.target.value as ResidentType })}><option>Renter</option><option>Homeowner</option><option>Property manager</option><option>Other</option></select></label>
            <label><span>Email <em>Optional</em></span><input type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label><span>What home service or project do you need? <b>Required</b></span><textarea required minLength={10} rows={6} placeholder="Describe the repair, move, cleaning, HVAC issue, project, timing, or anything else that would help us understand what you need." value={form.projectDetails} onChange={(e) => setForm({ ...form, projectDetails: e.target.value })} /></label>
            <div className="hlc-request-privacy"><strong>What happens after you send this</strong><span>Your request goes to HomeLead Connect for review. We’ll contact you using the information above. You are not enrolling in marketing messages.</span></div>
            <button disabled={busy} type="submit">{busy ? "Sending request…" : "Next Step →"}</button>
          </form>
        </div>

        <aside className="hlc-request-aside">
          <p className="hlc-request-kicker">CLEAR NEXT STEPS</p>
          <h2>Send one request. Then you’re done for now.</h2>
          <p>After you submit, HomeLead Connect reviews the request and contacts you about provider coordination or scheduling when appropriate.</p>
          <ul><li>Renters are welcome.</li><li>No marketing enrollment.</li><li>No provider or appointment is promised before confirmation.</li></ul>
          <Link to="/contact">Need help? Contact HomeLead Connect →</Link>
          <small className="hlc-request-photo-credit">Harrisburg skyline: J. Passepartout / CC BY-SA 4.0</small>
        </aside>
      </section>
    </main>
  </>;
}

