import { chromium } from "playwright";

const baseUrl = process.env.HLC_VISUAL_BASE_URL || "https://app.homeleadconnect.org";
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const email = process.env.HLC_VISUAL_TEST_EMAIL;
const password = process.env.HLC_VISUAL_TEST_PASSWORD;
const organization = "HomeLead Connect Professional E2E Production 20260909";

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

  await page.goto(`${baseUrl}/hq/approvals`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  if (new URL(page.url()).pathname !== "/hq/approvals") {
    throw new Error(`Professional E2E expected /hq/approvals but rendered ${new URL(page.url()).pathname}.`);
  }

  const application = page.getByRole("article").filter({ hasText: organization });
  await application.getByText(organization, { exact: true }).waitFor({ state: "visible", timeout: 20_000 });

  page.once("dialog", async (dialog) => dialog.accept());
  await application.getByRole("button", { name: "Approve & create access" }).click();
  await page.getByRole("status").filter({ hasText: "Application approved. The secure contractor access link is ready below." }).waitFor({
    state: "visible",
    timeout: 30_000,
  });

  const secureLink = await page.locator('a[href*="/portal/accept?token="]').first().getAttribute("href");
  if (!secureLink || !secureLink.startsWith(`${baseUrl}/portal/accept?token=`)) {
    throw new Error(`Professional approval did not expose a production portal acceptance link: ${secureLink ?? "missing"}`);
  }

  console.log(`Professional production-origin approval E2E: PASS ${secureLink}`);
  await context.close();
} finally {
  await browser.close();
}
