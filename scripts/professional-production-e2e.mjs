import { chromium } from "playwright";

// Test-only production-origin Professional journey probe. Never merge this branch.
const baseUrl = process.env.HLC_VISUAL_BASE_URL || "https://app.homeleadconnect.org";
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const email = process.env.HLC_VISUAL_TEST_EMAIL;
const password = process.env.HLC_VISUAL_TEST_PASSWORD;

if (!supabaseUrl || !supabaseAnonKey || !email || !password) {
  throw new Error("Missing authenticated E2E environment.");
}

const tokenResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: { apikey: supabaseAnonKey, "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
if (!tokenResponse.ok) throw new Error(`Professional E2E auth failed: ${tokenResponse.status}`);
const session = await tokenResponse.json();
const authStorageKey = `sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`;

const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: authStorageKey,
    value: JSON.stringify(session),
  });

  await page.goto(`${baseUrl}/contractor-portal`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const path = new URL(page.url()).pathname;
  if (path !== "/contractor-portal") {
    throw new Error(`Professional E2E expected /contractor-portal but rendered ${path}.`);
  }
  const body = await page.locator("body").innerText();
  if (/sign in|access denied|not authorized|invitation required/i.test(body)) {
    throw new Error(`Professional portal rendered an access blocker: ${body.slice(0, 500)}`);
  }
  console.log("Professional accepted-access portal E2E: PASS /contractor-portal");
  await context.close();
} finally {
  await browser.close();
}
