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


## Verified reconciliation checkpoint 2 — prototype cleanup versus current Web

Repository-tree and source-level comparison confirms that current Web has already advanced beyond the preserved prototype cleanup in the major static-style areas.

- Current Web now enforces static-style cleanup repository-wide by parsing every TSX source file. Only explicitly reviewed runtime properties are allowed: calculated widths/progress, agent/lead accents, ProviderMap coordinates/accent, and other genuinely data-derived values.
- The prototype cleanup test guarded a fixed list of previously cleaned files. That work remains valuable historical evidence, but the current Web guard is broader and stronger because newly added TSX files are inspected automatically.
- Current Web also explicitly prevents PublicSiteNav from reintroducing runtime style injection through `setImportant`, dynamically-created `<style>` elements, or the retired owner visual style block.
- Prototype communications/mobile/product tests still reference retired presentation layers such as `mobile-release-fix.css`, `final-release-guard.css`, `premium-theme.css`, `premium-effects.css`, and the old manual-communications soft-launch authority. Current Web intentionally tests that several of those retired layers stay disconnected.
- Prototype `index.html` still loads older runtime/public CSS authorities and the older dark theme/status-bar treatment. Current Web uses the newer structural safeguard and current light public authority. Prototype launch markup is therefore not a bring-forward candidate.
- Prototype `package.json` adds the static-style guard to acceptance while current Web already includes that guard in the visual suite together with public entry classification and logo-menu coverage. Keep the current Web test/build authority.
- The prototype visual-route-family audit reads a documentation JSON inventory; current Web has already adapted the audit to import the executable route-family inventory module. Keep the current Web implementation.
- The four prototype legacy scaffold files remain useful as a historical removal record, but no prototype implementation should be restored merely to reproduce that older test.

Updated dispositions:

| Area | Verified disposition |
| --- | --- |
| Prototype fixed-list inline-style cleanup test | Superseded by stronger repository-wide Web guard |
| Prototype cleaned TSX presentation extractions | Keep Current Web; cleanup objective already enforced globally |
| Prototype communications tests tied to retired soft-launch CSS | Superseded |
| Prototype mobile tests tied to final-release/mobile-release CSS | Superseded |
| Prototype product tests tied to retired premium paint | Superseded |
| Prototype index.html runtime paint stack | Superseded — do not restore |
| Prototype package scripts | Keep Current Web |
| Prototype route-family audit | Already adapted in Web; keep current implementation |
| Prototype continuity and sprint documentation | Preserve as historical evidence, not runtime authority |

This checkpoint means the preserved prototype branches are not being discarded; their intended cleanup outcomes have been compared against the current production-derived Web authority. Where current Web already contains a broader or newer implementation, the prototype copy is marked superseded instead of being copied back and risking regression.


## Verified reconciliation checkpoint 3 — preserved capabilities not yet present in Web

The prototype history was also checked for useful capability work that was not merely visual cleanup.

### Multilingual spoken agent addressing — integrated

Prototype commit `b47d1dde4f6711b2209da7c73fbf4c420dde0094` adds continuous/interim speech recognition and spoken-name handling for Kendrell, Dion, and Diamond.

Before that prototype commit, both `AgentChatPanel.tsx` and `multilingualAgentContract.test.ts` have blob hashes exactly identical to current Web production. This establishes a clean lineage: current Web was still at the direct pre-feature version of those two files.

The exact post-feature file contents were therefore brought forward to this reconciliation branch without replacing unrelated Web work.

Integrated branch commits:
- `3ede568fb285d6df44f4f56e9edeadcbb89f110b` — multilingual spoken agent addressing implementation.
- `4c72b938c266fd7b60fc4167671ee87ffc727009` — matching multilingual contract coverage.

The existing Web acceptance command already includes `src/routes/multilingualAgentContract.test.ts`, so no package-script replacement is required.

### Route-family authority — reconciled as organization evidence

Prototype route-family authority lists exactly 125 unique routes. Current Web `AppRouter.tsx` also declares exactly 125 unique routes, and set comparison shows zero routes present on only one side.

Prototype route-family metadata remains useful for the HCX product map (public, resident/family, professional, partner, shared signed-in, internal workspace; plus owner/focus descriptions). Current Web's executable visual inventory remains the stronger runtime audit because it derives route families from the current router rather than relying on a duplicated static route list.

Disposition: preserve the prototype taxonomy as reconciliation/product-organization evidence; keep the current Web dynamic route audit as code authority.

### Agent portrait identity lock — preserved, not blindly copied

Prototype commit `b0434235d1c45d92ce8a03cbcf6ed49b9dc956f9` added locked source portraits for Kendrell, Dion, and Diamond plus stricter asset-registry/hash tests. Current Web does not contain the same identity-lock package, and its current Kendrell portrait hash differs from the prototype's locked hash.

Owner authorization now covers bringing these locked identity assets forward on the isolated reconciliation branch. The prototype-locked Kendrell portrait, all three source identity portraits, asset-registry rules, and hash guards are integrated here. They still require rendered visual verification before any production promotion.

Updated dispositions:

| Area | Verified disposition |
| --- | --- |
| Multilingual spoken agent addressing | Bring Forward — integrated on reconciliation branch |
| Multilingual contract test | Bring Forward — integrated on reconciliation branch |
| Prototype 125-route taxonomy | Preserve as organization evidence; route set verified equal to Web |
| Current Web dynamic route audit | Keep Current |
| Prototype locked agent source portraits | Bring Forward — integrated under owner authorization; visual verification required before promotion |
| Prototype agent identity hash tests | Bring Forward — integrated with the locked portrait source set |


## Verified reconciliation checkpoint 2

The prototype cleanup and visual-system branches have now been compared directly against current Web production rather than treated as whole-branch candidates.

- The current Web static-inline-style guard is stronger than the prototype cleanup guard because it scans repository-wide TSX and permits only reviewed runtime-derived properties. Keep the Web guard as authority.
- The prototype's useful legacy-removal assertion is narrow and can be adapted independently if the referenced retired scaffold files are confirmed absent in the Web candidate.
- Prototype mobile-agent tests depend on retired `mobile-release-fix.css` and `final-release-guard.css` presentation. Current Web instead tests the newer Mobile A+ structural/device corrections. Keep current Web mobile-agent behavior and test authority; do not revive retired release paint.
- Prototype communications tests likewise depend on a retired soft-launch communications stylesheet. Current Web explicitly verifies that retired stylesheet is disconnected. Keep current Web communications authority.
- Prototype product-experience tests enforce global forced centering and older workspace/agent presentation. Current Web intentionally uses responsive containment, the current desktop workspace shell, and no permanent AI rail. The older prototype assertions are superseded.
- Prototype `index.html` points at older runtime/front-door stylesheet authorities and an older homepage hero asset. Current Web has the newer structural safeguard classification, current theme metadata, and current homepage hero authority. Keep current Web entry point.
- Prototype `package.json` adds the static-inline guard to acceptance while current Web already runs that guard in the visual suite together with public-entry and logo-menu contracts. Keep current Web package/test command authority.
- Prototype `board-login-authority-20260912.css` and `runtime-physical-authority-20260907.css` contain older auth presentation paint. Current Web deliberately leaves auth presentation to the current public visual family. Do not restore the older auth paint wholesale.
- The visual route-family audit exists in both histories. Current Web's version reads the current Web route inventory module, so it is already adapted to the authoritative repository and no prototype copy is needed.

Updated dispositions:

| Area | Verified disposition |
| --- | --- |
| Repository-wide static-inline visual guard | Keep Current Web |
| Prototype retired-scaffold absence guard | Bring Forward only as a narrow assertion after path verification |
| Prototype mobile agent release-paint tests | Superseded |
| Prototype communications soft-launch paint tests | Superseded |
| Prototype forced-global-centering/product paint tests | Superseded |
| Prototype index.html launch paint | Superseded |
| Prototype package/test command authority | Superseded |
| Prototype auth/runtime physical paint | Superseded; preserve current Web structural compatibility |
| Visual route-family audit | Keep Current Web; already adapted |
| Prototype runtime/data behavior | No wholesale import; inspect only remaining capability-specific deltas |

### Integration rule after checkpoint 2

The reconciliation has crossed an important boundary: broad prototype visual authorities are not to be copied into Web. Remaining prototype work is now evaluated only for unique capability or behavior that current Web does not already contain. This prevents older navigation, retired paint layers, forced global centering, and obsolete mobile-agent geometry from returning while still allowing genuinely stronger individual capabilities to be recovered.


## Verified reconciliation checkpoint 3 — route-family and mobile test authority

Compared current Web against prototype visual-system checkpoint `e4a33ad54aa2a8c293e97cfd14d6e05a883e9540`.

- **No-static-inline-style enforcement — Keep Current Web.** Prototype audits a fixed list of cleaned files. Web now walks repository-wide TSX and permits only reviewed runtime-calculated properties, so it is broader and stronger.
- **Product experience tests — Keep Current Web.** Prototype assertions depend on retired premium/release paint and forced global centering. Web explicitly verifies responsive containment without forced global centering, the current desktop workspace shell, and retirement of the permanent AI rail/release CSS.
- **Mobile agent dock tests — Keep Current Web.** Prototype expects the older 54px/release-guard implementation. Web verifies the current 60px structural target and viewport-owned mobile sheet without retired release-theme CSS.
- **Communications tests — Keep Current Web.** Prototype expects retired soft-launch manual-communications paint. Web explicitly verifies that retired stylesheet is disconnected while preserving selection feedback and the current advanced-details treatment.
- **Visual route-family audit — Keep Current Web implementation.** Prototype reads a static JSON inventory. Web builds the audit inventory from the current `visual-route-inventory.mjs`, reducing drift between the executable route inventory and audit.

### Result

No route-test or audit file from the preserved prototype should replace the current Web versions. Prototype tests remain useful historical evidence, but several encode presentation contracts that current Web intentionally retired.


## Verified reconciliation checkpoint 4 — CSS and imagery authority

Compared the large prototype visual authorities selector-by-selector instead of copying either stylesheet wholesale.

- **Public visual family — Keep Current Web as authority.** The prototype stylesheet contains older public-menu cue/mobile sign-in/team-invite presentation contracts. Current Web contains the newer logo-trigger menu, workspace-invite treatment, current public/footer authority, current pathway hero structure, destination-color rules, and current Request Service presentation.
- Several prototype-only selector names are still represented by current page markup but are intentionally styled by later Web authorities (for example Request Service/pathway classes). Their absence from the current `public-visual-family-20260919.css` alone is not evidence of missing functionality.
- **Network/map workspace — Keep Current layered Web authority.** Prototype and Web expose the same network-map class family, but prototype bakes more paint directly into `network-map-application-workspace.css`. Current Web distributes the later visual/mobile state across `map-lead-identity-pass.css`, `mobile-a-plus-sprint-3-network.css`, `hlc-unified-screen-archetypes.css`, and shared visual primitives. Current Web already owns selected-provider state and map-canvas treatment.
- **Imagery — no blind restoration.** Image paths or CSS image declarations from prototype are not copied merely because they exist there. Each visible image must be traced to current page ownership and checked against the current unique-image/page-title rules before replacement.

### Result

No large prototype CSS file is eligible for wholesale replacement. Any remaining visual delta must be proven at the selector/page level and verified in rendered desktop/mobile evidence.


## Verified reconciliation checkpoint 5 — remaining cleanup surfaces

Compared the remaining Stage-2 cleanup components against current Web.

| Surface | Disposition | Verified result |
| --- | --- | --- |
| Workflow | Keep Current | Workflow content, stage routes, counts and completion rule align; differences are class ownership/presentation only. |
| Workspace Activity | Keep Current | Activity loading/filter/history behavior aligns; differences are class ownership/presentation only. |
| Launch Surface | Keep Current | Data and action behavior align. Web contains later presentation/status class corrections. |
| Community Discover | Keep Current | Search, connection request, accepted-message route and service-transition copy align; differences are presentation classes. |
| Reserved Capability | Keep Current | Capability lookup and dashboard/workflow/automation links align; differences are presentation classes. |
| 404 | Keep Current | Same not-found behavior; current Web uses the later shared UI class. |

### Result

The Stage-2 component cleanup does not contain missing business behavior for these surfaces. Copying these prototype files would primarily restore older component-specific class systems, so they remain preserved evidence rather than integration payload.


## Verified reconciliation checkpoint 6 — rendered evidence and page image ownership

The exact head at the start of this checkpoint (`fc8f2f0fdd74712de6d78ab613036a622579f871`) passed all five required workflows: Launch Candidate, Blind Visual Certification, Rendered Quality Gate, Front Door Visual Review, and Authenticated Visual Proof. The downloaded evidence includes desktop/mobile front-door captures and the broad authenticated route sweep.

The image-ownership trace then found two real CSS mapping defects that the registry-only uniqueness test could not see:

- Contact was reusing the About photograph instead of its dedicated Contact asset.
- Request Service was reusing the Residents photograph while displaying a Harrisburg skyline attribution that did not describe the rendered file.

The reconciliation branch now maps About, Contact, Residents, and Request Service to separate page-owned assets and adds a source-level contract preventing those two regressions. The stale skyline attribution was removed because the skyline file was not actually being rendered.

The owner-approved long-term Request Service visual remains the verified Harrisburg river-to-city/Capitol photograph. The intended source has been re-verified as J. Passepartout's “Harrisburg PA skyline,” showing the Susquehanna River and Pennsylvania State Capitol under CC BY-SA 4.0. Until that licensed binary is deliberately added to the repository with attribution, the branch uses the existing request-specific local photograph rather than falsely crediting or reusing another page's image.

Because the image corrections advance the exact head, certification must be evaluated again on the final post-correction SHA before any merge decision.


### Manual rendered-evidence findings

The downloaded front-door evidence exposed two presentation defects that automated PASS status did not make acceptable by itself:

- Desktop Home rendered the tagline and membership price in a dark inherited color over the dark hero treatment. The homepage authority now explicitly keeps both supporting lines light/readable and has a regression contract.
- Desktop About rendered the long hero heading at the generic public maximum, creating an oversized multi-line composition. The current public visual authority now gives About a narrower owner-specific scale while retaining the existing mobile-safe clamp, with a regression contract.

This confirms the sprint rule that workflow success is necessary but not sufficient: rendered evidence is still manually inspected for owner-facing composition.
