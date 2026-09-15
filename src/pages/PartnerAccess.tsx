import { Link } from "react-router-dom";
import PublicSiteNav from "../components/PublicSiteNav";
import "../styles/public-premium.css";
import "../styles/public-board-pages-20260912.css";

export default function PartnerAccess(){
  return <main className="hlc-public-page hlc-public-board-page" data-public-page="partners">
    <PublicSiteNav/>
    <div className="hlc-public-shell hlc-public-shell--visual">
      <header className="hlc-public-hero">
        <div>
          <p className="hlc-public-kicker">HomeLead Connect partners</p>
          <h1>Refer people without entering the contractor workflow.</h1>
          <p className="hlc-public-intro-copy">Approved businesses, community organizations, and referral sources can use a dedicated partner account to record resident or professional referrals, check their current status, and submit another referral.</p>
          <div className="hlc-public-actions">
            <a className="hlc-public-primary" href="https://app.homeleadconnect.org/login">Sign In</a>
            <Link className="hlc-public-secondary" to="/contact">Ask about partner access</Link>
          </div>
        </div>
      </header>
      <figure className="hlc-public-visual" aria-label="HomeLead Connect partner connection">
        <img src="/four-pathways-residents-hq-20260915.jpg" alt="People connecting around a home-service project" loading="eager" referrerPolicy="no-referrer"/>
      </figure>
      <section className="hlc-public-grid" aria-label="How partner access works">
        <article className="hlc-public-card"><p className="hlc-public-card-label">01 · Relationship</p><h2>Identify the partner relationship.</h2><p>Contact HomeLead Connect and identify the business, organization, or referral relationship.</p></article>
        <article className="hlc-public-card"><p className="hlc-public-card-label">02 · Access</p><h2>Approval comes before portal access.</h2><p>HomeLead Connect approves and links a signed-in account to the partner source before protected records become available.</p></article>
        <article className="hlc-public-card"><p className="hlc-public-card-label">03 · Referrals</p><h2>Attribution stays explicit.</h2><p>The partner portal records referral attribution and status without exposing unrelated internal CRM records.</p></article>
      </section>
      <section className="hlc-public-offer">
        <p className="hlc-public-offer-label">Already approved?</p>
        <h2>Return to your partner workspace.</h2>
        <p>Sign in with the account HomeLead Connect linked to your partner source, then open the Partner Portal.</p>
        <div className="hlc-public-actions"><a className="hlc-public-primary" href="https://app.homeleadconnect.org/partner-portal">Open Partner Portal →</a></div>
      </section>
    </div>
  </main>;
}
