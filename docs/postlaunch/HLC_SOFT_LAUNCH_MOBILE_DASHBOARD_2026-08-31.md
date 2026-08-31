# HLC Soft-Launch Mobile Dashboard Regression

Baseline: `0fbb112ed4f4a7a16980d1f94005082e125137f3`

Classification: genuine mobile production regression / visual-layout defect

## Evidence

Real iPhone soft-launch screenshots showed two dashboard defects:

1. The `Good morning.` greeting was visually clipped beneath the authenticated mobile header.
2. The `Today` KPI value did not share the same horizontal value column as New leads, Follow-ups, and Active jobs.

## Scope

This repair is intentionally narrow and dashboard-only.

- Preserve the existing Command Center design.
- Keep desktop presentation untouched.
- Keep all four KPI rows in identical icon / numeric value / label columns on compact devices.
- Ensure the greeting has visible top breathing room and cannot be clipped by inherited compact-device geometry.
- Bind the repair to both the mobile media query and `html.hlc-compact-device` because physical iPhone browser chrome can report a wider layout viewport.

## Excluded work

The Manual Calls & Texts usability redesign is intentionally excluded. That is a separate post-launch UX enhancement and must not be mixed into this regression repair.

## Promotion boundary

Do not promote merely because CI passes. Exact-head certification and explicit owner approval are still required before production merge.
