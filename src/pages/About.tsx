import { Link } from "react-router-dom";
import "../styles/public-board-pages-20260912.css";

const cards = [
  ["Founder & Builder", "Antoine Washington", "Founder · Owner · Product Creator · Lead Developer · Technical Architect", "Antoine Washington founded HomeLead Connect and has led the product vision, application build, workflow design, technical implementation, operational systems, launch hardening, and day-to-day platform development."],
  ["What HLC Does", "Connection + guidance + execution", "One connected operating system", "HLC connects service requests, lead review, estimating, provider coordination, scheduling, jobs, communications, documents, workflow automation, analytics, and customer follow-through in one operating system."],
  ["In Remembrance", "Kendrell Memorial", "A family story carried forward", "A quiet, dedicated space honoring Kendrell Charles Washington and the family story carried forward through HomeLead Connect."],
] as const;

export default function AboutPage() {
  return <main className="hlc-public-about-page">
    <section className="hlc-about-hero">
      <img src="/hlc-frontdoor-resident-hero-v2.webp" alt="Family at home" className="hlc-about-hero-media" />
      <div className="hlc-about-hero-overlay" />
      <div className="hlc-about-hero-content">
        <p className="hlc-about-kicker">HomeLead Connect LLC</p>
        <h1>Built to connect home help with real opportunities.</h1>
        <p>HomeLead Connect is a connected home-services platform for residents, providers, service businesses, partners, and the teams coordinating the work between them.</p>
        <div className="hlc-about-actions"><Link to="/request-service">Request service</Link><Link to="/">Back to Home</Link></div>
      </div>
    </section>
    <section className="hlc-about-grid">
      {cards.map(([label, title, sub, body]) => <article className="hlc-about-card" key={title}><p>{label}</p><h2>{title}</h2><strong>{sub}</strong><span>{body}</span>{title === "Kendrell Memorial" && <Link to="/memorial">Visit the memorial →</Link>}</article>)}
    </section>
    <section className="hlc-about-credits"><div><p>Credits</p><h2>Mission, product, and platform.</h2><span>HomeLead Connect LLC product direction, platform architecture, application development, operations design, and launch implementation: Antoine Washington.</span><span>HomeLead Connect visual logo design credit: Dion Diamond.</span></div><img src="/hlc-logo-public.webp" alt="HomeLead Connect LLC official logo" /></section>
  </main>;
}
