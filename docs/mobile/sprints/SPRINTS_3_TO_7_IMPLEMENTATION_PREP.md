# Mobile A+ Sprints 3–7 — Implementation Prep

Status: PREPARED / PRODUCT WORK NOT STARTED

This planning-only document does not advance any sprint. Each product sprint may begin only after the prior sprint has been promoted through the isolated Mobile A+ program with exact-head automated evidence.

## Sprint 3 — Network + Map + Filters
Primary existing targets:
- `src/pages/dashboard/NetworkDirectory.tsx`
- `src/pages/dashboard/ProviderMap.tsx`
- `src/pages/dashboard/CommunityMatchDeck.tsx` where matching behavior is reused

Implementation direction:
- search-first Network entry;
- compact provider result rows/cards;
- map/list toggle;
- draggable/expandable result sheet over map on compact screens;
- mobile filter sheet for trade, area, availability and supported trust/ranking fields;
- preserve provider save/match/profile actions without creating unsupported writes;
- never render a desktop side panel on top of the phone map.

Exit focus:
- provider discovery, filtering, map inspection and record open all usable one-handed;
- map controls do not collide with bottom navigation, safe areas or agent surfaces.

## Sprint 4 — Community + Communications
Primary existing targets:
- `src/pages/dashboard/CommunityHub.tsx`
- `src/pages/dashboard/CommunityParticipation.tsx`
- `src/pages/dashboard/CommunityMatchDeck.tsx`
- `src/pages/dashboard/Messages.tsx`
- `src/pages/dashboard/ManualCommunications.tsx`
- `src/pages/dashboard/CallCenter.tsx`
- `src/pages/dashboard/Notifications.tsx`

Implementation direction:
- content-first community feed rather than dashboard card wall;
- compact community section rail;
- full-height mobile messaging conversation with keyboard-safe composer;
- message row swipe shortcuts only with visible fallback;
- preserve real Resend/manual communications truth and never imply unavailable browser telephony;
- mobile call-center surface emphasizes contact, script/context, disposition and next action rather than desktop analytics density.

Voice-note/dictation surface may be introduced only where existing storage/transmission contracts support it; otherwise implement safe UI scaffolding separately from claims of end-to-end delivery.

## Sprint 5 — Offline + Drafts + Saved State
Cross-cutting targets:
- authenticated shell/router state;
- Leads / Jobs / Follow-ups / Messages / Documents / Calendar forms and composers;
- local persistence utilities introduced behind explicit typed APIs.

Required behavior:
- preserve scroll/filter/tab/calendar/map state where safe;
- draft recovery for text/form composition;
- explicit online/offline/syncing/pending state;
- retry queue for safe reversible writes only;
- never silently queue billing, destructive deletes, irreversible automation execution or high-risk AI writes;
- document uploads/photos may retry only with visible user state and idempotent server behavior.

Implementation should prefer small reusable primitives over route-specific duplicated localStorage code.

## Sprint 6 — Analytics + Professional Admin
Primary existing targets:
- `src/pages/dashboard/Analytics.tsx`
- `src/pages/dashboard/Automations.tsx`
- `src/pages/dashboard/Settings.tsx`
- `src/pages/dashboard/Team.tsx`
- `src/pages/dashboard/BillingWorkspace.tsx`
- `src/pages/dashboard/WorkspaceActivity.tsx`
- `src/pages/dashboard/AgentWorkspace.tsx`

Implementation direction:
- mobile KPI summary -> drill-down -> filters/breakdown rather than tiny desktop dashboards;
- large data transforms into compact record rows by default;
- optional horizontal data mode only when useful;
- dense admin forms use progressive disclosure and grouped sections;
- bulk selection uses explicit Select mode + bottom action bar;
- financial actions and consequential agent/admin actions keep confirmation/audit requirements;
- do not invent revenue, connection or integration state.

## Sprint 7 — Full-route iPhone QA + Performance
Primary scope:
- all authenticated routes in the Mobile A+ IA;
- public/auth routes only for regression checks where shared CSS/shell changes could affect them.

Automated gates:
- HLC Launch Candidate exact-head PASS;
- HLC Rendered Quality Gate exact-head PASS;
- no lowered performance/accessibility/best-practice thresholds;
- acceptance suite and static audit remain at or above the inherited baseline;
- build/typecheck and production dependency audit pass.

Human evidence remains separate and required:
- Home / Work / Network / Community / More;
- Leads / Jobs / Calendar / Follow-ups / Workflow;
- Messages / Documents / Network Map / Provider Directory;
- Billing / Settings / AI Team / Profile;
- keyboard, bottom-sheet, safe-area, rotation where supported, scroll restoration and offline/retry states;
- no white screens, clipping, hidden actions or nav collisions.

## Shared architecture rules for Sprints 3–7
- Reuse the five-parent navigation; do not introduce another permanent mobile navigation system.
- One contextual agent surface at a time; never stack multiple floating bubbles.
- Minimum compact touch target remains 44–48px where applicable.
- Secondary actions belong in explicit overflow/sheets, not dense action clusters.
- Mobile-native presentation may differ from desktop while preserving capability.
- All automated sprint certification is exact-head only.
- No sprint promotion to production `main` is authorized by this program.
