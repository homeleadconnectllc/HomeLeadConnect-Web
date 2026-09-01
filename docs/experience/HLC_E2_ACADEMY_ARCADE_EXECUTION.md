# HLC E2 — Academy + Arcade Execution

Source of truth: Master Delivery Board #239 and locked experience contracts.

## Locked placement and progression

Canonical Academy routes:
- `/academy`
- `/academy/paths`
- `/academy/practice/:moduleId`
- `/academy/certifications`
- `/academy/progress`

E3-owned routes remain reserved and are not redefined here:
- `/academy/roleplay`
- `/academy/library`

Progression remains:
`Learn -> Practice -> Simulate -> Certify -> Apply -> Progress`

Teacher ownership remains contextual:
- Diamond — customer care, Community, onboarding, reviews, referrals, recovery.
- Dion — operations, CRM, scheduling, scripts, matching, providers, analytics, call-center execution.
- Kendrell — leadership, compliance, risk, escalation, approvals, governance.

## Trust and anti-gaming boundaries

- XP is progress currency, not a trust score.
- Community popularity does not prove competency.
- Event attendance does not create certification.
- HLC certifications must remain distinct from external licenses/credentials.
- Application XP requires a trusted verified outcome rather than a click or self-asserted completion.
- Repeat attempts provide full credit once, 25% credit on attempt two, and no farming credit after that.
- Certification requires assessment identity, positive threshold, passing score, date, and one of the locked HLC teachers.

## WIRED source evidence

E2 has advanced from FOUNDATION to WIRED in source control on the isolated E2 branch:
- all five canonical Academy routes are mounted for signed-in resident, professional, manager, and owner account shapes;
- `/community/academy` remains a compatibility doorway and routes into canonical `/academy` rather than duplicating training content;
- Community Arcade challenges remain at the existing `/community/challenges` surface;
- the staged Academy persistence migration provides user-scoped progress, attempts, and HLC certifications with RLS and RPC-only writes;
- practice recording is wired through `academy_record_activity`; browser roles cannot submit assessment scores or certifications, which are isolated behind the service-role-only `academy_record_assessment` boundary; application XP remains unavailable until a trusted outcome source can prove real-world completion;
- E3-owned `/academy/roleplay` and `/academy/library` remain reserved and unmounted;
- operational `/work/matching` vs Community `/community/swipe`, and operational `/messages` vs `/community/messages`, remain distinct.

## Verification boundary

WIRED does not mean runtime VERIFIED. The staged migration has not been applied to production and must first be exercised in an authorized isolated Supabase runtime. E2 may advance to VERIFIED only after positive/negative persistence proof, entitlement behavior proof, assessment/certification runtime proof, and rendered mobile/desktop evidence on one exact head. Until then, runtime status remains explicitly unverified.

Production `main`, production URLs, and the production database remain untouched by this branch.
