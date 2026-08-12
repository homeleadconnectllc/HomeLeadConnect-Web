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
    intro: "Residents use HLC to request and coordinate service without a SaaS subscription. Participating businesses subscribe for approved workspace capabilities.",
    sections: [
      ["Residents", "No HLC SaaS subscription is required to submit a request or use an invited portal."],
      ["Professionals", "Plan, trial and entitlement details appear before enrollment; provider service charges remain separate."],
      ["Payments boundary", "HLC does not collect contractor-to-customer service payments in the Pennsylvania V1 launch model."],
    ],
    primary: ["Professional application", "/professional-application"],
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
  return <main style={pageStyle}>
    <header style={heroStyle}><p style={eyebrowStyle}>HomeLead Connect</p><h1>{item.title}</h1><p>{item.intro}</p></header>
    <section style={gridStyle}>{item.sections.map(([title, body]) => <article key={title} style={cardStyle}><h2>{title}</h2><p>{body}</p></article>)}</section>
    <div style={actionsStyle}><Link style={primaryStyle} to={item.primary[1]}>{item.primary[0]}</Link><Link to="/how-it-works">How HLC works</Link></div>
  </main>;
}

const pageStyle = { width: "min(1080px, calc(100% - 32px))", margin: "40px auto", display: "grid", gap: 24 };
const heroStyle = { padding: "clamp(24px, 6vw, 56px)", borderRadius: 24, color: "#f8fafc", background: "linear-gradient(135deg,#081426,#12365f)" };
const eyebrowStyle = { color: "#60a5fa", fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" as const };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 16 };
const cardStyle = { padding: 20, border: "1px solid #cbd5e1", borderRadius: 16, background: "#fff" };
const actionsStyle = { display: "flex", flexWrap: "wrap" as const, gap: 16, alignItems: "center" };
const primaryStyle = { padding: "11px 16px", borderRadius: 10, color: "#fff", background: "#2563eb", textDecoration: "none", fontWeight: 800 };
