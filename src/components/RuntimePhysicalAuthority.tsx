import { useEffect } from "react";

const STRUCTURAL_AUTHORITY = {
  id: "hlc-runtime-structural-safeguards",
  href: "/runtime-structural-safeguards-20260919.css",
} as const;

function ensureStructuralAuthority() {
  if (typeof document === "undefined") return;
  let link = document.getElementById(STRUCTURAL_AUTHORITY.id) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.id = STRUCTURAL_AUTHORITY.id;
    link.rel = "stylesheet";
    link.href = STRUCTURAL_AUTHORITY.href;
  }
  document.head.appendChild(link);
}

export default function RuntimePhysicalAuthority() {
  useEffect(() => {
    ensureStructuralAuthority();
    const frame = window.requestAnimationFrame(ensureStructuralAuthority);
    const settle = window.setTimeout(ensureStructuralAuthority, 180);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settle);
    };
  }, []);

  return null;
}
