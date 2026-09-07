import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { trackAnalyticsEvent } from "../api/analytics";
import { submitServiceRequest } from "../api/publicIntake";
import { errorMessage } from "../lib/errorMessage";

type ResidentType = "Renter" | "Homeowner" | "Property manager" | "Other";

export default function RequestService() {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    residentType: "Renter" as ResidentType,
    projectDetails: "",
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
    return (
      <main className="hlc-request-complete">
        <style>{completionCss}</style>
        <section className="hlc-request-complete-card" aria-live="polite">
          <div className="hlc-request-complete-icon" aria-hidden="true">✓</div>
          <p className="hlc-request-kicker">REQUEST RECEIVED</p>
          <h1>You’re done for now.</h1>
          <p className="hlc-request-complete-lead">
            HomeLead Connect received your service request. You do not need to submit anything else right now.
          </p>
          <div className="hlc-request-next">
            <strong>What happens next</strong>
            <span>We’ll review your request and use the contact information you provided to reach you about the next step.</span>
          </div>
          <p className="hlc-request-note">
            A provider, price, or appointment is not confirmed until HomeLead Connect contacts you and confirms it.
          </p>
          <div className="hlc-request-actions">
            <Link to="/" className="hlc-request-primary">Back to HomeLead Connect</Link>
            <Link to="/contact" className="hlc-request-secondary">I need help</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="hlc-request-service">
      <style>{requestCss}</style>
      <section className="hlc-request-hero">
        <img src="/hlc-logo-transparent.png" alt="HomeLead Connect" />
        <p className="hlc-request-kicker">HOMELEAD CONNECT · SERVICE REQUEST</p>
        <h1>Tell us what your home needs.</h1>
        <p>Renters, homeowners, property managers, and everyday households can start with one request.</p>
        <a href="#request-form" className="hlc-request-primary">Start My Request ↓</a>
      </section>

      <section className="hlc-request-grid">
        <div id="request-form" className="hlc-request-form-card">
          <p className="hlc-request-kicker">SERVICE DETAILS</p>
          <h2>Start your request</h2>
          <p className="hlc-request-form-intro">Tell us what you need and how to reach you. We’ll contact you about the next step.</p>

          {error && <p role="alert" className="hlc-request-error">{error}</p>}

          <form onSubmit={submit}>
            <label className="hlc-request-trap" aria-hidden="true">
              Website
              <input tabIndex={-1} autoComplete="off" name="website" value={form.honeypot} onChange={(e) => setForm({ ...form, honeypot: e.target.value })} />
            </label>

            <label>
              <span>Full name <b>Required</b></span>
              <input required minLength={2} autoComplete="name" placeholder="Your name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </label>

            <label>
              <span>Best phone number <b>Required</b></span>
              <input required type="tel" autoComplete="tel" placeholder="(717) 555-0123" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </label>

            <label>
              <span>Resident / customer type <b>Required</b></span>
              <select value={form.residentType} onChange={(e) => setForm({ ...form, residentType: e.target.value as ResidentType })}>
                <option>Renter</option>
                <option>Homeowner</option>
                <option>Property manager</option>
                <option>Other</option>
              </select>
            </label>

            <label>
              <span>Email <em>Optional</em></span>
              <input type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>

            <label>
              <span>What home service or project do you need? <b>Required</b></span>
              <textarea required minLength={10} rows={6} placeholder="Describe the repair, move, cleaning, HVAC issue, project, timing, or anything else that would help us understand what you need." value={form.projectDetails} onChange={(e) => setForm({ ...form, projectDetails: e.target.value })} />
            </label>

            <div className="hlc-request-privacy">
              <strong>What happens after you send this</strong>
              <span>Your request goes to HomeLead Connect for review. We’ll contact you using the information above. You are not enrolling in marketing messages.</span>
            </div>

            <button disabled={busy} type="submit">
              {busy ? "Sending request…" : "Send My Request →"}
            </button>
          </form>
        </div>

        <aside className="hlc-request-aside">
          <p className="hlc-request-kicker">CLEAR NEXT STEPS</p>
          <h2>Send one request. Then you’re done for now.</h2>
          <p>After you submit, HomeLead Connect reviews the request and contacts you about provider coordination or scheduling when appropriate.</p>
          <ul>
            <li>Renters are welcome.</li>
            <li>No marketing enrollment.</li>
            <li>No provider or appointment is promised before confirmation.</li>
          </ul>
          <Link to="/contact">Need help? Contact HomeLead Connect →</Link>
        </aside>
      </section>
    </main>
  );
}

const requestCss = `
.hlc-request-service{width:min(1120px,calc(100% - 28px))!important;margin:24px auto 72px!important;display:grid!important;gap:20px!important;color:#f8fafc!important}
.hlc-request-service *{box-sizing:border-box}
.hlc-request-hero,.hlc-request-form-card,.hlc-request-aside{background:#081426!important;color:#f8fafc!important;border:1px solid rgba(147,197,253,.24)!important;border-radius:18px!important;box-shadow:0 22px 55px rgba(2,6,23,.22)!important}
.hlc-request-hero{padding:42px 28px!important;text-align:center!important;background:radial-gradient(circle at 12% 0%,rgba(37,99,235,.32),transparent 34%),linear-gradient(145deg,#081426,#10243e)!important}
.hlc-request-hero img{width:110px!important;max-height:84px!important;object-fit:contain!important;margin:0 auto 16px!important}
.hlc-request-kicker{margin:0 0 10px!important;color:#93c5fd!important;font-size:12px!important;font-weight:900!important;letter-spacing:.16em!important;text-transform:uppercase!important}
.hlc-request-hero h1{margin:0 auto 14px!important;max-width:760px!important;color:#fff!important;font-size:clamp(2.2rem,6vw,4.6rem)!important;line-height:1!important;letter-spacing:-.045em!important}
.hlc-request-hero>p:not(.hlc-request-kicker){max-width:700px!important;margin:0 auto 22px!important;color:#dbeafe!important;font-size:18px!important;line-height:1.6!important;font-weight:600!important}
.hlc-request-primary,.hlc-request-secondary{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:52px!important;padding:13px 22px!important;border-radius:12px!important;text-decoration:none!important;font-weight:900!important}
.hlc-request-primary{background:#2563eb!important;color:#fff!important}
.hlc-request-grid{display:grid!important;grid-template-columns:minmax(0,1.35fr) minmax(280px,.65fr)!important;gap:20px!important;align-items:start!important}
.hlc-request-form-card,.hlc-request-aside{padding:32px!important}
.hlc-request-form-card h2,.hlc-request-aside h2{margin:0 0 10px!important;color:#fff!important;font-size:clamp(1.8rem,4vw,2.6rem)!important;line-height:1.08!important}
.hlc-request-form-intro,.hlc-request-aside>p:not(.hlc-request-kicker){margin:0 0 22px!important;color:#c7d2e3!important;font-size:16px!important;line-height:1.6!important}
.hlc-request-form-card form{display:grid!important;gap:18px!important}
.hlc-request-form-card label{display:grid!important;gap:8px!important;color:#f8fafc!important;font-weight:800!important;font-size:15px!important}
.hlc-request-form-card label span{display:flex!important;align-items:baseline!important;justify-content:space-between!important;gap:10px!important}
.hlc-request-form-card label b,.hlc-request-form-card label em{font-size:10px!important;letter-spacing:.08em!important;text-transform:uppercase!important;color:#93c5fd!important;font-style:normal!important}
.hlc-request-form-card input,.hlc-request-form-card select,.hlc-request-form-card textarea{width:100%!important;min-height:54px!important;padding:13px 14px!important;border:1px solid #52769d!important;border-radius:10px!important;background:#f8fafc!important;color:#0f172a!important;font:inherit!important;font-size:16px!important;font-weight:600!important}
.hlc-request-form-card textarea{min-height:150px!important;resize:vertical!important}
.hlc-request-privacy{display:grid!important;gap:5px!important;padding:16px!important;border:1px solid #31577e!important;border-radius:12px!important;background:#0d2946!important;color:#dbeafe!important;line-height:1.55!important}
.hlc-request-form-card button{min-height:58px!important;border:0!important;border-radius:12px!important;background:#2563eb!important;color:#fff!important;font-size:16px!important;font-weight:900!important;cursor:pointer!important}
.hlc-request-form-card button:disabled{opacity:.65!important;cursor:wait!important}
.hlc-request-aside ul{margin:18px 0!important;padding-left:20px!important;color:#e2e8f0!important;line-height:1.8!important}
.hlc-request-aside a{color:#93c5fd!important;font-weight:900!important;text-decoration:none!important}
.hlc-request-error{padding:14px!important;border-radius:10px!important;background:#450a0a!important;color:#fecaca!important;border:1px solid #991b1b!important;font-weight:800!important}
.hlc-request-trap{position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important;overflow:hidden!important}
@media(max-width:760px){.hlc-request-service{width:calc(100% - 20px)!important;margin:10px auto 38px!important;gap:12px!important}.hlc-request-grid{grid-template-columns:1fr!important;gap:12px!important}.hlc-request-hero{padding:26px 18px!important}.hlc-request-hero img{width:88px!important;max-height:62px!important}.hlc-request-hero h1{font-size:2.35rem!important}.hlc-request-hero>p:not(.hlc-request-kicker){font-size:15px!important}.hlc-request-form-card,.hlc-request-aside{padding:22px 16px!important}.hlc-request-aside{order:2!important}.hlc-request-form-card{order:1!important}}
`;

const completionCss = `
.hlc-request-complete{min-height:calc(100vh - 80px)!important;display:grid!important;place-items:center!important;padding:20px!important;background:#081426!important;color:#f8fafc!important}
.hlc-request-complete *{box-sizing:border-box}
.hlc-request-complete-card{width:min(760px,100%)!important;padding:clamp(30px,7vw,58px)!important;text-align:center!important;border:1px solid rgba(147,197,253,.28)!important;border-radius:20px!important;background:radial-gradient(circle at 50% 0%,rgba(37,99,235,.3),transparent 38%),linear-gradient(145deg,#081426,#10243e)!important;box-shadow:0 30px 80px rgba(2,6,23,.35)!important;color:#f8fafc!important}
.hlc-request-complete-icon{width:68px!important;height:68px!important;display:grid!important;place-items:center!important;margin:0 auto 18px!important;border-radius:999px!important;background:#dbeafe!important;color:#1d4ed8!important;font-size:34px!important;font-weight:1000!important}
.hlc-request-complete-card h1{margin:8px auto 14px!important;color:#fff!important;font-size:clamp(2.5rem,7vw,4.8rem)!important;line-height:1!important;letter-spacing:-.05em!important}
.hlc-request-complete-lead{max-width:640px!important;margin:0 auto!important;color:#f8fafc!important;font-size:clamp(18px,3vw,22px)!important;line-height:1.55!important;font-weight:750!important}
.hlc-request-next{max-width:620px!important;display:grid!important;gap:7px!important;margin:24px auto 14px!important;padding:20px!important;border-radius:14px!important;background:#0d2946!important;border:1px solid #31577e!important;color:#e2e8f0!important;line-height:1.55!important}
.hlc-request-next strong{color:#fff!important;font-size:18px!important}
.hlc-request-note{max-width:620px!important;margin:0 auto 24px!important;color:#c7d2e3!important;line-height:1.55!important}
.hlc-request-actions{display:flex!important;flex-wrap:wrap!important;justify-content:center!important;gap:12px!important}
.hlc-request-secondary{background:#10243e!important;color:#fff!important;border:1px solid rgba(191,219,254,.3)!important}
@media(max-width:640px){.hlc-request-complete{padding:10px!important}.hlc-request-complete-card{padding:30px 18px!important}.hlc-request-actions{display:grid!important}.hlc-request-primary,.hlc-request-secondary{width:100%!important}}
`;