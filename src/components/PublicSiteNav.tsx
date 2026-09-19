import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BookOpen, Briefcase, Handshake, House, Info, Menu, Users, X } from "lucide-react";
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

function setImportant(element: HTMLElement | null, property: string, value: string) {
  element?.style.setProperty(property, value, "important");
}

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

  useLayoutEffect(() => {
    if (pathname === "/") return;
    let cleanup: void | (() => void);
    let cancelled = false;
    void import("./publicSiteNavRuntime").then(({ applyPublicNavRuntime }) => {
      if (cancelled) return;
      const nav = navRef.current;
      if (!nav) return;
      cleanup = applyPublicNavRuntime({ nav, pathname, setImportant });
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [pathname]);

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
        style={{ cursor: "pointer", border: 0, padding: 0, color: "inherit" }}
      >
        <img className="hlc-navbar-master-logo" data-hlc-master-logo="true" src={NAV_LOGO} alt="" aria-hidden="true" />
        <span className="hlc-brand-accessible-label">HomeLead Connect</span>
        <span className="hlc-public-menu-cue" aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          {menuOpen ? <X size={18} /> : <Menu size={18} />}<span>Menu</span>
        </span>
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
      style={{ position: "fixed", inset: 0, zIndex: 1500, background: "rgba(2,10,22,.78)", backdropFilter: "blur(12px)", padding: "clamp(84px, 10vh, 120px) 18px 24px", overflowY: "auto" }}
    >
      <nav
        id="hlc-public-menu"
        className="hlc-public-menu-panel"
        aria-label="HomeLead Connect menu"
        style={{ width: "min(920px, 100%)", margin: "0 auto", padding: "clamp(24px, 5vw, 54px)", background: "#06182a", border: "1px solid rgba(128,178,225,.32)", borderRadius: 28, boxShadow: "0 32px 90px rgba(0,0,0,.48)" }}
      >
        <div className="hlc-public-menu-primary" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 12 }}>
          {primaryMenuLinks.map(({ label, href, Icon, tone: linkTone }) => <a
            key={href}
            href={href}
            data-menu-tone={linkTone}
            aria-current={pathname === new URL(href, window.location.origin).pathname ? "page" : undefined}
            style={{ minHeight: 52, display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", color: linkTone === "resident" ? "#62e6b3" : linkTone === "professional" ? "#55c8ff" : linkTone === "partner" ? "#ffc443" : linkTone === "community" ? "#c38cff" : "#f4f7fb", textDecoration: "none", fontWeight: 800 }}
          ><Icon size={22} aria-hidden="true" /><span>{label}</span></a>)}
        </div>
        <div className="hlc-public-menu-secondary" style={{ marginTop: 28, paddingTop: 22, borderTop: "1px solid rgba(255,255,255,.14)", display: "flex", flexWrap: "wrap", gap: "14px 22px" }}>
          {secondaryMenuLinks.map(([label, href]) => <a key={href} href={href} style={{ color: "#c9d6e4", textDecoration: "none", minHeight: 44, display: "inline-flex", alignItems: "center" }}>{label}</a>)}
        </div>
        <div className="hlc-public-menu-account" style={{ marginTop: 26, display: "flex", flexWrap: "wrap", gap: 18 }}>
          <a href={appUrl("/login")} style={{ color: "#f4f7fb", minHeight: 44, display: "inline-flex", alignItems: "center" }}>Sign In</a>
          <a href={appUrl("/register")} style={{ color: "var(--page-accent, #63d3ff)", minHeight: 44, display: "inline-flex", alignItems: "center", fontWeight: 900 }}>Get Started</a>
        </div>
      </nav>
    </div>}
  </header>;
}
