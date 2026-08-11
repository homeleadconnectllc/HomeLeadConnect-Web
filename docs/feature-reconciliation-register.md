# HLC feature reconciliation register

This register prevents feature loss and duplicate architecture. It records
placement and evidence; it does not convert unverified work into PASS.

| Feature family | Canonical owner/location | Priority | Current classification | Action/evidence |
|---|---|---:|---|---|
| Public website | React public routes | P0 | CANONICAL / UNPROVEN production | Truthful Home, audience, workflow, intake, LeadScope, Community, and legal routes; final production crawl required. |
| Public intake | `public_forms` → canonical causal lead ingestion | P0 | CANONICAL / browser-unproven | Server resolves workspace; request ID is idempotent; backend transaction previously verified. |
| Auth/recovery | Supabase Auth + `/login`, `/register`, recovery routes | P0 | CANONICAL / production-config pending | Password length 8; Turnstile token support; leaked-password protection and production redirects require dashboard configuration. |
| Profiles/settings | `profiles`, `business_profile`, workspace RPC | P0 | CANONICAL / browser-unproven | Existing fields only; membership-validating workspace switch. |
| CRM/leads | `leads` and existing CRM APIs/pages | P0 | CANONICAL | Preserve current lead model; no website/call-center duplicate lead table. |
| Follow-ups/tasks | `follow_ups` | P0 | CANONICAL / limited contract | Create, due date, lead relationship, complete/history. Do not create a second task lifecycle. |
| LeadScope | `estimates`, `estimate_lines`, deterministic calculator | P0 | CANONICAL | User-facing name remains LeadScope; accepted estimate converts through canonical RPC. |
| Jobs/contractors | `crm_jobs`, `contractors` | P0 | CANONICAL / final browser acceptance pending | Existing deterministic records and workspace-scoped creation/filtering. |
| Assignments/scheduling | `job_assignments`, `appointments` | P0 | CANONICAL / final browser acceptance pending | Locked transitions, history, accepted-assignment gate, atomic reschedule. |
| Homeowner portal | invitation/link tables and portal RPC/page | P0 | BUILT / deployment and browser unproven | Explicit `auth.uid()` link; no authorization by email equality. |
| Contractor portal | contractor link table and portal RPC/page | P0 | BUILT / deployment and browser unproven | Explicit multi-workspace links; direct attributed accept/reject. |
| Messenger | conversations, participants, messages | P0 | BUILT / deployment and browser unproven | Internal persisted channel with participant RLS and idempotent posts. |
| SMS/calling | communication transmissions + Twilio functions | P0 | BUILT foundation / EXTERNAL BLOCKER | Compliance-linked queue, signed callbacks, delivery/failure, STOP suppression; Twilio verification/secrets required. |
| Email | communication transmission channel | P0 | PRESERVED / EXTERNAL BLOCKER | Honest `Email Setup Required`; provider/sender/domain not selected. |
| Voice notes | private bucket + `voice_notes` metadata | P0 | BUILT foundation / browser-unproven | Deliberate recording metadata, participant policy, 25 MiB limit; recording/playback UI acceptance remains. |
| Communication compliance | consent, suppression, DNC, provider, checks | P0 | BUILT / counsel and production-data dependency | Deterministic ALLOW/BLOCK/REVIEW; AI cannot override. |
| Notifications | `notifications` and explicit event triggers | P0 | BUILT / feature-gated | Real offer, appointment, and message recipients only; no fake badges. |
| SaaS billing | Stripe functions + subscription/entitlement tables | P0 | BUILT foundation / EXTERNAL BLOCKER | `$99/month`, 14 days, consent evidence, webhook idempotency, grace/cancel state; Price/secrets/deployment required. |
| Legal | public legal routes + implementation docs | P0 | DRAFT / ATTORNEY REVIEW REQUIRED | Platform/not-contractor, privacy, subscription disclosures; never represented as approved. |
| AI placement/capabilities | HLC AI platform | P0 only if exposed | PRESERVED / not exposed canonically | No global injection. Existing untracked AI work must be reconciled without overwriting locked identities. |
| Documents/media/e-sign | future canonical Documents domain | P1 | PRESERVE | One private metadata/storage/sharing/audit system; LeadScope and communications consume it later. |
| Community/directory | Community + directory profile/visibility | P1 | PRESERVE / honest public route | No auto-publication, ratings, rankings, or verified claims. |
| Map | geographic view over canonical records | P1 | PRESERVE | No invented geocoding, proximity, ETA, service radius, or dispatch. |
| Automatic Match | marketplace matching | Future | PRESERVE / UNDEFINED ranking | Current exact filtering is not Automatic Match. |
| Renter/mover/subcontractor | participant/profile family | Future | PRESERVE | Reuse CRM/job/comms primitives; role-specific authority remains undefined. |
| Job/homeowner money | separate money domain | Future | UNDEFINED | Never merge with SaaS subscription billing. |
| Production | Vite build + Vercel-compatible SPA config | P0 | PREPARED / EXTERNAL BLOCKER | Canonical host mapping, secrets, domain, migrations/functions, monitoring, recovery, deploy authorization, and acceptance remain. |

Legacy Lovable, Base44, KEN, GitHub branches, and historical deployments are
REFERENCE sources only unless behavior is deliberately ported through the
canonical security and tenancy model. Unsafe email-equality authorization, old
plans/economics, fake ratings, and duplicate CRM/scheduling systems are RETIRED.
