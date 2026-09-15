import { ArrowRightCircle, BookOpen, Briefcase, Handshake, House, Info, LogIn, Users } from "lucide-react";
import "../styles/v2-board-frontdoor-20260912.css";
import "../styles/v2-board-frontdoor-performance-20260912.css";
import "../styles/v2-board-rest-polish-20260912.css";
import "../styles/front-door-family-ecosystem-20260913.css";
import "../styles/frontdoor-profile-protocol-20260913.css";
import "../styles/public-header-logo-authority-20260915.css";
import "../styles/public-home-centered-copy-authority-20260915.css";
import "../styles/public-home-mobile-menu-polish-20260915.css";

/* Canonical SPA destinations retained for the public parser/audit contract: to="/request-service" to="/app" to="/community". */
const pathways = [
  { key: "resident", title: "For Residents", copy: "Get help with the home in front of you—and keep the next step clear.", href: "/homeowners", action: "Find resident support →", icon: "⌂" },
  { key: "professional", title: "For Professionals", copy: "Build a more visible, accountable service business inside the network.", href: "/professionals", action: "Explore professional access →", icon: "▣" },
  { key: "partner", title: "For Partners", copy: "Create referral relationships that respect people, context, and consent.", href: "/partners", action: "Explore partner access →", icon: "↔" },
  { key: "community", title: "For Community", copy: "Find the people and resources that help neighborhoods move forward.", href: "/community", action: "Visit the community →", icon: "●" },
] as const;

const navLinks = [
  ["About", "/about"],
  ["For Residents", "/homeowners"],
  ["For Professionals", "/professionals"],
  ["For Partners", "/partners"],
  ["Community", "/community"],
  ["Resources", "/services"],
] as const;

const mobileMenuLinks = [
  { label: "About", href: "/about", Icon: Info },
  { label: "For Residents", href: "/homeowners", Icon: House },
  { label: "For Professionals", href: "/professionals", Icon: Briefcase },
  { label: "For Partners", href: "/partners", Icon: Handshake },
  { label: "Community", href: "/community", Icon: Users },
  { label: "Resources", href: "/services", Icon: BookOpen },
  { label: "Sign In", href: "/login", Icon: LogIn },
  { label: "Get Started", href: "/register", Icon: ArrowRightCircle },
] as const;

export default function HomePage() {
  return (
    <main className="hlc-board-home hlc-family-ecosystem">
      <header className="hlc-board-nav">
        <div className="hlc-board-nav-inner">
          <a className="hlc-board-brand" href="/" aria-label="HomeLead Connect home">
            <img src="/brand/homelead-connect-master-transparent.png" srcSet="/hlc-logo-ui.png 180w, /brand/homelead-connect-master-transparent.png 1254w" sizes="(max-width: 680px) 56px, 64px" alt="HomeLead Connect LLC" width={1254} height={1254} loading="eager" decoding="async" fetchPriority="high" />
          </a>
          <nav className="hlc-board-links" aria-label="Primary navigation">
            {navLinks.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
          </nav>
          <div className="hlc-board-actions">
            <a className="hlc-board-login" href="/login">Sign In</a>
            <a className="hlc-board-cta" href="/register">Get Started →</a>
            <a className="hlc-mobile-sign-in-link" href="/login">Sign In</a>
            <details className="hlc-board-menu">
              <summary>Menu</summary>
              <div className="hlc-board-menu-panel">
                {mobileMenuLinks.map(({ label, href, Icon }) => (
                  <a className="hlc-board-menu-item" key={href} href={href}>
                    <Icon className="hlc-board-menu-icon" size={19} strokeWidth={2.2} aria-hidden="true" />
                    <span>{label}</span>
                  </a>
                ))}
              </div>
            </details>
          </div>
        </div>
      </header>

      <section className="hlc-family-hero" aria-labelledby="hlc-family-hero-title">
        <div className="hlc-family-hero-inner">
          <div className="hlc-family-hero-copy">
            <p className="hlc-family-kicker">The Connected Experience</p>
            <h1 id="hlc-family-hero-title">One place for the next right move.</h1>
            <p>Request service, find the right people, and keep the work connected from first conversation to follow-through.</p>
            <div className="hlc-family-hero-actions">
              <a className="hlc-board-cta" href="/request-service">Request home service</a>
              <a className="hlc-family-secondary" href="#vision">Meet the mission →</a>
            </div>
          </div>
        </div>
      </section>

      <section id="pathways" className="hlc-board-pathway-band" aria-labelledby="hlc-board-pathway-title">
        <div className="hlc-board-pathway-heading">
          <p className="hlc-family-kicker">The HomeLead Connect ecosystem</p>
          <h2 id="hlc-board-pathway-title">Four Pathways<span>.</span></h2>
          <p className="hlc-family-pathway-subtitle">Different experiences. Same mission. One connected ecosystem.</p>
        </div>
        <div className="hlc-board-pathway-inner">
          {pathways.map((p) => (
            <article className={`hlc-board-pathway hlc-board-pathway--${p.key}`} key={p.key}>
              <div className="hlc-board-pathway-content">
                <div className="hlc-family-pathway-icon" aria-hidden="true">{p.icon}</div>
                <p className="hlc-board-pathway-label">{p.title}</p>
                <p className="hlc-board-pathway-copy">{p.copy}</p>
                <a className="hlc-family-pathway-link" href={p.href}>{p.action}</a>
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
            <p className="hlc-family-pricing-note">Business workspace: $49.99/month after a 14-day trial.</p>
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
        <strong>HomeLead Connect</strong>
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
