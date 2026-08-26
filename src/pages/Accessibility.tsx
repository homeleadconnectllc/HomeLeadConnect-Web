import { Link } from "react-router-dom";
import "../styles/public-utility-flat.css";

const commitments = [
  ["Navigation", "Keyboard-operable by design", "Navigation and actions should remain reachable without requiring a pointer or touch-only interaction."],
  ["Responsive", "No required horizontal scrolling", "Public, portal, and workspace layouts are designed to adapt across phone, tablet, desktop, zoom, and safe-area constraints."],
  ["Communication", "Status and error information", "Forms use semantic labels and visible status or error messaging so users can understand what happened and what to do next."],
  ["Media", "Meaningful alternatives", "Meaningful imagery and agent portraits should include text alternatives, with captions or transcripts for future instructional media."],
  ["Motion + contrast", "Readable and controllable", "HLC supports reduced-motion-aware presentation and clear contrast targets across high-attention actions and status surfaces."],
  ["States", "Clear when something changes", "Loading, empty, denied and failure states should be explicit rather than leaving users to infer whether an action succeeded."],
] as const;

export default function Accessibility() {
  return <main className="hlc-utility-page"><div className="hlc-utility-shell">
    <header className="hlc-utility-header">
      <div>
        <div className="hlc-utility-brand"><img className="hlc-utility-logo" src="/hlc-logo-transparent.png" alt="HomeLead Connect" /></div>
        <p className="hlc-utility-kicker">Accessibility</p>
        <h1 className="hlc-utility-title">HomeLead Connect should work across devices, inputs, and abilities.</h1>
        <p className="hlc-utility-lead">HLC is being built for keyboard, screen-reader, zoom, contrast, reduced-motion and phone use across public, portal and workspace experiences.</p>
        <div className="hlc-utility-actions"><Link className="hlc-utility-primary" to="/contact">Report an accessibility problem</Link><Link className="hlc-utility-secondary" to="/">Back to HomeLead Connect</Link></div>
      </div>
      <div className="hlc-utility-summary" aria-label="Accessibility release principles"><span><strong>Keyboard</strong><small>Operable</small></span><span><strong>Responsive</strong><small>Phone to desktop</small></span><span><strong>Explicit</strong><small>States and errors</small></span></div>
    </header>

    <section className="hlc-utility-sections" aria-label="Accessibility commitments">
      {commitments.map(([label,title,body]) => <article className="hlc-utility-section" key={title}><p className="hlc-utility-section-label">{label}</p><div className="hlc-utility-section-main"><h2>{title}</h2><p>{body}</p></div></article>)}
    </section>

    <section className="hlc-utility-focus"><p className="hlc-utility-section-label">Need help?</p><h2>Report a problem with enough context to reproduce it.</h2><p>Include the page, device, browser and the action you could not complete. Do not send passwords, authentication codes or sensitive job information through a general support message.</p><div className="hlc-utility-actions"><Link className="hlc-utility-primary" to="/contact">Contact HomeLead Connect</Link></div></section>
    <section className="hlc-utility-section"><p className="hlc-utility-section-label">Release standard</p><div className="hlc-utility-section-main"><h2>Accessibility acceptance is part of deployment readiness.</h2><p>Formal WCAG acceptance testing is still required on each deployment candidate. A polished interface is not treated as proof of accessibility by itself.</p></div></section>
  </div></main>;
}
