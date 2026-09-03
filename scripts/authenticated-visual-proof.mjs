import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

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
  ["workflow", "/workflow"],
  ["messages", "/messages"],
  ["academy", "/academy"],
  ["analytics", "/analytics"],
  ["ai-team-kendrell", "/hq"],
  ["work", "/work"],
  ["community", "/community-hub"],
  ["resources", "/resources"],
];

const mustRenderAuthorizedWorkspace = new Set(["/analytics", "/hq", "/community-hub"]);

const viewports = [
  ["mobile", { width: 390, height: 844 }],
  ["desktop", { width: 1440, height: 1000 }],
];

const outputDir = path.resolve("artifacts/authenticated-visual-proof");
fs.mkdirSync(outputDir, { recursive: true });

const tokenResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ email, password }),
});

if (!tokenResponse.ok) {
  const body = await tokenResponse.text();
  throw new Error(`Visual-proof authentication failed (${tokenResponse.status}): ${body.slice(0, 300)}`);
}

const auth = await tokenResponse.json();
const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
const storageKey = `sb-${projectRef}-auth-token`;
const sessionPayload = JSON.stringify({
  access_token: auth.access_token,
  refresh_token: auth.refresh_token,
  expires_in: auth.expires_in,
  expires_at: Math.floor(Date.now() / 1000) + Number(auth.expires_in || 3600),
  token_type: auth.token_type || "bearer",
  user: auth.user,
});

const browser = await chromium.launch({ headless: true });
const summary = [];
const failures = [];

for (const [viewportName, viewport] of viewports) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: storageKey, value: sessionPayload });
  const page = await context.newPage();

  for (const [routeName, routePath] of routes) {
    const row = { viewport: viewportName, route: routePath, routeName, status: "PASS", issues: [] };
    try {
      await page.goto(`${baseUrl}${routePath}`, { waitUntil: "networkidle", timeout: 45000 });
      await page.waitForTimeout(1200);

      const finalPath = new URL(page.url()).pathname;
      if (["/login", "/signup", "/forgot-password"].includes(finalPath)) row.issues.push(`redirected to ${finalPath}`);

      const bodyText = (await page.locator("body").innerText()).trim();
      if (bodyText.length < 40) row.issues.push("page body is unexpectedly sparse");
      if (mustRenderAuthorizedWorkspace.has(routePath) && /Access restricted/i.test(bodyText)) {
        row.issues.push("target workspace rendered Access restricted instead of authorized application UI");
      }

      const geometry = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        scrollHeight: document.documentElement.scrollHeight,
        clientHeight: document.documentElement.clientHeight,
        fixedElements: [...document.querySelectorAll("*")].filter((el) => getComputedStyle(el).position === "fixed").length,
      }));
      if (geometry.scrollWidth > geometry.clientWidth + 2) row.issues.push(`horizontal overflow ${geometry.scrollWidth}px > ${geometry.clientWidth}px`);

      if (viewportName === "mobile") {
        const navText = await page.locator(".hlc-mobile-tabbar").innerText().catch(() => "");
        for (const label of ["Home", "Work", "Community", "Messages", "More"]) {
          if (!navText.includes(label)) row.issues.push(`mobile nav missing ${label}`);
        }
      }

      const fatalText = bodyText.match(/(Something went wrong|Unexpected error|Application error|ChunkLoadError)/i);
      if (fatalText) row.issues.push(`fatal UI text detected: ${fatalText[0]}`);

      const screenshotPath = path.join(outputDir, `${viewportName}-${routeName}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      row.screenshot = screenshotPath;
      row.geometry = geometry;

      if (row.issues.length) {
        row.status = "FAIL";
        failures.push(row);
      }
    } catch (error) {
      row.status = "FAIL";
      row.issues.push(error instanceof Error ? error.message : String(error));
      failures.push(row);
    }
    summary.push(row);
  }
  await context.close();
}

await browser.close();
fs.writeFileSync(path.join(outputDir, "summary.json"), JSON.stringify(summary, null, 2));
fs.writeFileSync(path.join(outputDir, "summary.md"), [
  "# HLC Authenticated Visual Proof",
  "",
  `Base URL: ${baseUrl}`,
  "",
  "| Viewport | Route | Status | Issues |",
  "| --- | --- | --- | --- |",
  ...summary.map((row) => `| ${row.viewport} | ${row.route} | ${row.status} | ${(row.issues || []).join("; ") || "None"} |`),
  "",
].join("\n"));

console.log(`Captured ${summary.length} authenticated route proofs.`);
if (failures.length) {
  console.error(`Authenticated visual proof failed on ${failures.length} route/viewport combinations.`);
  process.exit(1);
}
console.log("Authenticated visual proof: PASS");