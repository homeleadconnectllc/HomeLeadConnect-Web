import { ArrowRightCircle, BookOpen, Briefcase, Handshake, House, Info, LogIn, Users } from "lucide-react";
import "../styles/public-site-nav.css";
import "../styles/frontdoor-profile-protocol-20260913.css";
import "../styles/public-header-logo-authority-20260915.css";
import "../styles/public-nav-home-authority-20260916.css";

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

const menuIcons = [Info, House, Briefcase, Handshake, Users, BookOpen] as const;
const menuTones = ["neutral", "resident", "professional", "partner", "community", "neutral"] as const;

export default function PublicSiteNav() {
  return <nav className="hlc-public-site-nav" aria-label="Primary navigation">
    <div className="hlc-public-site-nav__inner">
      <a className="hlc-public-site-nav__brand" href={`${PUBLIC_ORIGIN}/`} aria-label="HomeLead Connect home">
        <img src="/brand/homelead-connect-master-transparent.png" srcSet="/hlc-logo-ui.png 180w, /brand/homelead-connect-master-transparent.png 1254w" sizes="(max-width: 680px) 56px, 64px" alt="HomeLead Connect" width={1254} height={1254} />
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
            {links.map(([label, path], index) => {
              const Icon = menuIcons[index];
              return <a className={`hlc-public-site-nav__menu-item--${menuTones[index]}`} key={path} href={`${PUBLIC_ORIGIN}${path}`}><Icon size={18} strokeWidth={2.2} aria-hidden="true"/><span>{label}</span></a>;
            })}
            <a href={`${APP_ORIGIN}/login`}><LogIn size={18} strokeWidth={2.2} aria-hidden="true"/><span>Sign In</span></a>
            <a className="hlc-public-site-nav__menu-item--start" href={`${APP_ORIGIN}/register`}><ArrowRightCircle size={18} strokeWidth={2.2} aria-hidden="true"/><span>Get Started</span></a>
          </div>
        </details>
      </div>
    </div>
  </nav>;
}
