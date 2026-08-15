import { Link } from "react-router-dom";

type LegalPage = "privacy" | "terms" | "platform";

const reviewNotice = <p role="note" style={{ padding: 12, background: "#fff7ed", border: "1px solid #fdba74" }}>
  <strong>ATTORNEY REVIEW REQUIRED:</strong> This Pennsylvania V1 draft is provided for pre-launch review and is not represented as attorney-approved.
</p>;

export default function Legal({ page }: { page: LegalPage }) {
  return <main style={{ width: "min(820px, calc(100% - 32px))", margin: "48px auto", lineHeight: 1.65 }}>
    {reviewNotice}
    {page === "privacy" && <>
      <h1>Privacy Policy — launch draft</h1>
      <p>HomeLead Connect LLC provides software that helps participating businesses receive service requests and manage estimates, jobs, contractor assignments, appointments, portal access, and communications.</p>
      <h2>Information handled by HLC</h2>
      <p>Depending on the service used, HLC may process account and business profile information, service-request and contact information, estimates and job records, appointment information, portal messages, documents deliberately shared through HLC, consent and suppression records, billing identifiers and subscription status, and security/audit records.</p>
      <h2>How information is used</h2>
      <p>HLC uses information to provide and secure the platform, route an authorized service request to the intended participating workspace, maintain requested workflows, support communications, administer subscriptions, prevent abuse, and meet applicable recordkeeping obligations.</p>
      <h2>Access and service providers</h2>
      <p>Information is available only through applicable account, workspace, portal-link, and sharing permissions. HLC may use infrastructure, payment, authentication, hosting, and communication providers to perform platform functions. HLC does not treat an email match alone as portal authorization.</p>
      <h2>Choices and contact</h2>
      <p>Communication consent and opt-out requests are recorded by channel where supported. Do not use an opt-out message for emergencies. Questions or privacy requests may be sent to homeleadconnect@gmail.com. Final retention, deletion, and Pennsylvania breach-response language remains subject to counsel review.</p>
    </>}
    {page === "terms" && <>
      <h1>Terms of Service — launch draft</h1>
      <h2>Platform role</h2>
      <p>HomeLead Connect LLC provides software and marketplace/referral/coordination services. Unless a separate written agreement expressly states otherwise, HLC is not the contractor or trade professional performing the underlying work. The identified service provider is responsible for its offer, contract, credentials, work, scheduling commitments, and legal obligations.</p>
      <h2>SaaS trial and subscription</h2>
      <p>The Pennsylvania V1 software plan includes a 14-day free trial and then renews monthly at $49.99 USD unless cancelled. A payment method is required to start the trial; no subscription charge is scheduled before the trial ends. Enrollment requires affirmative acknowledgment of the displayed trial length, recurring price, first-charge timing, and cancellation method.</p>
      <p>Customers may manage or cancel through the Stripe-hosted billing portal when billing is enabled. Cancellation during a paid period is intended to take effect at that period’s end. Failed payments have a target seven-day grace period before paid entitlement suspension. Refund language remains subject to final review and no automatic prorated refund is promised here.</p>
      <h2>Acceptable use and records</h2>
      <p>Users must provide accurate information, use only records they are authorized to access, and not bypass security, consent, suppression, lifecycle, or provider restrictions. Account activity may be recorded for security and operational audit.</p>
      <h2>Underlying work</h2>
      <p>A LeadScope estimate or HLC workflow record does not by itself make HLC the contracting service provider. Covered Pennsylvania home-improvement work may require a separate written agreement between the homeowner and actual contractor containing legally required terms.</p>
    </>}
    {page === "platform" && <>
      <h1>Platform and contractor disclosure — launch draft</h1>
      <p>HomeLead Connect is a software/platform and marketplace/referral/coordination service. HLC does not perform the underlying trade or home service merely because a request, LeadScope estimate, contractor offer, appointment, or message is recorded in the platform.</p>
      <p>The actual contractor, subcontractor, mover, cleaner, painter, landscaper, repair provider, or other identified service business performs and is responsible for the underlying work and its customer agreement.</p>
      <h2>Pennsylvania registrations</h2>
      <p>When HLC displays a Pennsylvania Home Improvement Contractor registration, it must be labeled factually with its registration number and source/check date. Registration is not an HLC endorsement, competency finding, quality certification, or generic “Verified Contractor” badge.</p>
      <p>Consumers can consult the <a href="https://www.attorneygeneral.gov/for-the-public/home-improvement/">Pennsylvania Office of Attorney General contractor-registration resource</a>. Applicability and required contract terms vary by work and provider and require legal review.</p>
    </>}
    <nav aria-label="Legal pages" style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 28 }}>
      <Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/platform-disclosure">Platform disclosure</Link>
    </nav>
  </main>;
}
