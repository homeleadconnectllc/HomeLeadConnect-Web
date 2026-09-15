import "../styles/public-site-nav.css";
import "../styles/frontdoor-profile-protocol-20260913.css";
import "../styles/public-header-logo-authority-20260915.css";

const PUBLIC_ORIGIN = "https://homeleadconnect.org";
const APP_ORIGIN = "https://app.homeleadconnect.org";

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
      <a className="hlc-public-site-nav__brand" href={`${PUBLIC_ORIGIN}/`} aria-label="HomeLead Connect home">
        <img src="/brand/homelead-connect-master-transparent.png" alt="HomeLead Connect" width={1254} height={1254} />
      </a>
      <div className="hlc-public-site-nav__links">
        {links.map(([label, path]) => <a key={path} href={`${PUBLIC_ORIGIN}${path}`}>{label}</a>)}
      </div>
      <div className="hlc-public-site-nav__actions">
        <a className="hlc-public-site-nav__login" href={`${APP_ORIGIN}/login`}>Sign In</a>
        <a className="hlc-public-site-nav__cta" href={`${APP_ORIGIN}/register`}>Get Started →</a>
        <details className="hlc-public-site-nav__menu">
          <summary>Menu</summary>
          <div className="hlc-public-site-nav__menu-panel">
            {links.map(([label, path]) => <a key={path} href={`${PUBLIC_ORIGIN}${path}`}>{label}</a>)}
            <a href={`${APP_ORIGIN}/login`}>Sign In</a>
            <a href={`${APP_ORIGIN}/register`}>Get Started</a>
          </div>
        </details>
      </div>
    </div>
  </nav>;
}
