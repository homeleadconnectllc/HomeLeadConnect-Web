import { chromium } from "playwright";

// Test-only production-origin Professional approval diagnostic. Never merge this branch.
const baseUrl = "https://app.homeleadconnect.org";
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const email = process.env.HLC_VISUAL_TEST_EMAIL;
const password = process.env.HLC_VISUAL_TEST_PASSWORD;
const organization = "HomeLead Connect Professional E2E Production 20260909";

if (!supabaseUrl || !supabaseAnonKey || !email || !password) throw new Error("Missing authenticated E2E environment.");

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
  let rpcStatus = "not-seen";
  let rpcBody = "";
  const consoleErrors = [];

  page.on("console", msg => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("pageerror", error => consoleErrors.push(`pageerror: ${error.message}`));
  page.on("response", async response => {
    if (response.url().includes("/rest/v1/rpc/approve_professional_application")) {
      rpcStatus = String(response.status());
      try { rpcBody = (await response.text()).slice(0, 1000); } catch { rpcBody = "<unreadable>"; }
    }
  });

  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: authStorageKey,
    value: JSON.stringify(session),
  });

  await page.goto(`${baseUrl}/hq/approvals`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const application = page.getByRole("article").filter({ hasText: organization });
  await application.getByText(organization, { exact: true }).waitFor({ state: "visible", timeout: 20_000 });

  page.once("dialog", async dialog => dialog.accept());
  await application.getByRole("button", { name: "Approve & create access" }).click();
  await page.waitForTimeout(7000);

  const success = await page.getByRole("status").filter({ hasText: "Application approved. The secure contractor access link is ready below." }).count();
  const alerts = await page.getByRole("alert").allTextContents();
  console.log("PROFESSIONAL_APPROVAL_DIAGNOSTIC", JSON.stringify({ rpcStatus, rpcBody, alerts, consoleErrors }));
  if (!success) throw new Error(`Professional production approval failed. RPC ${rpcStatus}; alerts=${JSON.stringify(alerts)}; rpc=${rpcBody}`);

  console.log("Professional production-origin approval diagnostic: PASS");
  await context.close();
} finally {
  await browser.close();
}
