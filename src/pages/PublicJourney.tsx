import { Link } from "react-router-dom";

type PublicJourneyKey = "services" | "pricing" | "trust" | "professionals" | "demo";

const content: Record<PublicJourneyKey, { title: string; intro: string; sections: Array<[string, string]>; primary: [string, string] }> = {
  services: {
    title: "Services and network",
    intro: "Start with the service you need, then HLC keeps the request, scope, provider coordination, schedule and communication connected.",
    sections: [
      ["Property and remodeling", "Painting, roofing, HVAC, cleaning, moving and other approved home-service categories."],
      ["One request history", "Photos, notes, appointments, messages and outcomes stay attached to the canonical request."],
      ["No invented guarantees", "Provider eligibility, availability and evidence are shown only when HLC has verified records."],
    ],
    primary: ["Request service", "/request-service"],
  },
  pricing: {
    title: "Pricing and access",
    intro: "Residents use HLC to request and coordinate service without a SaaS subscription. Participating businesses can start with a 14-day free trial, then continue at $99 per month.",
    sections: [
      ["14-day free trial", "Create your company workspace and complete subscription setup. A payment method is required for the business trial."],
      ["$99 per month afterward", "The participating-business workspace subscription is $99 per month after the trial period."],
      ["Residents", "No HLC SaaS subscription is required to submit a request or use an invited resident portal."],
      ["Service payments stay separate", "Provider service charges are separate from the HLC workspace subscription. HLC does not collect contractor-to-customer service payments in the Pennsylvania V1 launch model."],
    ],
    primary: ["Start 14-day free trial", "/register?next=/settings"],
  },
  trust: {
    title: "About, trust and safety",
    intro: "HomeLead Connect LLC is a Pennsylvania-first technology, referral and coordination platform—not the contractor performing the work.",
    sections: [
      ["Truthful records", "HLC separates requests, estimates, offers, assignments, appointments, messages and completion outcomes."],
      ["Privacy by role", "Private workspace and portal information requires an authorized account relationship."],
      ["Human decisions", "AI assistance does not replace provider eligibility, customer consent, owner approval or professional advice."],
    ],
    primary: ["Read platform disclosure", "/platform-disclosure"],
  },
  professionals: {
    title: "For professionals",
    intro: "Businesses, contractors, subcontractors and trades use one professional journey from application through profile, opportunities, scheduling and work history.",
    sections: [
      ["Business profile", "Services, territory, team, contact details and approved verification evidence."],
      ["Opportunities", "Explicit provider offers with accept or decline state—never silent assignment."],
      ["Operations", "LeadScope, jobs, schedule, communications, documents and Dion assistance in one workspace."],
    ],
    primary: ["Apply as a professional", "/professional-application"],
  },
  demo: {
    title: "Demo and contact",
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
  return <main style={pageStyle}>
    <header style={heroStyle}><p style={eyebrowStyle}>HomeLead Connect</p><h1>{item.title}</h1><p>{item.intro}</p></header>
    {pricing && <section aria-label="Business workspace subscription" style={offerStyle}>
      <p style={offerEyebrowStyle}>HLC BUSINESS WORKSPACE</p>
      <div style={priceRowStyle}><strong style={priceStyle}>$99</strong><span style={priceUnitStyle}>/ month after trial</span></div>
      <p style={trialStyle}>14 days free · payment method required</p>
      <p style={offerCopyStyle}>Start with the full connected HLC workspace, then manage your subscription from Settings after sign-in.</p>
      <div style={offerActionsStyle}>
        <Link style={primaryStyle} to="/register?next=/settings">Start 14-day free trial</Link>
        <Link style={secondaryStyle} to="/login?next=/settings">Already have a workspace? Manage subscription</Link>
      </div>
    </section>}
    <section style={gridStyle}>{item.sections.map(([title, body]) => <article key={title} style={cardStyle}><h2>{title}</h2><p>{body}</p></article>)}</section>
    <div style={actionsStyle}><Link style={primaryStyle} to={item.primary[1]}>{item.primary[0]}</Link><Link to="/how-it-works">How HLC works</Link>{pricing && <Link to="/terms">Subscription terms</Link>}</div>
  </main>;
}

const pageStyle = { width: "min(1080px, calc(100% - 32px))", margin: "40px auto", display: "grid", gap: 24 };
const heroStyle = { padding: "clamp(24px, 6vw, 56px)", borderRadius: 24, color: "#f8fafc", background: "linear-gradient(135deg,#081426,#12365f)" };
const eyebrowStyle = { color: "#93c5fd", fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" as const };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 16 };
const cardStyle = { padding: 20, border: "1px solid #cbd5e1", borderRadius: 16, background: "#fff", color: "#0f172a" };
const actionsStyle = { display: "flex", flexWrap: "wrap" as const, gap: 16, alignItems: "center", justifyContent: "center" };
const primaryStyle = { padding: "13px 20px", borderRadius: 12, color: "#fff", background: "#2563eb", textDecoration: "none", fontWeight: 900 };
const secondaryStyle = { padding: "13px 20px", borderRadius: 12, color: "#dbeafe", border: "1px solid rgba(147,197,253,.45)", textDecoration: "none", fontWeight: 800 };
const offerStyle = { padding: "clamp(24px,5vw,42px)", borderRadius: 28, color: "#f8fafc", background: "linear-gradient(145deg,#07111f,#0b2345 60%,#0b3b51)", boxShadow: "0 24px 70px rgba(15,23,42,.18)", textAlign: "center" as const };
const offerEyebrowStyle = { margin: 0, color: "#93c5fd", fontSize: 12, fontWeight: 900, letterSpacing: ".12em" };
const priceRowStyle = { display: "flex", flexWrap: "wrap" as const, justifyContent: "center", alignItems: "baseline", gap: 10, marginTop: 12 };
const priceStyle = { color: "#fff", fontSize: "clamp(52px,9vw,82px)", lineHeight: 1, letterSpacing: "-.05em" };
const priceUnitStyle = { color: "#cbd5e1", fontSize: 18, fontWeight: 800 };
const trialStyle = { marginTop: 12, color: "#67e8f9", fontWeight: 900 };
const offerCopyStyle = { maxWidth: 680, margin: "16px auto 0", color: "#cbd5e1", lineHeight: 1.6 };
const offerActionsStyle = { display: "flex", flexWrap: "wrap" as const, justifyContent: "center", gap: 12, marginTop: 24 };
