import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { PUBLIC_ORIGIN } from "../config/siteOrigins";

const APP_HOST = "app.homeleadconnect.org";

export default function MainSiteOnly({ children }: { children: ReactNode }) {
  const location = useLocation();

  if (typeof window !== "undefined" && window.location.hostname.toLowerCase() === APP_HOST) {
    window.location.replace(`${PUBLIC_ORIGIN}${location.pathname}${location.search}${location.hash}`);
    return null;
  }

  return <>{children}</>;
}
