# HLC Mobile A+ Acceptance Matrix

Status: LOCKED PROGRAM GATE

Every sprint is cumulative. A sprint may not be frozen if it introduces a regression in any previously frozen Mobile A+ behavior.

## Global gates for every sprint

1. Exact-head HLC Launch Candidate PASS.
2. Exact-head HLC Rendered Quality Gate PASS.
3. No quality threshold reduction.
4. No unauthorized production/main merge.
5. Role/access policy remains authoritative.
6. Mobile 44px+ practical touch targets on newly changed controls.
7. iPhone safe-area and keyboard clearance on changed surfaces.
8. Desktop regression check for changed shared components.
9. No white-screen route failures.
10. Human visual QA remains a separate gate; automated evidence never substitutes for physical-device judgment.

## Sprint 1 — Shell, Home, Search
- Five-tab IA preserved.
- Home is action-first on compact screens.
- Search accessible from Home and More.
- Command/Ctrl+K supported on hardware keyboards.
- Search results filtered by authorized role/workspace access.
- Search modal is safe-area aware and keyboard safe.

## Sprint 2 — Work, Quick Actions, Gestures
- Leads, Jobs, Calendar, Follow-ups and Workflow have compact mobile navigation.
- No record exposes more than two primary actions by default.
- Secondary actions move behind overflow/sheet patterns.
- Swipe actions have visible non-gesture alternatives.
- Destructive actions require confirmation.

## Sprint 3 — Network, Map, Filters
- Search-first Network entry.
- Map/list toggle is usable with one hand.
- Filters use mobile sheet/full-screen presentation.
- Provider result cards expose only essential fields and actions.
- Map, results and bottom navigation never overlap.

## Sprint 4 — Community, Messages, Voice
- Community is content-first.
- Messages use a keyboard-safe sticky composer.
- Voice note recording supports cancel, preview and send where browser capability permits.
- Dictation/browser speech support is progressive enhancement, not a hard dependency.
- Draft text survives route/background interruption where technically possible.

## Sprint 5 — Offline, Retry, Saved State
- Explicit Online/Offline/Syncing/Pending state.
- Safe queued actions persist and retry deterministically.
- Financial/destructive/high-risk AI writes are never silently queued.
- Scroll, filters, selected tabs, calendar date/view and drafts restore appropriately.
- Queue failures are visible and recoverable.

## Sprint 6 — Analytics, Large Data, Admin
- Mobile analytics use KPI/trend/drill-down patterns rather than shrunken desktop dashboards.
- Large tables default to record-row views.
- Optional horizontal data mode remains available where useful.
- Bulk selection is explicit and reversible where possible.
- Dense admin controls use progressive disclosure and role filtering.

## Sprint 7 — Full Route Certification
- Full authenticated route matrix checked at compact viewport.
- Full critical route matrix checked at desktop viewport.
- Cross-sprint regression sweep complete.
- Mobile performance/accessibility/best-practices thresholds pass.
- Offline/keyboard/safe-area/rotation edge cases checked.
- Human iPhone visual QA checklist prepared for final observational gate.

## Freeze rule
A sprint is FROZEN only when the exact SHA carrying its final changes has green required automated gates and its required human observational evidence is recorded. Until then the sprint is IMPLEMENTED or VERIFYING, never COMPLETE.
