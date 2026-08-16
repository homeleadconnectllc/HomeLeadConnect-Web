import { Link } from "react-router-dom";
import "../styles/public-premium.css";

type PublicJourneyKey = "services" | "pricing" | "trust" | "professionals" | "demo";

const content: Record<PublicJourneyKey, { title: string; intro: string; sections: Array<[string, string]>; primary: [string, string]; kicker: string }> = {
  services: {
    kicker: "Connected home services",
    title: "One service journey. Every important step connected.",
    intro: "Start with the service you need, then HLC keeps the request, scope, provider coordination, schedule and communication connected.",
    sections: [
      ["Property and remodeling", "Painting, roofing, HVAC, cleaning, moving and other approved home-service categories."],
      ["One request history", "Photos, notes, appointments, messages and outcomes stay attached to the canonical request."],
      ["No invented guarantees", "Provider eligibility, availability and evidence are shown only when HLC has verified records."],
    ],
    primary: ["Request service", "/request-service"],
  },
  pricing: {
    kicker: "HLC business workspace",
    title: "Simple access to the connected workspace.",
    intro: "Residents can request and coordinate service through HLC without a SaaS subscription. Participating businesses can start with a 14-day free business trial, then continue at $49.99 per month.",
    sections: [
      ["14-day free business trial", "Create your company workspace and complete subscription setup. A payment method is required to begin the business trial."],
      ["$49.99 per month after the trial", "The participating-business HLC workspace subscription is $49.99 per month after the 14-day trial period."],
      ["Residents", "No HLC SaaS subscription is required to submit a service request or use an invited resident portal."],
      ["Service payments stay separate", "Provider service charges are separate from the HLC workspace subscription. HLC does not collect contractor-to-customer service payments in the Pennsylvania V1 launch model."],
    ],
    primary: ["Start 14-day free trial", "/register?next=/settings"],
  },
  trust: {
    kicker: "Trust + platform clarity",
    title: "Clear roles. Scoped access. Human decisions.",
    intro: "HomeLead Connect LLC is a Pennsylvania-first technology, referral and coordination platform—not the contractor performing the work.",
    sections: [
      ["Truthful records", "HLC separates requests, estimates, offers, assignments, appointments, messages and completion outcomes."],
      ["Privacy by role", "Private workspace and portal information requires an authorized account relationship."],
      ["Human decisions", "AI assistance does not replace provider eligibility, customer consent, owner approval or professional advice."],
    ],
    primary: ["Read platform disclosure", "/platform-disclosure"],
  },
  professionals: {
    kicker: "For businesses + trades",
    title: "Build your provider presence inside one connected system.",
    intro: "Businesses, contractors, subcontractors and trades use one professional journey from application through profile, opportunities, scheduling and work history.",
    sections: [
      ["Business profile", "Services, territory, team, contact details and approved verification evidence."],
      ["Opportunities", "Explicit provider offers with accept or decline state—never silent assignment."],
      ["Operations", "LeadScope, jobs, schedule, communications, documents and Dion assistance in one workspace."],
    ],
    primary: ["Apply as a professional", "/professional-application"],
  },
  demo: {
    kicker: "See HLC in context",
    title: "A demo built around the journey you actually need.",
    intro: "Tell HLC which journey you need to see. Demo requests are reviewed before workspace or portal access is issued.",
    sections: [
      ["Owner and business demo", "See CRM, LeadScope, matching, scheduling, communications and agent workspaces."],
      ["Provider demo", "See profiles, offers, assignment acceptance, jobs, schedule and documents."],
      ["Resident demo", "See requests, estimates, appointments, messages and completion follow-up."],
    ],
    primary: ["Contact HLC", "/contact"],
  },
};

export default function PublicJourney({ page }: { page: PublicJourneyKey }) {
  const item = content[page];
  const pricing = page === "pricing";

  return <main className="hlc-public-page">
    <div className="hlc-public-shell">
      <header className="hlc-public-hero">
        <div className="hlc-public-brand"><img className="hlc-public-logo" src="/hlc-logo-final.png" alt="HomeLead Connect" /></div>
        <p className="hlc-public-kicker">{item.kicker}</p>
        <h1>{item.title}</h1>
        <p className="hlc-public-hero-copy">{item.intro}</p>
        <div className="hlc-public-actions">
          <Link className="hlc-public-primary" to={item.primary[1]}>{item.primary[0]}</Link>
          <Link className="hlc-public-secondary" to="/how-it-works">How HLC works</Link>
          {pricing && <Link className="hlc-public-secondary" to="/terms">Subscription terms</Link>}
        </div>
      </header>

      {pricing && <section className="hlc-public-offer" aria-label="Business workspace subscription">
        <p className="hlc-public-offer-label">HLC BUSINESS WORKSPACE</p>
        <div className="hlc-public-price"><strong>$49.99</strong><span>/ month after trial</span></div>
        <p><strong>14 days free · payment method required.</strong> Start with the full connected HLC business workspace. After sign-in, subscription setup and ongoing billing are managed from Settings.</p>
        <div className="hlc-public-actions" style={{ justifyContent: "center" }}>
          <Link className="hlc-public-primary" to="/register?next=/settings">Start 14-day free trial</Link>
          <Link className="hlc-public-secondary" to="/login?next=/settings">Manage existing subscription</Link>
        </div>
      </section>}

      <section className="hlc-public-grid" aria-label={`${item.title} details`}>
        {item.sections.map(([title, body], index) => <article className="hlc-public-card" key={title}>
          <p className="hlc-public-card-label">{String(index + 1).padStart(2, "0")} · HomeLead Connect</p>
          <h2>{title}</h2>
          <p>{body}</p>
        </article>)}
      </section>
    </div>
  </main>;
}
