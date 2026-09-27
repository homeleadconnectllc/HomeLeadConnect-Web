export type PortalVisualFamily = "resident" | "professional" | "partner" | "community";

type PortalAccess = { homeowner: boolean; contractor: boolean; partner: boolean; business: boolean };

const sharedPaths = new Set(["/messages", "/notifications", "/profile"]);

export function portalFamilyForPath(pathname: string): PortalVisualFamily | null {
  if (pathname.startsWith("/homeowner-portal")) return "resident";
  if (pathname.startsWith("/contractor-portal")) return "professional";
  if (pathname.startsWith("/partner-portal")) return "partner";
  if (pathname.startsWith("/community")) return "community";
  return null;
}

export function resolvePortalVisualFamily(pathname: string, access: PortalAccess, saved: string | null): PortalVisualFamily | null {
  const direct = portalFamilyForPath(pathname);
  if (direct) return direct;
  if (sharedPaths.has(pathname)) {
    if (saved === "resident" && access.homeowner) return saved;
    if (saved === "professional" && access.contractor) return saved;
    if (saved === "partner" && access.partner) return saved;
    if (saved === "community" && (access.homeowner || access.contractor || access.business)) return saved;
    if (access.homeowner) return "resident";
    if (access.contractor) return "professional";
    if (access.partner) return "partner";
  }
  return access.business ? "professional" : null;
}
