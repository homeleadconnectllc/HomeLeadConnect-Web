import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const AUTHORITY_ID = "hlc-runtime-physical-authority";
const AUTHORITY_HREF = "/runtime-physical-authority-20260907.css";

function ensureAuthorityIsLast() {
  if (typeof document === "undefined") return;
  let link = document.getElementById(AUTHORITY_ID) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.id = AUTHORITY_ID;
    link.rel = "stylesheet";
    link.href = AUTHORITY_HREF;
  }
  if (document.head.lastElementChild !== link) document.head.appendChild(link);
}

export default function RuntimePhysicalAuthority() {
  const location = useLocation();

  useEffect(() => {
    ensureAuthorityIsLast();
    const frame = window.requestAnimationFrame(ensureAuthorityIsLast);
    const settle = window.setTimeout(ensureAuthorityIsLast, 180);
    const observer = new MutationObserver(() => {
      const link = document.getElementById(AUTHORITY_ID);
      if (link && document.head.lastElementChild !== link) ensureAuthorityIsLast();
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
