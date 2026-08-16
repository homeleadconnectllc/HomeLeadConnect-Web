import { Link } from "react-router-dom";
import "../styles/public-premium.css";

const content = {
  about: {
    kicker: "About HomeLead Connect",
    title: "A connected operating layer for home-service work.",
    body: "HomeLead Connect LLC is a Pennsylvania-first software platform founded and owned by Antoine Washington. HLC helps participating businesses organize service requests, LeadScope estimates, jobs, contractor assignments, appointments, communications, and related history in one workspace.",
  },
  homeowners: {
    kicker: "For residents",
    title: "Request help without losing the thread.",
    body: "Submit a service request for review. A submitted request does not guarantee contractor assignment, pricing, or an appointment.",
  },
  contractors: {
    kicker: "For professionals",
    title: "Provider access built around explicit invitations and work history.",
    body: "HomeLead Connect supports contractor records, job offers, assignment history, and scheduling for participating businesses. A public contractor portal is not yet available.",
  },
  how: {
    kicker: "How HLC works",
    title: "One request becomes a traceable service journey.",
    body: "The current service workflow is Request → Estimate → Contractor Assignment → Schedule → Work. Each step is recorded separately; submitting a request does not skip later review or acceptance steps.",
  },
  leadscope: {
    kicker: "LeadScope",
    title: "Scope and estimating with an auditable path to the job.",
    body: "LeadScope is HomeLead Connect's itemized estimating and scoping workflow. It records quantities, unit costs, estimate-level markup, status, and an explicit conversion from an accepted estimate to a CRM job. It does not invent pricing or guarantee a final project price.",
  },
  community: {
    kicker: "Community + Network",
    title: "Discover, connect, and move into a real HLC workflow.",
    body: "Find providers, explore service coverage, participate in Community, and move from discovery into a real HomeLead Connect service workflow. Provider records, map locations, availability, reviews, and matching results are shown only when HLC has canonical data for them.",
  },
} as const;

const communitySections = [
  ["Find help", "Provider Directory", "Browse provider records and service capabilities stored in HLC. Directory presence is not a ranking or endorsement.", "/providers", "Open directory"],
  ["Explore locations", "Provider Map", "See providers with stored map coordinates. Approximate city or ZIP points remain clearly different from verified exact locations.", "/map", "Open map"],
  ["Connect", "Matching", "Use HLC matching and eligibility records to narrow possible providers without inventing fit, availability, or outcomes.", "/matching", "Open matching"],
  ["Plan service", "Service Areas", "Review recorded service-area information before moving into assignment and scheduling.", "/network/service-areas", "View service areas"],
  ["Plan timing", "Availability", "Review recorded provider availability before moving into assignment or appointment scheduling.", "/network/availability", "View availability"],
  ["Stay connected", "Saved Providers", "Keep provider records you want to revisit in one HLC list instead of searching again.", "/network/saved", "Open saved providers"],
  ["Community", "Discussions & Events", "Participate in discussions, groups, and event/update records inside the same HLC ecosystem.", "/community/discussions", "Open discussions"],
  ["Trust & growth", "Reviews & Referrals", "Reviews stay tied to eligible completed HLC work, while referrals record attribution without silently enrolling or messaging another person.", "/community/reviews", "Open reviews"],
  ["One place", "Full Community Hub", "Use the signed-in Community hub as the launch point for Network discovery, participation, saved providers, trust signals, and Community operations.", "/community-hub", "Open Community Hub"],
] as const;

export default function PublicInfo({ page }: { page: keyof typeof content }) {
  const item = content[page];

  return <main className="hlc-public-page">
    <div className="hlc-public-shell">
      <header className="hlc-public-hero">
        <div className="hlc-public-brand"><img className="hlc-public-logo" src="/hlc-logo-final.png" alt="HomeLead Connect" /></div>
        <p className="hlc-public-kicker">{item.kicker}</p>
        <h1>{item.title}</h1>
        <p className="hlc-public-hero-copy">{item.body}</p>
        <div className="hlc-public-actions">
          {page === "homeowners" && <Link className="hlc-public-primary" to="/request-service">Request service</Link>}
          {page === "contractors" && <Link className="hlc-public-primary" to="/professional-application">Apply as a professional</Link>}
          {page === "community" && <Link className="hlc-public-primary" to="/request-service">Request home service</Link>}
          <Link className="hlc-public-secondary" to="/contact">Contact HLC</Link>
        </div>
      </header>

      {page === "community" ? <section className="hlc-public-grid" aria-label="Community and network destinations">
        {communitySections.map(([eyebrow, title, body, to, action]) => <article className="hlc-public-card" key={title}>
          <p className="hlc-public-card-label">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{body}</p>
          <Link className="hlc-public-link" to={to}>{action} →</Link>
        </article>)}
      </section> : <section className="hlc-public-grid">
        <article className="hlc-public-card"><p className="hlc-public-card-label">Connected records</p><h2>One canonical history</h2><p>HLC keeps each request, estimate, job, appointment and communication attached to the correct record instead of scattering the work across disconnected tools.</p></article>
        <article className="hlc-public-card"><p className="hlc-public-card-label">Clear workflow</p><h2>Every stage stays explicit</h2><p>Requests, approvals, assignments and scheduling remain separate steps so the platform does not silently invent acceptance or completion.</p></article>
        <article className="hlc-public-card"><p className="hlc-public-card-label">Scoped access</p><h2>Access follows the relationship</h2><p>Workspace and portal information is shown through the account, membership, invitation and sharing relationships supported by HLC.</p></article>
      </section>}

      {page === "contractors" && <section className="hlc-public-offer"><p className="hlc-public-offer-label">PROFESSIONAL ACCESS</p><div className="hlc-public-price"><strong>Invite-first</strong></div><p>Contractor access uses explicit workspace invitations and email magic-link authentication. It will be enabled only after production invitation delivery and contractor acceptance testing pass.</p></section>}
    </div>
  </main>;
}
