import { Link } from "react-router-dom";
import PublicSiteNav from "../components/PublicSiteNav";
import { pageImage } from "../config/publicPageImagery";
import "../styles/public-visual-family-20260919.css";
import "../styles/connected-visual-family-20260923.css";

const cards = [
  ["Founder & Builder", "Antoine Washington", "Founder · Owner · Product Creator · Lead Developer · Technical Architect", "Antoine Washington founded HomeLead Connect and has led the product vision, application build, workflow design, technical implementation, operational systems, launch hardening, and day-to-day platform development."],
  ["What HomeLead Connect Does", "Connection + guidance + execution", "One connected operating system", "HomeLead Connect connects service requests, lead review, estimating, provider coordination, scheduling, jobs, communications, documents, workflow automation, analytics, and customer follow-through in one operating system."],
  ["In Remembrance", "Kendrell Memorial", "A family story carried forward", "A quiet, dedicated space honoring Kendrell Charles Washington and the family story carried forward through HomeLead Connect."],
] as const;

export default function AboutPage() {
  const visual = pageImage("about");
  return <main className="hlc-public-page hlc-public-board-page" data-public-page="about">
    <PublicSiteNav />
    <div className="hlc-public-shell hlc-public-shell--visual">
      <header className="hlc-public-hero"><div><p className="hlc-public-kicker">About HomeLead Connect</p><h1>One connected platform for home service, opportunity, and follow-through.</h1><p className="hlc-public-intro-copy">HomeLead Connect brings residents, professionals, service businesses, partners, and internal teams into one coordinated experience—from the first request through communication, scheduling, work history, and follow-up.</p><div className="hlc-public-actions"><Link className="hlc-public-primary" to="/request-service">Request service</Link><Link className="hlc-public-secondary" to="/how-it-works">How HomeLead Connect works</Link></div></div></header>
      <figure className="hlc-public-visual"><img src={visual.src} alt={visual.alt} loading="eager" /></figure>
      <section className="hlc-public-grid" aria-label="HomeLead Connect story">{cards.map(([label, title, sub, body]) => <article className="hlc-public-card" key={title}><p className="hlc-public-card-label">{label}</p><h2>{title}</h2><p><strong>{sub}</strong></p><p>{body}</p>{title === "Kendrell Memorial" && <Link className="hlc-public-link" to="/memorial">Visit the memorial →</Link>}</article>)}</section>
      <section className="hlc-public-offer hlc-kendrell-dedication" aria-label="Kendrell Charles Washington dedication"><figure className="hlc-kendrell-dedication-portrait"><img src="/brand/avatars/Kendrell_Locked_HLC.png" alt="Kendrell Charles Washington dedication portrait" /></figure><p className="hlc-public-offer-label">In Remembrance</p><h2>Kendrell Charles Washington</h2><p>A brother, a family story, and a name carried forward with purpose, care, and pride through HomeLead Connect.</p><Link className="hlc-public-link" to="/memorial">Visit the full dedication →</Link></section>
      <section className="hlc-public-offer" aria-label="HomeLead Connect credits"><p className="hlc-public-offer-label">Credits</p><h2>Mission, product, and platform.</h2><p>HomeLead Connect LLC product direction, platform architecture, application development, operations design, and launch implementation: Antoine Washington.</p><p>HomeLead Connect visual logo design credit: Dion Diamond.</p></section>
    </div>
    
  </main>;
}
