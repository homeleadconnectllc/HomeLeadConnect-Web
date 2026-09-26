# HCX Global Whole-System Execution Rule

Status: PERMANENT SPRINT AUTHORITY  
Applies to: this sprint and every future HomeLead Connect build task  
Effect: governs execution without replacing, restarting, or widening the current sprint.

## Governing distinction

Finish the current task without routine interruption. Never treat the current page, screenshot, route, component, file, or symptom as the whole product.

Every sprint operates at three scopes simultaneously:

1. **Task scope** — the outcome explicitly requested now.
2. **System scope** — the shared architecture, component, state, policy, or service directly affected by that outcome.
3. **Application scope** — a bounded impact sweep for equivalent defects and regressions across affected HomeLead Connect surfaces.

Whole-system awareness does not authorize unrelated redesign. The required chain is:

**Observed issue → root cause → ownership layer → blast radius → canonical repair → affected-surface verification**

If the defect is local, repair it locally. If it belongs to a shared primitive, repair the primitive once. If it belongs to system architecture, repair that architecture. Do not apply route-by-route patches to a shared defect, and do not rewrite unaffected systems.

## Correct product home

Before adding or moving a capability, resolve:

- who owns it;
- who may see and act on it;
- its primary product home;
- when and in what context it appears;
- the governed record or relationship it belongs to;
- its permission, workspace, organization, role, and entitlement boundary;
- mobile behavior;
- authoritative state and source of truth;
- failure, recovery, audit, and retention behavior where applicable.

Use the Experience Placement Authority, Relationship Matrix, Capability Registry, route inventory, Connected Core, and current exact-SHA implementation authority as the product map. Do not solve architecture by placing unrelated cards beside one another.

## Experience, not a feature wall

Prefer **record → context → relevant action** over **dashboard → feature catalog**.

Appointments own appointment actions. Jobs own job actions. Contact and communication history follows the governed person, relationship, lead, request, job, or conversation. Scripts and manuals live in Resources or Academy and may surface contextually. QR generation belongs to the governed profile, campaign, or resource it represents. Referrals belong to their relationships and outcome records. Personal appearance belongs in My HCX. Authorized organization branding belongs in organization administration. HomeLead Connect controls the system visual design.

Use progressive disclosure: what matters now → relevant detail → deeper authorized controls. Every page does not need every feature.

## Audience and relationship sweep

For meaningful changes, evaluate only the reasonably affected audiences: Resident, Professional, Partner, Community participant, public visitor, staff, Manager, Operations, Owner/admin, organization/team user, and AI agent.

Where relevant, inspect directional cross-role relationships among Residents, Professionals, Partners, Community, and authorized HCX/Internal participants. Direction matters. A relationship in one direction does not create reciprocal authority.

Every interaction has explicit business meaning, purpose, permission, consent basis, lifecycle, resulting record, and audit behavior. Do not create one generic Connect action. Use meanings such as Request Service, Request Callback, Request Estimate, Request Appointment, Refer, Share, Save, Follow, Invite, Request Introduction, Collaborate, Send Opportunity, Request Partnership, or Request Resource while sharing infrastructure only where appropriate.

## Connected Core obligation

Every change must be reconciled against affected Connected Core areas:

- identity and contact points;
- organization, role, workspace, permission, and RLS;
- CRM records and relationships;
- communications and delivery evidence;
- scheduling;
- workflow, automation, retries, escalation, and idempotency;
- notifications and activity;
- audit;
- billing and entitlements;
- documents;
- AI authority;
- failure and recovery;
- mobile and offline behavior.

Never create parallel state simply to make a screen work. Reuse canonical sources and certified systems.

## State separation

Keep notification, workflow, automation, activity, audit, sound, AI suggestion, AI action, backend state, and frontend presentation distinct.

A toast is not a workflow. A sound is not status. A badge is not proof. A trigger firing is not completion. A queue entry is not delivery. A calendar item is not automatically an HCX appointment. A payment return screen is not entitlement evidence. Presentation may communicate state but never manufacture it.

## Required bounded impact sweep

Before a meaningful repair is complete, inspect the reasonably affected dimensions:

- **Shared UI:** canonical components, responsive behavior, focus, accessibility, visual family.
- **Data:** source of truth, persistence, duplicate models, provenance.
- **Permissions:** role, organization, workspace, tenant/RLS, entitlement.
- **Workflow:** upstream/downstream state, triggers, actions, completion evidence, retry/escalation.
- **Communication:** phone, SMS, email, in-platform messages, notifications, consent, suppression, delivery evidence.
- **Mobile:** 390px-class layout, keyboard, safe area, tap targets, modal and bottom-sheet behavior.
- **Recovery:** reload, retry, stale session, duplicate execution, offline/reconnect where applicable.

Only inspect areas reasonably affected by the change. Do not turn a bounded repair into a platform rewrite.

## Preservation and authority

Do not rebuild HomeLead Connect from scratch. Preserve certified behavior, canonical routes, working workflows, existing state, correct permissions, approved visual patterns, accessibility work, test architecture, and release governance.

When uncertain, reconcile in this order:

1. current owner-approved HCX rules;
2. master product and governance authority;
3. current milestone authority;
4. canonical repository implementation;
5. canonical database and state architecture;
6. existing certified components and tests;
7. current exact-SHA branch authority.

## Autonomous execution

Make ordinary implementation decisions from established architecture, governance, role rules, design authority, and accepted product/engineering practice. Record material decisions and continue.

Do not stop for ordinary placement, responsive repair, accessibility correction, test stabilization, canonical reuse, normal state wiring, duplicate cleanup, minor layout correction, or standard failure handling.

For fixable failure: **detect → investigate root cause → repair → retest → record → continue**.

Stop only for a genuine owner boundary: production promotion, destructive irreversible action, unresolved legal/business policy, missing external authority or credentials, materially conflicting product requirements, or a decision that changes an established owner rule. Continue all independent work around a localized blocker.

Speed comes from fewer interruptions and less duplicate effort, not fewer checks. Never hide failures to keep moving.

## Completion reporting

Maintain the execution ledger during the build. At a meaningful boundary report: findings, root cause, repair and propagation, intentionally unchanged systems, tests, rendered/mobile verification, workflow/automation effects, permission effects, risks, blockers, exact candidate SHA, and any required owner action.

## Final whole-system rule

When the owner points to one thing, investigate the system that owns it.

Do not assume the problem ends at the page. Do not assume the solution applies everywhere. Find and repair the correct layer, place the capability in its correct home, preserve what is already correct, verify the reasonable blast radius, and keep building.

Treat HomeLead Connect as one connected product even when the immediate work is one file, page, route, or feature. Do not create feature walls, parallel systems, or routine owner interruptions.
