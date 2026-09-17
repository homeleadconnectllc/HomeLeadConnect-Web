export const PUBLIC_ORIGIN = "https://homeleadconnect.org";
export const APP_ORIGIN = "https://app.homeleadconnect.org";

export const publicUrl = (path = "/") =>
  `${PUBLIC_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;

export const appUrl = (path = "/") =>
  `${APP_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;

/** Canonical signed-in workspace home. */
export const APP_HOME = "/dashboard";

/** Backward-compatible entry route only. Normal navigation must not target this path. */
export const LEGACY_APP_ENTRY = "/app";
