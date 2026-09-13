import { Link } from "react-router-dom";
import "../styles/public-site-nav.css";

const links = [
  ["About", "/about"],
  ["For Residents", "/homeowners"],
  ["For Professionals", "/professionals"],
  ["For Partners", "/partners"],
  ["Community", "/community"],
  ["Resources", "/services"],
] as const;

export default function PublicSiteNav() {
  return <nav className="hlc-public-site-nav" aria-label="Primary navigation">
    <div className="hlc-public-site-nav__inner">
      <Link className="hlc-public-site-nav__brand" to="/" aria-label="HomeLead Connect home">
        <img src="/hlc-logo-public.webp" alt="HomeLead Connect" width={440} height={142} />
      </Link>
      <div className="hlc-public-site-nav__links">
        {links.map(([label, to]) => <Link key={to} to={to}>{label}</Link>)}
      </div>
      <div className="hlc-public-site-nav__actions">
        <a className="hlc-public-site-nav__login" href="https://app.homeleadconnect.org/login">Sign In</a>
        <a className="hlc-public-site-nav__cta" href="https://app.homeleadconnect.org/register">Get Started →</a>
        <details className="hlc-public-site-nav__menu">
          <summary>Menu</summary>
          <div className="hlc-public-site-nav__menu-panel">
            {links.map(([label, to]) => <Link key={to} to={to}>{label}</Link>)}
            <a href="https://app.homeleadconnect.org/login">Sign In</a>
            <a href="https://app.homeleadconnect.org/register">Get Started</a>
          </div>
        </details>
      </div>
    </div>
  </nav>;
}
