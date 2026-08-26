# HomeLead Connect — Live Post-Production Launch Map

Date: 2026-08-25
Release line: `postlaunch/production-integration-20260825`
Target: `main` (frozen until explicit release approval)
Unified release PR: #198
Production database: Supabase `homeconnect` (`cguhtshclyybivvdnpig`)
Hosting: Cloudflare Pages

## Release-state vocabulary

- **VERIFIED** — exercised with direct production or controlled rollback-only evidence.
- **WIRED** — runtime path exists and is secured, but external/provider transaction proof is still missing.
- **MANUAL GATE** — requires a real human device/account control that current connected tooling cannot safely perform.
- **BLOCKED** — a defect or missing dependency prevents release.

## Live system wiring

| Domain | User surface | Runtime/data path | Production evidence | State | Release gate |
|---|---|---|---|---|---|
| Auth + tenancy | Login, workspace shell, portals | Supabase Auth → `workspace_members` / portal links → RLS | Fail-closed account access and role contracts in launch suite; production tenancy hardening applied | VERIFIED | Supabase leaked-password protection remains MANUAL |
| Leads | `/leads`, intake, Lead Vacuum | canonical causal ingest → `public.leads` | single-writer, workspace RLS, lifecycle sync and attributed intake enforced | VERIFIED | none beyond final exact-deploy QA |
| Jobs / appointments | `/jobs`, `/calendar` | jobs + appointments + assignments | golden workflow lifecycle and scheduling contracts covered | VERIFIED | external Google Calendar transaction still separate |
| Google Calendar | `/calendar` sync action | JWT browser session → `google-calendar-sync` Edge Function → Google API → `calendar_event_mappings` | protected adapter and persisted mapping state wired | WIRED | real signed-user sync must create a production mapping |
| Communications | Messages / manual communications / call center | compliance queue → configured provider adapter → transmission ledger | provider-neutral queue and manual handoff behavior verified | VERIFIED for queue | provider delivery proof handled below |
| Resend email | communications provider | `send-communication` → Resend → `resend-webhook` → provider-event ledger | connected provider + sent transmission evidence exists | WIRED | signed Resend callback required |
| Google Voice | call/SMS manual handoff | HLC canonical call/outcome flow → device/carrier handoff | intentionally manual, no fake browser telephony | VERIFIED as manual workflow | physical carrier behavior is user/device dependent |
| Billing / Finance | `/settings/billing` | HLC plan state + `workspace_plan_status` + Stripe Checkout/Portal | dedicated provider-backed billing workspace, no second billing store | VERIFIED | controlled Stripe end-to-end billing event remains provider evidence where required |
| Business + Growth | `/analytics` | KPI RPCs + `hlc_growth_summary` aggregate RPC | production #116; owner allowed, technician rejected; no PII returned | VERIFIED | attribution quality depends on real source capture |
| Provider Network | `/network`, `/providers`, `/profiles`, `/network/saved` | contractors + services + service areas + availability + saved providers | filterable directory; declared/undeclared availability kept distinct | VERIFIED | real provider availability remains data-entry dependent |
| Provider Map | `/map`, `/network/map` | canonical provider coordinates + confidence metadata | coordinate authority and confidence contracts enforced | VERIFIED | human map visual QA |
| Community core | `/community-hub`, reviews, referrals, moderation | existing Community records and workspace RLS | persisted records and moderation/referral/review contracts | VERIFIED | human UX QA |
| Community participation | discussions / groups / events | `LaunchSurfaceRouter` → `CommunityParticipation` → replies / memberships / attendance | production #117; same-workspace technician positive rollback test; authenticated non-member blocked | VERIFIED | exact-head CI + visual QA |
| Documents | `/documents`, `/documents/scan` | private document storage + document metadata | upload/share/open/storage boundaries live | VERIFIED for document library | OCR remains separate |
| OCR / extraction | explicit processing only | queued processing foundation → protected processor → proposed extraction fields → human review | test-project schema/RLS/RPC/processor foundation proven | WIRED IN TEST ONLY | stored-file provider canary, then explicit production promotion decision |
| AI agents | contextual dock + `/hq` `/operations` `/customer-experience` | JWT edge runtime → OpenAI Responses/voice + shared page knowledge | advisory role boundaries, multilingual/voice contracts, no widened write authority | VERIFIED for advisory operation | state-changing AI remains confirmation/audit gated |
| Automations | `/automations` | deterministic `run_hlc_automation` + persisted jobs/audit | management-only execution boundary + scheduled monitoring proven | VERIFIED | no autonomous customer-impacting writes without approved capability |
| Notifications | `/notifications`, device alerts | canonical notification records + web push | recipient-scoped read/update and push contracts proven | VERIFIED | physical push UX QA |
| Public web / PWA | public routes + install metadata | Cloudflare Pages + no-React public root + canonical branding | performance/brand regression guards and SPA route delivery | VERIFIED by CI | current exact-head Cloudflare preview + human iPhone/Mac QA |

## Release execution order

1. Exact-head Launch Candidate must pass.
2. Exact-head Rendered Quality Gate must pass.
3. Confirm exact-head Cloudflare preview / deployment evidence.
4. Re-query production integration evidence: Calendar mapping, Resend callback, Community participation, Growth RPC, security hardening.
5. Run external canaries only when a safe signed-user/provider target exists; never fabricate evidence.
6. Complete iPhone live QA and Mac/desktop live QA on the exact preview.
7. Update PR #198 to this exact head and evidence state.
8. Keep PR draft/unmerged until explicit production release approval.
9. Merge to `main` only after release approval and no BLOCKED items.
10. After merge, verify exact production SHA, critical deep links, auth boot, logs, provider callbacks, and no new regressions.

## Hard stop rules

- CI success alone does not convert WIRED external integrations to VERIFIED.
- Do not claim OCR production-ready until the stored-file canary and explicit production migration decision are complete.
- Do not expose provider secrets or service-role credentials to browser code.
- Do not infer provider availability, delivery, calendar sync, payment, or AI action success without persisted evidence.
- Do not merge PR #198 into `main` without explicit release approval.
