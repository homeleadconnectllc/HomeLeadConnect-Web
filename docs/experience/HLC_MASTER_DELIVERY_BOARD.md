# HLC Master Delivery Board

Status: ACTIVE execution control
Date: 2026-09-01

State model: ARCHITECTED -> FOUNDATION -> WIRED -> VERIFIED

No row may advance to VERIFIED without attached evidence.

| Area | Canonical route/system | Current execution state | Primary missing work | Access | Agent | Owner program | Verification required |
|---|---|---|---|---|---|---|---|
| Role-aware Home | `/dashboard` | FOUNDATION/WIRED partial | locked hierarchy, role behavior, Continue state, visual storytelling | Core role-aware | Diamond/Dion/Kendrell | S1 | exact-head CI; resident/pro/manager access; iPhone; desktop; real next-action evidence |
| Work Home | `/work` | ARCHITECTED | parent route + operational summary + handoffs | Pro/Manager | Dion | S2 | route/data/role/mobile/desktop; negative resident access if restricted |
| Leads | `/leads`, `/leads/:leadId` | FOUNDATION/WIRED partial | visual queue/detail, blockers, next-action contract | Core Work | Dion | S2 | live data; empty/error/loading; mobile; desktop; cross-route actions |
| Operational Matching | `/work/matching` | ARCHITECTED | new route, explainable ranking, review/confirm assignment | Authorized Work | Dion | S2 | no silent assignment; role isolation; real factors; negative tests |
| Jobs | `/jobs`, `/jobs/:jobId` | FOUNDATION/WIRED partial | visual lifecycle, blockers, materials/docs context | Core Work | Dion | S2 | lifecycle data; role access; mobile/desktop; consequential action confirmation |
| Follow-Ups | `/follow-ups` | FOUNDATION/WIRED partial | Overdue/Today/Upcoming/Completed, Contact/Complete | Core Work | Dion | S2 | real due-state behavior; mobile; completion evidence |
| Call Center | `/call-center` | FOUNDATION | visual live workspace, script guidance, checkpoints, Dion Coach | Core Work | Dion | S2/E3 | real vs simulation boundary; data/communications access; mobile/desktop |
| Calendar | `/calendar` | WIRED | contextual Work/Community/Academy handoffs, final role polish | Core | Dion | S1-S2 | day/week/month; event semantics; route handoffs; mobile/desktop |
| Operational Messages | `/messages` | WIRED partial | ensure job/service scope and separation from Community Messenger | Core relationship scoped | Dion/Diamond | S4 | permission scope; draft/state; mobile keyboard; service handoff |
| Network Home | `/network` | FOUNDATION/WIRED partial | visual directory, role-specific discovery | Core + premium depth | Dion/Diamond | S3 | role filters; real provider data; mobile/desktop |
| Network Map | `/network/map` | FOUNDATION/WIRED partial | modes, Map/List state, shared cards, privacy-safe geography | Role-aware | Dion/Diamond | S3 | privacy negative tests; modes; state persistence; mobile/desktop |
| Coverage Intelligence | `/network/coverage` | ARCHITECTED | coverage/gap model + visual layer | Pro/Manager | Dion/Kendrell | S3/E5 | real data provenance; gap explanation; role isolation |
| Shared Member Profile | `/profile`, `/profiles/:profileId` | FOUNDATION fragmented | one shared identity model + role presentations | Visibility controlled | Role-based | S3/E1 | privacy; trust-signal separation; old-route compatibility |
| Community Home | `/community-hub` | FOUNDATION | role-aware premium front door, Local Pulse, For You, feed | Community | Diamond | S4/E1 | entitlement; role ranking; real event feed; visuals |
| Community Discover | `/community/discover` | ARCHITECTED | new discovery experience | Community | Diamond | S4/E1 | role filters; privacy; shared profiles; mobile/desktop |
| Community Swipe | `/community/swipe` | ARCHITECTED / deck foundation elsewhere | canonical route, role modes, scoring confidence, trial behavior | Premium/trial | Diamond/Dion | S4/E1 | scoring truth; privacy; mutual connection; no assignment; entitlement |
| Community Messenger | `/community/messages` | ARCHITECTED | social messaging layer + connection gate | Premium Community | Diamond | S4/E1 | accepted-relationship gate; block/report/privacy; operational handoff |
| Reviews | `/community/reviews` | FOUNDATION | provenance model: verified service vs recommendation | Community | Diamond | S4/E1 | legitimate relationship evidence; anti-gaming; privacy |
| Referrals | `/community/referrals` | FOUNDATION | actionable referral objects + outcome tracking | Community | Diamond | S4/E1 | provenance; no self/duplicate gaming; profile/match integration |
| Community Events | `/community/events` | FOUNDATION | rich event cards, RSVP, Calendar/share integration | Community | Diamond | S4/E1 | role access; calendar handoff; attendance vs credential distinction |
| Community Challenges | `/community/challenges` | ARCHITECTED | quality-based challenge engine | Community | Role-based | S4/E2 | anti-spam scoring; profile/Academy distinction |
| Academy Home | `/academy` | ARCHITECTED | route hierarchy and role-based learning | Core + Premium | Role-based | E2 | role tracks; access; mobile/desktop; content integrity |
| Learning Paths | `/academy/paths` | ARCHITECTED | paths, modules, progress | Core + Premium | All three | E2 | progression; persistence; role visibility |
| Practice | `/academy/practice/:moduleId` | ARCHITECTED | quizzes/micro-games | Core + Premium | Track teacher | E2 | scoring; attempts; feedback; accessibility |
| Certifications | `/academy/certifications` | ARCHITECTED | competency, threshold, date, level, teacher, expiry | Core + Premium | All three | E2 | assessment evidence; external-credential distinction |
| Arcade/Progress | system-wide + `/academy/progress` | ARCHITECTED | XP, streaks, achievements, progress timeline | Signed-in | Role-based | E2 | anti-manipulation; persistence; trust separation |
| Roleplay Studio | `/academy/roleplay` | ARCHITECTED | simulation engine, scoring, Dion coaching, replay | Premium/trial | Dion | E3 | synthetic/live isolation; scoring; replay; voice/text if available |
| Scripts & Knowledge | `/academy/library` | ARCHITECTED | versioned content source, Guide/Assisted/Practice | Role/access aware | All three | E3 | versioning; retirement; permissions; agent grounding |
| Resources Home | `/resources` | ARCHITECTED | visual sourcing hub | Public teaser + Core | Dion | E4 | visuals; role access; links; mobile/desktop |
| Materials | `/resources/materials`, project material routes | ARCHITECTED | material state machine + job/doc/receipt links | Core/authorized | Dion | E4 | state transitions; permissions; persistence |
| Suppliers | `/resources/suppliers` | ARCHITECTED | visual supplier cards + honest external links | Core + premium depth | Dion | E4 | no fabricated price/inventory; safe external links; saved state |
| Supplier Map | `/resources/suppliers/map` | ARCHITECTED | map/list sourcing view | Core + premium depth | Dion | E4 | location accuracy; privacy; route consistency |
| Analytics | `/analytics` | FOUNDATION/WIRED partial | question-driven views + Why? drilldown | Pro/Manager | Dion/Kendrell | S6 | real-record drilldown; data provenance; role access |
| Forecasting | `/analytics/forecasting` | ARCHITECTED | model-based estimates + assumptions | Advanced | Dion/Kendrell | E5 | distinguish estimate from fact; assumptions visible |
| Logistics Sandbox | `/analytics/sandbox` | ARCHITECTED | simulation engine + compare scenarios + action-plan export | Advanced | Dion/Kendrell | E5 | zero production writes; Simulation Only label; deterministic test cases |
| Notifications | `/notifications` | FOUNDATION/WIRED partial | priority/bundling/quiet hours/role copy/progress moments | Core | Contextual | S4/E2 | channels; consent separation; bundling; priority; quiet hours |
| Trial + Entitlements | system-wide | ARCHITECTED | central policy engine: full preview -> taper -> post-trial | Role/plan dependent | Contextual | E6 | entitlement transitions; saved-data persistence; Stripe/app copy consistency |
| Kendrell Workspace | `/hq` | WIRED | preserve + contextual handoffs | Authorized | Kendrell | KEEP | regression + role access |
| Dion Workspace | `/operations` | WIRED | preserve + contextual handoffs | Authorized | Dion | KEEP | regression + role access |
| Diamond Workspace | `/customer-experience` | WIRED | preserve + contextual handoffs | Authorized | Diamond | KEEP | regression + role access |
| Visual Experience | system-wide | ARCHITECTED / partial | imagery, art, maps, progress graphics, agent presence, motion, empty states | All | Contextual | E7 | iPhone + desktop + accessibility + performance + no sterile major routes |

## Execution order
1. Preserve production. Work only on isolated production-derived branches.
2. Complete Mobile A+ S1 through S7 under existing exact-head quality gates.
3. Execute E1 through E7 in order unless a dependency requires a narrow reorder.
4. Do not lower quality thresholds or fabricate verification.
5. Consequential writes remain deliberate and audited.
6. No production merge merely because CI is green; production promotion requires explicit approval.

## Evidence contract
Every VERIFIED row records, as applicable:
- exact commit SHA
- exact CI/workflow run
- route render proof
- positive role/access test
- negative restricted-role test
- iPhone evidence
- desktop evidence
- data/API evidence
- entitlement-state evidence
- consequential-action confirmation test
- old-route compatibility test
- accessibility/performance evidence
