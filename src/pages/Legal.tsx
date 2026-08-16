import { Link } from "react-router-dom";
import "../styles/legal.css";

type LegalPage = "privacy" | "terms" | "platform";

const ReviewNotice = () => (
  <p className="hlc-legal-review" role="note">
    <strong>ATTORNEY REVIEW REQUIRED:</strong> This Pennsylvania V1 draft is provided for pre-launch review and is not represented as attorney-approved.
  </p>
);

function PrivacyPage() {
  return <>
    <header className="hlc-legal-brandbar">
      <Link to="/" aria-label="HomeLead Connect home">
        <img className="hlc-legal-logo" src="/hlc-logo-final.png" alt="HomeLead Connect" />
      </Link>
      <div className="hlc-legal-status"><span className="hlc-legal-status-dot"/>HLC PRIVACY &amp; TRUST</div>
    </header>

    <section className="hlc-legal-hero">
      <div className="hlc-legal-hero-grid">
        <div>
          <div className="hlc-legal-kicker">HOMELEAD CONNECT LLC</div>
          <h1 className="hlc-legal-title">Privacy,<span>built into the experience.</span></h1>
          <p className="hlc-legal-lead">This Privacy Policy explains how HomeLead Connect LLC collects, uses, shares, and protects information when you use our websites, applications, forms, communications, and services.</p>
          <div className="hlc-legal-effective"><span className="hlc-legal-status-dot"/>Effective August 15, 2026</div>
          <div className="hlc-legal-actions">
            <Link className="hlc-legal-primary" to="/app">Open HLC App →</Link>
            <a className="hlc-legal-secondary" href="https://homeleadconnect.org/">HomeLead Connect</a>
          </div>
        </div>

        <aside className="hlc-legal-guide" aria-label="HLC Privacy Center">
          <div className="hlc-legal-avatar"><img src="/brand/avatars/Kendrell_Locked_HLC.png" alt="Kendrell, HomeLead Connect assistant" /></div>
          <div className="hlc-legal-guide-label">HLC PRIVACY CENTER</div>
          <div className="hlc-legal-guide-title">Your information matters.</div>
          <p>Kendrell can help you navigate HomeLead Connect account, privacy, security, and platform information.</p>
          <div className="hlc-legal-guide-note">Platform guidance only · not legal advice</div>
          <div className="hlc-legal-trust">
            <div><strong>✓ Protected</strong><span>Account access</span></div>
            <div><strong>◈ Scoped</strong><span>Workspace data</span></div>
            <div><strong>◎ Secure</strong><span>Platform controls</span></div>
          </div>
        </aside>
      </div>
    </section>

    <ReviewNotice />

    <section className="hlc-legal-card"><h2>1. Information We Collect</h2><p>We may collect information you provide directly to us, including your name, email address, phone number, service address, company information, service request details, appointment information, messages, documents, and other information you choose to submit.</p><p>We may also collect technical and usage information such as device type, browser type, IP address, pages viewed, application events, session information, and interaction data used to operate, secure, troubleshoot, and improve the HomeLead Connect platform.</p></section>

    <section className="hlc-legal-card"><h2>2. How We Use Information</h2><p>We may use information to:</p><ul><li>Provide and operate HomeLead Connect services.</li><li>Connect residents, customers, professionals, contractors, and service providers.</li><li>Manage service requests, leads, estimates, jobs, appointments, follow-ups, and communications.</li><li>Maintain user accounts, workspaces, portals, and access permissions.</li><li>Send service-related communications and requested updates.</li><li>Process payments and subscription-related activity.</li><li>Prevent fraud, abuse, spam, and unauthorized access.</li><li>Analyze usage and improve platform performance and reliability.</li><li>Comply with applicable legal, regulatory, and contractual obligations.</li></ul></section>

    <section className="hlc-legal-card"><h2>3. Communications</h2><p>If you provide contact information, HomeLead Connect may contact you regarding service requests, appointments, account activity, professional applications, operational updates, or other matters related to your use of the platform.</p><p>Where required, marketing or automated communications will be sent only with appropriate consent. You may request that certain communications stop, subject to legal or service-related exceptions.</p></section>

    <section className="hlc-legal-card"><h2>4. Service Providers and Third Parties</h2><p>We may use third-party service providers to support platform operations, including hosting, database services, authentication, communications, payments, analytics, email delivery, and other infrastructure.</p><p>These providers may process information on our behalf only as needed to provide their services, subject to their applicable agreements and privacy practices.</p></section>

    <section className="hlc-legal-card"><h2>5. Professionals and Service Providers</h2><p>Information related to a service request may be shared with authorized professionals, contractors, or service providers when necessary to evaluate, schedule, perform, or manage requested work.</p><div className="hlc-legal-note">HomeLead Connect is a connection, scheduling, and operational platform and does not independently guarantee the work, licensing, insurance, pricing, or performance of third-party service providers.</div></section>

    <section className="hlc-legal-card"><h2>6. Payment Information</h2><p>Payment processing may be handled by third-party payment providers. HomeLead Connect does not intend to store complete payment-card numbers directly in its application database.</p></section>

    <section className="hlc-legal-card"><h2>7. Data Security</h2><p>We use reasonable administrative, technical, and organizational measures intended to protect information against unauthorized access, misuse, alteration, or disclosure.</p><p>No internet-based service can guarantee absolute security. Users should also take reasonable steps to protect account credentials and devices.</p></section>

    <section className="hlc-legal-card"><h2>8. Data Retention</h2><p>We may retain information for as long as reasonably necessary to operate the platform, maintain records, support business operations, resolve disputes, enforce agreements, meet legal requirements, and protect the security and integrity of HomeLead Connect.</p></section>

    <section className="hlc-legal-card"><h2>9. Your Choices</h2><p>Depending on your relationship with HomeLead Connect and applicable law, you may request access to, correction of, or deletion of certain personal information.</p><p>Some information may need to be retained for legitimate operational, legal, security, accounting, or compliance purposes.</p></section>

    <section className="hlc-legal-card"><h2>10. Cookies and Similar Technologies</h2><p>HomeLead Connect may use browser storage, cookies, or similar technologies to maintain sessions, support authentication, remember preferences, provide security controls, and understand platform usage.</p></section>

    <section className="hlc-legal-card"><h2>11. Children's Privacy</h2><p>HomeLead Connect is not intended for children under 13, and we do not knowingly seek to collect personal information directly from children under 13.</p></section>

    <section className="hlc-legal-card"><h2>12. External Links</h2><p>Our websites and applications may link to third-party websites or services. HomeLead Connect is not responsible for the privacy practices, content, or security of independent third-party services.</p></section>

    <section className="hlc-legal-card"><h2>13. Changes to This Privacy Policy</h2><p>We may update this Privacy Policy from time to time. The current version will be posted on this page with an updated effective date when appropriate.</p></section>

    <section className="hlc-legal-card"><h2>14. Contact Us</h2><p>Privacy, account, or platform questions may be directed to HomeLead Connect LLC.</p><div className="hlc-legal-contact"><strong>HomeLead Connect LLC</strong><span>Harrisburg, Pennsylvania</span><a href="mailto:homeleadconnect@gmail.com">homeleadconnect@gmail.com</a><a href="https://homeleadconnect.org/">homeleadconnect.org</a><Link to="/app">app.homeleadconnect.org</Link></div></section>
  </>;
}

export default function Legal({ page }: { page: LegalPage }) {
  return <main className="hlc-legal-page"><div className="hlc-legal-shell">
    {page === "privacy" && <PrivacyPage />}
    {page === "terms" && <><ReviewNotice/><section className="hlc-legal-card"><h1>Terms of Service — launch draft</h1><h2>Platform role</h2><p>HomeLead Connect LLC provides software and marketplace/referral/coordination services. Unless a separate written agreement expressly states otherwise, HLC is not the contractor or trade professional performing the underlying work. The identified service provider is responsible for its offer, contract, credentials, work, scheduling commitments, and legal obligations.</p><h2>SaaS trial and subscription</h2><p>The Pennsylvania V1 software plan includes a 14-day free trial and then renews monthly at $49.99 USD unless cancelled. A payment method is required to start the trial; no subscription charge is scheduled before the trial ends.</p><h2>Acceptable use and records</h2><p>Users must provide accurate information, use only records they are authorized to access, and not bypass security, consent, suppression, lifecycle, or provider restrictions.</p></section></>}
    {page === "platform" && <><ReviewNotice/><section className="hlc-legal-card"><h1>Platform and contractor disclosure — launch draft</h1><p>HomeLead Connect is a software/platform and marketplace/referral/coordination service. HLC does not perform the underlying trade or home service merely because a request, LeadScope estimate, contractor offer, appointment, or message is recorded in the platform.</p><p>The actual contractor, subcontractor, mover, cleaner, painter, landscaper, repair provider, or other identified service business performs and is responsible for the underlying work and its customer agreement.</p><h2>Pennsylvania registrations</h2><p>When HLC displays a Pennsylvania Home Improvement Contractor registration, it must be labeled factually with its registration number and source/check date. Registration is not an HLC endorsement, competency finding, quality certification, or generic “Verified Contractor” badge.</p></section></>}
    <nav className="hlc-legal-nav" aria-label="Legal pages"><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/platform-disclosure">Platform disclosure</Link></nav>
  </div></main>;
}
