import { ArrowRightCircle, BookOpen, Briefcase, Handshake, House, Info, LogIn, Users } from "lucide-react";
import { appUrl, publicUrl } from "../config/siteOrigins";
import "../styles/v2-board-frontdoor-20260912.css";
import "../styles/v2-board-frontdoor-performance-20260912.css";
import "../styles/v2-board-rest-polish-20260912.css";
import "../styles/front-door-family-ecosystem-20260913.css";
import "../styles/frontdoor-profile-protocol-20260913.css";
import "../styles/public-header-logo-authority-20260915.css";
import "../styles/public-home-centered-copy-authority-20260915.css";
import "../styles/public-home-mobile-nav-v2-20260915.css";
import "../styles/public-nav-home-authority-20260916.css";

const navLinks = [
  ["About", publicUrl("/about")],
  ["For Residents", publicUrl("/homeowners")],
  ["For Professionals", publicUrl("/professionals")],
  ["For Partners", publicUrl("/partners")],
  ["Community", publicUrl("/community")],
  ["Resources", publicUrl("/services")],
] as const;

const mobileMenuLinks = [
  { label: "About", href: publicUrl("/about"), Icon: Info, tone: "neutral" },
  { label: "For Residents", href: publicUrl("/homeowners"), Icon: House, tone: "resident" },
  { label: "For Professionals", href: publicUrl("/professionals"), Icon: Briefcase, tone: "professional" },
  { label: "For Partners", href: publicUrl("/partners"), Icon: Handshake, tone: "partner" },
  { label: "Community", href: publicUrl("/community"), Icon: Users, tone: "community" },
  { label: "Resources", href: publicUrl("/services"), Icon: BookOpen, tone: "neutral" },
  { label: "Sign In", href: appUrl("/login"), Icon: LogIn, tone: "neutral" },
  { label: "Get Started", href: appUrl("/register"), Icon: ArrowRightCircle, tone: "start" },
] as const;

export default function PublicSiteNav() {
  return <header className="hlc-board-nav hlc-family-ecosystem hlc-public-shared-nav"><div className="hlc-board-nav-inner">
    <a className="hlc-board-brand" href={publicUrl("/")} aria-label="HomeLead Connect home"><img src="/brand/homelead-connect-transparent-v2.svg" alt="HomeLead Connect LLC" width={512} height={512} loading="eager" decoding="async" fetchPriority="high" /></a>
    <nav className="hlc-board-links" aria-label="Primary navigation">{navLinks.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav>
    <div className="hlc-board-actions"><a className="hlc-board-login" href={appUrl("/login")}>Sign In</a><a className="hlc-board-cta" href={appUrl("/register")}>Get Started →</a><a className="hlc-mobile-sign-in-link" href={appUrl("/login")}>Sign In</a><details className="hlc-mobile-nav-v2" data-mobile-nav-version="2"><summary className="hlc-mobile-nav-v2__trigger">Menu</summary><nav className="hlc-mobile-nav-v2__panel" aria-label="Mobile navigation">{mobileMenuLinks.map(({ label, href, Icon, tone }) => <a className={`hlc-mobile-nav-v2__item hlc-mobile-nav-v2__item--${tone}`} key={href} href={href}><Icon className="hlc-mobile-nav-v2__icon" size={18} strokeWidth={2.2} aria-hidden="true" /><span>{label}</span></a>)}</nav></details></div>
  </div></header>;
}
