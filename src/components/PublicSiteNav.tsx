import { useEffect, useRef, useState } from "react";
import { BookOpen, Briefcase, Handshake, House, Info, Users } from "lucide-react";
import { appUrl, publicUrl } from "../config/siteOrigins";
import { useAuth } from "../hooks/useAuth";
import "../styles/mockup-authority-20260924.css";

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

const focusableSelector = "a[href],button:not([disabled]),[tabindex]:not([tabindex='-1'])";

export default function PublicSiteNav() {
  const { session } = useAuth();
  const navRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";

  const tone = pathname === "/homeowners"
    ? "resident"
    : pathname === "/professionals" || pathname === "/contractors" || pathname === "/professional-application"
      ? "professional"
      : pathname === "/partners"
        ? "partner"
        : pathname === "/community"
          ? "community"
          : pathname === "/services"
            ? "resources"
            : "neutral";

  useEffect(() => {
    if (!menuOpen || typeof document === "undefined") return;

    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const firstMenuControl = menuPanelRef.current?.querySelector<HTMLElement>(focusableSelector);
    window.requestAnimationFrame(() => firstMenuControl?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        window.requestAnimationFrame(() => menuButtonRef.current?.focus());
        return;
      }

      if (event.key !== "Tab") return;
      const controls = Array.from(
        menuPanelRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
      ).filter((element) => !element.hasAttribute("disabled") && element.tabIndex !== -1);
      if (controls.length === 0) return;

      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = priorOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header
      ref={navRef}
      className="hlc-board-nav"
      data-public-tone={tone}
      data-menu-open={menuOpen ? "true" : "false"}
    >
      <div className="hlc-board-nav-inner">
        <button
          ref={menuButtonRef}
          type="button"
          className="hlc-board-brand"
          aria-label={menuOpen ? "Close HomeLead Connect menu" : "Open HomeLead Connect menu"}
          aria-expanded={menuOpen}
          aria-controls="hlc-public-menu"
          onClick={() => setMenuOpen((value) => !value)}
        >
          <img
            className="hlc-navbar-master-logo"
            src={NAV_LOGO}
            data-hlc-master-logo="true"
            alt=""
            aria-hidden="true"
          />
          <span className="hlc-brand-accessible-label">HomeLead Connect</span>
        </button>

        <nav className="hlc-public-desktop-links" aria-label="Public pages">
          {primaryMenuLinks.slice(1).map(({ label, href }) => (
            <a key={href} href={href}>{label}</a>
          ))}
        </nav>

        <div className="hlc-board-actions">
          <a className="hlc-board-login" href={appUrl("/login")}>Sign In</a>
          {!session && <a className="hlc-board-cta" href={appUrl("/register")}>Get Started</a>}
        </div>
      </div>

      {menuOpen && (
        <div
          className="hlc-public-menu-backdrop"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) setMenuOpen(false);
          }}
        >
          <nav
            ref={menuPanelRef}
            id="hlc-public-menu"
            className="hlc-public-menu-panel"
            aria-label="HomeLead Connect menu"
          >
            <div className="hlc-public-menu-primary">
              {primaryMenuLinks.map(({ label, href, Icon, tone: linkTone }) => (
                <a
                  key={href}
                  href={href}
                  data-menu-tone={linkTone}
                  aria-current={pathname === new URL(href, window.location.origin).pathname ? "page" : undefined}
                >
                  <Icon size={22} aria-hidden="true" />
                  <span>{label}</span>
                </a>
              ))}
            </div>

            <div className="hlc-public-menu-secondary">
              {secondaryMenuLinks.map(([label, href]) => (
                <a key={href} href={href}>{label}</a>
              ))}
            </div>

            <div className="hlc-public-menu-account">
              <a href={appUrl("/login")}>Sign In</a>
              {!session && <a href={appUrl("/register")}>Get Started</a>}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}