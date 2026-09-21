# HCX Integration Specification — Reconciliation Sprint 01

Date: 2026-09-21
Owner: Antoine Washington
Company: HomeLead Connect LLC
Product: The HomeLead Connect Experience (HCX)

## Authority and release boundary

This sprint starts from production-verified Web merge SHA `c3fcecbaafefdf8285cc5170e3c9eb133f55912b`.
Production Verification #247 completed successfully for that exact SHA.

Working branch:
`sprint/hcx-reconciliation-01-20260921`

Production remains protected. This branch is for reconciliation, integration, testing, and owner review only. Production promotion still requires an exact certified candidate and owner approval.

## Preserved source checkpoints

- Web production authority: `c3fcecbaafefdf8285cc5170e3c9eb133f55912b`
- Prototype application/CSS cleanup: `9056dc10578f50a3821c1ba60a3fe4aab2cad965`
- Prototype visual-system sprint: `e4a33ad54aa2a8c293e97cfd14d6e05a883e9540`
- Prototype visual-system merge base with cleanup branch: `32200a8e0dc4b7d6b95b0b033b797c62d29bbdf2`
- Prototype continuity main: `e4eb74eef39b12c3ce7a16b1c816a9c6bd9ba253`

The two prototype sprint heads diverge by one commit each after `32200a8`. They must be reconciled deliberately; neither is to be blindly merged into Web.

## Product families to reconcile

1. Front Door — Home, About, Contact, Residents, Professionals, Partners, Community, Request Service, Sign In/Join/Applications.
2. Resident — Home/Dashboard, My Requests, Request Status, Messages, Professionals/Service Connections, Resources, Account.
3. Professional — Home/Dashboard, Leads, Work/Jobs, Customers, Estimates, Availability, Network/Map, Communications, Resources/Academy, Account.
4. Partner — Partner Home, Opportunities/Connections, Communications, Resources, Partner Management.
5. Community — Discover, Community Activity, Academy/Learning, Roleplay, Resources, Messages.
6. Shared HCX — Universal Search, Work, Network, Communications, Resources, App Directory, Notifications, Settings/Profile.
7. AI Team — Kendrell (HQ/coordination), Dion (Operations/BI), Diamond (Customer Experience).
8. HLC HQ / Operations — CRM, Leads, Workflows, Analytics, Communications, Professional Management, Partner Management, System Health, Administration, AI Operations.
9. Platform — Authentication, Supabase/data, permissions/RLS, routing, notifications, search, responsive/mobile, offline/drafts, security/monitoring.

## Disposition vocabulary

- **Keep Current** — production authority already owns the correct behavior/presentation.
- **Bring Forward** — preserved source contains useful work that should be integrated.
- **Superseded** — preserved source is older than the current authority or replaced by stronger work.
- **Needs Technical Verification** — useful candidate work, but behavior/dependency parity must be proven before integration.
- **Needs Owner Review** — product/visual decision cannot be settled safely from code evidence alone.

## Initial reconciliation decisions

| Area | Disposition | Evidence / boundary |
| --- | --- | --- |
| Production auth/data/RLS behavior | Keep Current | No prototype visual cleanup is allowed to replace production security/data authority without explicit technical proof. |
| Auth shell and auth status presentation | Bring Forward selectively | Prototype work extracts fixed presentation into shared CSS while preserving auth flow. |
| Login/Register/Forgot/Reset presentation | Bring Forward selectively | Presentation cleanup only; production behavior remains authority. |
| Portal access presentation | Bring Forward selectively | Preserve access calculation and authorization boundaries. |
| Request Service | Bring Forward selectively | Prototype branch removes embedded static style blocks while retaining page/form structure; submission/data behavior remains production authority. |
| Professional services/availability presentation | Bring Forward selectively | Preserve handlers, controls, and data behavior. |
| Provider Map visual state | Needs Technical Verification | Both prototype sprint heads touch ProviderMap; runtime positions/data-derived styles must remain dynamic while finite selected state may move to CSS. |
| Shared static-style cleanup | Bring Forward | Static visual islands should move to shared style authorities where behavior is unchanged. |
| PublicSiteNav prototype sprint | Needs Technical Verification | Compare against the newly promoted Web public-navigation authority before any code is carried forward. |
| Prototype public visual CSS | Needs Technical Verification | Do not layer large CSS authorities blindly; reconcile selector ownership against current Web styles. |
| Route-family visual audit | Bring Forward/adapt | Useful as a guard for broad HCX route-family coverage. |
| Mobile agent-dock tests | Bring Forward/adapt | Mobile is a cross-cutting HCX quality layer. |
| Communications experience tests | Bring Forward/adapt | Preserve current communications behavior and strengthen coverage. |
| Continuity/sprint docs | Bring Forward as evidence | Documentation informs integration but does not override current runtime authority. |
| index.html/package.json prototype changes | Needs Technical Verification | Compare individual changes; do not replace current Web launch/build configuration wholesale. |

## Owner product requirements to preserve for later capability integration

The unified HCX should support, without scattering features across unrelated surfaces:

- Resident-friendly estimates and ballpark-price education.
- Professional/company pricing inputs such as products/materials, quantity, labor/hourly information, and estimate policy.
- Paid/subscription perks that can include estimate-related value without misleading users about cash value.
- Points, badges, progress, credits/discount-style rewards, QR/referral interactions, and visual progress such as house/room/build progression.
- Academy/tutorial learning tied to relevant progress and rewards.
- Resident/family/community participation and helpful suggestions.
- AI agents that respond naturally, learn from approved knowledge, route people to useful help, support quick replies/scripts, and escalate when needed.
- Owner-level visibility across roles/workspaces, with sensitive operational/technical information shown only where appropriate.
- Settings/preferences such as appearance, keyboard shortcuts, time zone, locale/language, notifications, accessibility, profile/account, security/sign-in, and eventually device/session controls.

These are product requirements, not permission to bypass existing privacy, authorization, security, or release boundaries.

## Sprint execution order

1. Establish exact production-derived integration branch.
2. Reconcile current Web against prototype cleanup head by route family/capability.
3. Reconcile the divergent prototype visual-system commit, resolving ProviderMap/shared CSS/navigation/test overlap deliberately.
4. Integrate only verified stronger work into the Web branch in coherent batches.
5. Run focused tests after each batch and full build/route-family checks at checkpoints.
6. Verify auth, Request Service, resident/professional/partner/community flows, Network, communications, AI Team, HQ, routing/redirects, and protected boundaries.
7. Verify public and signed-in presentation on desktop and mobile.
8. Run required exact-head certification.
9. Owner walkthrough on approved HomeLead Connect domains.
10. Promote only the exact certified owner-approved SHA.

## Cleanup rule

No repository, branch, folder, Supabase project, deployment, key, or historical artifact is deleted merely because its name looks old or duplicated. Runtime dependency is determined by technical fingerprints and verified references first.


## Verified reconciliation checkpoint 1

Direct GitHub comparison after prototype access was restored:

- Prototype cleanup head is exactly `9056dc10578f50a3821c1ba60a3fe4aab2cad965`.
- Prototype visual-system head is exactly `e4a33ad54aa2a8c293e97cfd14d6e05a883e9540`.
- The branches diverge by one commit each from merge base `32200a8e0dc4b7d6b95b0b033b797c62d29bbdf2`.
- Current Web production already contains the ProviderMap finite selected-state class and CSS while retaining runtime/data-derived coordinate and accent values.
- Current Web ProviderMap and both prototype heads are semantically aligned for the inspected map behavior; the prototype file differs only in non-substantive file text/formatting at this checkpoint.
- Prototype `PublicSiteNav.tsx` is superseded by current Web navigation. The prototype still contains the visible Menu/hamburger cue and older logo asset, while current Web contains the owner-approved logo-only menu trigger and current master-logo derivative.
- Current Web `package.json` remains authority. It already carries the stronger production test/build suite, including public logo-menu coverage and static-inline visual guards. Prototype package changes will not replace it wholesale.
- The prototype route-family audit remains a candidate to adapt as an additional guard rather than replacing current launch verification.

Updated dispositions:

| Area | Verified disposition |
| --- | --- |
| PublicSiteNav prototype implementation | Superseded — keep current Web |
| ProviderMap component behavior | Keep Current — required selected-state cleanup is already represented in Web |
| ProviderMap selected-state CSS | Keep Current — present in current shared/Web style authorities |
| Web package/build/test authority | Keep Current |
| Prototype route-family audit script | Bring Forward/adapt after compatibility check |
| Large prototype CSS authorities | Needs Technical Verification selector-by-selector; no wholesale copy |
