import { Link } from "react-router-dom";
import "../styles/public-utility-flat.css";

const paths = [
  { eyebrow: "HOME HELP", title: "Request home service", body: "Tell HLC what you need and route the request into the connected service workflow.", to: "/request-service", action: "Start service request" },
  { eyebrow: "PROFESSIONALS", title: "Grow with the HLC network", body: "Contractors, trades and service businesses can apply to participate in the HomeLead Connect ecosystem.", to: "/professional-application", action: "Apply as a professional" },
  { eyebrow: "PLATFORM", title: "Account & business support", body: "Questions about HLC, workspace access, partnerships or the platform can go directly to our business contact.", to: "mailto:homeleadconnect@gmail.com", action: "Email HomeLead Connect" },
] as const;

export default function ContactPage() {
  return <main className="hlc-utility-page"><div className="hlc-utility-shell">
    <header className="hlc-utility-header">
      <div>
        <div className="hlc-utility-brand"><img className="hlc-utility-logo" src="/branding/hlc-logo-full.png" alt="HomeLead Connect" /></div>
        <p className="hlc-utility-kicker">HomeLead Connect · Contact</p>
        <h1 className="hlc-utility-title">How can we help?</h1>
        <p className="hlc-utility-lead">One place for home-service requests, professional opportunities, and HomeLead Connect platform support.</p>
        <div className="hlc-utility-actions"><Link className="hlc-utility-primary" to="/request-service">Request home service</Link><Link className="hlc-utility-secondary" to="/professionals">For professionals</Link></div>
      </div>
      <div className="hlc-utility-summary" aria-label="Contact pathways"><span><strong>Residents</strong><small>Service requests</small></span><span><strong>Professionals</strong><small>Network participation</small></span><span><strong>Platform</strong><small>Account support</small></span></div>
    </header>

    <section className="hlc-utility-paths" aria-label="Contact paths">
      {paths.map((item) => <article className="hlc-utility-path" key={item.title}><p className="hlc-utility-section-label">{item.eyebrow}</p><div><h2>{item.title}</h2><p>{item.body}</p></div>{item.to.startsWith("mailto:") ? <a className="hlc-utility-link" href={item.to}>{item.action} →</a> : <Link className="hlc-utility-link" to={item.to}>{item.action} →</Link>}</article>)}
    </section>

    <section className="hlc-utility-contact-grid" aria-label="HomeLead Connect business contact">
      <div><p className="hlc-utility-section-label">Business contact</p><h2 className="hlc-utility-title" style={{fontSize:"clamp(1.8rem,4vw,2.8rem)"}}>HomeLead Connect LLC</h2><p className="hlc-utility-lead">Serving the Pennsylvania launch market with a connected platform for residents, professionals, and participating businesses.</p></div>
      <div className="hlc-utility-contact-details"><div><span className="hlc-utility-detail-label">Founder / Owner</span><strong>Antoine Washington</strong></div><div><span className="hlc-utility-detail-label">Email</span><a href="mailto:homeleadconnect@gmail.com">homeleadconnect@gmail.com</a></div><div><span className="hlc-utility-detail-label">Phone</span><a href="tel:+17172881785">717-288-1785</a></div><div><span className="hlc-utility-detail-label">Web</span><a href="https://homeleadconnect.org">homeleadconnect.org</a></div></div>
    </section>

    <section className="hlc-utility-focus"><p className="hlc-utility-section-label">Ready when you are</p><h2>Start with the right HLC path.</h2><p>Service requests enter the HLC workflow for review. Submitting a request does not guarantee provider assignment, pricing, or an appointment.</p><div className="hlc-utility-actions"><Link className="hlc-utility-primary" to="/request-service">Request service →</Link></div></section>
  </div></main>;
}
