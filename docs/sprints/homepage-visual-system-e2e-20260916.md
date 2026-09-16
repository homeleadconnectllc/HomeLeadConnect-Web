# HomeLead Connect — Homepage Visual System E2E Sprint

Date: 2026-09-16

## Authority

- Production baseline: `14163f7af2ba327a8dfd5b77cbe436acb5fd75de`
- Homepage is the public visual design authority.
- The approved circular badge is the sole logo authority.
- Preserve application behavior, data access, authentication, billing, routing, and workflows.
- A photograph or illustrative page image may appear on only one page and must match that page's title, audience, and purpose.
- Shared logos and interface icons are exempt from the page-image uniqueness rule.
- Four Pathways assets remain governed by their separately approved image authority.

## Milestones

1. **Complete** — establish exact authority.
2. **Complete** — build the route and page-state inventory.
3. **Complete** — audit visual assets and duplicate photography.
4. **Complete** — assign unique page-matched imagery.
5. **Complete** — standardize the shared shell.
6. **Complete** — align public audience pages.
7. **Complete** — align conversion and account flows.
8. **Complete** — align legal and support pages.
9. **Local gates complete; physical browser gate blocked** — certify one exact candidate SHA.
10. **Not promoted** — production promotion requires the unresolved browser gate and any repository-required exact-SHA authorization.

## Stop conditions

- Failed safety or certification gate
- Inaccessible required system or credentials
- Uncertain production authority
- Destructive database change
- Missing legally usable imagery
- Conflict with protected functionality

## Verified baseline findings

- `origin/main` and the production deployment source resolve to `14163f7af2ba327a8dfd5b77cbe436acb5fd75de`.
- The application router exposes 125 explicit route patterns, including the catch-all route.
- Public surfaces include the homepage, 23 informational/intake/legal routes, four account-access routes, and two invitation routes.
- Protected surfaces include resident, professional, and partner portals plus the internal workspace, Community, Network, operations, messaging, documents, analytics, billing, AI-team, and settings families.
- The baseline production build passes, with warnings for stale `/hlc-frontdoor-resident-hero-final.jpg` and `/hlc-logo-public.webp` URLs.
- Baseline interior pages reused Four Pathways photography across About, Residents, Professionals, Partners, Community, Contact, How It Works, LeadScope, Services, Pricing, Trust, Demo, and Professional Application.
- The first browser-verification attempt is blocked in this environment because the required Chrome runtime is absent and its installer cannot validate the remote certificate. Browser certification remains required before promotion.

## Image authority implemented in this sprint

- Route-specific imagery is registered in `src/config/publicPageImagery.ts`.
- All new people-centered photography depicts Black residents, families, professionals, owners, coordinators, and community members.
- Assets are local 1120 × 840 WebP files with unique names and unique SHA-256 content.
- `npm run test:visual` enforces unique paths, unique hashes, existing files, descriptive Black-centered alt text, and exclusion of Four Pathways images from interior page components.
- The 23 generated editorial photographs are sprint-specific assets rather than third-party stock downloads, removing external source-rights ambiguity.
- All 23 files are 1120 × 840 WebP assets. Their encoded sizes range from 45,752 to 124,794 bytes.
- Generic authenticated route banners use abstract graphics, and portal stories use role-specific interface illustrations rather than reusing public photography.
- The memorial routes retain their dedicated memorial presentation; no likeness was invented to satisfy a decorative-image quota.

## Page-image replacement matrix

| Route | Image story | Asset |
|---|---|---|
| `/about` | Connected home help | `page-about-connected-home-help-20260916.webp` |
| `/homeowners` | Resident request help | `page-residents-request-help-20260916.webp` |
| `/contractors` | Explicit provider access | `page-contractors-explicit-access-20260916.webp` |
| `/how-it-works` | Connected service journey | `page-how-service-journey-20260916.webp` |
| `/leadscope` | Resident-led measurements | `page-leadscope-resident-measurements-20260916.webp` |
| `/community` | Connected Black neighbors | `page-community-connected-neighbors-20260916.webp` |
| `/services` | Coordinated service journey | `page-services-connected-journey-20260916.webp` |
| `/pricing` | Business workspace planning | `page-pricing-business-workspace-20260916.webp` |
| `/trust` | Clear participant roles | `page-trust-clear-roles-20260916.webp` |
| `/professionals` | Black provider presence | `page-professionals-provider-presence-20260916.webp` |
| `/partners` | Referral relationships | `page-partners-referral-relationships-20260916.webp` |
| `/demo` | Guided journey walkthrough | `page-demo-journey-walkthrough-20260916.webp` |
| `/professional-application` | Professional application | `page-professional-application-20260916.webp` |
| `/contact` | Support conversation | `page-contact-how-can-we-help-20260916.webp` |
| `/request-service` | Resident home need | `page-request-service-home-needs-20260916.webp` |
| `/login` | Welcome back | `page-login-welcome-back-20260916.webp` |
| `/register` | Company workspace creation | `page-register-company-workspace-20260916.webp` |
| `/forgot-password` | Calm account recovery | `page-forgot-password-recovery-20260916.webp` |
| `/reset-password` | Secure credential reset | `page-reset-password-new-password-20260916.webp` |
| `/accessibility` | Adaptive devices and inputs | `page-accessibility-devices-inputs-20260916.webp` |
| `/privacy` | Privacy choices built in | `page-privacy-built-in-20260916.webp` |
| `/terms` | Clear agreement review | `page-terms-clear-agreement-20260916.webp` |
| `/platform-disclosure` | Distinct platform roles | `page-platform-distinct-roles-20260916.webp` |

The exhaustive 125-pattern inventory and required states are recorded in `docs/sprints/route-state-register-20260916.md`.

## Local certification evidence

- `npm run verify:launch` — **pass** on 2026-09-16.
- ESLint — **pass**.
- Visual uniqueness/authority tests — **2/2 pass**.
- Complete repository acceptance suite — **pass**.
- Static launch audit — **pass**.
- TypeScript and production Vite build — **pass**.
- Missing baseline logo and auth-background asset warnings — **repaired**.
- Physical mobile/desktop browser capture — **blocked** because no Chrome runtime is installed and the approved installer cannot validate the remote certificate.
