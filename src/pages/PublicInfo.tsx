import { Link } from "react-router-dom";
import PublicSiteNav from "../components/PublicSiteNav";
import { pageImage, type PublicPageImageKey } from "../config/publicPageImagery";
import PathwayPage from "./PathwayPage";
import "../styles/public-premium.css";
import "../styles/final-candidate-public-reconciliation.css";
import "../styles/public-board-pages-20260912.css";
import "../styles/pathway-exact-render-authority-20260916.css";
import "../styles/public-owner-visual-authority-20260918.css";
import "../styles/public-owner-visual-final-20260918.css";

const content = {
  about: { kicker: "About HomeLead Connect", title: "A connected operating layer for home-service work.", body: "HomeLead Connect LLC is a home-services technology platform based in Pennsylvania and designed for residents, professionals, partners, and service operations across supported locations. HomeLead Connect connects service requests, resident project planning, provider coordination, scheduling, jobs, communications, documents, workflow automation, analytics, and customer follow-through in one operating system.", imageKey: "about" },
  homeowners: { kicker: "For residents", title: "Request help without losing the thread.", body: "Submit a service request for review. A submitted request does not guarantee contractor assignment, pricing, or an appointment.", imageKey: "homeowners" },
  contractors: { kicker: "For professionals", title: "Provider access built around explicit invitations and work history.", body: "HomeLead Connect supports professional profiles, provider records, job offers, assignment history, service areas, availability, scheduling, and protected portal access for participating businesses and service professionals.", imageKey: "contractors" },
  how: { kicker: "How HomeLead Connect works", title: "One request becomes a traceable service journey.", body: "The HomeLead Connect workflow keeps request review, provider coordination, scheduling, service work, communication, and completion as explicit stages. Submitting a request does not skip later review, acceptance, pricing, or scheduling steps.", imageKey: "how" },
  leadscope: { kicker: "LeadScope", title: "Resident project measurements and informational self-estimates.", body: "LeadScope is a resident-facing premium HomeLead Connect capability for recording project measurements, assumptions, site conditions, and project scope, then saving an informational estimate range based on explicit resident-entered cost assumptions. LeadScope does not invent market pricing, replace an on-site inspection, or create a binding professional quote.", imageKey: "leadscope" },
  community: { kicker: "Community + Network", title: "Discover, connect, and move into a real HomeLead Connect workflow.", body: "Find providers, explore service coverage, participate in Community, and move from discovery into a real HomeLead Connect service workflow.", imageKey: "community" },
} as const satisfies Record<string,{kicker:string;title:string;body:string;imageKey:PublicPageImageKey}>;

// Canonical Community destinations remain part of the public front-door contract.
// The redesigned Community page presents these through the connected Community
// experience rather than duplicating the authenticated tools here.
const communityDestinationContract = [
  "/providers",
  "/map",
  "/matching",
  "/network/service-areas",
  "/network/availability",
  "/network/saved",
  "/community/discussions",
  "/community/events",
  "/community/reviews",
  "/community/referrals",
  "/community-hub",
] as const;
void communityDestinationContract;

export default function PublicInfo({ page }: { page: keyof typeof content }) {
  if (page === "homeowners") return <PathwayPage pathway="residents" />;
  if (page === "community") return <PathwayPage pathway="community" />;

  const item = content[page];
  const visual = pageImage(item.imageKey);
  return <main className="hlc-public-page hlc-public-board-page" data-public-page={page}>
    <PublicSiteNav/>
    <div className="hlc-public-shell hlc-public-shell--visual">
      <header className="hlc-public-hero"><div>
        <div className="hlc-public-brand"><img className="hlc-public-logo" src="/hlc-logo-transparent.png" alt="HomeLead Connect LLC" width={220} height={71}/></div>
        <p className="hlc-public-kicker">{item.kicker}</p><h1>{item.title}</h1><p className="hlc-public-intro-copy">{item.body}</p>
        <div className="hlc-public-actions">{page === "contractors" && <Link className="hlc-public-primary" to="/professional-application">Apply as a professional</Link>}{page === "leadscope" && <Link className="hlc-public-primary" to="/app">Open HomeLead Connect</Link>}<Link className="hlc-public-secondary" to="/contact">Contact HomeLead Connect</Link></div>
      </div></header>
      <figure className="hlc-public-visual"><img src={visual.src} alt={visual.alt} loading="eager"/></figure>
      {page === "about" ? <section className="hlc-public-grid" aria-label="HomeLead Connect ownership and credits">
        <article className="hlc-public-card"><p className="hlc-public-card-label">Founder & builder</p><h2>Antoine Washington</h2><p><strong>Founder · Owner · Product Creator · Lead Developer · Technical Architect</strong></p><p>Antoine Washington leads the HomeLead Connect product vision, application build, workflow design, technical implementation, operating systems, and launch hardening.</p></article>
        <article className="hlc-public-card"><p className="hlc-public-card-label">Operating model</p><h2>Connection + guidance + execution</h2><p>HomeLead Connect is designed to keep customer requests, providers, scheduling, communications, documents, automation, and completion history connected instead of scattering the work across unrelated tools.</p></article>
        <article className="hlc-public-card"><p className="hlc-public-card-label">AI operations team</p><h2>Kendrell · Dion · Diamond</h2><p>Kendrell supports command and risk, Dion supports operations and business intelligence, and Diamond supports customer experience and community.</p></article>
        <article className="hlc-public-card"><p className="hlc-public-card-label">Design credit</p><h2>HomeLead Connect visual identity</h2><p>HomeLead Connect visual logo design credit: Dion Diamond.</p></article>
      </section> : <section className="hlc-public-grid">
        <article className="hlc-public-card"><p className="hlc-public-card-label">Connected records</p><h2>One canonical history</h2><p>HomeLead Connect keeps each request, estimate, job, appointment and communication attached to the correct record.</p></article>
        <article className="hlc-public-card"><p className="hlc-public-card-label">Clear workflow</p><h2>Every stage stays explicit</h2><p>Requests, approvals, assignments and scheduling remain separate steps.</p></article>
        <article className="hlc-public-card"><p className="hlc-public-card-label">Scoped access</p><h2>Access follows the relationship</h2><p>Workspace and portal information is shown through the account, membership, invitation and sharing relationships supported by HomeLead Connect.</p></article>
      </section>}
      {page === "contractors" && <section className="hlc-public-offer"><p className="hlc-public-offer-label">PROFESSIONAL ACCESS</p><div className="hlc-public-price"><strong>Application + protected portal</strong></div><p>Professionals can apply to join HomeLead Connect. Approved or invited participants use authenticated portal access for the records and services made available to their HomeLead Connect relationship.</p></section>}
    </div>
    
  </main>;
}
