# V1 Visual Readiness Audit

Protected production baseline: `5c1b86a68966d8fa0391f1e3d64d0dfa21a990f7`

Sprint intent: improve the existing live V1 presentation without changing business logic, auth, RLS, billing, workflow semantics, or backend contracts.

## Governing rule

Every screen should show the user where they are, what matters, and the single best next action—without repeating itself.

## Hard visual rules

- One primary HomeLead Connect brand mark in app chrome. Footer brand is optional; avoid repeated brand-name copy inside page headings, cards, banners, and helper text unless context requires it.
- One primary action per page. Do not duplicate the same CTA unless a long page genuinely needs a repeated action for reachability.
- One predictable communication/help entry point. Avoid multiple competing Contact / Message / Chat / Help controls.
- Desktop sidebar is grouped, role-aware, collapsible, and visually quiet. Mobile uses a purpose-built drawer/bottom navigation rather than a squeezed desktop sidebar.
- No accidental plain-white page shells that visually conflict with the approved product system.
- Normal mobile workflows must not require horizontal scrolling.
- Dense desktop tables must simplify into prioritized mobile cards/rows where needed.
- Shared shell/component fixes come before page-specific fixes.
- No functional/backend change unless a visual defect proves inseparable from wiring or behavior.
- Passed visual families freeze after certification unless fresh user evidence justifies reopening them.

## Acceptance gates

### Clarity
A screen fails if it unnecessarily repeats the brand, duplicates primary CTAs, creates competing navigation, scatters communication controls, repeats explanatory copy, or leaves the next action unclear.

### Responsive
A screen fails for horizontal overflow, clipped controls, unsafe iPhone areas, broken stacking, unreadable typography, squeezed desktop tables, sidebar collisions, or hidden primary actions.

### Visual coherence
A screen fails for accidental white-background outliers, inconsistent card/form/button treatment, conflicting icon styles, inconsistent status language, or layout rhythm that does not match the approved system.

### Performance
A screen fails if visual changes cause material bundle/image growth, unnecessary route loading, visible layout jumping, or degraded rendered-quality gates.

### Accessibility
A screen fails for weak contrast, missing focus visibility, unusable keyboard order, undersized mobile controls, or inaccessible state communication.

## Severity

- P0 — unusable or blocks task completion.
- P1 — confusing, visibly broken, or materially undermines trust.
- P2 — inconsistent or clearly unfinished but usable.
- P3 — minor cosmetic polish; never blocks promotion by itself.

## Execution order

1. Global authenticated shell and desktop sidebar.
2. Login / register / recovery / invitation auth family.
3. Global background/theme outliers.
4. Shared forms, cards, tables, empty/loading/error states.
5. Operational route families: Dashboard, Work, Leads, Jobs, Calendar, Follow-ups, Messages.
6. Portal route families: Resident, Professional, Partner.
7. Network / Community / Resources / Settings / HQ families.
8. Mobile certification sweep.
9. Desktop certification sweep.
10. Automated visual regression, overflow, accessibility, and rendered-quality gates.
11. Owner visual signoff; then freeze.

## Initial source-backed findings

### P1 — Authentication branding repetition
`AuthShell` currently renders a logo plus visible `HomeLead Connect`, defaults the eyebrow to `HomeLead Connect account`, while Login supplies `Welcome to HomeLead Connect`, repeats the brand in its description, submit text, new-account copy, and return link. This violates the one-brand-mark / no-repetition rule and is the first auth-family repair target.

Target direction: keep the logo/brand once in the auth shell; change page title to task language such as `Welcome back` / `Sign in`; make supporting copy short; use `Sign in` as the primary CTA; keep recovery/create-account links concise; retain invitation-specific context only when an invitation is actually present.

### P1 — Navigation information density
`Navbar.tsx` contains both grouped desktop navigation and a separate mobile bottom/more system, which is architecturally useful, but the desktop implementation exposes page purpose copy and counts inside expandable groups. This needs visual certification for density, hierarchy, repeated labels, and role relevance before any rewrite.

Target direction: preserve route/role logic; simplify presentation only. Group by user intent, reduce explanatory text inside routine navigation, keep agent access contextual, and ensure one obvious active location.

### P1 — Unstyled protected/workspace fallback states
`ProtectedLayout` and `WorkspaceLayout` contain plain loading/access/billing fallback markup, including inline padding-only `<main>` surfaces. These can become visible user-facing white/unstyled states and should be brought under the same dark/premium error/loading shell without changing access decisions.

Target direction: shared branded system-state component for loading, restricted, billing unavailable, subscription required, and role-not-assigned states; logic remains untouched.

## Route families from current router

- Public / marketing / legal
- Auth / invitation / recovery
- Resident portal
- Professional portal
- Partner portal
- Shared authenticated communication / notifications / academy
- Internal workspace dashboard / work
- Network / map / matching
- Community
- Resources / help / tutorials / rules
- Analytics / intelligence / HQ
- Billing / settings / team / profile
- Leads / jobs / calendar / follow-ups / messages / documents / call center
- Agent workspaces
- Error / not-found

## Stop condition

The sprint ends when every high-exposure route family has a certified desktop and mobile representative, shared-shell defects are resolved, P0/P1 visual defects are closed, no material P2 remains on primary journeys, automation passes on the exact candidate SHA, and owner visual signoff is complete. P3 polish moves to post-launch observation.