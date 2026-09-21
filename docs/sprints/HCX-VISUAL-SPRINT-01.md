# HCX-VISUAL-SPRINT-01

## Verified authority and preserved owner work

Authoritative repository: homeleadconnectllc/HomeLeadConnect-Web. Sprint starts from current remote main `7197ed0276d84b0fca91145b8c744162315edb56`, not remembered branch SHAs.

Original checkout: `/Users/homelead_connect/Desktop/HomeLeadConnect-Web-local`, branch `visual/home-frontdoor-reintegration-20260913`, HEAD `6f1a5498d08e65b8f1aca6b0babba871fcff2c7c`. Its only modification was `src/styles/v2-real-stock-and-global-type-20260913.css`: Four Pathways image fit/crop rules. The original checkout was not modified. A binary patch and complete CSS copy were saved outside the sprint checkout. Current main has removed that stylesheet and uses the standalone owner-authority homepage; the obsolete file was not resurrected.

Read current CODEX_HANDOFF.md and PROJECT_TRUTH, ARCHITECTURE, AI_GOVERNANCE, BRAND_SYSTEM, ASSET_REGISTRY, DECISION_LOG, ROADMAP. Earlier local prototype-labelled work was inspected as historical context only and is not an authority or separate target repository.

## Shared-system changes

LaunchSurface already uses classes on main. Workflow and WorkspaceActivity plus residual static style islands now use one deduplicated shared stylesheet. Public and signed-in entries load it before their current visual authorities. Shared fallback surfaces/text inherit signed-in tokens, retaining public fallbacks. Finite selected, scheduled and compliance states use CSS selectors. Runtime coordinates, gestures, record accents and calculated widths remain inline.

Removed four unreferenced scaffold components: Home.tsx, FeaturesPage.tsx, components/layout/Navbar.tsx and components/layout/Footer.tsx. No route table, business logic, API, auth, database, RLS, AI/persona behavior or existing asset was replaced. A verified entrypoint defect was corrected: only exact public routes load the public CSS entry, so protected Community descendants and /partners/manage retain structural app styles. PortalAccessBoundary changes only the loading element's presentation attribute.

## Runtime exceptions

Eight JSX style attributes across seven files: GlobalPullToRefresh (distance/progress), AgentChatPanel (persona accent), AnalyticsKpis (bar width), LeadCard (record accent), CommunityMatchDeck (gesture transform), IntelligenceWorkspace (forecast width), ProviderMap (two objects: coordinates and record accents).

Imperative styles: measured mobile viewport/keyboard CSS variables; navigation/search/standalone-home scroll locking and restoration. Standalone public HTML document styles and generated browser fixtures remain outside the routed app and are not presumed dead.

## Route coverage

Inventory is derived from current AppRouter nesting: public 31, resident 11, professional 6, partner 2, shared signed-in 9, internal workspace 66; total 125. Local screenshots and geometry checks cover all patterns at 390 and 1440 widths, with public representatives first. Protected redirects are boundary proof only.

The approved authenticated workflow uses HLC_VISUAL_TEST_EMAIL/HLC_VISUAL_TEST_PASSWORD through GitHub secrets. It now sweeps the 75 shared/internal routes using only that existing workspace identity. Parameterized routes use a missing-record identifier and cannot prove real-record content. Resident/professional/partner interior proof is not implied by workspace authentication. No alternate credentials are invented or substituted.

## Rendered exception fixes

- Public header: restore grid layout, intrinsic account-link sizing and menu rows; separate account-benefit labels.
- Public menu trigger: the official circular logo is the single visible trigger on every public/account route. The former hamburger icon and `Menu` label are removed; a restrained blue ring/glimmer signals interactivity, with a static reduced-motion fallback and explicit keyboard focus.
- Pathway family: paired desktop hero copy/imagery, mobile stacking and readable heading line height.
- Signed-in system: explicit sans-serif typography, token-based neutral/status surface fallbacks, intrinsic navigation-link width.
- App Directory: restore collection/link layout in its existing CSS owner.
- Resources: visible, usable navigation touch targets.
- Auth entry after protected redirect: clear inherited two-column outer shell and full-width password-toggle rules.
- Dedication: ensure the standalone memorial's more specific selector receives the mobile single-column layout; no identity/content/portrait changes.
- System Health: stack evidence labels and values using shared surface/line tokens.

## Verification and honest boundaries

The launch gate includes lint, six visual/source checks, 568 acceptance checks, 185 static launch checks and production build. Focused checks were run after each defect correction. A normalized syntax-tree comparison found no non-presentation differences in the 39 changed surviving component files; main.tsx's separately reviewed stylesheet classification is the sole entrypoint logic change.

The expanded approved-account proof captured all 75 shared/internal patterns at both sizes (150 screenshots), plus the protected sign-in deep link. Earlier captures found the corrected entrypoint overflow, navigation compression, directory layout and memorial-width defects. Final run-specific outcomes, exact SHAs, screenshots and remaining limits are provided with PR #478 and the task's output report; earlier screenshots are diagnostic evidence, not final certification.

One dedicated workspace identity does not certify all internal roles or resident/professional/partner interiors. Partner-management data returned a permission error for the approved identity; permissions were not changed. Placeholder detail IDs can produce missing/invalid-record states (or an existing permitted record), and do not certify all data states. Public local audit blocks external services and does not claim form submission or persistence proof.

Manual review checks: desktop/mobile header and menu; public/account entry; workflow/activity; CRM and communications; Resources/navigation; Community descendants; directory; memorial; forms/empty/error states. Review existing-record detail actions and audience-specific portal interiors only with separately approved sessions.

No merge, production deployment, or paid creative generation occurred. The final branch is intentionally a draft review candidate while audience-specific proof remains outstanding.
