import { Link } from "react-router-dom";
import PublicSiteNav from "../components/PublicSiteNav";
import "../styles/public-premium.css";
import "../styles/public-board-pages-20260912.css";

const routes = [
  ["Home service", "Need help with a home project? Start with a service request and tell HLC what you need.", "/request-service", "Request service"],
  ["Professional network", "Interested in bringing your business into the HLC service network?", "/professional-application", "Apply as a professional"],
  ["Community", "Looking for the broader HomeLead Connect community and network experience?", "/community", "Explore community"],
] as const;

export default function Contact() {
  return (
    <main className="hlc-public-page hlc-public-board-page" data-public-page="contact">
      <PublicSiteNav />
      <div className="hlc-public-shell hlc-public-shell--visual">
        <header className="hlc-public-hero">
          <div>
            <p className="hlc-public-kicker">HomeLead Connect · Contact</p>
            <h1>Let’s get you to the right next step.</h1>
            <p className="hlc-public-intro-copy">
              HomeLead Connect connects residents, professionals, partners and communities through one clear service ecosystem. Choose the path that best matches what you need today.
            </p>
            <div className="hlc-public-actions">
              <Link className="hlc-public-primary" to="/request-service">Get help now</Link>
              <Link className="hlc-public-secondary" to="/">Back to HomeLead Connect</Link>
            </div>
          </div>
        </header>
        <figure className="hlc-public-visual hlc-public-visual--contact" aria-label="Family planning a home project">
          <img src="/four-pathways-residents-hq-20260915.jpg" alt="People connecting around a home-service project" loading="eager" />
        </figure>
        <section className="hlc-public-grid" aria-label="Contact pathways">
          {routes.map(([eyebrow, copy, to, action]) => (
            <article className="hlc-public-card" key={eyebrow}>
              <p className="hlc-public-card-label">{eyebrow}</p>
              <h2>{action}</h2>
              <p>{copy}</p>
              <Link className="hlc-public-link" to={to}>{action} →</Link>
            </article>
          ))}
        </section>
        <section className="hlc-public-offer" aria-label="HomeLead Connect contact guidance">
          <p className="hlc-public-offer-label">ONE CONNECTED FRONT DOOR</p>
          <div className="hlc-public-price"><strong>Start with the workflow, not a dead end.</strong></div>
          <p>HomeLead Connect keeps requests, professional participation, scheduling, communications and community experiences connected. If you are unsure where to begin, start with HomeLead Connect and choose the path that matches your goal.</p>
          <Link className="hlc-public-primary" to="/">Explore the platform</Link>
        </section>
      </div>
    </main>
  );
}
