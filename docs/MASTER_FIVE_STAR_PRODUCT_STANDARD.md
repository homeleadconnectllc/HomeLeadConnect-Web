# HomeLead Connect — Master Five-Star Product Standard

Status: LOCKED PROGRAM STANDARD

This standard applies to every public route, authenticated route, portal, modal, sheet, menu, drawer, form, card, row, sub-page, sub-screen, agent surface, document surface, alert, empty state, loading state, error state, mobile view, tablet view, desktop view, and installable/PWA surface.

## Product principles

1. Task-first: the most likely next action is obvious without training.
2. Self-explaining: every control uses plain language and gives just enough context to make a correct decision.
3. Progressive disclosure: advanced controls stay available without overwhelming first-time users.
4. Evidence-first: HLC never labels guessed, customer-entered, inferred, or estimated information as verified device/business evidence.
5. No dead ends: every meaningful state includes a useful next action or a clear explanation.
6. Mobile-first: iPhone layouts are intentionally designed, not compressed desktop screens.
7. Desktop-complete: Mac/desktop views use the space productively without hiding mobile-critical workflows.
8. Consistent anatomy: similar records, forms, alerts, actions, navigation, and agent experiences behave the same across the product.
9. Accessible by default: readable contrast, labels, focus states, keyboard access, adequate touch targets, error recovery, and no critical hover-only interactions.
10. Honest integrations: never claim a provider, measurement, payment, delivery, message, call, scan, or AI action succeeded unless evidence confirms it.

## Visual rules

- No purple branding.
- Primary canvas: dark navy / layered HLC blue.
- White is for text and contained controls where necessary, not page-size backgrounds or large floating white islands.
- Do not use rounded-bubble/card-wall SaaS styling.
- Prefer continuous workspaces, dividers, rows, rails, inspectors, and restrained semantic panels.
- Rounded geometry is reserved for compact semantic controls (status pills, avatars, icon buttons) and must not make every section look like a bubble.
- Official transparent circular HLC logo is the canonical brand mark.
- Agent closed launchers are compact avatar-first controls, not floating rectangular promo cards.
- All mobile content must clear bottom navigation and safe areas.
- No page-level horizontal scrolling at 320–430 CSS px.
- No clipped buttons, placeholders, chips, labels, or action rows.

## Interaction rules

Every meaningful feature must document and verify:

Trigger → user intent → authorization → backend/API/RPC → database/state → notification/side effect → user-visible result → recovery path.

Each primary action must answer:
- What will happen?
- What record will change?
- Can it be reversed?
- What happens next?
- What does failure look like?

## Measurement and camera standard

LeadScope Measure supports a tiered capture strategy:

1. Native depth/LiDAR measurement when supported and actually captured.
2. Guided camera/photo-assisted capture with explicit calibration/confirmation where depth data is unavailable.
3. Guided manual dimensions with customer confirmation.
4. Professional verification when the project cannot be safely or reliably measured remotely.

Measurement evidence labels are mandatory:
- Device measured
- Customer confirmed
- Estimated
- Needs professional verification

HLC preliminary estimates must never be represented as contractor-final proposals unless an authorized professional performs the required verification.

## Global feature quality checklist

Every route/sub-route must be reviewed for:
- Purpose and primary user
- Top task
- Top 1–3 actions
- Navigation in/out
- Search/discovery
- Empty state
- Loading state
- Error state
- Permission denied state
- Confirmation/success state
- Destructive-action safeguards
- Mobile keyboard behavior
- Safe-area behavior
- Desktop use of space
- Agent context/guidance
- Alerts/notifications
- Help/tutorial link where needed
- Data provenance/evidence labels
- Backend wiring
- RLS/authorization
- Analytics/audit event where appropriate
- Accessibility
- Performance
- Physical-device QA

## Global release labels

- GREEN — built, wired, automated checks pass, rendered QA passes, physical-device QA passes.
- YELLOW — built and wired but final human/device proof is incomplete.
- ORANGE — partial, unclear wiring, or important behavior still unproven.
- RED — broken, missing, unsafe, or launch-blocking.
- DEFERRED — explicitly approved post-launch work with no false launch claim.

No route or feature becomes GREEN from discussion, screenshots alone, or CI alone.

## Quality gate

A release candidate cannot be promoted merely because it builds. A qualifying candidate requires exact-head evidence for code, CI, rendered deployment, physical mobile QA, desktop regression QA, and integration/security evidence appropriate to the feature.
