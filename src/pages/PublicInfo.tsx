import { Link } from "react-router-dom";

const content = {
  about: {
    title: "About HomeLead Connect",
    body: "HomeLead Connect LLC is a Pennsylvania-first software platform founded and owned by Antoine Washington. HLC helps participating businesses organize service requests, LeadScope estimates, jobs, contractor assignments, appointments, communications, and related history in one workspace.",
  },
  homeowners: {
    title: "For homeowners",
    body: "Submit a service request for review. A submitted request does not guarantee contractor assignment, pricing, or an appointment.",
  },
  contractors: {
    title: "For contractors",
    body: "HomeLead Connect supports contractor records, job offers, assignment history, and scheduling for participating businesses. A public contractor portal is not yet available.",
  },
  how: {
    title: "How it works",
    body: "The current service workflow is Request → Estimate → Contractor Assignment → Schedule → Work. Each step is recorded separately; submitting a request does not skip later review or acceptance steps.",
  },
  leadscope: {
    title: "LeadScope",
    body: "LeadScope is HomeLead Connect's itemized estimating and scoping workflow. It records quantities, unit costs, estimate-level markup, status, and an explicit conversion from an accepted estimate to a CRM job. It does not invent pricing or guarantee a final project price.",
  },
  community: {
    title: "HLC Community & Network",
    body: "Find providers, explore service coverage, participate in Community, and move from discovery into a real HomeLead Connect service workflow. Provider records, map locations, availability, reviews, and matching results are shown only when HLC has canonical data for them.",
  },
} as const;

const communitySections = [
  {
    eyebrow: "Find help",
    title: "Provider Directory",
    body: "Browse provider records and service capabilities stored in HLC. Directory presence is not a ranking or endorsement.",
    to: "/providers",
    action: "Open directory",
  },
  {
    eyebrow: "Explore locations",
    title: "Provider Map",
    body: "See providers with stored map coordinates. Approximate city or ZIP points remain clearly different from verified exact locations.",
    to: "/map",
    action: "Open map",
  },
  {
    eyebrow: "Connect",
    title: "Matching",
    body: "Use HLC matching and eligibility records to narrow possible providers without inventing fit, availability, or outcomes.",
    to: "/matching",
    action: "Open matching",
  },
  {
    eyebrow: "Plan service",
    title: "Service Areas & Availability",
    body: "Review recorded service-area and availability information before moving into assignment and scheduling.",
    to: "/network/service-areas",
    secondaryTo: "/network/availability",
    action: "View service areas",
    secondaryAction: "View availability",
  },
  {
    eyebrow: "Stay connected",
    title: "Saved Providers",
    body: "Keep provider records you want to revisit in one HLC list instead of searching again.",
    to: "/network/saved",
    action: "Open saved providers",
  },
  {
    eyebrow: "Community",
    title: "Discussions, Groups & Events",
    body: "Participate in discussions, groups, and event/update records inside the same HLC ecosystem.",
    to: "/community/discussions",
    secondaryTo: "/community/events",
    action: "Open discussions",
    secondaryAction: "View events",
  },
  {
    eyebrow: "Trust & growth",
    title: "Reviews & Referrals",
    body: "Reviews stay tied to eligible completed HLC work, while referrals record attribution without silently enrolling or messaging another person.",
    to: "/community/reviews",
    secondaryTo: "/community/referrals",
    action: "Open reviews",
    secondaryAction: "Open referrals",
  },
  {
    eyebrow: "One place",
    title: "Full Community Hub",
    body: "Use the signed-in Community hub as the launch point for Network discovery, participation, saved providers, trust signals, and Community operations.",
    to: "/community-hub",
    action: "Open Community Hub",
  },
] as const;

export default function PublicInfo({ page }: { page: keyof typeof content }) {
  const item = content[page];

  if (page === "community") {
    return (
      <main style={{ width: "min(1180px, calc(100% - 32px))", margin: "48px auto 72px", lineHeight: 1.6 }}>
        <header style={{ textAlign: "center", maxWidth: 860, margin: "0 auto 32px" }}>
          <p style={{ margin: "0 0 8px", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}>HomeLead Connect · Community + Network</p>
          <h1 style={{ margin: "0 0 14px", fontSize: "clamp(2.2rem, 6vw, 4.5rem)", lineHeight: 1 }}>{item.title}</h1>
          <p style={{ margin: "0 auto", maxWidth: 760 }}>{item.body}</p>
        </header>

        <section aria-label="Community and network destinations" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))", gap: 18 }}>
          {communitySections.map((section) => (
            <article key={section.title} style={{ border: "1px solid #dbe3ef", borderRadius: 20, padding: 22, background: "#fff", boxShadow: "0 12px 30px rgba(15,23,42,.06)", display: "flex", flexDirection: "column", minHeight: 220 }}>
              <small style={{ fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "#475569" }}>{section.eyebrow}</small>
              <h2 style={{ margin: "8px 0 8px" }}>{section.title}</h2>
              <p style={{ margin: "0 0 18px", flex: 1 }}>{section.body}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <Link to={section.to} style={{ fontWeight: 800 }}>{section.action}</Link>
                {"secondaryTo" in section && section.secondaryTo && <Link to={section.secondaryTo} style={{ fontWeight: 700 }}>{section.secondaryAction}</Link>}
              </div>
            </article>
          ))}
        </section>

        <section style={{ marginTop: 28, padding: 24, borderRadius: 20, background: "#0f172a", color: "#e2e8f0", textAlign: "center" }}>
          <h2 style={{ color: "#fff", marginTop: 0 }}>Need home help now?</h2>
          <p style={{ maxWidth: 720, margin: "0 auto 16px" }}>Start with a service request when you already know what you need. Use Community and Network when you want to explore providers, locations, service coverage, or HLC activity first.</p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
            <Link to="/request-service" style={{ fontWeight: 800, color: "#fff" }}>Request service</Link>
            <Link to="/login" style={{ fontWeight: 800, color: "#fff" }}>Sign in to HLC</Link>
          </div>
        </section>
      </main>
    );
  }

  return <main style={{ width: "min(760px, calc(100% - 32px))", margin: "64px auto", lineHeight: 1.6 }}>
    <h1>{item.title}</h1>
    <p>{item.body}</p>
    {page === "homeowners" && <Link to="/request-service">Request service</Link>}
    {page === "contractors" && <p>Contractor access uses explicit workspace invitations and email magic-link authentication. It will be enabled only after production invitation delivery and contractor acceptance testing pass.</p>}
  </main>;
}
