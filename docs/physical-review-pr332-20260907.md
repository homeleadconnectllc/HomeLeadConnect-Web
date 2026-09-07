# PR #332 physical iPhone review — 2026-09-07

Exact candidate reviewed: `190684bdc741fdb44494f3fdee9973378ca15651`

Status: **PHYSICAL FAIL — permanently non-promotable**

Owner-provided iPhone screen recording showed that machine certification did not match the intended on-device visual authority.

## Confirmed visible failures

1. **Sign-In visual authority is not winning on-device.**
   - The approved design requires a dark/navy auth-only surface with dark high-contrast fields.
   - The physical recording shows a predominantly white/light Sign-In page and light form fields.
   - This contradicts `master-visual-system-20260907.css`, which explicitly sets the login shell, route content, auth shell, auth card, and inputs to dark/navy values.
   - Treat as cascade/selector/application failure; do not loosen the visual contract.

2. **Authenticated visual system remains too purple/systemically tinted.**
   - The approved authority is deep navy with restrained blue/cyan accents and explicitly says not to reintroduce purple as a system authority.
   - The physical recording shows broad purple surface/border/nav treatment across Dashboard, Work, Community, Messages, and More.
   - Reconcile the late authenticated cascade so navy remains the base and purple is not the dominant surface authority.

3. **Work still presents a large intro/choice card on mobile.**
   - The physical recording shows a prominent “What are you working on?” card occupying the top of Work.
   - The locked visual direction rejects giant intro blocks and repeated navigation-card walls in authenticated operational screens.
   - Compact this without deleting any capability or changing routing/role semantics.

4. **Messages empty state remains card-heavy.**
   - The physical recording shows the empty inbox/message state contained in a conspicuous purple card/surface rather than the intended flatter operational treatment.

## Important non-findings

- The recording does not provide a complete physical inspection of the Leads row itself, so do not claim the repaired Leads geometry has physically passed merely because Blind Visual Certification passed.
- No production defect is inferred from this visual review.
- No backend, auth logic, RLS, billing, route, role, permission, workflow, or AI-agent ownership change is authorized by this review.

## Required next sequence

- Keep production untouched.
- Make the smallest visual-only corrective changes on PR #332.
- Preserve all existing functional behavior.
- New commit SHA invalidates all prior gate results.
- Rerun all four exact-head gates on the new SHA.
- Only after 4/4 PASS and exact preview verification should another physical iPhone inspection be requested.
