import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const routerPath = resolve(root, "src/routes/AppRouter.tsx");
const outputPath = resolve(root, "docs/sprints/route-state-register-20260916.md");
const router = readFileSync(routerPath, "utf8");
const protectedStart = router.indexOf('<Route element={<ProtectedLayout/>}>');
const workspaceStart = router.indexOf('<Route element={<WorkspaceLayout/>}>');
const workspaceEnd = router.indexOf('</Route></Route><Route path="*"');
const routePattern = /<Route path="([^"]+)" element=\{([\s\S]*?)\/>\}/g;
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
  rows.push({ path, element, audience: routeAudience, states: requiredStates(path, routeAudience, element), visual: visualAuthority(path, routeAudience) });
}

const lines = [
  "# HomeLead Connect Route and State Register",
  "",
  "Generated from `src/routes/AppRouter.tsx` on 2026-09-16. Dynamic route parameters are represented by their declared patterns. The global Suspense boundary supplies every route's loading state. Protected routes inherit authentication and authorization boundaries.",
  "",
  `Total explicit route patterns: **${rows.length}**`,
  "",
  "| # | Route | Audience / boundary | Component | Required state coverage | Visual authority |",
  "|---:|---|---|---|---|---|",
  ...rows.map((row, index) => `| ${index + 1} | \`${row.path}\` | ${row.audience} | \`${row.element.replaceAll("|", "\\|")}\` | ${row.states} | ${row.visual} |`),
  "",
  "## Certification note",
  "",
  "Static route, access, workflow, visual-contract, and build coverage is enforced by `npm run verify:launch`. Physical browser capture at mobile and desktop widths remains a promotion gate and is not represented as completed by this register.",
  "",
];

writeFileSync(outputPath, lines.join("\n"));
console.log(`Wrote ${rows.length} routes to ${outputPath}`);
