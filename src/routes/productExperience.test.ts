import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const responsiveContract = readFileSync("src/styles/responsive-page-contract.css", "utf8");
const contextualDockCss = readFileSync("src/styles/contextual-agent-dock.css", "utf8");
const tutorialDock = readFileSync("src/components/tutorials/LiveTutorialDock.tsx", "utf8");
const providerMap = readFileSync("src/pages/dashboard/ProviderMap.tsx", "utf8");
const manualCommunications = readFileSync("src/pages/dashboard/ManualCommunications.tsx", "utf8");
const notificationCenter = readFileSync("src/components/notifications/RealtimeNotificationCenter.tsx", "utf8");
const serviceWorker = readFileSync("public/sw.js", "utf8");
const voiceNotes = readFileSync("src/api/voiceNotes.ts", "utf8");
const messagesPage = readFileSync("src/pages/dashboard/Messages.tsx", "utf8");
const navbar = readFileSync("src/components/Navbar.tsx", "utf8");
const workspaceNav = readFileSync("src/styles/workspace-nav.css", "utf8");
const mobileAppShell = readFileSync("src/styles/mobile-app-shell.css", "utf8");
const premiumTheme = readFileSync("src/styles/premium-theme.css", "utf8");
const premiumEffects = readFileSync("src/styles/premium-effects.css", "utf8");
const contrastContract = readFileSync("src/styles/contrast-contract.css", "utf8");
const mainEntry = readFileSync("src/main.tsx", "utf8");

test("all routed HLC page content remains globally centered", () => {
  assert.match(responsiveContract, /\.hlc-route-content > main,\s*\.hlc-route-content > main \* \{\s*text-align: center !important;/s);
  assert.match(responsiveContract, /:is\(input, select, textarea, option\)[\s\S]*text-align: center !important;/);
  assert.match(responsiveContract, /:is\(a, button\)[\s\S]*text-align: center !important;/);
  assert.match(responsiveContract, /justify-content: center !important;/);
});

test("browser speech synthesis is never used as an HLC voice fallback", () => {
  assert.doesNotMatch(tutorialDock, /speechSynthesis|SpeechSynthesisUtterance/);
});

test("mobile contextual agent controls do not automatically cover business content", () => {
  assert.match(contextualDockCss, /@media \(max-width: 720px\)[\s\S]*\.hlc-agent-greeting \{ display: none; \}/);
  assert.match(contextualDockCss, /bottom: max\(82px, calc\(env\(safe-area-inset-bottom\) \+ 70px\)\)/);
});

test("signed-in mobile navigation behaves like an adaptive field app", () => {
  assert.match(navbar, /className="hlc-mobile-tabbar"/);
  assert.match(navbar, /MobileNavIcon/);
  assert.match(navbar, /label: "Home", route: "\/dashboard"/);
  assert.match(navbar, /label: "Leads", route: "\/leads"/);
  assert.match(navbar, /label: "Jobs", route: "\/jobs"/);
  assert.match(navbar, /label: "Messages", route: "\/messages"/);
  assert.match(navbar, /canAccessWorkspacePath\(access\.role, item\.route\)/);
  assert.match(navbar, /aria-label="Mobile primary navigation"/);
  assert.match(navbar, /aria-current=\{active \? "page" : undefined\}/);
  assert.match(workspaceNav, /padding-bottom: calc\(84px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(workspaceNav, /\.hlc-mobile-tabbar \{[\s\S]*position: fixed;[\s\S]*bottom: 0;/);
  assert.match(mobileAppShell, /repeat\(auto-fit, minmax\(0, 1fr\)\)/);
  assert.match(mobileAppShell, /:has\(\.hlc-mobile-tabbar\) \.hlc-navbar-toggle/);
  assert.match(mainEntry, /\.\/styles\/mobile-app-shell\.css/);
});

test("premium HLC presentation layer stays blue-cyan beneath contrast and responsive contracts", () => {
  assert.match(mainEntry, /\.\/styles\/premium-theme\.css";\s*import "\.\/styles\/premium-effects\.css";\s*import "\.\/styles\/contrast-contract\.css";\s*import "\.\/styles\/responsive-page-contract\.css";/);
  assert.match(premiumTheme, /--hlc-blue: #2563eb/);
  assert.match(premiumTheme, /--hlc-cyan: #0891b2/);
  assert.match(premiumTheme, /prefers-reduced-motion: reduce/);
  assert.match(premiumTheme, /\.hlc-analytics-kpi::before/);
  assert.match(premiumTheme, /\.hlc-signed-in-shell > \.hlc-navbar/);
  assert.doesNotMatch(premiumTheme, /purple|violet|#aa3bff|#c084fc/i);
});

test("premium interaction effects remain restrained and accessible", () => {
  assert.match(premiumEffects, /hlcSurfaceSheen/);
  assert.match(premiumEffects, /hlcPresenceBreath/);
  assert.match(premiumEffects, /hlcBusyShimmer/);
  assert.match(premiumEffects, /prefers-reduced-motion: reduce/);
  assert.match(premiumEffects, /aria-busy="true"/);
  assert.match(premiumEffects, /aria-current="page"/);
  assert.doesNotMatch(premiumEffects, /particle|parallax|purple|violet/i);
});

test("dark and light HLC surfaces enforce readable foreground contrast", () => {
  assert.match(contrastContract, /--hlc-text-on-light: #0f172a/);
  assert.match(contrastContract, /--hlc-text-on-dark: #f8fafc/);
  assert.match(contrastContract, /\.hlc-navbar,[\s\S]*\.hlc-mobile-tabbar,[\s\S]*\.hlc-agent-card/);
  assert.match(contrastContract, /\.hlc-card,[\s\S]*\.hlc-analytics-kpi,[\s\S]*\.hlc-field-device-center/);
  assert.match(contrastContract, /prefers-contrast: more/);
  assert.match(contrastContract, /select option[\s\S]*background: #ffffff/);
});

test("provider map selection preserves coordinate confidence color", () => {
  assert.match(providerMap, /provider\.coordinate_accuracy === "approximate" \? approximatePinStyle : verifiedPinStyle/);
  const selectedStyle = providerMap.match(/const selectedPinStyle = \{([^}]+)\}/s)?.[1] ?? "";
  assert.ok(selectedStyle, "selected pin style must exist");
  assert.doesNotMatch(selectedStyle, /background\s*:/, "selected state must not replace approximate or verified pin color");
  assert.match(providerMap, /Approximate area/);
  assert.match(providerMap, /Verified map location/);
});

test("Google Voice workspace setup remains management-only in the UI", () => {
  assert.match(manualCommunications, /\["owner", "manager"\]\.includes/);
  assert.match(manualCommunications, /canConfigureGoogleVoice && !configuredNumber/);
  assert.match(manualCommunications, /if \(!canConfigureGoogleVoice\) return;/);
  assert.match(manualCommunications, /Google Voice workspace setup is limited to an HLC owner or manager/);
  assert.match(manualCommunications, /Save operator-reported activity/);
});

test("device alerts support explicit disable without silent re-enrollment", () => {
  assert.match(notificationCenter, /disable_hlc_web_push_subscription/);
  assert.match(notificationCenter, /subscription\.unsubscribe\(\)/);
  assert.match(notificationCenter, /hlc-device-alerts-disabled:/);
  assert.match(notificationCenter, /Disable device alerts/);
  assert.match(notificationCenter, /localStorage\.getItem\(deviceAlertsDisabledKey\(userId\)\) === "1"/);
});

test("notification deep links stay inside HLC in foreground and service worker", () => {
  assert.match(notificationCenter, /candidate\.startsWith\("\/"\) && !candidate\.startsWith\("\/\/"\)/);
  assert.match(notificationCenter, /safeHlcDeepLink\(latest\.deep_link\)/);
  assert.match(serviceWorker, /safeHlcNotificationTarget/);
  assert.match(serviceWorker, /resolved\.origin === self\.location\.origin/);
});

test("portal voice notes use the canonical conversation-scoped storage path", () => {
  assert.match(voiceNotes, /VOICE_NOTE_BUCKET = "communication-voice-notes"/);
  assert.doesNotMatch(voiceNotes, /getCurrentWorkspaceId/);
  assert.doesNotMatch(voiceNotes, /hlc-voice-notes/);
  assert.match(voiceNotes, /\$\{workspaceId\}\/\$\{conversationId\}\//);
  assert.match(messagesPage, /uploadVoiceNote\(selected\.id, selected\.workspace_id, file, durationSeconds\)/);
});
