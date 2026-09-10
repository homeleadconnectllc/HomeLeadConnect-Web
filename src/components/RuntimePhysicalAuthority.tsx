import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const AUTHORITIES = [
  { id: "hlc-runtime-physical-authority", href: "/runtime-physical-authority-20260907.css" },
  { id: "hlc-runtime-portal-authority", href: "/runtime-portal-authority-20260907.css" },
  { id: "hlc-physical-component-root-authority", href: "/physical-component-root-authority-20260907.css" },
] as const;

const AUTH_VISUAL_AUTHORITY = {
  id: "hlc-frontdoor-login-visual-authority",
  href: "/frontdoor-login-visual-authority-20260910.css",
} as const;

const AUTH_ROUTE_PATTERN = /^\/(?:login|register|forgot-password|reset-password)(?:\/|$)/;

function activeAuthorities(includeAuthVisuals: boolean) {
  return includeAuthVisuals ? [...AUTHORITIES, AUTH_VISUAL_AUTHORITY] : AUTHORITIES;
}

function ensureAuthoritiesAreTerminal(includeAuthVisuals: boolean) {
  if (typeof document === "undefined") return;
  const authLink = document.getElementById(AUTH_VISUAL_AUTHORITY.id);
  if (!includeAuthVisuals) authLink?.remove();
  for (const authority of activeAuthorities(includeAuthVisuals)) {
    let link = document.getElementById(authority.id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = authority.id;
      link.rel = "stylesheet";
      link.href = authority.href;
    }
    document.head.appendChild(link);
  }
}

function authoritiesAreTerminal(includeAuthVisuals: boolean) {
  const authorities = activeAuthorities(includeAuthVisuals);
  const children = Array.from(document.head.children);
  if (children.length < authorities.length) return false;
  const tail = children.slice(-authorities.length);
  return authorities.every((authority, index) => tail[index]?.id === authority.id);
}

export default function RuntimePhysicalAuthority() {
  const location = useLocation();

  useEffect(() => {
    const includeAuthVisuals = AUTH_ROUTE_PATTERN.test(location.pathname);
    const ensureTerminal = () => ensureAuthoritiesAreTerminal(includeAuthVisuals);
    ensureTerminal();
    const frame = window.requestAnimationFrame(ensureTerminal);
    const settle = window.setTimeout(ensureTerminal, 180);
    const observer = new MutationObserver(() => {
      if (!authoritiesAreTerminal(includeAuthVisuals)) ensureTerminal();
    });
    observer.observe(document.head, { childList: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      observer.disconnect();
    };
  }, [location.pathname]);

  return null;
}
