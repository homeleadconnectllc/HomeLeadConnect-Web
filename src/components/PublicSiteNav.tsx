import { Link } from "react-router-dom";
import "../styles/public-site-nav.css";

const links = [
  ["For Residents", "/homeowners"],
  ["For Professionals", "/professionals"],
  ["For Partners", "/partners"],
  ["Community", "/community"],
] as const;

export default function PublicSiteNav() {
  return <nav className="hlc-public-site-nav" aria-label="Public site navigation">
    <div className="hlc-public-site-nav__inner">
      <Link className="hlc-public-site-nav__brand" to="/" aria-label="HomeLead Connect home">
        <img src="/hlc-logo-public.webp" alt="HomeLead Connect" width={220} height={71} />
      </Link>
      <div className="hlc-public-site-nav__links">
        {links.map(([label, to]) => <Link key={to} to={to}>{label}</Link>)}
      </div>
      <div className="hlc-public-site-nav__actions">
        <Link className="hlc-public-site-nav__login" to="/login">Sign in</Link>
        <Link className="hlc-public-site-nav__cta" to="/request-service">Request service</Link>
      </div>
    </div>
  </nav>;
}
