# Mobile A+ Sprint 1 — Shell + Home + Universal Search

Status: IMPLEMENTED / AWAITING EXACT-HEAD CI + HUMAN VISUAL QA

Branch: `postlaunch/mobile-a-plus-s1-shell-home-search-20260826`
Parent mobile program: `postlaunch/mobile-a-plus-20260826`

## Scope

- Preserve the existing role-aware five-tab mobile IA.
- Add a universal HLC command/search surface.
- Expose search from the Home command center and the mobile More menu.
- Support keyboard command search with Command/Ctrl+K.
- Respect HLC role/path access when presenting searchable destinations.
- Make the mobile Home hierarchy action-first without changing desktop content order.
- Add safe-area bottom clearance and minimum compact navigation target sizing.

## Implemented

### Universal command/search

`src/components/search/GlobalCommandSearch.tsx`

- Role-aware route and command catalog.
- Search groups: Commands, Work, Network, Community, Communication, Resources, Account, AI.
- More-menu search launcher rendered into the existing mobile drawer.
- Command/Ctrl+K shortcut.
- Mobile-safe modal with keyboard focus, Escape close, body scroll lock and safe-area sizing.

### Mobile Home

`src/pages/dashboard/Dashboard.tsx`

- Search control added beside notifications.
- Existing live metrics preserved.
- Mobile hierarchy is reordered through CSS so Needs Attention / Priority and Quick Actions precede deeper dashboard surfaces.
- Desktop DOM/content order remains unchanged.

### Mobile shell rules

`src/styles/mobile-a-plus.css`

- Authenticated route bottom clearance accounts for tab bar and device safe area.
- Mobile tab targets retain minimum usable height.
- More drawer gets additional home-indicator/tabbar clearance.
- Home section order becomes action-first on compact screens only.

## Guardrails

- No `main` changes.
- No production-release-candidate changes.
- No authorization policy widening.
- No quality threshold reductions.
- Search exposes only destinations allowed by existing role/path policy.
- No claim that entity-record full-text search exists yet; Sprint 1 establishes the universal command/navigation architecture. Record-level federated search can plug into this surface in a later exact-head slice.

## Required exit evidence

- TypeScript/Vite production build PASS.
- Existing acceptance/static gates PASS.
- Rendered mobile quality PASS.
- iPhone visual QA for Dashboard, More -> Search, search modal, keyboard-open state and bottom navigation.
- No regression to desktop dashboard/navigation.

## Exact-head retry checkpoint

A fresh documentation-only checkpoint was created after GitHub Actions returned a runner `startup_failure` before any job started. This retry does not alter Sprint 1 product behavior or lower any gate; it exists only to obtain clean exact-head Launch Candidate and Rendered Quality evidence.
