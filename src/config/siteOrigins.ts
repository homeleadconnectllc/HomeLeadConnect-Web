const CANONICAL_PUBLIC_ORIGIN = "https://homeleadconnect.org";
const CANONICAL_APP_ORIGIN = "https://app.homeleadconnect.org";

export function resolveSiteOrigins(hostname: string, origin: string) {
  const host = hostname.toLowerCase();
  const temporaryPreview = host === "homeleadconnect-web.pages.dev" || host.endsWith(".homeleadconnect-web.pages.dev");
  return {
    publicOrigin: temporaryPreview ? origin : CANONICAL_PUBLIC_ORIGIN,
    appOrigin: temporaryPreview ? origin : CANONICAL_APP_ORIGIN,
  };
}

const siteOrigins = resolveSiteOrigins(
  typeof window === "undefined" ? "" : window.location.hostname,
  typeof window === "undefined" ? "" : window.location.origin,
);

export const PUBLIC_ORIGIN = siteOrigins.publicOrigin;
export const APP_ORIGIN = siteOrigins.appOrigin;

export const publicUrl = (path = "/") =>
  `${PUBLIC_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;

export const appUrl = (path = "/") =>
  `${APP_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;

/** Canonical signed-in workspace home. */
export const APP_HOME = "/dashboard";

/** Backward-compatible entry route only. Normal navigation must not target this path. */
export const LEGACY_APP_ENTRY = "/app";
