import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const responsiveContract = readFileSync("src/styles/responsive-page-contract.css", "utf8");
const contextualDockCss = readFileSync("src/styles/contextual-agent-dock.css", "utf8");
const contextualDock = readFileSync("src/components/agents/ContextualAgentDock.tsx", "utf8");
const tutorialDock = readFileSync("src/components/tutorials/LiveTutorialDock.tsx", "utf8");
const providerMap = readFileSync("src/pages/dashboard/ProviderMap.tsx", "utf8");
const manualCommunications = readFileSync("src/pages/dashboard/ManualCommunications.tsx", "utf8");
const callCenter = readFileSync("src/pages/dashboard/CallCenter.tsx", "utf8");
const notificationCenter = readFileSync("src/components/notifications/RealtimeNotificationCenter.tsx", "utf8");
const serviceWorker = readFileSync("public/sw.js", "utf8");
const voiceNotes = readFileSync("src/api/voiceNotes.ts", "utf8");
const voiceNoteRecorder = readFileSync("src/components/messages/VoiceNoteRecorder.tsx", "utf8");
const messagesPage = readFileSync("src/pages/dashboard/Messages.tsx", "utf8");
const analyticsPage = readFileSync("src/pages/dashboard/Analytics.tsx", "utf8");
const analyticsKpis = readFileSync("src/components/analytics/AnalyticsKpis.tsx", "utf8");
const analyticsHardening = readFileSync("src/styles/analytics-hardening.css", "utf8");
const dashboard = readFileSync("src/pages/dashboard/Dashboard.tsx", "utf8");
const dashboardStructuralCss = readFileSync("src/styles/hlc-dashboard-structural-correction.css", "utf8");
const navbar = readFileSync("src/components/Navbar.tsx", "utf8");
const workspaceNav = readFileSync("src/styles/workspace-nav.css", "utf8");
const mobileAppShell = readFileSync("src/styles/mobile-app-shell.css", "utf8");
const mobileReleaseCss = readFileSync("src/styles/mobile-release-fix.css", "utf8");
const appLayout = readFileSync("src/routes/AppLayout.tsx", "utf8");
const premiumTheme = readFileSync("src/styles/premium-theme.css", "utf8");
const premiumEffects = readFileSync("src/styles/premium-effects.css", "utf8");
const visualPizzazz = readFileSync("src/styles/global-visual-pizzazz.css", "utf8");
const contrastContract = readFileSync("src/styles/contrast-contract.css", "utf8");
const workspacePremium = readFileSync("src/styles/workspace-premium-v3.css", "utf8");
const mainEntry = readFileSync("src/main.tsx", "utf8");
const authenticatedEntry = readFileSync("src/styles/authenticated-entry.ts", "utf8");
const agentWorkspace = readFileSync("src/pages/dashboard/AgentWorkspace.tsx", "utf8");
const agentTeamCss = readFileSync("src/styles/agent-team.css", "utf8");
const dedication = readFileSync("src/pages/dashboard/KendrellDedication.tsx", "utf8");
const pageMap = readFileSync("src/config/pageMap.ts", "utf8");
const accountAccessProvider = readFileSync("src/context/AccountAccessProvider.tsx", "utf8");

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
  assert.match(contextualDockCss, /left: max\(14px, env\(safe-area-inset-left\)\)/);
  assert.match(contextualDockCss, /bottom: calc\(154px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(contextualDockCss, /min-width: 132px/);
  assert.match(contextualDockCss, /\.hlc-agent-dock-trigger span \{[\s\S]*display: grid/);
});

test("device alerts and contextual agents use separate safe viewport lanes", () => {
  assert.match(notificationCenter, /className="hlc-device-alert-center"/);
  assert.match(notificationCenter, /window\.setTimeout\(\(\) => setPushStatus\(""\), 5000\)/);
  assert.match(contextualDockCss, /\.hlc-device-alert-center \{[\s\S]*bottom: max\(22px, env\(safe-area-inset-bottom\)\);[\s\S]*left: max\(22px, env\(safe-area-inset-left\)\)/);
  assert.match(contextualDockCss, /@media \(min-width: 721px\) and \(max-width: 1100px\)[\s\S]*\.hlc-agent-dock:not\(\.is-open\)/);
});

test("desktop agent and workspace navigation remain readable at laptop scale", () => {
  assert.match(mobileReleaseCss, /@media \(min-width: 721px\)[\s\S]*\.hlc-agent-dock:not\(\.is-open\)[\s\S]*min-width: 210px !important/);
  assert.match(mobileReleaseCss, /\.hlc-agent-dock\.is-open \{[\s\S]*width: min\(880px, calc\(100vw - 64px\)\) !important/);
  assert.match(mobileReleaseCss, /\.hlc-agent-dock\.is-open \.hlc-ai-icon-action,[\s\S]*min-height: 34px !important/);
  assert.match(mobileReleaseCss, /\.hlc-agent-dock\.is-open \.hlc-agent-tutorial :is\(p, li\)[\s\S]*color: #dbeafe !important;[\s\S]*font-size: 14px !important/);
  assert.match(mobileReleaseCss, /\.hlc-signed-in-shell > \.hlc-navbar \.hlc-nav-menu a > small,[\s\S]*font-size: 12\.5px !important/);
  assert.match(mobileReleaseCss, /\.hlc-command-center \.hlc-metric-card > span:last-child,[\s\S]*font-size: 14px !important/);
});

test("the proactive briefing replaces rather than duplicates the closed agent launcher", () => {
  assert.match(contextualDock, /const showBriefing = Boolean\(/);
  assert.match(contextualDock, /showBriefing \? "has-briefing" : ""/);
  assert.match(contextualDock, /\{showBriefing && \(/);
  assert.match(mobileReleaseCss, /\.hlc-agent-dock\.has-briefing:not\(\.is-open\) \.hlc-agent-dock-trigger \{[\s\S]*display: none !important;/);
  assert.match(mobileReleaseCss, /\.hlc-agent-dock\.has-briefing \.hlc-agent-proactive-briefing > p \{[\s\S]*color: #e6efff !important;[\s\S]*font-size: 15px !important;/);
});

test("an open agent panel never leaves a second corner launcher visible", () => {
  assert.match(mobileReleaseCss, /\.hlc-agent-dock\.is-open > \.hlc-agent-dock-trigger \{[\s\S]*display: none !important;/);
  assert.match(contextualDock, /className="hlc-agent-dock-panel"/);
  assert.match(contextualDock, /aria-label=\{`Close \$\{agent\.name\} assistant`\}/);
});

test("internal-only mobile routes retain an agent while role resolution completes", () => {
  assert.match(contextualDock, /const internalFallbackPrefixes = \[/);
  assert.match(contextualDock, /"\/dashboard"/);
  assert.match(contextualDock, /access\.kind === null && isInternalOnlyRoute\(pathname\)\) return agents\.dion/);
  assert.match(contextualDock, /if \(access\.role === "owner" \|\| access\.role === "manager"\) return agents\.kendrell/);
});

test("signed-in mobile navigation behaves like an adaptive field app", () => {
  assert.match(navbar, /useAccountAccess\(\)/);
  assert.doesNotMatch(navbar, /from\("workspace_members"\)/);
  assert.match(navbar, /className="hlc-mobile-tabbar"/);
  assert.match(navbar, /MobileNavIcon/);
  assert.match(navbar, /label:\s*"Home",[\s\S]*?route:\s*"\/dashboard"/);
  assert.match(navbar, /label:\s*"Work",[\s\S]*?route:\s*"\/leads"/);
  assert.match(navbar, /label:\s*"Network",[\s\S]*?route:\s*"\/network"/);
  assert.match(navbar, /label:\s*"Community",[\s\S]*?route:\s*"\/community-hub"/);
  assert.match(navbar, /aria-label=\{mobileOpen \? "Close all HomeLead Connect areas" : "Open all HomeLead Connect areas"\}/);
  assert.match(navbar, /<span>More<\/span>/);
  assert.match(navbar, /canAccessWorkspacePath\(access\.role, item\.route\)/);
  assert.match(navbar, /aria-label="Mobile primary navigation"/);
  assert.match(navbar, /aria-current=\{active \? "page" : undefined\}/);
  assert.match(workspaceNav, /padding-bottom: calc\(84px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(workspaceNav, /\.hlc-mobile-tabbar \{[\s\S]*position: fixed;[\s\S]*bottom: 0;/);
  assert.match(mobileAppShell, /repeat\(auto-fit, minmax\(0, 1fr\)\)/);
  assert.match(mobileAppShell, /:has\(\.hlc-mobile-tabbar\) \.hlc-navbar-toggle/);
  assert.match(authenticatedEntry, /mobile-app-shell\.css/);
});

test("navigation, dashboard and contextual agents share one fail-closed account access source", () => {
  assert.match(mainEntry, /<AccountAccessProvider>/);
  assert.match(accountAccessProvider, /from\("workspace_members"\)/);
  assert.match(accountAccessProvider, /from\("profiles"\)\.select\("role"\)/);
  assert.match(accountAccessProvider, /from\("homeowner_portal_links"\)/);
  assert.match(accountAccessProvider, /from\("contractor_portal_links"\)/);
  assert.match(accountAccessProvider, /business: !failed/);
  assert.match(accountAccessProvider, /role: failed \? null/);
  assert.match(dashboard, /useAccountAccess\(\)/);
  assert.match(contextualDock, /useAccountAccess\(\)/);
  assert.doesNotMatch(contextualDock, /from\("workspace_members"\)/);
});

test("mobile workspace uses one permanent navigation surface", () => {
  assert.doesNotMatch(appLayout, /MobileWorkDock/);
  assert.doesNotMatch(mainEntry, /mobile-work-dock\.css/);
  assert.match(navbar, /className="hlc-mobile-tabbar"/);
  assert.match(navbar, /aria-label="Mobile primary navigation"/);
});

test("Kendrell HQ separates the family memorial from the operational AI workspace", () => {
  assert.match(agentWorkspace, /<KendrellMemorial \/>/);
  assert.match(dedication, /In loving memory/);
  assert.match(dedication, /Kendrell Charles Washington/);
  assert.match(dedication, /December 6, 1991 — November 17, 2010/);
  assert.match(dedication, /created by his brother, Antoine Washington/);
  assert.match(dedication, /Harrisburg High School graduate/);
  assert.match(dedication, /HACC student/);
  assert.match(dedication, /Aspiring music artist/);
  assert.match(dedication, /to="\/hq\/dedication"/);
  assert.match(dedication, /to="\/hq"/);
  assert.match(dedication, /hlc-dedication-view/);
  assert.match(dedication, /Symbolic Kendrell AI visual — not a historical photograph/);
  assert.match(dedication, /\/brand\/avatars\/Kendrell_Locked_HLC\.png/);
  assert.match(dedication, /A brother’s dedication/);
  assert.match(dedication, /Only family-approved and verified details are presented as history/);
  assert.match(dedication, /A place reserved for authentic memories/);
  assert.match(dedication, /HLC will not replace real family memories with generated images/);
  assert.match(mobileReleaseCss, /body\.hlc-dedication-view :is\(\.hlc-mobile-work-dock, \.hlc-work-dock, \.hlc-mobile-tabbar, \.hlc-agent-dock\)/);
  assert.match(mobileReleaseCss, /\.hlc-route-content \.hlc-kendrell-path-grid article h3 \{[\s\S]*color: #ffffff !important;/);
  assert.match(mobileReleaseCss, /\.hlc-kendrell-memorial-mark span \{[\s\S]*white-space: nowrap !important;/);
  assert.match(pageMap, /page\("Kendrell Dedication", "\/hq\/dedication"/);
  assert.match(agentWorkspace, /Symbolic Kendrell AI visual — not a historical photograph/);
  assert.match(agentTeamCss, /\.hlc-kendrell-memorial/);
  assert.match(agentTeamCss, /\.hlc-agent-command-hero/);
  assert.doesNotMatch(agentTeamCss, /#fbbf24|#d97706|#d89b2b|#fde68a|251, 191, 36|245, 158, 11/i);
  assert.match(agentTeamCss, /#1e5bff/);
  assert.match(agentTeamCss, /\.hlc-kendrell-memorial \{[\s\S]*justify-items: center;[\s\S]*text-align: center !important;/);
  assert.match(agentTeamCss, /\.hlc-kendrell-legacy \{[\s\S]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(agentTeamCss, /@media \(max-width: 820px\)[\s\S]*\.hlc-kendrell-legacy \{ grid-template-columns: 1fr;/);
  assert.match(agentTeamCss, /\.hlc-agent-command-hero button \{ width: min\(100%, 280px\) !important;/);
});

test("mobile voice-note action opens a ready recorder in the selected conversation", () => {
  assert.match(messagesPage, /useSearchParams/);
  assert.match(messagesPage, /searchParams\.get\("compose"\) === "voice-note"/);
  assert.match(messagesPage, /focusOnMount=\{composeVoiceNote\}/);
  assert.match(messagesPage, /Voice note mode is ready/);
  assert.match(voiceNoteRecorder, /focusOnMount\?: boolean/);
  assert.match(voiceNoteRecorder, /recordButtonRef\.current\?\.focus\(\)/);
  assert.match(voiceNoteRecorder, /scrollIntoView/);
});

test("Dion business intelligence copy and reporting control remain durable and mobile accessible", () => {
  assert.match(analyticsPage, /HLC Business Intelligence/);
  assert.match(analyticsPage, /Operating KPIs &amp; Visitor Analytics/);
  assert.match(analyticsPage, /Canonical workflow performance plus privacy-minimized first-party HLC traffic for the last 30 days\./);
  assert.match(analyticsKpis, /className="hlc-analytics-period-button"/);
  assert.match(analyticsKpis, /aria-pressed="true"/);
  assert.match(analyticsKpis, /setRefreshKey/);
  assert.match(analyticsHardening, /min-width: 44px/);
  assert.match(analyticsHardening, /min-height: 44px/);
  assert.match(analyticsHardening, /background: #1e3a8a/);
  assert.match(analyticsHardening, /color: #ffffff/);
  assert.match(analyticsHardening, /\.hlc-analytics-period-button:hover/);
  assert.match(analyticsHardening, /\.hlc-analytics-period-button:focus-visible/);
  assert.match(analyticsHardening, /\.hlc-analytics-period-button:active/);
  assert.match(authenticatedEntry, /analytics-hardening\.css/);
});

test("dashboard protects the approved structural home workspace", () => {
  assert.match(dashboard, /className="hlc-home-workspace hlc-home-structural"/);
  assert.match(dashboard, /className="hlc-home-primary-grid"/);
  assert.match(dashboard, /Needs attention/);
  assert.match(dashboard, /<h2 id="hlc-home-today-title">Today<\/h2>/);
  assert.match(dashboard, /<Link to="\/work">Open Work<\/Link>/);
  assert.match(dashboard, /<Link to="\/messages">/);
  assert.match(dashboard, /<Link to="\/call-center">/);
  assert.match(dashboard, /<Link to="\/calendar">/);
  assert.match(dashboard, /<Link to="\/jobs">/);
  assert.match(dashboard, /canAccessWorkspacePath\(account\.role, agent\.route\)/);
  assert.match(dashboard, /visibleAgentTeam\.length > 0/);
  assert.doesNotMatch(dashboard, /\{agentTeam\.map\(/);
  assert.doesNotMatch(dashboard, /Business Pulse/);
  assert.doesNotMatch(dashboard, /hlc-command-hero/);
  assert.match(dashboardStructuralCss, /\.hlc-home-primary-grid \{[\s\S]*grid-template-columns:/);
  assert.match(dashboardStructuralCss, /@media \(max-width: 820px\)[\s\S]*\.hlc-home-primary-grid \{[\s\S]*grid-template-columns: 1fr/);
  assert.match(dashboardStructuralCss, /@media \(max-width: 820px\)[\s\S]*\.hlc-home-metric-strip \{[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
});

test("premium HLC presentation layer stays blue-cyan beneath contrast and responsive contracts", () => {
  assert.match(mainEntry, /\.\/styles\/premium-theme\.css";\s*import "\.\/styles\/premium-effects\.css";\s*import "\.\/styles\/global-premium-system\.css";\s*import "\.\/styles\/global-visual-pizzazz\.css";\s*import "\.\/styles\/contrast-contract\.css";\s*import "\.\/styles\/responsive-page-contract\.css";/);
  assert.match(authenticatedEntry, /workspace-premium-v3\.css/);
  assert.match(premiumTheme, /--hlc-blue: #2563eb/);
  assert.match(premiumTheme, /--hlc-cyan: #0891b2/);
  assert.match(premiumTheme, /prefers-reduced-motion: reduce/);
  assert.match(premiumTheme, /\.hlc-analytics-kpi::before/);
  assert.match(premiumTheme, /\.hlc-signed-in-shell > \.hlc-navbar/);
  assert.doesNotMatch(premiumTheme, /purple|violet|#aa3bff|#c084fc/i);
  assert.match(visualPizzazz, /--hlc-pop-blue: #2563eb/);
  assert.match(workspacePremium, /--hlc-v3-navy-950: #07111f/);
  assert.match(workspacePremium, /\.hlc-route-content \.hlc-lead-card/);
  assert.match(workspacePremium, /border-radius: 0 !important/);
  assert.match(visualPizzazz, /\.hlc-job-card/);
  assert.match(visualPizzazz, /\.hlc-call-center-record/);
  assert.match(visualPizzazz, /\.hlc-message-start/);
  assert.match(visualPizzazz, /\.hlc-legal-page \.hlc-legal-card/);
  assert.match(visualPizzazz, /prefers-reduced-motion/);
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

test("Google Voice handoff stays unified without pretending browser telephony exists", () => {
  assert.match(callCenter, /Open Google Voice/);
  assert.match(callCenter, /Outbound call/);
  assert.match(callCenter, /Outbound text/);
  assert.match(callCenter, /Log inbound call/);
  assert.match(callCenter, /Log inbound text/);
  assert.match(callCenter, /embedded Answer, Hold, Transfer, Hang Up/);
  assert.match(manualCommunications, /searchParams\.get\("transport"\) === "google_voice"/);
  assert.match(manualCommunications, /searchParams\.get\("direction"\) === "inbound"/);
  assert.doesNotMatch(callCenter, /onClick=\{[^}]*answer|onClick=\{[^}]*hold|onClick=\{[^}]*transfer/i);
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

test("agent workspaces present business language instead of internal capability codes", () => {
  assert.match(agentWorkspace, /What would you like \{agent\.name\} to do\?/);
  assert.match(agentWorkspace, /Show my business overview/);
  assert.match(agentWorkspace, /Add this to Antoine's priority list/);
  assert.match(agentWorkspace, /Recent activity/);
  assert.match(agentWorkspace, /Conversation with Kendrell/);
  assert.match(agentWorkspace, /friendlyStatus/);
  assert.doesNotMatch(agentWorkspace, /<small>\{capability\.level\}<\/small>/);
  assert.doesNotMatch(agentWorkspace, /<pre style=\{preStyle\}>/);
  assert.match(agentWorkspace, /account\.role !== "owner"/);
});

test("mobile agent guidance is a complete scrollable sheet above fixed navigation", () => {
  assert.match(agentWorkspace, /document\.body\.classList\.add\("hlc-agent-guidance-open"\)/);
  assert.match(agentWorkspace, /hlc-agent-guidance-overlay/);
  assert.match(agentWorkspace, /createPortal\(/);
  assert.match(agentWorkspace, /document\.body\)\}/);
  assert.match(agentWorkspace, /hlc-agent-guidance-drawer/);
  assert.match(agentWorkspace, /hlc-agent-guidance-head/);
  assert.match(mobileReleaseCss, /body\.hlc-agent-guidance-open :is\([\s\S]*\.hlc-mobile-tabbar[\s\S]*display: none !important;/);
  assert.match(mobileReleaseCss, /body\.hlc-agent-guidance-open \.hlc-navbar/);
  assert.match(mobileReleaseCss, /\.hlc-agent-guidance-drawer \{[\s\S]*height: 100dvh !important;[\s\S]*overflow-y: auto !important;/);
  assert.match(mobileReleaseCss, /\.hlc-agent-guidance-head > button \{[\s\S]*white-space: nowrap !important;/);
  assert.match(agentWorkspace, /Make the next decision clear/);
  assert.match(agentWorkspace, /Analyze/);
  assert.match(agentWorkspace, /Prioritize/);
  assert.match(agentWorkspace, /Delegate/);
  assert.match(agentWorkspace, /Escalate/);
  assert.match(agentWorkspace, /Ask \{agent\.name\} about this/);
  assert.match(mobileReleaseCss, /\.hlc-agent-guidance-intro \{[\s\S]*linear-gradient/);
  assert.match(mobileReleaseCss, /\.hlc-agent-guidance-cards details/);
});
