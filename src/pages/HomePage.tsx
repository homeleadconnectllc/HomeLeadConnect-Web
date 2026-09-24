import PublicSiteNav from "../components/PublicSiteNav";
import "../styles/public-home-owner-authority-20260918.css";
import "../styles/connected-visual-family-20260923.css";

const pathways = [
  { key: "resident", title: "For Residents", copy: "Find help with the home in front of you—and keep the next step clear.", href: "/homeowners", action: "Find resident support →" },
  { key: "professional", title: "For Professionals", copy: "Grow your business, get more opportunities, and do your best work.", href: "/professionals", action: "Explore professional access →" },
  { key: "partner", title: "For Partners", copy: "Create referral relationships that respect people, context, and consent.", href: "/partners", action: "Explore partner opportunities →" },
  { key: "community", title: "For Community", copy: "Find the people and resources that help build stronger neighborhoods.", href: "/community", action: "Explore community resources →" },
] as const;

export default function HomePage() {
  return (
    <main className="hlc-owner-home" data-public-page="home">
      <PublicSiteNav />
      <section className="hlc-owner-hero" aria-labelledby="hlc-owner-title">
        <picture className="hlc-owner-hero-media" aria-hidden="true">
          <source media="(max-width: 680px)" srcSet="/home-hero-authority-mobile-20260916.webp" />
          <img src="/home-hero-authority-desktop-20260916.webp" alt="" width="1600" height="900" fetchPriority="high" decoding="sync" />
        </picture>
        <div className="hlc-owner-hero-copy">
          <p className="hlc-owner-kicker">The HomeLead Connect ecosystem</p>
          <h1 id="hlc-owner-title">A stronger community <span>starts here.</span></h1>
          <p className="hlc-owner-tagline">Connecting homes. Creating opportunities.</p>
          <p className="hlc-owner-intro">The people. The services. The partnerships.<br />All in one place to help our communities move forward.</p>
          <p className="hlc-owner-price"><strong>14 days free</strong> for the professional business workspace · then <strong>$49.99/month</strong>.</p>
        </div>
        <p className="hlc-owner-script">Stronger Homes. Brighter Futures.<small>Harrisburg, PA</small></p>
      </section>
      <section className="hlc-owner-pathways" aria-label="HomeLead Connect pathways">
        {pathways.map((p) => <a className={`hlc-owner-pathway hlc-owner-pathway--${p.key}`} href={p.href} key={p.key}>
          <span className="hlc-owner-pathway-photo" aria-hidden="true" />
          <span className="hlc-owner-pathway-body"><strong>{p.title}</strong><span>{p.copy}</span><b>{p.action}</b></span>
        </a>)}
      </section>
      <section className="hlc-owner-mission" aria-label="HomeLead Connect mission">
        <p>Connecting Homes. Creating Opportunities.</p>
        <div><span>⌂ <b>Stronger Homes</b></span><span>◎ <b>More Opportunities</b></span><span>↔ <b>Thriving Communities</b></span><span>↗ <b>Brighter Futures</b></span></div>
      </section>
    </main>
  );
}
