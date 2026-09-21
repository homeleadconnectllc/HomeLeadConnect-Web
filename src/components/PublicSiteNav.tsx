import { useEffect, useRef, useState } from "react";
import { BookOpen, Briefcase, Handshake, House, Info, Users } from "lucide-react";
import { appUrl, publicUrl } from "../config/siteOrigins";


const NAV_LOGO = "/hlc-logo-ui.png";




const primaryMenuLinks = [
  { label: "Home", href: publicUrl("/"), Icon: House, tone: "home" },
  { label: "About", href: publicUrl("/about"), Icon: Info, tone: "about" },
  { label: "Residents", href: publicUrl("/homeowners"), Icon: House, tone: "resident" },
  { label: "Professionals", href: publicUrl("/professionals"), Icon: Briefcase, tone: "professional" },
  { label: "Partners", href: publicUrl("/partners"), Icon: Handshake, tone: "partner" },
  { label: "Community", href: publicUrl("/community"), Icon: Users, tone: "community" },
  { label: "Resources", href: publicUrl("/services"), Icon: BookOpen, tone: "resources" },
] as const;

const secondaryMenuLinks = [
  ["Services", publicUrl("/services")],
  ["Contact", publicUrl("/contact")],
  ["Accessibility", publicUrl("/accessibility")],
  ["Platform Disclosure", publicUrl("/platform-disclosure")],
  ["Privacy", publicUrl("/privacy")],
  ["Terms", publicUrl("/terms")],
] as const;

export default function PublicSiteNav() {
  const navRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
  const tone = pathname === "/homeowners" ? "resident" : pathname === "/professionals" || pathname === "/contractors" || pathname === "/professional-application" ? "professional" : pathname === "/partners" ? "partner" : pathname === "/community" ? "community" : pathname === "/services" ? "resources" : "neutral";

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        window.requestAnimationFrame(() => menuButtonRef.current?.focus());
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);


  return <header ref={navRef} className="hlc-board-nav hlc-public-shared-nav" data-hlc-public-navigation="true" data-public-tone={tone}>
    <div className="hlc-board-nav-inner">
      <button
        ref={menuButtonRef}
        type="button"
        className="hlc-board-brand hlc-public-menu-trigger"
        aria-label={menuOpen ? "Close HomeLead Connect menu" : "Open HomeLead Connect menu"}
        aria-expanded={menuOpen}
        aria-controls="hlc-public-menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <img className="hlc-navbar-master-logo" data-hlc-master-logo="true" src={NAV_LOGO} alt="" aria-hidden="true" />
        <span className="hlc-brand-accessible-label">HomeLead Connect</span>
      </button>
      <div className="hlc-board-actions">
        <a className="hlc-board-login" href={appUrl("/login")}>Sign In</a>
        <a className="hlc-board-cta" href={appUrl("/register")}>Get Started</a>
      </div>
    </div>
    {menuOpen && <div
      className="hlc-public-menu-backdrop"
      data-hlc-public-menu-open="true"
      onMouseDown={(event) => { if (event.target === event.currentTarget) setMenuOpen(false); }}
    >
      <nav
        id="hlc-public-menu"
        className="hlc-public-menu-panel"
        aria-label="HomeLead Connect menu"
      >
        <div className="hlc-public-menu-primary">
          {primaryMenuLinks.map(({ label, href, Icon, tone: linkTone }) => <a
            key={href}
            href={href}
            data-menu-tone={linkTone}
            aria-current={pathname === new URL(href, window.location.origin).pathname ? "page" : undefined}

          ><Icon size={22} aria-hidden="true" /><span>{label}</span></a>)}
        </div>
        <div className="hlc-public-menu-secondary">
          {secondaryMenuLinks.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
        </div>
        <div className="hlc-public-menu-account">
          <a href={appUrl("/login")}>Sign In</a>
          <a href={appUrl("/register")}>Get Started</a>
        </div>
      </nav>
    </div>}
  </header>;
}
