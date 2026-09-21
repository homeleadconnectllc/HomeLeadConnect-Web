import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { routeFamilies } from "./visual-route-inventory.mjs";

const baseUrl = process.env.HLC_VISUAL_BASE_URL || "http://127.0.0.1:4173";
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const email = process.env.HLC_VISUAL_TEST_EMAIL;
const password = process.env.HLC_VISUAL_TEST_PASSWORD;

if (!supabaseUrl || !supabaseAnonKey) throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.");
if (!email || !password) throw new Error("Missing HLC_VISUAL_TEST_EMAIL or HLC_VISUAL_TEST_PASSWORD. Configure a dedicated visual-proof test account in repository secrets.");

const routes = [
  ["dashboard", "/dashboard"],
  ["leads", "/leads"],
  ["jobs", "/jobs"],
  ["calendar", "/calendar"],
  ["follow-ups", "/follow-ups"],
  ["manual-communications", "/manual-communications"],
  ["provider-fit", "/work/matching"],
  ["provider-directory", "/providers"],
  ["workflow", "/workflow"],
  ["automations", "/automations"],
  ["messages", "/messages"],
  ["academy", "/academy"],
  ["help", "/help"],
  ["analytics", "/analytics"],
  ["ai-team-kendrell", "/hq"],
  ["work", "/work"],
  ["community", "/community-hub"],
  ["resources", "/resources"],
];

// Use only the existing approved workspace identity. Portal identities are not assumed.
for (const route of [...routeFamilies.shared, ...routeFamilies.internal]) {
  if (!routes.some(([, existing]) => existing === route)) routes.push([route.replace(/[^a-z0-9]/gi, "_").replace(/^_/, ""), route]);
}
const proofResults = [];
// Existing bookmark redirect confirmed in src/pages/dashboard/Ecosystem.tsx.
const expectedRedirects = new Map([["/ecosystem", "/dashboard"]]);

const mustRenderAuthorizedWorkspace = new Set(routes.map(([, route]) => route));

const viewports = [
  ["mobile", { width: 390, height: 844 }],
  ["desktop", { width: 1440, height: 1000 }],
];

const outputDir = path.resolve("artifacts/authenticated-visual-proof");
fs.mkdirSync(outputDir, { recursive: true });

async function assertExactlyOneVisibleLogo(page, label) {
  const logoCount = await page.locator('img[alt="HomeLead Connect LLC"]').evaluateAll((nodes) => nodes.filter((node) => {
    const style = window.getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return style.display !== "none"
      && style.visibility !== "hidden"
      && Number(style.opacity || "1") > 0
      && rect.width > 0
      && rect.height > 0;
  }).length);
  if (logoCount !== 1) {
    throw new Error(`${label} expected exactly 1 visible HomeLead Connect logo but rendered ${logoCount}.`);
  }
}

const tokenResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: { apikey: supabaseAnonKey, "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
if (!tokenResponse.ok) throw new Error(`Visual-proof auth failed: ${tokenResponse.status}`);
const session = await tokenResponse.json();

const authStorageKey = `sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`;
const authValue = JSON.stringify(session);

const browser = await chromium.launch({ headless: true });
try {
  const deepLinkProof = (async () => {
  const deepLinkContext = await browser.newContext({ viewport: viewports[0][1] });
  const deepLinkPage = await deepLinkContext.newPage();
  const invitationToken = "visual-proof-token";
  const invitationDestination = `/portal/accept?token=${invitationToken}`;
  const encodedInvitationDestination = encodeURIComponent(invitationDestination);
  await deepLinkPage.goto(`${baseUrl}${invitationDestination}`, { waitUntil: "networkidle" });
  const signInHref = await deepLinkPage.getByRole("link", { name: "Sign in to your HomeLead Connect account" }).getAttribute("href");
  const registerHref = await deepLinkPage.getByRole("link", { name: "Create your portal identity" }).getAttribute("href");
  if (signInHref !== `/login?next=${encodedInvitationDestination}`) {
    throw new Error(`Portal invitation sign-in lost its token: ${signInHref ?? "missing href"}.`);
  }
  if (registerHref !== `/register?next=${encodedInvitationDestination}`) {
    throw new Error(`Portal invitation registration lost its token: ${registerHref ?? "missing href"}.`);
  }
  await deepLinkPage.getByRole("link", { name: "Sign in to your HomeLead Connect account" }).click();
  await deepLinkPage.waitForURL((url) => url.pathname === "/login" && url.searchParams.get("next") === invitationDestination, { timeout: 20_000 });
  const createAccountHref = await deepLinkPage.getByRole("link", { name: "Create your account" }).getAttribute("href");
  if (createAccountHref !== `/register?next=${encodedInvitationDestination}`) {
    throw new Error(`Login registration handoff lost the portal invitation: ${createAccountHref ?? "missing href"}.`);
  }

  await deepLinkPage.goto(`${baseUrl}/hq/approvals`, { waitUntil: "networkidle" });
  if (new URL(deepLinkPage.url()).pathname !== "/login") {
    throw new Error(`Protected deep-link proof expected /login but rendered ${new URL(deepLinkPage.url()).pathname}.`);
  }
  await deepLinkPage.getByLabel("Email").fill(email);
  await deepLinkPage.getByLabel("Password").fill(password);
  await deepLinkPage.getByRole("button", { name: "Sign in to HomeLead Connect" }).click();
  await deepLinkPage.waitForURL((url) => url.pathname === "/hq/approvals", { timeout: 20_000 });
  await deepLinkPage.waitForLoadState("networkidle");
  await deepLinkPage.waitForSelector('.hlc-navbar-brand img[alt="HomeLead Connect LLC"]', { state: "visible", timeout: 20_000 });
  await deepLinkPage.waitForTimeout(1200);
  await assertExactlyOneVisibleLogo(deepLinkPage, "Protected deep-link after sign-in mobile");
  await deepLinkPage.screenshot({ path: path.join(outputDir, "protected-deep-link-after-sign-in-mobile.png"), fullPage: true });
  await deepLinkContext.close();
  })();

  const viewportProofs = viewports.map(async ([viewportName, viewport]) => {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: authStorageKey, value: authValue });

    for (const [slug, route] of routes) {
      const resolvedRoute = route.replace(/:[^/]+/g, "1");
      await page.goto(`${baseUrl}${resolvedRoute}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1200);
      const currentPath = new URL(page.url()).pathname;
      const unexpectedRedirect = mustRenderAuthorizedWorkspace.has(route) && currentPath !== (expectedRedirects.get(route) || resolvedRoute);
      const metrics = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        compressedNavigation: [...document.querySelectorAll(".hlc-route-content nav > a")].filter(link => {
          const box = link.getBoundingClientRect();
          if (!box.width || !box.height) return false;
          const range = document.createRange(); range.selectNodeContents(link);
          return range.getBoundingClientRect().width > box.width + 2;
        }).map(link => link.textContent.trim()),
        narrowHeading: [...document.querySelectorAll("h1")].some(node => node.getBoundingClientRect().width > 0 && node.getBoundingClientRect().width < 120),
        workspaceFont: getComputedStyle(document.querySelector(".hlc-signed-in-shell") || document.body).fontFamily,
        heading: document.querySelector("h1")?.textContent?.trim() || null,
        blank: document.body.innerText.trim().length < 30,
        denied: /Your HomeLead Connect role does not allow this area/.test(document.body.innerText),
        dataPermissionError: /You do not have permission to perform this action/.test(document.body.innerText),
      }));
      const result = {route, resolvedRoute, viewport: viewportName, currentPath, unexpectedRedirect, ...metrics,
        coverage: route.includes(":") ? "missing-record-state; no real record identity supplied" : "approved-workspace-session"};
      proofResults.push(result);
      fs.writeFileSync(path.join(outputDir, "results.json"), JSON.stringify(proofResults, null, 2));
      try { await assertExactlyOneVisibleLogo(page, `${route} ${viewportName}`); }
      catch { result.logoFailure = true; }
      fs.writeFileSync(path.join(outputDir, "results.json"), JSON.stringify(proofResults, null, 2));
      await page.screenshot({ path: path.join(outputDir, `${slug}-${viewportName}.png`), fullPage: true });
    }

    await context.close();
  });

  await Promise.all([deepLinkProof, ...viewportProofs]);
  const failures = proofResults.filter(row => row.overflow || row.blank || row.denied || row.unexpectedRedirect || row.logoFailure || row.compressedNavigation.length || row.narrowHeading);
  if (failures.length) throw new Error(`Authenticated visual layout failures: ${failures.map(row => `${row.route} ${row.viewport}`).join(", ")}`);
} finally {
  await browser.close();
}
