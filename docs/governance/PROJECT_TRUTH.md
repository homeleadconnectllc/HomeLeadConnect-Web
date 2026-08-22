# HomeLead Connect — Project Truth

## Company
- HomeLead Connect LLC is the master company and brand.
- Founder & Builder: Antoine Washington.
- Public front door: HomeLeadConnect.org.
- Public tagline: **Smarter Connections. Better Service Experiences.**

## Canonical Platform
- CRM / Operations
- Ken OS — platform / orchestration layer
- Kendrell — Executive Command AI
- Dion — Operations & BI AI
- Diamond — Customer Experience & Community AI

## Governance
HomeLead Connect is the master brand. The three AI identities are specialized platform capabilities, not competing brands. Ken OS is distinct from Kendrell.

## Canonical Department Accents
- Kendrell — Amber `#F59E0B`
- Dion — Indigo `#6366F1`
- Diamond — Emerald `#10B981`

Department accents identify responsibility; HomeLead branding identifies ownership.

## Verified Application Repository
- Repository: `homeleadconnectllc/HomeLeadConnect-Web`
- Default branch: `main`
- Application package name: `hlc-web`
- Application architecture: Vite + React + React Router + TypeScript.

### Verified package versions — 2026-08-22
- React `^19.2.7`
- React DOM `^19.2.7`
- TypeScript `~6.0.2`
- Vite `^8.1.1`
- React Router DOM `^7.18.2`
- Supabase JS `^2.110.0`
- TanStack React Query `^5.101.2`
- React Hook Form `^7.80.0`
- Zod `^4.4.3`
- Framer Motion `^12.42.2`

## Verified Production Architecture — 2026-08-22
- Authentication/data platform: Supabase Auth + Postgres + RLS.
- Workspace tenancy uses `workspace_id`.
- Browser clients must not gain direct mutation paths to `public.leads`.
- Cloudflare Pages is the canonical production and preview application host.
- Authenticated application hostname: `app.homeleadconnect.org`.
- The hosted application is pinned to Supabase project `cguhtshclyybivvdnpig` in `src/lib/supabase.ts`.
- Production API URL: `https://cguhtshclyybivvdnpig.supabase.co`.

## Verified AI Product Routing
- Kendrell → `/hq`
- Dion → `/operations`
- Diamond → `/customer-experience`

The implementation handoff boundaries are aligned with governance:
- executive command and escalated judgment → Kendrell
- operations and business intelligence → Dion
- customer experience and community → Diamond

Canonical role labels and department accent tokens were aligned in PR #126 and protected with regression tests.

## Verification Pipeline
`npm run verify:launch` is the canonical launch verification command and runs:
1. lint
2. acceptance tests
3. static launch audit
4. production build

The repository also runs a rendered quality gate for mobile and desktop presentation.

## Locked Brand Assets
- `public/brand/HLC_Primary_Full_Logo_LOCKED.png` when present in production asset paths
- Approved circular HLC seal/emblem assets only
- AI-generated approximations of official HLC artwork are not authoritative

## Locked Persona Assets
- Kendrell canonical portrait
- Dion canonical portrait
- Diamond canonical portrait

Supporting visual variants do not replace canonical persona identity without explicit approval.

## Public / Private Boundary
Public materials remain benefit-led. Proprietary workflows, internal AI implementation, database design, infrastructure, orchestration, and competitive implementation details remain private unless explicitly approved for disclosure.

## Verified Public-Site Correction Queue — 2026-08-22
- `homeleadconnectprivacy.carrd.co` currently renders Request a Demo content instead of the Privacy Policy body. This is a launch-blocking public legal mismatch tracked by issue #125.
- The main front-door CTA hierarchy requires reconciliation so `Explore HomeLead Connect` and `Request Demo` do not duplicate the same conversion destination.
- Carrd remains external to this repository; public-site corrections must be verified on the live properties after they are republished.

## Superseded Definitions
- Dion as primarily customer support — superseded.
- Diamond as primarily an innovation/design division — superseded.

## Change Control
Normal presentation evolution does not alter governance. AI role reassignment, master-brand changes, canonical portrait replacement, architecture restructuring, official-logo replacement, or major identity changes require explicit approval.

## Verification Rule
Historical runtime, repository, deployment, database, and environment claims are not automatically current truth. Re-verify them against the current production source before promoting them here.
