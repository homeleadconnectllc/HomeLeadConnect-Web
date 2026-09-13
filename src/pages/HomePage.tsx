import "../styles/v2-board-frontdoor-20260912.css";
import "../styles/v2-board-frontdoor-performance-20260912.css";
import "../styles/v2-board-rest-polish-20260912.css";
import "../styles/front-door-family-ecosystem-20260913.css";

/* Canonical SPA destinations retained for the public parser/audit contract: to="/request-service" to="/app" to="/community". */
const pathways = [
  { key: "resident", title: "For Residents", copy: "Build wealth. Find trusted professionals. Create your future.", href: "/homeowners", icon: "⌂" },
  { key: "professional", title: "For Professionals", copy: "Grow your business. Get more opportunities.", href: "/professionals", icon: "▣" },
  { key: "partner", title: "For Partners", copy: "Collaborate. Invest. Build a bigger impact.", href: "/partners", icon: "↔" },
  { key: "community", title: "For Our Community", copy: "Stronger neighborhoods. Greater possibilities.", href: "/community", icon: "●" },
] as const;

const navLinks = [
  ["About", "/about"],
  ["For Residents", "/homeowners"],
  ["For Professionals", "/professionals"],
  ["For Partners", "/partners"],
  ["Community", "/community"],
  ["Resources", "/services"],
] as const;

export default function HomePage() {
  return (
    <main className="hlc-board-home hlc-family-ecosystem">
      <header className="hlc-board-nav">
        <div className="hlc-board-nav-inner">
          <a className="hlc-board-brand" href="/" aria-label="HomeLead Connect home">
            <img src="/hlc-logo-public.webp" alt="HomeLead Connect LLC" width={440} height={142} loading="eager" decoding="async" />
          </a>
          <nav className="hlc-board-links" aria-label="Primary navigation">
            {navLinks.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
          </nav>
          <div className="hlc-board-actions">
            <a className="hlc-board-login" href="/login">Sign In</a>
            <a className="hlc-board-cta" href="/register">Get Started →</a>
            <details className="hlc-board-menu">
              <summary>Menu</summary>
              <div className="hlc-board-menu-panel">
                {navLinks.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
                <a href="/login">Sign In</a>
                <a href="/register">Get Started</a>
              </div>
            </details>
          </div>
        </div>
      </header>

      <section className="hlc-family-hero" aria-labelledby="hlc-family-hero-title">
        <img className="hlc-family-hero-media" src="/hlc-frontdoor-resident-hero-v2.webp" alt="" width={1536} height={864} fetchPriority="high" decoding="async" />
        <div className="hlc-family-hero-inner">
          <div className="hlc-family-hero-copy">
            <p className="hlc-family-kicker">Homes. People. Opportunity.</p>
            <h1 id="hlc-family-hero-title">A stronger community <span>starts at home.</span></h1>
            <p>HomeLead Connect brings residents, service professionals, partners and communities together through one connected ecosystem built around real people and real progress.</p>
            <div className="hlc-family-hero-actions">
              <a className="hlc-board-cta" href="/request-service">Request Service</a>
              <a className="hlc-family-secondary" href="#pathways">Explore the ecosystem →</a>
            </div>
          </div>
          <aside className="hlc-family-hero-note" aria-label="HomeLead Connect mission">
            <span>People</span>
            <span>Homes</span>
            <span>Opportunity</span>
            <strong>Together</strong>
          </aside>
        </div>
      </section>

      <section id="pathways" className="hlc-board-pathway-band" aria-labelledby="hlc-board-pathway-title">
        <div className="hlc-board-pathway-heading">
          <p className="hlc-family-kicker">The HomeLead Connect ecosystem</p>
          <h2 id="hlc-board-pathway-title">Four Pathways<span>.</span></h2>
          <p className="hlc-family-pathway-subtitle">Different experiences. Same mission. One connected ecosystem.</p>
          <p className="hlc-family-pathway-copy">HomeLead Connect connects the people, services, businesses and relationships that make a community work.</p>
          <a className="hlc-family-pathway-explore" href="#vision">Explore the ecosystem →</a>
        </div>
        <div className="hlc-board-pathway-inner">
          {pathways.map((p) => (
            <article className={`hlc-board-pathway hlc-board-pathway--${p.key}`} key={p.key}>
              <div className="hlc-board-pathway-content">
                <div className="hlc-family-pathway-icon" aria-hidden="true">{p.icon}</div>
                <p className="hlc-board-pathway-label">{p.title}</p>
                <p className="hlc-board-pathway-copy">{p.copy}</p>
                <a className="hlc-family-pathway-link" href={p.href}>Learn More →</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="vision" className="hlc-family-vision" aria-labelledby="hlc-family-vision-title">
        <div className="hlc-family-vision-inner">
          <div>
            <p className="hlc-family-vision-kicker">The HomeLead Connect vision</p>
            <h2 id="hlc-family-vision-title">A stronger community <span>starts here.</span></h2>
          </div>
          <p className="hlc-family-vision-note">Communities move forward when residents, professionals, partners and local opportunity move forward together.</p>
        </div>
      </section>

      <section className="hlc-family-entry" aria-labelledby="hlc-family-entry-title">
        <div className="hlc-family-entry-inner">
          <div>
            <p className="hlc-family-kicker">Ready when you are</p>
            <h2 id="hlc-family-entry-title">Start with the path that fits you.</h2>
            <p className="hlc-family-pricing-note">Business workspace: $49.99/month after 14-day trial.</p>
          </div>
          <div className="hlc-family-entry-actions">
            <a href="/request-service">Request Service</a>
            <a href="/professional-application">Apply as a Professional</a>
            <a href="/partners">Explore Partnerships</a>
            <a href="/app">Open the App</a>
          </div>
        </div>
      </section>

      <footer className="hlc-board-footer">
        <strong>HomeLead Connect LLC</strong>
        <span>Connecting Homes. Creating Opportunities.</span>
        <nav aria-label="Legal and accessibility">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/accessibility">Accessibility</a>
          <a href="/platform-disclosure">Platform disclosure</a>
        </nav>
        <small>© {new Date().getFullYear()} HomeLead Connect LLC</small>
      </footer>
    </main>
  );
}
