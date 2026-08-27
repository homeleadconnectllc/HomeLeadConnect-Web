# Mobile A+ Sprint 5 — Offline + Drafts + Saved State

Status: MAPPED / NOT STARTED

Scope:
- Shared draft persistence for messages, notes, forms and event creation.
- Saved scroll, filter, tab, calendar and map state.
- Global online/offline/syncing/pending indicator.
- Retry queue and Retry Center for safe queued operations.
- Explicit failure, recovery and cancellation states.

Guardrail:
- Do not silently queue billing, destructive deletes, irreversible automation execution or high-risk AI writes.

Exit:
- Interrupted field work survives navigation, reloads and connection loss where safe.
- Exact-head CI + rendered mobile QA + iPhone offline/recovery QA.
