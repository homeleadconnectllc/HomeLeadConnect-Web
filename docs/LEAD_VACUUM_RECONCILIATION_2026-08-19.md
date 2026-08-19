# Lead Vacuum reconciliation — 2026-08-19

## Certification purpose

This document records the verified lead-intake architecture behind the HomeLead Connect "Lead Vacuum" concept without inventing undocumented source adapters or creating a second lead system.

During launch certification, "Lead Vacuum" is treated as the intake/capture layer that feeds the canonical CRM:

`source intake -> normalize/dedupe -> canonical lead -> pipeline -> lead profile -> communications/follow-ups/estimates/jobs`

It is not a separate lead database, parallel pipeline, or authority layer.

## Canonical source of truth

`public.leads` is the canonical CRM lead table.

Related evidence tables are:

- `causal.leads_state` — append/de-duplicated causal ingestion state evidence.
- `public.lead_activities` — lead activity evidence, including accepted public intake.

Production still contains an empty legacy `public.leads_new` table. It is not the canonical CRM authority and must not receive normal authenticated browser writes or be restored as a parallel lead pipeline.

## Verified active intake paths

### 1. Public service request

The public `/request-service` form calls `src/api/publicIntake.ts`, which invokes `public.submit_public_service_request(...)` with a generated request UUID and honeypot field.

The live production RPC:

- validates the enabled public form;
- applies the public intake guard/rate-limit/honeypot boundary;
- validates contact/project fields;
- checks the request UUID for idempotent replay;
- delegates lead creation/upsert to the private causal ingestion implementation;
- records `request_id` on the canonical lead;
- triggers a `public_intake` activity record after accepted intake.

The public form does not directly insert a browser row into `public.leads`.

### 2. Authenticated internal Add Lead

The signed-in Leads workspace calls `public.create_workspace_lead(...)`.

The live production RPC:

- requires an authenticated user;
- derives the active workspace from the profile;
- verifies `workspace_members` membership and an internal owner/manager/technician role;
- validates name, phone, email, and notes;
- checks the plan lead limit for a genuinely new normalized phone identity;
- delegates to `causal.ingest_lead(...)`;
- returns the canonical `public.leads.id`.

The browser does not insert directly into `public.leads`.

## Identity and deduplication

The canonical causal writers normalize the phone value to digits and upsert on the unique `(workspace_id, phone)` identity.

Public service requests add a second idempotency boundary through the hardened intake ledger: `public.public_intake_attempts` uniquely enforces `(form_slug, request_id)`. A retried request returns the original accepted/rejected decision instead of creating a second intake event.

The current verified launch behavior therefore treats normalized phone identity within a workspace as the canonical lead identity. Any future Lead Vacuum source adapter must use the same canonical ingestion boundary rather than inventing its own deduplication table or direct INSERT path.

## Write-boundary verification

Production reconciliation confirms the controlled causal functions as the canonical lead mutation boundary:

- `causal._ingest_lead_impl(...)` — private implementation used by guarded public intake.
- `causal.ingest_lead(...)` — richer internal causal writer used behind the authenticated Add Lead RPC.
- `public.submit_public_service_request(...)` only performs the post-ingest `request_id` update; it does not directly INSERT a lead.

`public.leads` has RLS enabled. The browser-facing lead policy is authenticated workspace-scoped SELECT; there is no browser row policy authorizing direct INSERT/UPDATE/DELETE.

Production also contains the legacy SECURITY DEFINER helper `public.create_lead_if_under_limit(...)`, which writes to `public.leads_new`. The table itself has an authenticated INSERT-deny RLS policy, but SECURITY DEFINER bypasses that row-policy boundary. Launch certification found the legacy RPC still executable by `authenticated` even though the current repository has no consumer for it. Migration #102, `20260819201500_disable_legacy_leads_new_writer.sql`, removes authenticated execution while preserving `service_role` compatibility.

The presence of the empty legacy table is therefore treated as compatibility state, not a second active CRM. Normal browser users must have only the canonical `public.create_workspace_lead(...)` entry point for internal lead creation.

## Production versus reconciliation-test evidence

The active production Supabase project is `homeconnect` (`cguhtshclyybivvdnpig`). The project `hlc-reconciliation-test` (`agfwqnirspmptjiqrrtk`) is not production and must not be used as production certification evidence.

A reconciliation pass against `hlc-reconciliation-test` found `public.create_workspace_lead(...)` present while `causal.ingest_lead(...)` was absent there. PR #59 added forward-only migration `20260819193000_restore_canonical_lead_ingest.sql`, and that migration was applied to the reconciliation-test project with direct PUBLIC/`anon`/`authenticated` execution revoked.

That finding was **test-project schema drift, not a production launch defect**.

Independent verification against production `homeconnect` confirms:

- the canonical `causal.ingest_lead(...)` signature already exists from the earlier production lead-ingest migration chain;
- `anon` cannot execute it;
- `authenticated` cannot execute it directly;
- `public.create_workspace_lead(...)` remains the approved authenticated browser entry point;
- production did not require migration #101 to restore the writer.

Migration #101 remains in the local repository migration chain because it was applied to the reconciliation-test project. It must not be described as production repair evidence or applied to production solely for test-history parity.

## Current active public source inventory

The live production `public.public_forms` inventory includes:

- `request-service` — enabled; source `public_website`; canonical lead intake.
- `professional-application` — enabled; source `public_website`; provider/professional application intake, not a customer lead writer.

No lead-specific Supabase Edge Function was found in the deployed repository function inventory. Billing, communications, agent, calendar, portal, and telephony functions must not become ad-hoc lead writers.

## Lead Vacuum rule for future sources

A future Lead Vacuum adapter may watch or receive an external source only if it satisfies all of these rules:

1. Resolve the intended HLC workspace before mutation.
2. Normalize identity before deduplication.
3. Delegate creation/upsert through the canonical causal lead boundary.
4. Never create a second lead table or independent CRM record authority.
5. Preserve source/event metadata in causal evidence.
6. Be idempotent for provider retries or repeated source events.
7. Keep browser/API credentials least-privileged; normal browser roles must not receive a direct lead INSERT path.
8. Preserve consent/compliance boundaries separately from lead capture; the existence of a lead is not marketing or automated-contact consent.
9. Route the resulting lead into the same `/leads/:leadId` working record used for notes, communication, follow-up, estimates, appointments, and jobs.

## Not currently proven or specified

The repository contains no canonical component, route, function, or table literally named `Lead Vacuum`.

No verified launch specification currently defines additional source adapters such as marketplace scraping, inbox harvesting, third-party CRM imports, partner webhooks, or provider portal feeds as part of the Lead Vacuum. Those behaviors must not be invented during launch certification.

If an earlier product definition for Lead Vacuum is recovered, reconcile each intended source against this canonical boundary. Missing adapters may be implemented later only as explicit product scope; they must not bypass the existing single-source-of-truth model.

## Launch classification

The Lead Vacuum foundation is **reconciled at the canonical lead-system boundary** against production `homeconnect`, with one focused legacy-writer hardening gate:

- canonical CRM table `public.leads`: verified;
- public request-service intake: verified structurally;
- public intake guard/idempotency: verified;
- authenticated Add Lead entry point: verified structurally;
- canonical internal writer presence/security: verified in production;
- legacy `public.leads_new`: exists, empty, non-canonical;
- direct browser INSERT to `leads_new`: denied by RLS;
- legacy SECURITY DEFINER `create_lead_if_under_limit`: migration #102 removes authenticated execution;
- reconciliation-test writer drift: repaired in test only and not classified as a production defect;
- broader undocumented Lead Vacuum source adapters: not claimed.

Real signed-in owner Add Lead execution remains part of the owner runtime acceptance journey; catalog/source inspection does not replace that human-authenticated proof.
