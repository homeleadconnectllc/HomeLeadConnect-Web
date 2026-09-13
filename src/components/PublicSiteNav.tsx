import "../styles/public-site-nav.css";

const PUBLIC_ORIGIN = "https://homeleadconnect.org";
const APP_ORIGIN = "https://app.homeleadconnect.org";

const desktopLinks = [
  ["About", "/about"],
  ["For Residents", "/homeowners"],
  ["For Professionals", "/professionals"],
  ["For Partners", "/partners"],
  ["Community", "/community"],
  ["Resources", "/services"],
] as const;

const mobileLinks = [
  ["How it works", "/how-it-works", "neutral"],
  ["Services", "/services", "neutral"],
  ["Pricing", "/pricing", "neutral"],
  ["About HomeLead Connect", "/about", "neutral"],
  ["Contact & help", "/contact", "neutral"],
  ["For Residents", "/homeowners", "resident"],
  ["For Professionals", "/professionals", "professional"],
  ["For Partners", "/partners", "partner"],
  ["Community", "/community", "community"],
] as const;

export default function PublicSiteNav() {
  return <nav className="hlc-public-site-nav" aria-label="Primary navigation">
    <div className="hlc-public-site-nav__inner">
      <a className="hlc-public-site-nav__brand" href={`${PUBLIC_ORIGIN}/`} aria-label="HomeLead Connect home">
        <img src="/hlc-icon.jpeg" alt="HomeLead Connect" width={64} height={64} />
      </a>
      <div className="hlc-public-site-nav__links">
        {desktopLinks.map(([label, path]) => <a key={path} href={`${PUBLIC_ORIGIN}${path}`}>{label}</a>)}
      </div>
      <div className="hlc-public-site-nav__actions">
        <a className="hlc-public-site-nav__request" href={`${APP_ORIGIN}/request-service`}>Request service</a>
        <a className="hlc-public-site-nav__login" href={`${APP_ORIGIN}/login`}>Sign In</a>
        <details className="hlc-public-site-nav__menu">
          <summary><span className="hlc-public-site-nav__menu-icon" aria-hidden="true">☰</span><span>Menu</span></summary>
          <div className="hlc-public-site-nav__menu-panel">
            {mobileLinks.map(([label, path, accent]) => <a className={`hlc-public-site-nav__menu-link hlc-public-site-nav__menu-link--${accent}`} key={path} href={`${PUBLIC_ORIGIN}${path}`}>{label}</a>)}
            <a className="hlc-public-site-nav__menu-link hlc-public-site-nav__menu-link--neutral" href={`${APP_ORIGIN}/login`}>Sign in</a>
            <a className="hlc-public-site-nav__menu-link hlc-public-site-nav__menu-link--resident" href={`${APP_ORIGIN}/request-service`}>Request service</a>
          </div>
        </details>
      </div>
    </div>
  </nav>;
}
