import { useLayoutEffect, useRef } from "react";
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

function setImportant(element: HTMLElement | null, property: string, value: string) {
  element?.style.setProperty(property, value, "important");
}

export default function PublicSiteNav() {
  const navRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    // Public navigation is the top-edge authority on every public/account surface.
    // Apply the final computed values directly at the shared component root so
    // route-specific lazy CSS and terminal legacy authorities cannot repaint it.
    setImportant(nav, "background", "#03111f");
    setImportant(nav, "background-color", "#03111f");
    setImportant(nav, "background-image", "none");

    const cta = nav.querySelector<HTMLElement>(".hlc-board-cta");
    setImportant(cta, "background", "#0b6ed6");
    setImportant(cta, "background-color", "#0b6ed6");
    setImportant(cta, "background-image", "none");
    setImportant(cta, "border-color", "#0b6ed6");
    setImportant(cta, "color", "#fff");
    setImportant(cta, "-webkit-text-fill-color", "#fff");

    const mobileSignIn = nav.querySelector<HTMLElement>(".hlc-mobile-sign-in-link");
    setImportant(mobileSignIn, "color", "#62e6b3");
    setImportant(mobileSignIn, "-webkit-text-fill-color", "#62e6b3");
    setImportant(mobileSignIn, "background", "transparent");

    const menuTrigger = nav.querySelector<HTMLElement>(".hlc-mobile-icon-nav-v5__trigger");
    setImportant(menuTrigger, "color", "#fff");
    setImportant(menuTrigger, "-webkit-text-fill-color", "#fff");
    setImportant(menuTrigger, "background", "transparent");
    setImportant(menuTrigger, "background-color", "transparent");
    setImportant(menuTrigger, "background-image", "none");

    // Any route that mounts the shared public navigation must start at the same
    // viewport origin as Home. Older auth/app shells may add top padding later.
    const routeContent = nav.closest<HTMLElement>(".hlc-route-content");
    setImportant(routeContent, "padding-top", "0");
    const authShell = nav.closest<HTMLElement>(".hlc-auth-shell");
    setImportant(authShell, "padding-top", "0");

    const alignToViewportTop = () => {
      const y = nav.getBoundingClientRect().y;
      if (Math.abs(y) <= 2) {
        setImportant(nav, "margin-top", "0");
        return;
      }
      setImportant(nav, "margin-top", `${-y}px`);
    };

    alignToViewportTop();
    const frame = window.requestAnimationFrame(alignToViewportTop);
    const settle = window.setTimeout(alignToViewportTop, 220);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settle);
    };
  }, []);

  return <header ref={navRef} className="hlc-board-nav hlc-public-shared-nav"><div className="hlc-board-nav-inner">
    <a className="hlc-board-brand" href={publicUrl("/")} aria-label="HomeLead Connect home">HomeLead Connect</a>
    <nav className="hlc-board-links" aria-label="Primary navigation">{navLinks.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav>
    <div className="hlc-board-actions"><a className="hlc-board-login" href={appUrl("/login")}>Sign In</a><a className="hlc-board-cta" href={appUrl("/register")}>Get Started →</a><a className="hlc-mobile-sign-in-link" href={appUrl("/login")}>Sign In</a><details className="hlc-mobile-icon-nav-v5" data-mobile-nav-version="5"><summary className="hlc-mobile-icon-nav-v5__trigger">Menu</summary><nav className="hlc-mobile-icon-nav-v5__panel" aria-label="Mobile navigation">{mobileMenuLinks.map(({ label, href, Icon, tone }) => <a className={`hlc-mobile-icon-nav-v5__item hlc-mobile-icon-nav-v5__item--${tone}`} key={href} href={href}><span className="hlc-mobile-icon-nav-v5__icon" aria-hidden="true"><Icon size={24} strokeWidth={2.2} /></span><span className="hlc-mobile-icon-nav-v5__label">{label}</span></a>)}</nav></details></div>
  </div></header>;
}
