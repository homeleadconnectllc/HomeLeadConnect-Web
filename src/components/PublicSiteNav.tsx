import { ArrowRightCircle, BookOpen, Briefcase, Handshake, House, Info, LogIn, Users } from "lucide-react";
import { appUrl, publicUrl } from "../config/siteOrigins";
import "../styles/public-header-logo-authority-20260915.css";
import "../styles/public-home-mobile-nav-v5-20260915.css";
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
  { label: "About", href: publicUrl("/about"), Icon: Info, tone: "about" },
  { label: "For Residents", href: publicUrl("/homeowners"), Icon: House, tone: "resident" },
  { label: "For Professionals", href: publicUrl("/professionals"), Icon: Briefcase, tone: "professional" },
  { label: "For Partners", href: publicUrl("/partners"), Icon: Handshake, tone: "partner" },
  { label: "Community", href: publicUrl("/community"), Icon: Users, tone: "community" },
  { label: "Resources", href: publicUrl("/services"), Icon: BookOpen, tone: "resources" },
  { label: "Sign In", href: appUrl("/login"), Icon: LogIn, tone: "signin" },
  { label: "Get Started", href: appUrl("/register"), Icon: ArrowRightCircle, tone: "start" },
] as const;

const sharedNavRuntimeAuthority = `
  html body #root .hlc-public-shared-nav{background:#03111f!important;background-color:#03111f!important;}
  html body #root .hlc-public-shared-nav .hlc-board-cta{background:#0b6ed6!important;background-color:#0b6ed6!important;}
  @media(max-width:680px){
    html body #root .hlc-public-shared-nav .hlc-mobile-sign-in-link{color:#62e6b3!important;-webkit-text-fill-color:#62e6b3!important;}
    html body #root .hlc-public-shared-nav .hlc-mobile-icon-nav-v5__trigger{color:#fff!important;-webkit-text-fill-color:#fff!important;background:transparent!important;background-color:transparent!important;}
  }
`;

export default function PublicSiteNav() {
  return <>
    <style data-hlc-public-nav-runtime-authority>{sharedNavRuntimeAuthority}</style>
    <header className="hlc-board-nav hlc-public-shared-nav"><div className="hlc-board-nav-inner">
      <a className="hlc-board-brand" href={publicUrl("/")} aria-label="HomeLead Connect home">HomeLead Connect</a>
      <nav className="hlc-board-links" aria-label="Primary navigation">{navLinks.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav>
      <div className="hlc-board-actions"><a className="hlc-board-login" href={appUrl("/login")}>Sign In</a><a className="hlc-board-cta" href={appUrl("/register")}>Get Started →</a><a className="hlc-mobile-sign-in-link" href={appUrl("/login")}>Sign In</a><details className="hlc-mobile-icon-nav-v5" data-mobile-nav-version="5"><summary className="hlc-mobile-icon-nav-v5__trigger">Menu</summary><nav className="hlc-mobile-icon-nav-v5__panel" aria-label="Mobile navigation">{mobileMenuLinks.map(({ label, href, Icon, tone }) => <a className={`hlc-mobile-icon-nav-v5__item hlc-mobile-icon-nav-v5__item--${tone}`} key={href} href={href}><span className="hlc-mobile-icon-nav-v5__icon" aria-hidden="true"><Icon size={24} strokeWidth={2.2} /></span><span className="hlc-mobile-icon-nav-v5__label">{label}</span></a>)}</nav></details></div>
    </div></header>
  </>;
}
