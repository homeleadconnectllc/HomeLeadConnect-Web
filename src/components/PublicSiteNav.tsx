import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BookOpen, Briefcase, Handshake, House, Info, Menu, Users, X } from "lucide-react";
import { appUrl, publicUrl } from "../config/siteOrigins";
import "../styles/public-owner-visual-authority-20260918.css";

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
    const nav = navRef.current;
    if (!nav) return;

    setImportant(nav, "background", "#03111f");
    setImportant(nav, "background-color", "#03111f");
    setImportant(nav, "background-image", "none");

    const brand = nav.querySelector<HTMLElement>(".hlc-board-brand");
    const brandImage = nav.querySelector<HTMLImageElement>("img[data-hlc-master-logo]");
    setImportant(brand, "background", "transparent");
    setImportant(brand, "background-image", "none");
    setImportant(brandImage, "display", "block");
    setImportant(brandImage, "visibility", "visible");
    setImportant(brandImage, "opacity", "1");
    setImportant(brandImage, "width", "100%");
    setImportant(brandImage, "height", "100%");
    setImportant(brandImage, "object-fit", "contain");

    const menuTrigger = nav.querySelector<HTMLElement>(".hlc-mobile-icon-nav-v5__trigger");
    setImportant(menuTrigger, "color", "#fff");
    setImportant(menuTrigger, "-webkit-text-fill-color", "#fff");
    setImportant(menuTrigger, "background", "transparent");
    setImportant(menuTrigger, "background-color", "transparent");
    setImportant(menuTrigger, "background-image", "none");

    const login = nav.querySelector<HTMLElement>(".hlc-board-login");
    const cta = nav.querySelector<HTMLElement>(".hlc-board-cta");
    const applyGlobalHeaderActions = () => {
      const mobile = window.matchMedia("(max-width: 680px)").matches;
      for (const element of [login, cta]) {
        setImportant(element, "background", "transparent");
        setImportant(element, "background-color", "transparent");
        setImportant(element, "background-image", "none");
        setImportant(element, "border", "0");
        setImportant(element, "border-radius", "0");
        setImportant(element, "box-shadow", "none");
        setImportant(element, "padding", "0");
        setImportant(element, "min-height", "0");
      }
      setImportant(login, "color", "#e5edf6");
      setImportant(login, "-webkit-text-fill-color", "#e5edf6");
      setImportant(cta, "color", "var(--page-accent)");
      setImportant(cta, "-webkit-text-fill-color", "var(--page-accent)");
      setImportant(login, "display", mobile ? "inline-flex" : "inline");
      setImportant(cta, "display", mobile ? "inline-flex" : "inline");
      if (mobile) {
        const inner = nav.querySelector<HTMLElement>(".hlc-board-nav-inner");
        const actions = nav.querySelector<HTMLElement>(".hlc-board-actions");
        const mobileMenu = nav.querySelector<HTMLElement>(".hlc-mobile-icon-nav-v5");
        setImportant(nav, "position", "relative");
        setImportant(nav, "left", "auto");
        setImportant(nav, "right", "auto");
        setImportant(nav, "width", "100vw");
        setImportant(nav, "max-width", "100vw");
        setImportant(nav, "margin-left", "calc(50% - 50vw)");
        setImportant(nav, "margin-right", "calc(50% - 50vw)");
        setImportant(nav, "padding", "0");
        setImportant(inner, "box-sizing", "border-box");
        setImportant(inner, "width", "100%");
        setImportant(inner, "max-width", "none");
        setImportant(inner, "margin", "0");
        setImportant(inner, "padding", "0 12px");
        setImportant(inner, "display", "block");
        setImportant(inner, "position", "relative");
        setImportant(inner, "min-height", "84px");
        setImportant(inner, "padding", "0 12px");
        setImportant(brand, "position", "absolute");
        setImportant(brand, "left", "12px");
        setImportant(brand, "top", "50%");
        setImportant(brand, "transform", "translateY(-50%)");
        setImportant(actions, "position", "absolute");
        setImportant(actions, "right", "12px");
        setImportant(actions, "top", "50%");
        setImportant(actions, "transform", "translateY(-50%)");
        setImportant(actions, "margin", "0");
        setImportant(actions, "padding", "0");
        setImportant(actions, "width", "auto");
        setImportant(actions, "display", "flex");
        setImportant(actions, "align-items", "center");
        setImportant(actions, "justify-content", "flex-end");
        setImportant(actions, "gap", "14px");
        const mobileTrigger = nav.querySelector<HTMLElement>(".hlc-mobile-icon-nav-v5__trigger");
        setImportant(mobileMenu, "margin", "0");
        setImportant(mobileMenu, "padding", "0");
        setImportant(mobileMenu, "height", "44px");
        setImportant(mobileMenu, "min-height", "44px");
        setImportant(mobileMenu, "display", "inline-flex");
        setImportant(mobileMenu, "align-items", "center");
        setImportant(login, "height", "44px");
        setImportant(login, "min-height", "44px");
        setImportant(login, "min-width", "66px");
        setImportant(login, "display", "inline-flex");
        setImportant(login, "align-items", "center");
        setImportant(login, "justify-content", "center");
        setImportant(login, "line-height", "1");
        setImportant(login, "font-size", "16px");
        setImportant(login, "font-weight", "900");
        setImportant(login, "visibility", "visible");
        setImportant(login, "opacity", "1");
        setImportant(cta, "height", "44px");
        setImportant(cta, "min-height", "44px");
        setImportant(cta, "display", "inline-flex");
        setImportant(cta, "align-items", "center");
        setImportant(cta, "justify-content", "center");
        setImportant(cta, "visibility", "visible");
        setImportant(cta, "opacity", "1");
        setImportant(mobileTrigger, "height", "44px");
        setImportant(mobileTrigger, "min-height", "44px");
        setImportant(mobileTrigger, "display", "inline-flex");
        setImportant(mobileTrigger, "align-items", "center");
        setImportant(mobileTrigger, "justify-content", "center");
        setImportant(mobileTrigger, "line-height", "1");
        setImportant(mobileTrigger, "font-size", "16px");
        setImportant(mobileTrigger, "font-weight", "900");
        setImportant(mobileTrigger, "padding", "0");
        setImportant(mobileTrigger, "margin", "0");
      }
    };

    const ownerVisualStyleId = "hlc-owner-public-visual-runtime";
    let ownerVisualStyle = document.getElementById(ownerVisualStyleId) as HTMLStyleElement | null;
    if (!ownerVisualStyle) {
      ownerVisualStyle = document.createElement("style");
      ownerVisualStyle.id = ownerVisualStyleId;
      document.head.appendChild(ownerVisualStyle);
    }
    ownerVisualStyle.textContent = `
      html body #root :is(.hlc-pathway-page,.hlc-public-board-page,.hlc-utility-page,.hlc-legal-page,.hlc-public-story,.hlc-memorial-page)
      :is(.hlc-public-grid,.hlc-board-access-grid,.hlc-public-card,.hlc-board-access-card,.hlc-public-offer,.hlc-legal-card,.hlc-legal-note,.hlc-legal-contact,.hlc-public-story-card,.hlc-pathway-card,.hlc-pathway-final,.hlc-pathway-reassurance,.hlc-leadscope-visual,.hlc-network-node,.hlc-professional-timeline,.hlc-professional-timeline li,.hlc-partner-trust-grid,.hlc-partner-trust-grid article,.hlc-partner-flow,.hlc-partner-flow span,.hlc-community-board,.hlc-community-sidebar,.hlc-community-feature-card,.hlc-community-post,.hlc-community-principles,.hlc-community-principles article){
        background:transparent!important;background-image:none!important;border:0!important;border-radius:0!important;box-shadow:none!important;outline:0!important;
      }
      html body #root :is(.hlc-public-card,.hlc-board-access-card)::before,
      html body #root :is(.hlc-public-card,.hlc-board-access-card)::after{display:none!important;content:none!important}
      html body #root :is(.hlc-public-shell,.hlc-utility-shell,.hlc-legal-shell){width:100%!important;max-width:none!important;margin:0!important;padding:0!important;background:transparent!important}
      html body #root :is(.hlc-public-grid,.hlc-board-access-grid){display:block!important;width:min(1180px,calc(100% - 40px))!important;margin:0 auto!important}
      html body #root :is(.hlc-public-card,.hlc-board-access-card,.hlc-public-offer,.hlc-legal-card,.hlc-public-story-card){width:100%!important;max-width:920px!important;margin:0 auto!important;padding:48px 0!important;text-align:center!important}
      html body #root .hlc-pathway-section{width:min(1180px,calc(100% - 40px))!important;margin:0 auto!important;padding:76px 0!important;border:0!important;background:transparent!important}
      html body #root .hlc-pathway-page :is(.hlc-resident-action-grid,.hlc-partner-types,.hlc-professional-benefits,.hlc-pathway-three-grid,.hlc-professional-metrics,.hlc-community-highlights){grid-template-columns:1fr!important;gap:0!important}
      html body #root :is(.hlc-pathway-primary,.hlc-pathway-secondary,.hlc-pathway-text-link,.hlc-public-primary,.hlc-public-secondary,.hlc-public-link,.hlc-utility-primary,.hlc-utility-secondary,.hlc-legal-primary,.hlc-legal-secondary,.hlc-public-story-actions a){display:inline!important;width:auto!important;min-height:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;text-decoration:none!important}
      html body #root .hlc-legal-page-visual{width:100%!important;max-width:none!important;margin:0!important;border:0!important;border-radius:0!important;box-shadow:none!important}
    `;

    const heroImages: Record<string, string> = {
      "/about": "/page-about-connected-home-help-20260916.webp",
      "/homeowners": "/page-residents-request-help-20260916.webp",
      "/professionals": "/page-professionals-provider-presence-20260916.webp",
      "/partners": "/page-partners-referral-relationships-20260916.webp",
      "/community": "/page-community-connected-neighbors-20260916.webp",
      "/services": "/page-services-connected-journey-20260916.webp",
      "/accessibility": "/page-accessibility-devices-inputs-20260916.webp",
      "/privacy": "/page-privacy-built-in-20260916.webp",
    };
    const hero = document.querySelector<HTMLElement>(".hlc-pathway-hero, .hlc-public-board-page .hlc-public-hero, .hlc-utility-page .hlc-public-hero, .hlc-legal-hero");
    const heroImage = heroImages[pathname];
    if (hero && heroImage) {
      setImportant(hero, "position", "relative");
      setImportant(hero, "width", "100vw");
      setImportant(hero, "max-width", "100vw");
      setImportant(hero, "min-height", "690px");
      setImportant(hero, "margin-left", "calc(50% - 50vw)");
      setImportant(hero, "margin-right", "calc(50% - 50vw)");
      setImportant(hero, "margin-top", "0");
      setImportant(hero, "margin-bottom", "0");
      setImportant(hero, "padding", "0");
      setImportant(hero, "border", "0");
      setImportant(hero, "border-radius", "0");
      setImportant(hero, "box-shadow", "none");
      setImportant(hero, "background-image", `linear-gradient(90deg, rgba(2,10,22,.32), rgba(3,17,34,.18) 54%, rgba(4,19,38,.06) 82%, rgba(4,19,38,.02)), linear-gradient(180deg, rgba(2,10,22,.03), transparent 62%, rgba(4,19,38,.26)), url('${heroImage}')`);
      setImportant(hero, "background-size", "cover");
      setImportant(hero, "background-position", "center");
      setImportant(hero, "background-repeat", "no-repeat");
    }

    document.querySelectorAll<HTMLElement>(".hlc-pathway-hero-copy, .hlc-public-board-page .hlc-public-hero > div, .hlc-utility-page .hlc-public-hero > div, .hlc-legal-hero-grid").forEach((element) => {
      setImportant(element, "position", "relative");
      setImportant(element, "z-index", "1");
      setImportant(element, "width", "min(980px, calc(100% - 36px))");
      setImportant(element, "margin", "auto");
      setImportant(element, "padding", "92px 0 72px");
      setImportant(element, "background", "transparent");
      setImportant(element, "background-image", "none");
      setImportant(element, "border", "0");
      setImportant(element, "border-radius", "0");
      setImportant(element, "box-shadow", "none");
      setImportant(element, "text-align", "center");
    });

    if (heroImage) {
      document.querySelectorAll<HTMLElement>(".hlc-pathway-hero-visual, .hlc-public-shell > .hlc-public-visual, .hlc-legal-hero + .hlc-legal-page-visual").forEach((element) => {
        setImportant(element, "display", "none");
      });
      document.querySelectorAll<HTMLElement>(".hlc-pathway-hero h1, .hlc-pathway-hero h2, .hlc-public-hero h1, .hlc-public-hero h2, .hlc-legal-hero h1, .hlc-legal-hero h2, .hlc-public-kicker, .hlc-pathway-eyebrow").forEach((element) => {
        setImportant(element, "color", "#ffffff");
        setImportant(element, "-webkit-text-fill-color", "#ffffff");
        setImportant(element, "text-shadow", "0 2px 18px rgba(0,0,0,.50)");
      });
      document.querySelectorAll<HTMLElement>(".hlc-pathway-hero p, .hlc-pathway-hero small, .hlc-public-hero p, .hlc-public-hero small, .hlc-legal-hero p, .hlc-legal-hero small, .hlc-legal-hero span, .hlc-legal-effective, .hlc-legal-effective span").forEach((element) => {
        setImportant(element, "color", "#e5edf6");
        setImportant(element, "-webkit-text-fill-color", "#e5edf6");
        setImportant(element, "text-shadow", "0 1px 12px rgba(0,0,0,.55)");
      });
    }

    const routeAccent: Record<string, string> = {
      "/homeowners": "#55e6b3",
      "/professionals": "#63d3ff",
      "/contractors": "#63d3ff",
      "/professional-application": "#63d3ff",
      "/partners": "#f2c45f",
      "/community": "#c98cff",
      "/services": "#6edbd2",
    };
    const accent = routeAccent[pathname] ?? "#f4f7fb";
    document.querySelectorAll<HTMLElement>(".hlc-pathway-eyebrow, .hlc-public-kicker, .hlc-public-card-label, .hlc-public-offer-label, .hlc-pathway-primary, .hlc-pathway-text-link, .hlc-public-primary, .hlc-public-link, .hlc-utility-primary").forEach((element) => {
      setImportant(element, "color", accent);
      setImportant(element, "-webkit-text-fill-color", accent);
    });
    document.querySelectorAll<HTMLElement>(".hlc-pathway-secondary, .hlc-public-secondary, .hlc-utility-secondary, .hlc-legal-primary, .hlc-legal-secondary").forEach((element) => {
      setImportant(element, "color", "#f4f7fb");
      setImportant(element, "-webkit-text-fill-color", "#f4f7fb");
    });

    document.querySelectorAll<HTMLElement>(".hlc-public-grid, .hlc-board-access-grid, .hlc-public-card, .hlc-board-access-card, .hlc-public-offer, .hlc-legal-card, .hlc-legal-note, .hlc-legal-contact, .hlc-public-story-card, .hlc-pathway-card, .hlc-pathway-final, .hlc-pathway-reassurance, .hlc-leadscope-visual, .hlc-network-node, .hlc-professional-timeline, .hlc-professional-timeline li, .hlc-partner-trust-grid, .hlc-partner-trust-grid article, .hlc-partner-flow, .hlc-partner-flow span, .hlc-community-board, .hlc-community-sidebar, .hlc-community-feature-card, .hlc-community-post, .hlc-community-principles, .hlc-community-principles article").forEach((element) => {
      setImportant(element, "background", "transparent");
      setImportant(element, "background-image", "none");
      setImportant(element, "border", "0");
      setImportant(element, "border-radius", "0");
      setImportant(element, "box-shadow", "none");
      setImportant(element, "outline", "0");
    });

    applyGlobalHeaderActions();
    window.addEventListener("resize", applyGlobalHeaderActions);

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
      window.removeEventListener("resize", applyGlobalHeaderActions);
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
