# Mobile A+ Sprint 2 — Implementation Prep

Status: PREPARED / PRODUCT WORK NOT STARTED

This planning-only checkpoint does not advance Sprint 2 and does not replace Sprint 1 certification. Product implementation begins only after Sprint 1 has exact-head green HLC Launch Candidate + HLC Rendered Quality Gate evidence and is promoted into the isolated Mobile A+ program branch.

## Locked scope
- Leads, Jobs, Follow-ups and Golden Workflow compact-native layouts.
- Maximum two primary visible record actions.
- Overflow actions for secondary commands.
- Swipe shortcuts with visible fallback controls.
- Bottom-sheet filters, sort, status and disposition flows.
- Mobile work-section navigation while preserving Home / Work / Network / Community / More.

## Existing implementation audit

### Leads
Primary files:
- `src/pages/dashboard/Leads.tsx`
- `src/components/leads/LeadCard.tsx`
- `src/styles/leads-application-workspace.css`

Current card exposes Estimate, Follow up, Call and Invite simultaneously. Sprint 2 should preserve all capabilities while showing no more than two contextually primary actions on compact screens and moving the remaining commands to an explicit overflow/sheet. Desktop behavior must remain available.

Recommended compact default:
- Primary: Call when phone exists; otherwise Follow up.
- Primary: Next step / Follow up.
- Overflow: Estimate, Invite, other secondary record actions.
- Entire identity area remains the record-open affordance.

Filters should use a mobile sheet rather than adding permanent controls to the page header.

### Jobs
Primary files:
- `src/pages/dashboard/Jobs.tsx`
- `src/components/jobs/JobCard.tsx`

Current card exposes a status select plus Open job, Schedule follow-up, Prepare call and Attach evidence. Sprint 2 should transform compact mode into a record row with two visible actions and an overflow/sheet while preserving all permissions and job status semantics.

Recommended compact default:
- Primary: Open / Update.
- Primary: Schedule when applicable.
- Overflow: Prepare call, Attach evidence, secondary status/action commands.
- Status changes remain explicit and auditable; do not make consequential updates gesture-only.

### Follow-ups
Primary file:
- `src/pages/dashboard/FollowUps.tsx`

Current page combines the composer and queue and already computes overdue/today/upcoming/completed states. Sprint 2 should keep that data model and transform compact mode into a task-first queue grouped or filtered by urgency.

Recommended compact default:
- Primary: Contact / Open lead when contact path exists.
- Primary: Complete.
- Swipe shortcut: Complete, with visible Complete fallback.
- Secondary sheet: Snooze/reschedule or contextual record actions only where existing APIs support them; do not invent writes.
- Composer can become a sheet or compact progressive form on phone.

### Golden Workflow
Audit target:
- existing Golden Workflow route/components and workflow status controls.

Mobile implementation principle:
- show current stage, blocker/missing requirement, owner and next action;
- do not squeeze desktop workflow visualization into phone width;
- preserve existing confirmation and authorization boundaries.

## Shared Sprint 2 components to introduce only after Sprint 1 promotion
Suggested reusable primitives:
- `MobileActionOverflow` — explicit secondary-action sheet/menu.
- `MobileSwipeRow` — touch/pointer shortcut wrapper with visible fallback requirement.
- `MobileFilterSheet` — filter/sort sheet with explicit Apply/Clear semantics.
- `MobileWorkSectionRail` — compact Work sub-navigation without replacing the five parent tabs.

These primitives should be compact-screen enhancements only and should not replace desktop controls.

## Gesture safety rules
- Swipe is never the only way to complete an action.
- Destructive, billing, irreversible, or consequential AI actions are never gesture-only.
- Gesture activation requires a clear threshold and cancel path.
- Keyboard/focus interaction remains usable without swiping.
- No swipe implementation may block ordinary vertical page scrolling.

## Acceptance matrix
Automated:
- existing acceptance suite unchanged;
- static audit unchanged;
- production dependency audit unchanged;
- build/typecheck unchanged;
- HLC Launch Candidate exact-head PASS;
- HLC Rendered Quality Gate exact-head PASS with thresholds unchanged.

Human iPhone QA remains required and must not be fabricated:
- Leads row/actions/overflow/swipe;
- Jobs row/actions/overflow/status flow;
- Follow-ups queue/composer/swipe;
- Golden Workflow stage/next action;
- bottom navigation clearance;
- keyboard/sheet/safe-area behavior;
- no white screens, clipping, overlap or hidden required actions.

## Promotion rule
Sprint 2 product branch may be cut only from the Mobile A+ program branch after Sprint 1 automated gates pass and Sprint 1 is promoted into that program branch. Human iPhone QA may remain an explicitly open evidence gate, but it must never be claimed complete without real device evidence.
