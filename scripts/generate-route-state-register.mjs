import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const routerPath = resolve(root, "src/routes/AppRouter.tsx");
const outputPath = resolve(root, "docs/sprints/route-state-register-current.md");
const router = readFileSync(routerPath, "utf8");
const protectedStart = router.indexOf('<Route element={<ProtectedLayout/>}>');
const workspaceStart = router.indexOf('<Route element={<WorkspaceLayout/>}>');
const workspaceEnd = router.indexOf('</Route></Route><Route path="*"');
// Route expressions close as `}/>`; nested self-closing JSX closes as `/>`.
// Matching the nested close truncated composed elements and swallowed routes.
const routePattern = /<Route path="([^"]+)" element=\{([\s\S]*?)\}\/\>/g;
const publicPhotoRoutes = new Set([
  "/about", "/homeowners", "/contractors", "/how-it-works", "/leadscope", "/community",
  "/services", "/pricing", "/trust", "/professionals", "/partners", "/demo", "/contact",
  "/request-service", "/professional-application", "/login", "/register", "/forgot-password",
  "/reset-password", "/accessibility", "/privacy", "/terms", "/platform-disclosure",
]);

function audience(path, offset) {
  if (offset < protectedStart || path === "*") return "Public";
  if (offset >= workspaceStart && offset < workspaceEnd) return "Internal workspace";
  if (path.startsWith("/homeowner-portal")) return "Resident portal";
  if (path.startsWith("/contractor-portal")) return "Professional portal";
  if (path.startsWith("/partner-portal")) return "Partner portal";
  return "Authenticated shared";
}

const publicFamilies = {
  "/": "Home", "/app": "Entry", "/portal": "Entry", "/contact": "Contact", "/request-service": "Resident",
  "/about": "About", "/kendrell-memorial": "Memorial", "/memorial": "Memorial", "/homeowners": "Resident",
  "/contractors": "Professional", "/how-it-works": "About", "/leadscope": "Professional", "/community": "Community",
  "/services": "Services", "/pricing": "Services", "/trust": "Trust", "/professionals": "Professional",
  "/partners": "Partner", "/demo": "Entry", "/professional-application": "Professional",
  "/accessibility": "Legal", "/privacy": "Legal", "/terms": "Legal", "/platform-disclosure": "Legal",
  "/login": "Auth", "/register": "Auth", "/forgot-password": "Auth", "/reset-password": "Auth",
  "/portal/accept": "Invitation", "/team/accept": "Invitation", "/residents": "Resident", "*": "System state",
};

function family(path, routeAudience) {
  if (routeAudience === "Public") return publicFamilies[path];
  if (routeAudience === "Resident portal") return "Resident";
  if (routeAudience === "Professional portal") return "Professional";
  if (routeAudience === "Partner portal") return "Partner";
  if (path === "/messages" || path === "/notifications") return "Communications";
  if (path.startsWith("/academy")) return "Academy";
  if (path.startsWith("/community") || path === "/matching") return "Community";
  if (["/network", "/map", "/profiles", "/providers"].some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) return "Network";
  if (path.startsWith("/resources") || ["/help", "/tutorials", "/rules", "/documents", "/documents/scan"].includes(path)) return "Resources";
  if (path.startsWith("/hq") || ["/operations", "/customer-experience"].includes(path)) return "HQ and agents";
  if (path.startsWith("/analytics")) return "Analytics";
  if (path.startsWith("/settings") || ["/profile", "/team"].includes(path)) return "Account and settings";
  if (["/manual-communications", "/call-center"].includes(path)) return "Communications";
  if (path.startsWith("/partners/")) return "Partner operations";
  if (["/dashboard", "/start-here", "/ecosystem", "/activity"].includes(path)) return "Dashboard";
  if (["/work", "/work/matching", "/workflow", "/automations", "/leads", "/estimator", "/jobs", "/calendar", "/follow-ups"].includes(path) || /^\/(?:leads|jobs)\//.test(path)) return "Work";
  return undefined;
}

function pageType(path, element) {
  if (element.startsWith("Navigate ")) return "Redirect";
  if (path === "*") return "System state";
  if (["/login", "/register", "/forgot-password", "/reset-password", "/portal/accept", "/team/accept"].includes(path)) return "Auth / onboarding";
  if (["/contact", "/request-service", "/professional-application"].includes(path)) return "Intake form";
  if (["/privacy", "/terms", "/accessibility", "/platform-disclosure"].includes(path)) return "Legal / information";
  if (/\/(?:[^/]+Id|practice\/:[^/]+)$/.test(path)) return "Record detail";
  if (/\/(?:settings|profile|team|billing)$/.test(path)) return "Settings / control center";
  if (/\/(?:map|service-areas|availability)$/.test(path)) return "Map / geography";
  if (/\/(?:messages|notifications|call-center|manual-communications)$/.test(path)) return "Communications";
  if (/\/(?:calendar|appointments)$/.test(path)) return "Calendar / scheduling";
  if (/\/(?:analytics|forecasting|sandbox)$/.test(path)) return "Analytics / reporting";
  if (/\/(?:documents|scan|materials|forms)$/.test(path)) return "Documents / resources";
  if (/\/(?:automations|workflow|roleplay|library)$/.test(path)) return "Operational workspace";
  if (/\/(?:dashboard|portal|app|hq|operations|customer-experience|community-hub)$/.test(path) || path === "/") return "Dashboard / home";
  if (path.startsWith("/community") || path === "/matching") return "Community / feed";
  if (path.startsWith("/homeowner-portal") || path.startsWith("/contractor-portal") || path.startsWith("/partner-portal")) return "Portal workspace";
  if (publicFamilies[path]) return "Public marketing";
  return "Index / list";
}

function requiredStates(path, routeAudience, element) {
  if (path === "*") return "Not found; mobile; desktop";
  if (element.startsWith("Navigate ")) return "Redirect destination; browser back/forward";
  if (path === "/portal/accept" || path === "/team/accept") {
    return "Loading; invalid/expired token; signed-out handoff; error; success; mobile; desktop";
  }
  if (["/login", "/register", "/forgot-password", "/reset-password"].includes(path)) {
    return "Default; validation; submitting; error; success/redirect; mobile; desktop; keyboard";
  }
  if (["/contact", "/request-service", "/professional-application"].includes(path)) {
    return "Default; validation; submitting; error; success; mobile; desktop; keyboard";
  }
  if (routeAudience === "Public") return "Loading; success; mobile; desktop; keyboard";
  return "Auth redirect; access denial; loading; empty; error; populated/success; mobile; desktop; keyboard";
}

function visualAuthority(path, routeAudience) {
  if (path === "/") return "Homepage / Four Pathways authority";
  if (publicPhotoRoutes.has(path)) return "Unique registered Black-centered page photograph";
  if (["/kendrell-memorial", "/memorial"].includes(path)) return "Memorial-owned visual; no invented likeness";
  if (routeAudience.includes("portal") || routeAudience.includes("workspace") || routeAudience === "Authenticated shared") {
    return "Role/interface graphics; no public photography";
  }
  return "No decorative photograph";
}

const rows = [];
for (const match of router.matchAll(routePattern)) {
  const [raw, path, elementRaw] = match;
  const element = elementRaw.replace(/\s+/g, " ").trim();
  const offset = match.index ?? 0;
  const routeAudience = audience(path, offset);
  const routeFamily = family(path, routeAudience);
  if (!routeFamily) throw new Error(`Route ${path} is missing a family owner`);
  rows.push({ path, element, audience: routeAudience, family: routeFamily, pageType: pageType(path, element), states: requiredStates(path, routeAudience, element), visual: visualAuthority(path, routeAudience) });
}
if (new Set(rows.map((row) => row.path)).size !== rows.length) throw new Error("Duplicate route patterns in AppRouter");

const lines = [
  "# HomeLead Connect Route and State Register",
  "",
  "Generated from `src/routes/AppRouter.tsx` by the current repository inventory script. Dynamic route parameters are represented by their declared patterns. The global Suspense boundary supplies every route's loading state. Protected routes inherit authentication and authorization boundaries.",
  "",
  `Total explicit route patterns: **${rows.length}**`,
  "",
  "| # | Route | Audience / boundary | Family / owner | Page type | Component | Required state coverage | Visual authority |",
  "|---:|---|---|---|---|---|---|---|",
  ...rows.map((row, index) => `| ${index + 1} | \`${row.path}\` | ${row.audience} | ${row.family} | ${row.pageType} | \`${row.element.replaceAll("|", "\\|")}\` | ${row.states} | ${row.visual} |`),
  "",
  "## Certification note",
  "",
  "Static route, access, workflow, visual-contract, and build coverage is enforced by `npm run verify:launch`. Physical browser capture at mobile and desktop widths remains a promotion gate and is not represented as completed by this register.",
  "",
];

writeFileSync(outputPath, lines.join("\n"));
console.log(`Wrote ${rows.length} routes to ${outputPath}`);
