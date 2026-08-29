import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const envExample = readFileSync(".env.example", "utf8");
const billingDeployment = readFileSync("supabase/functions/BILLING_DEPLOYMENT.md", "utf8");
const communicationsDeployment = readFileSync("supabase/functions/COMMUNICATIONS_DEPLOYMENT.md", "utf8");
const checkout = readFileSync("supabase/functions/stripe-checkout-session/index.ts", "utf8");
const webhook = readFileSync("supabase/functions/stripe-webhook/index.ts", "utf8");
const productionWorkflow = readFileSync(".github/workflows/cloudflare-production-verification.yml", "utf8");
const integrationApi = readFileSync("src/api/integrations.ts", "utf8");
const integrationPanel = readFileSync("src/components/settings/IntegrationsConnectionsPanel.tsx", "utf8");
const settingsPage = readFileSync("src/pages/dashboard/Settings.tsx", "utf8");

test("unproven launch integrations remain disabled by default", () => {
  assert.match(envExample, /VITE_BILLING_ENABLED=false/);
  assert.match(envExample, /VITE_PORTAL_INVITATIONS_ENABLED=false/);
  assert.match(envExample, /VITE_NOTIFICATIONS_ENABLED=false/);
  assert.match(billingDeployment, /signed webhook transaction evidence/i);
  assert.match(billingDeployment, /Do not enable billing merely because Checkout returns successfully/i);
});

test("Stripe checkout fails closed unless canonical server configuration and membership exist", () => {
  for (const required of ["STRIPE_SECRET_KEY", "STRIPE_PRICE_HLC", "APP_URL", "SUPABASE_URL", "SUPABASE_ANON_KEY"]) {
    assert.match(checkout, new RegExp(required));
  }
  assert.match(checkout, /Workspace membership is required/);
  assert.match(checkout, /price\.unit_amount !== plan\.price_cents/);
  assert.match(checkout, /idempotencyKey/);
  assert.match(checkout, /success_url: `\$\{appUrl/);
  assert.match(checkout, /cancel_url: `\$\{appUrl/);
  assert.doesNotMatch(checkout, /example\.com|localhost/);
});

test("Stripe entitlement remains signed-webhook derived and duplicate safe", () => {
  assert.match(webhook, /Stripe-Signature/);
  assert.match(webhook, /constructEventAsync/);
  assert.match(webhook, /stripe_webhook_events/);
  assert.match(webhook, /duplicate\s*:\s*true/);
  assert.match(webhook, /workspace_plan_status/);
  assert.match(webhook, /subscription\.metadata\.workspace_id/);
  assert.match(webhook, /price does not match HLC V1/i);
});

test("launch communications remain provider-agnostic and do not fabricate delivery", () => {
  assert.match(communicationsDeployment, /launch path uses the phone and messaging applications/i);
  assert.match(communicationsDeployment, /must never claim that a call or text was delivered/i);
  assert.match(communicationsDeployment, /No Twilio account.*required for the HLC V1 launch gate/is);
  assert.match(communicationsDeployment, /Email transport remains disabled until a real provider and verified sender are configured/i);
});

test("integration settings read workspace-scoped runtime evidence instead of hard-coded provider claims", () => {
  assert.match(integrationApi, /from\("communication_provider_connections"\)/);
  assert.match(integrationApi, /from\("calendar_event_mappings"\)/);
  assert.match(integrationApi, /from\("communication_transmissions"\)/);
  assert.match(integrationApi, /from\("communication_provider_events"\)/);
  assert.match(integrationApi, /eq\("workspace_id", workspaceId\)/);
  assert.match(settingsPage, /getIntegrationEvidence\(profile\.workspace_id\)/);
  assert.match(settingsPage, /integrationEvidence=\{integrationEvidence\}/);
  assert.match(integrationPanel, /emailConnection\?\.status === "connected"/);
  assert.match(integrationPanel, /syncedCalendarMappings > 0/);
  assert.match(integrationPanel, /Provider delivery-event proof is still pending/);
  assert.match(integrationPanel, /User OAuth and bidirectional reconciliation are not claimed/);
});

test("production verification exercises the Cloudflare custom host and deep links", () => {
  assert.match(productionWorkflow, /app\.homeleadconnect\.org/);
  assert.match(productionWorkflow, /homeleadconnect-web\.pages\.dev/);
  for (const path of ["/login", "/dashboard", "/messages", "/jobs", "/calendar", "/community-hub", "/documents", "/hq"]) {
    assert.match(productionWorkflow, new RegExp(`app\\.homeleadconnect\\.org${path.replace("/", "\\/")}`));
  }
});
