import { Link } from "react-router-dom";
import "../styles/public-premium.css";

export default function Accessibility() {
  return <main className="hlc-public-page"><div className="hlc-public-shell">
    <header className="hlc-public-hero">
      <div className="hlc-public-brand"><img className="hlc-public-logo" src="/hlc-logo-final.png" alt="HomeLead Connect" /></div>
      <p className="hlc-public-kicker">Accessibility</p>
      <h1>HomeLead Connect should work across devices, inputs, and abilities.</h1>
      <p className="hlc-public-hero-copy">HLC is being built for keyboard, screen-reader, zoom, contrast, reduced-motion and phone use across public, portal and workspace experiences.</p>
      <div className="hlc-public-actions"><Link className="hlc-public-primary" to="/contact">Report an accessibility problem</Link><Link className="hlc-public-secondary" to="/">Back to HomeLead Connect</Link></div>
    </header>

    <section className="hlc-public-grid" aria-label="Accessibility commitments">
      <article className="hlc-public-card"><p className="hlc-public-card-label">Navigation</p><h2>Keyboard-operable by design</h2><p>Navigation and actions should remain reachable without requiring a pointer or touch-only interaction.</p></article>
      <article className="hlc-public-card"><p className="hlc-public-card-label">Responsive</p><h2>No required horizontal scrolling</h2><p>Public, portal, and workspace layouts are designed to adapt across phone, tablet, desktop, zoom, and safe-area constraints.</p></article>
      <article className="hlc-public-card"><p className="hlc-public-card-label">Communication</p><h2>Status and error information</h2><p>Forms use semantic labels and visible status or error messaging so users can understand what happened and what to do next.</p></article>
      <article className="hlc-public-card"><p className="hlc-public-card-label">Media</p><h2>Meaningful alternatives</h2><p>Meaningful imagery and agent portraits should include text alternatives, with captions or transcripts for future instructional media.</p></article>
      <article className="hlc-public-card"><p className="hlc-public-card-label">Motion + contrast</p><h2>Readable and controllable</h2><p>HLC supports reduced-motion-aware presentation and clear contrast targets across high-attention actions and status surfaces.</p></article>
      <article className="hlc-public-card"><p className="hlc-public-card-label">States</p><h2>Clear when something changes</h2><p>Loading, empty, denied and failure states should be explicit rather than leaving users to infer whether an action succeeded.</p></article>
    </section>

    <section className="hlc-public-nav-cards">
      <article className="hlc-public-card"><p className="hlc-public-card-label">Need help?</p><h2>Report a problem with enough context to reproduce it.</h2><p>Include the page, device, browser and the action you could not complete. Do not send passwords, authentication codes or sensitive job information through a general support message.</p><Link className="hlc-public-link" to="/contact">Contact HomeLead Connect →</Link></article>
      <article className="hlc-public-card"><p className="hlc-public-card-label">Release standard</p><h2>Accessibility acceptance is part of deployment readiness.</h2><p>Formal WCAG acceptance testing is still required on each deployment candidate. A polished interface is not treated as proof of accessibility by itself.</p></article>
    </section>
  </div></main>;
}
