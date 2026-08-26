import { Link } from "react-router-dom";
import "../styles/public-premium.css";

const content = {
  about: {
    kicker: "About HomeLead Connect",
    title: "A connected operating layer for home-service work.",
    body: "HomeLead Connect LLC is a Pennsylvania-first home-services technology platform founded, owned, created, and developed by Antoine Washington. HLC connects service requests, LeadScope estimates, provider coordination, scheduling, jobs, communications, documents, workflow automation, analytics, and customer follow-through in one operating system.",
  },
  homeowners: {
    kicker: "For residents",
    title: "Request help without losing the thread.",
    body: "Submit a service request for review. A submitted request does not guarantee contractor assignment, pricing, or an appointment.",
  },
  contractors: {
    kicker: "For professionals",
    title: "Provider access built around explicit invitations and work history.",
    body: "HomeLead Connect supports professional profiles, provider records, job offers, assignment history, service areas, availability, scheduling, and protected portal access for participating businesses and service professionals.",
  },
  how: {
    kicker: "How HLC works",
    title: "One request becomes a traceable service journey.",
    body: "The HLC workflow keeps Request → Lead → LeadScope/Estimate → Provider coordination → Schedule → Job → Completion as explicit stages. Submitting a request does not skip later review, acceptance, pricing, or scheduling steps.",
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
  ["Community", "Discussions", "Participate in discussions and groups inside the same HLC ecosystem.", "/community/discussions", "Open discussions"],
  ["Community", "Events & Updates", "Follow community events and updates without leaving the connected HLC experience.", "/community/events", "View events"],
  ["Trust", "Completion-linked Reviews", "Reviews stay tied to eligible completed HLC work and canonical records.", "/community/reviews", "Open reviews"],
  ["Growth", "Referrals", "Record referral attribution without silently enrolling or messaging another person.", "/community/referrals", "Open referrals"],
  ["One place", "Full Community Hub", "Use the signed-in Community hub as the launch point for Network discovery, participation, saved providers, trust signals, and Community operations.", "/community-hub", "Open Community Hub"],
] as const;

export default function PublicInfo({ page }: { page: keyof typeof content }) {
  const item = content[page];

  return <main className="hlc-public-page">
    <div className="hlc-public-shell">
      <header className="hlc-public-hero">
        <div className="hlc-public-brand"><img className="hlc-public-logo" src="/hlc-logo-transparent.png" alt="HomeLead Connect" /></div>
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

      {page === "about" && <section className="hlc-public-grid" aria-label="HomeLead Connect ownership and credits">
        <article className="hlc-public-card"><p className="hlc-public-card-label">Founder & builder</p><h2>Antoine Washington</h2><p><strong>Founder · Owner · Product Creator · Lead Developer · Technical Architect</strong></p><p>Antoine Washington leads the HLC product vision, application build, workflow design, technical implementation, operating systems, and launch hardening.</p></article>
        <article className="hlc-public-card"><p className="hlc-public-card-label">Operating model</p><h2>Connection + guidance + execution</h2><p>HLC is designed to keep customer requests, providers, scheduling, communications, documents, automation, and completion history connected instead of scattering the work across unrelated tools.</p></article>
        <article className="hlc-public-card"><p className="hlc-public-card-label">AI operations team</p><h2>Kendrell · Dion · Diamond</h2><p>Kendrell supports command and risk, Dion supports operations and business intelligence, and Diamond supports customer experience and community. Their actions remain bounded by HLC roles, consent, workflow state, and database controls.</p></article>
        <article className="hlc-public-card"><p className="hlc-public-card-label">Design credit</p><h2>HLC visual identity</h2><p>HomeLead Connect visual logo design credit: Dion Diamond.</p></article>
      </section>}

      {page === "community" ? <section className="hlc-public-grid" aria-label="Community and network destinations">
        {communitySections.map(([eyebrow, title, body, to, action]) => <article className="hlc-public-card" key={title}>
          <p className="hlc-public-card-label">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{body}</p>
          <Link className="hlc-public-link" to={to}>{action} →</Link>
        </article>)}
      </section> : page !== "about" && <section className="hlc-public-grid">
        <article className="hlc-public-card"><p className="hlc-public-card-label">Connected records</p><h2>One canonical history</h2><p>HLC keeps each request, estimate, job, appointment and communication attached to the correct record instead of scattering the work across disconnected tools.</p></article>
        <article className="hlc-public-card"><p className="hlc-public-card-label">Clear workflow</p><h2>Every stage stays explicit</h2><p>Requests, approvals, assignments and scheduling remain separate steps so the platform does not silently invent acceptance or completion.</p></article>
        <article className="hlc-public-card"><p className="hlc-public-card-label">Scoped access</p><h2>Access follows the relationship</h2><p>Workspace and portal information is shown through the account, membership, invitation and sharing relationships supported by HLC.</p></article>
      </section>}

      {page === "contractors" && <section className="hlc-public-offer"><p className="hlc-public-offer-label">PROFESSIONAL ACCESS</p><div className="hlc-public-price"><strong>Application + protected portal</strong></div><p>Professionals can apply to join HLC. Approved/invited participants use authenticated portal access for the records and services made available to their HLC relationship.</p></section>}
    </div>
  </main>;
}
