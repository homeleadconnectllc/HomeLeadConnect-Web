# HomeLead Connect — Approved Visual Master System

Status: implementation authority for the post-launch visual cleanup branch.

## Scope

Visual structure only. Do not change business logic, Supabase behavior, RLS, authentication, billing, routes, roles, permissions, workflow rules, lead/job lifecycle semantics, or AI agent ownership.

## Core rules

- Operational pages use a compact eyebrow + page title + at most one compact primary action.
- No marketing/pitch copy or oversized intro cards inside recurring operational workspaces.
- Auth is an account-entry surface: dark HomeLead Connect canvas, one job, no competing marketing banner.
- Prefer one continuous navy surface, rows and hairline dividers over nested card walls.
- KPI summaries are number-first and compact; decorative icons are not required.
- Dense list rows prioritize identity, status/value/timestamp, and next action. Full contact/detail data belongs in detail views.
- Secondary row actions are compact 44px touch targets; overflow is an icon, not a full-width button.
- Empty states collapse to concise text rather than large whitespace cards.
- Mobile uses progressive list-to-detail navigation and preserves 44px touch targets.
- Contextual AI remains subordinate to the work surface and stays clear of bottom navigation, list rows and composers.
- Use the existing HomeLead Connect navy/blue/cyan palette tokens. Do not reintroduce purple as a system color and do not create a new approximate palette.
- Raw database strings should not become user-facing visual labels without human formatting.

## First implementation surfaces

1. Sign-In
2. Dashboard
3. Leads
4. Jobs
5. Messages

Physical-device approval remains required before any production promotion.
