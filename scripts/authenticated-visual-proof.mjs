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
  ["automations", "/automations"],
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
  headers: { apikey: supabaseAnonKey, "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
if (!tokenResponse.ok) throw new Error(`Visual-proof auth failed: ${tokenResponse.status}`);
const session = await tokenResponse.json();

const authStorageKey = `sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`;
const authValue = JSON.stringify(session);

const browser = await chromium.launch({ headless: true });
try {
  for (const [viewportName, viewport] of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: authStorageKey, value: authValue });

    for (const [slug, route] of routes) {
      await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1200);
      const currentPath = new URL(page.url()).pathname;
      if (mustRenderAuthorizedWorkspace.has(route) && currentPath !== route) {
        throw new Error(`Authenticated visual proof expected ${route} but rendered ${currentPath}.`);
      }
      await page.screenshot({ path: path.join(outputDir, `${slug}-${viewportName}.png`), fullPage: true });
    }

    await context.close();
  }
} finally {
  await browser.close();
}
