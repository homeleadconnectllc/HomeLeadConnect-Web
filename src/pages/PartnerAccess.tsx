import { Link } from "react-router-dom";
import PublicSiteNav from "../components/PublicSiteNav";
import "../styles/public-premium.css";
import "../styles/public-page-consistency-20260913.css";

export default function PartnerAccess(){
  return <main className="hlc-public-consistency-page">
    <PublicSiteNav/>
    <div className="hlc-public-consistency-shell">
      <section className="hlc-public-consistency-hero">
        <header className="hlc-public-consistency-copy">
          <p className="hlc-public-consistency-kicker">HomeLead Connect partners</p>
          <h1>Refer people without entering the contractor workflow.</h1>
          <p>Approved businesses, community organizations, and referral sources can use a dedicated partner account to record resident or professional referrals, check their current status, and submit another referral.</p>
          <div className="hlc-public-consistency-actions">
            <Link className="primary" to="/login">Sign in</Link>
            <Link className="secondary" to="/contact">Ask about partner access</Link>
          </div>
        </header>
        <figure className="hlc-public-consistency-visual" aria-label="HomeLead Connect partner connection">
          <img src="/hlc-frontdoor-people-first.webp" alt="People connecting around a home-service project" loading="eager" referrerPolicy="no-referrer"/>
        </figure>
      </section>
      <section className="hlc-public-consistency-section">
        <p className="hlc-public-consistency-kicker">How partner access works</p>
        <h2>A clear referral relationship.</h2>
        <ol>
          <li>Contact HLC and identify the business or referral relationship.</li>
          <li>HLC approves and links a signed-in account to the partner source.</li>
          <li>The partner portal records referral attribution and status without exposing internal CRM records.</li>
          <li>Partners can return to submit another referral when needed.</li>
        </ol>
      </section>
      <section className="hlc-public-consistency-section">
        <p className="hlc-public-consistency-kicker">Already approved?</p>
        <h2>Return to your partner workspace.</h2>
        <p>Sign in with the account HLC linked to your partner source, then open the Partner Portal.</p>
        <Link to="/partner-portal">Open Partner Portal →</Link>
      </section>
    </div>
  </main>;
}
