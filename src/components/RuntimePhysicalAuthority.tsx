import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const AUTHORITIES = [
  { id: "hlc-runtime-physical-authority", href: "/runtime-physical-authority-20260907.css" },
  { id: "hlc-runtime-portal-authority", href: "/runtime-portal-authority-20260907.css" },
  { id: "hlc-physical-component-root-authority", href: "/physical-component-root-authority-20260907.css" },
] as const;

function ensureAuthoritiesAreTerminal() {
  if (typeof document === "undefined") return;
  for (const authority of AUTHORITIES) {
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

function authoritiesAreTerminal() {
  const children = Array.from(document.head.children);
  if (children.length < AUTHORITIES.length) return false;
  const tail = children.slice(-AUTHORITIES.length);
  return AUTHORITIES.every((authority, index) => tail[index]?.id === authority.id);
}

export default function RuntimePhysicalAuthority() {
  const location = useLocation();

  useEffect(() => {
    ensureAuthoritiesAreTerminal();
    const frame = window.requestAnimationFrame(ensureAuthoritiesAreTerminal);
    const settle = window.setTimeout(ensureAuthoritiesAreTerminal, 180);
    const observer = new MutationObserver(() => {
      if (!authoritiesAreTerminal()) ensureAuthoritiesAreTerminal();
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
