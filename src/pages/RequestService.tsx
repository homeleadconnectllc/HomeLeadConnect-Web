import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PublicSiteNav from "../components/PublicSiteNav";
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
        <style>{completionCss}</style>
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
      <style>{requestCss}</style>
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

const requestCss = `
.hlc-request-service{position:relative!important;isolation:isolate!important;width:100%!important;max-width:none!important;margin:0!important;padding:clamp(44px,7vw,88px) clamp(20px,5vw,72px) 76px!important;display:grid!important;gap:34px!important;color:#f8fafc!important;background:linear-gradient(180deg,rgba(3,17,31,.42),rgba(3,17,31,.74)),url("https://commons.wikimedia.org/wiki/Special:Redirect/file/Harrisburg_PA_skyline.jpg") center 48%/cover fixed no-repeat,#071a2d!important}
.hlc-request-service *{box-sizing:border-box}
.hlc-request-intro{width:min(880px,100%)!important;margin:0 auto!important;padding:0!important;text-align:center!important;background:transparent!important;border:0!important;box-shadow:none!important}
.hlc-request-kicker{margin:0 0 12px!important;color:#56e3ad!important;font-size:12px!important;font-weight:900!important;letter-spacing:.19em!important;text-transform:uppercase!important}
.hlc-request-intro h1{margin:0 auto 14px!important;color:#fff!important;font-family:Georgia,"Times New Roman",serif!important;font-size:clamp(2.7rem,6vw,5rem)!important;font-weight:700!important;line-height:.98!important;letter-spacing:-.045em!important;text-shadow:0 2px 18px rgba(0,0,0,.55)!important}
.hlc-request-intro>p:not(.hlc-request-kicker){max-width:650px!important;margin:0 auto!important;color:#f1f5f9!important;font-size:18px!important;line-height:1.6!important;font-weight:650!important;text-shadow:0 1px 12px rgba(0,0,0,.65)!important}
.hlc-request-grid{width:min(1040px,100%)!important;margin:0 auto!important;display:grid!important;grid-template-columns:minmax(0,1fr) minmax(260px,.42fr)!important;gap:42px!important;align-items:start!important}
.hlc-request-form-card,.hlc-request-aside{padding:0!important;background:transparent!important;color:#f8fafc!important;border:0!important;border-radius:0!important;box-shadow:none!important}
.hlc-request-form-card form{display:grid!important;gap:18px!important}
.hlc-request-form-card label{display:grid!important;gap:8px!important;color:#fff!important;font-weight:850!important;font-size:15px!important;text-shadow:0 1px 10px rgba(0,0,0,.72)!important}
.hlc-request-form-card label span{display:flex!important;align-items:baseline!important;justify-content:space-between!important;gap:10px!important}
.hlc-request-form-card label b,.hlc-request-form-card label em{flex:0 0 auto!important;white-space:nowrap!important;font-size:10px!important;letter-spacing:.08em!important;text-transform:uppercase!important;color:#56e3ad!important;font-style:normal!important}
.hlc-request-form-card input,.hlc-request-form-card select,.hlc-request-form-card textarea{width:100%!important;min-height:54px!important;padding:13px 14px!important;border:1px solid rgba(219,234,254,.78)!important;border-radius:8px!important;background:rgba(248,250,252,.92)!important;color:#0f172a!important;font:inherit!important;font-size:16px!important;font-weight:600!important;box-shadow:0 8px 24px rgba(2,6,23,.12)!important}
.hlc-request-form-card textarea{min-height:150px!important;resize:vertical!important}
.hlc-request-privacy{display:grid!important;gap:5px!important;padding:14px 0!important;border:0!important;border-radius:0!important;background:transparent!important;color:#f1f5f9!important;line-height:1.55!important;text-shadow:0 1px 10px rgba(0,0,0,.72)!important}
.hlc-request-form-card button{justify-self:start!important;min-height:0!important;padding:4px 0!important;border:0!important;border-bottom:2px solid currentColor!important;border-radius:0!important;background:transparent!important;color:#56e3ad!important;font-size:17px!important;font-weight:900!important;cursor:pointer!important;box-shadow:none!important}
.hlc-request-form-card button:disabled{opacity:.65!important;cursor:wait!important}
.hlc-request-aside{padding-top:4px!important;text-shadow:0 1px 12px rgba(0,0,0,.72)!important}
.hlc-request-aside h2{margin:0 0 10px!important;color:#fff!important;font-family:Georgia,"Times New Roman",serif!important;font-size:clamp(1.7rem,3vw,2.35rem)!important;line-height:1.08!important}
.hlc-request-aside>p:not(.hlc-request-kicker){margin:0 0 18px!important;color:#eef4fb!important;font-size:15px!important;line-height:1.65!important}
.hlc-request-aside ul{margin:18px 0!important;padding-left:20px!important;color:#eef4fb!important;line-height:1.8!important}
.hlc-request-aside a{color:#56e3ad!important;font-weight:900!important;text-decoration:none!important;border-bottom:1px solid currentColor!important}\n.hlc-request-photo-credit{display:block!important;margin-top:24px!important;color:#dbeafe!important;font-size:11px!important;line-height:1.45!important;opacity:.88!important}
.hlc-request-error{padding:12px 0!important;border:0!important;border-radius:0!important;background:transparent!important;color:#fecaca!important;font-weight:900!important;text-shadow:0 1px 10px rgba(0,0,0,.8)!important}
.hlc-request-trap{position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important;overflow:hidden!important}
@media(max-width:760px){.hlc-request-service{padding:38px 20px 48px!important;gap:28px!important;background-attachment:scroll!important;background-position:center top!important}.hlc-request-grid{grid-template-columns:1fr!important;gap:34px!important}.hlc-request-intro h1{font-size:clamp(2.5rem,11vw,3.5rem)!important}.hlc-request-intro>p:not(.hlc-request-kicker){font-size:16px!important}.hlc-request-form-card label span{align-items:center!important}.hlc-request-aside{order:2!important}.hlc-request-form-card{order:1!important}}
`;

const completionCss = `
.hlc-request-complete{min-height:calc(100vh - 140px)!important;display:grid!important;place-items:center!important;padding:28px 20px!important;background:#081426!important;color:#f8fafc!important}
.hlc-request-complete *{box-sizing:border-box}
.hlc-request-complete-card{width:min(760px,100%)!important;padding:clamp(30px,7vw,58px)!important;text-align:center!important;border:1px solid rgba(147,197,253,.28)!important;border-radius:18px!important;background:radial-gradient(circle at 50% 0%,rgba(32,200,244,.18),transparent 38%),linear-gradient(145deg,#081426,#10243e)!important;box-shadow:0 30px 80px rgba(2,6,23,.35)!important;color:#f8fafc!important}
.hlc-request-complete-icon{width:68px!important;height:68px!important;display:grid!important;place-items:center!important;margin:0 auto 18px!important;border-radius:999px!important;background:#dbeafe!important;color:#1d4ed8!important;font-size:34px!important;font-weight:1000!important}
.hlc-request-complete-card h1{margin:8px auto 14px!important;color:#fff!important;font-family:Georgia,"Times New Roman",serif!important;font-size:clamp(2.5rem,7vw,4.8rem)!important;line-height:1!important;letter-spacing:-.05em!important}
.hlc-request-complete-lead{max-width:640px!important;margin:0 auto!important;color:#f8fafc!important;font-size:clamp(18px,3vw,22px)!important;line-height:1.55!important;font-weight:750!important}
.hlc-request-next{max-width:620px!important;display:grid!important;gap:7px!important;margin:24px auto 14px!important;padding:20px!important;border-radius:14px!important;background:#0d2946!important;border:1px solid #31577e!important;color:#e2e8f0!important;line-height:1.55!important}
.hlc-request-next strong{color:#fff!important;font-size:18px!important}
.hlc-request-note{max-width:620px!important;margin:0 auto 24px!important;color:#c7d2e3!important;line-height:1.55!important}
.hlc-request-actions{display:flex!important;flex-wrap:wrap!important;justify-content:center!important;gap:12px!important}
.hlc-request-secondary{background:#10243e!important;color:#fff!important;border:1px solid rgba(191,219,254,.3)!important}
@media(max-width:640px){.hlc-request-complete{padding:10px!important}.hlc-request-complete-card{padding:30px 18px!important}.hlc-request-actions{display:grid!important}.hlc-request-primary,.hlc-request-secondary{width:100%!important}}
`;
