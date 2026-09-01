# HLC E5 Intelligence execution

## Protected scope

- `/analytics/forecasting` provides a deterministic, directional demand-and-capacity model.
- `/analytics/sandbox` compares browser-local logistics scenarios and exports a review artifact.
- `/analytics` remains the canonical REAL DATA surface.
- Access stays inside the existing manager/owner `WorkspaceLayout` and `/analytics` access policy.

## Truth and action boundaries

- REAL DATA, FORECAST, and SIMULATION ONLY remain visibly distinct.
- Forecast assumptions are operator entered and visible; the modeled ±20% range is not presented as a probability interval or guarantee.
- Sandbox calculations are pure and deterministic. The page imports no Supabase client or mutation API.
- Export creates a local JSON review artifact. It cannot assign providers, schedule appointments, alter routes or SLAs, bill, or update customers.
- Every real change must move to the applicable canonical authorized workflow and receive deliberate review.

## Verification target

- Focused deterministic, route-boundary, provenance, negative-write, mobile, and accessibility contracts.
- Full acceptance suite, static audit, lint, TypeScript, production build.
- Exact-head Launch Candidate, Blind Visual Certification, and Rendered Quality Gate before E6 begins.
