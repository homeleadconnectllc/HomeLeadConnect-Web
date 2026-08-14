export type InternalRole = "owner" | "manager" | "technician";

const internalRoles = new Set<InternalRole>(["owner", "manager", "technician"]);
const managerRoles = new Set<InternalRole>(["owner", "manager"]);

const ownerOnlyPrefixes = [
  "/hq",
  "/settings/billing",
];

const managerPrefixes = [
  "/workflow",
  "/automations",
  "/analytics",
  "/settings",
  "/operations",
  "/customer-experience",
  "/community/moderation",
];

export function normalizeInternalRole(value: unknown): InternalRole | null {
  const role = typeof value === "string" ? value.trim().toLowerCase() : "";
  return internalRoles.has(role as InternalRole) ? role as InternalRole : null;
}

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function canAccessWorkspacePath(roleValue: unknown, pathname: string) {
  const role = normalizeInternalRole(roleValue);
  if (!role) return false;
  if (ownerOnlyPrefixes.some((prefix) => matchesPrefix(pathname, prefix))) return role === "owner";
  if (managerPrefixes.some((prefix) => matchesPrefix(pathname, prefix))) return managerRoles.has(role);
  return internalRoles.has(role);
}

export function canRunAutomation(roleValue: unknown) {
  const role = normalizeInternalRole(roleValue);
  return Boolean(role && managerRoles.has(role));
}
