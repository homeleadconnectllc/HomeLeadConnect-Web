# HomeLead Connect LeadScope and Estimating Architecture

Date: 2026-09-03
Status: LOCKED INFORMATION-ARCHITECTURE CORRECTION

## Decision

LeadScope and the internal operational estimator are separate product capabilities and must not share one identity.

### LeadScope

LeadScope is a resident-facing paid SaaS capability.

Purpose:
- let a resident use a supported phone/camera measurement experience;
- capture project dimensions and scope evidence;
- use those measurements to help the resident create an informational self-estimate;
- save the resident result to the authorized resident/property/request context;
- gate access through the correct resident paid entitlement.

Target hierarchy:

Resident Portal
- LeadScope
  - Start measurement
  - Camera/phone measurement experience
  - Review measurements
  - Project scope
  - Resident estimate
  - Saved LeadScope results
  - Paid entitlement / upgrade boundary

LeadScope must not be represented as the internal materials-and-quantity editor.

### Operational Estimates

The existing `/estimator` implementation is an internal CRM/work estimating tool.

Purpose:
- open from an authorized lead or estimate context;
- enter work/material line items;
- enter quantities and unit costs;
- apply markup;
- manage estimate status;
- save the estimate;
- convert an accepted estimate to a job.

Target hierarchy:

Work
- Leads
  - Lead Detail
    - Estimate / Operational Estimate
- Jobs
  - Job Detail where an existing estimate relationship applies

The operational estimator may continue using the existing estimate and estimate-line persistence model. It must not be branded LeadScope.

## Verified current-state findings

1. `src/pages/Estimator.tsx` currently implements the operational line-item estimator: labor/material descriptions, quantity, unit cost, markup, estimate status, persistence, and accepted-estimate-to-job conversion.
2. The same page currently labels this operational estimator as `LeadScope` in headings, saved-state messages, errors and summary copy. This is an information-architecture/naming defect.
3. Historical LeadScope domain code includes property evidence and a `measurements` evidence field. That foundation is useful but does not prove a production phone/camera measurement UI exists.
4. A repository-history search did not locate a committed camera/LiDAR/AR measurement implementation. Therefore the camera measurement experience must be treated as unproven/missing until a concrete implementation is located or built.
5. Current billing entitlement logic is workspace/subscription-level. It does not currently prove a resident-specific LeadScope paid-feature entitlement.
6. The Workflow route currently sends the `LeadScope` stage to `/estimator`, which incorrectly joins the resident LeadScope concept to the operational estimator.

## Required architecture correction

Do not delete or rewrite working estimate persistence simply to correct naming.

Correct in isolated stages:

1. Rename/reposition `/estimator` as the operational estimate surface in user-facing language.
2. Update Workflow so operational estimating is not presented as LeadScope.
3. Place LeadScope under the resident experience, not beside ordinary internal CRM routes.
4. Locate any existing measurement implementation before creating a replacement.
5. If no camera measurement implementation exists, record LeadScope camera measurement as a paid resident capability gap rather than pretending it is live.
6. Add or map a resident feature entitlement before exposing paid LeadScope access.
7. Preserve existing estimates, estimate lines, lead/job conversions, RLS, auth and canonical records.

## Product boundaries

LeadScope output is informational and resident-directed. It must clearly distinguish measurements/assumptions from verified contractor pricing or a binding professional quote.

Operational Estimates remain an internal CRM capability and can be tied to leads/jobs according to existing authorization.

Neither capability should create duplicate Lead, Job, Property, Estimate or Document records when an existing canonical record can be referenced.

## Navigation rule

A URL does not automatically earn a top-level navigation item.

- Resident LeadScope is reached from the resident portal/property/request context and paid-feature entry point.
- Operational Estimate is reached from the relevant Work/Lead/Job context.
- Saved estimate detail is a child/detail surface.
- LeadScope measurement/result screens are children of LeadScope.

## Execution boundary

This document corrects architecture only. Production remains unchanged until isolated implementation work is reconciled, certified on an exact SHA, visually inspected, approved and promoted through the normal HomeLead Connect release protocol.
