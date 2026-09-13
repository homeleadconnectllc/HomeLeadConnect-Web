import { Link } from "react-router-dom";
import PublicSiteNav from "../components/PublicSiteNav";
import "../styles/public-premium.css";
import "../styles/public-board-pages-20260912.css";

const cards = [
  ["Founder & Builder", "Antoine Washington", "Founder · Owner · Product Creator · Lead Developer · Technical Architect", "Antoine Washington founded HomeLead Connect and has led the product vision, application build, workflow design, technical implementation, operational systems, launch hardening, and day-to-day platform development."],
  ["What HomeLead Connect Does", "Connection + guidance + execution", "One connected operating system", "HomeLead Connect connects service requests, lead review, estimating, provider coordination, scheduling, jobs, communications, documents, workflow automation, analytics, and customer follow-through in one operating system."],
  ["In Remembrance", "Kendrell Memorial", "A family story carried forward", "A quiet, dedicated space honoring Kendrell Charles Washington and the family story carried forward through HomeLead Connect."],
] as const;

export default function AboutPage() {
  return <main className="hlc-public-page hlc-public-board-page" data-public-page="about">
    <PublicSiteNav />
    <div className="hlc-public-shell hlc-public-shell--visual">
      <header className="hlc-public-hero">
        <div>
          <p className="hlc-public-kicker">About HomeLead Connect</p>
          <h1>Built to connect home help with real opportunities.</h1>
          <p className="hlc-public-intro-copy">HomeLead Connect is a connected home-services platform for residents, professionals, service businesses, partners, and the teams coordinating the work between them.</p>
          <div className="hlc-public-actions">
            <Link className="hlc-public-primary" to="/request-service">Request service</Link>
            <Link className="hlc-public-secondary" to="/how-it-works">How HomeLead Connect works</Link>
          </div>
        </div>
      </header>
      <figure className="hlc-public-visual">
        <img src="/hlc-frontdoor-resident-hero-v2.webp" alt="Family at home" loading="eager" />
      </figure>
      <section className="hlc-public-grid" aria-label="HomeLead Connect story">
        {cards.map(([label, title, sub, body]) => <article className="hlc-public-card" key={title}>
          <p className="hlc-public-card-label">{label}</p>
          <h2>{title}</h2>
          <p><strong>{sub}</strong></p>
          <p>{body}</p>
          {title === "Kendrell Memorial" && <Link className="hlc-public-link" to="/memorial">Visit the memorial →</Link>}
        </article>)}
      </section>
      <section className="hlc-public-offer" aria-label="HomeLead Connect credits">
        <p className="hlc-public-offer-label">Credits</p>
        <h2>Mission, product, and platform.</h2>
        <p>HomeLead Connect LLC product direction, platform architecture, application development, operations design, and launch implementation: Antoine Washington.</p>
        <p>HomeLead Connect visual logo design credit: Dion Diamond.</p>
      </section>
    </div>
  </main>;
}
