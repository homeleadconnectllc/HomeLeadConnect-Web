# Global Authenticated Visual Cleanup — 2026-09-05

Baseline: `7c990c18f1df2b55f1a93bf2096bf6cb91ad278d`
Issue: #321

Visual-only scope:
- button labels must fit comfortably without squeezing, clipping, or awkward wrapping
- no unintended white controls or white islands in the authenticated dark app
- all text must maintain readable contrast against its owning surface
- profile initials fallback remains, but nested/extra avatar halo treatment is removed

No routing, auth, role, workspace, RLS, workflow, data-contract, billing, or backend changes.

Physical iPhone inspection remains final authority before promotion.
