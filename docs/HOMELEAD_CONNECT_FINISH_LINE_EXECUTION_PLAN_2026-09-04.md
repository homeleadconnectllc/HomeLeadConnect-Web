# HomeLead Connect finish-line execution plan

Date: 2026-09-04
Base production SHA: `e88d6893bb17258244cc922368b79910f410ee18`
Working branch: `feature/leadscope-resident-completion-20260904`

## Goal

Finish the already-defined HomeLead Connect product without adding unrelated scope. Preserve the free resident/professional core, keep internal workspace billing separate from participant entitlements, complete resident LeadScope, then run consolidated certification before any production promotion.

## Frozen commercial and access boundaries

- Resident Free keeps the existing resident service workflow.
- Professional Free keeps the existing provider workflow.
- Business/Workspace Pro remains the repository-defined `$49.99 USD/month` plan with a 14-day trial; code exists but final live Stripe round-trip certification is still required before billing can be called launch-enabled.
- Resident Plus is a capability entitlement boundary, not a replacement for resident role authorization. LeadScope is its first concrete premium capability.
- Professional Pro remains conceptual until a real premium capability and commercial implementation are justified.
- Partner remains non-subscription unless a real paid partner product is intentionally defined later.

## Completion sequence

### 1. Subscription and entitlement closure

1. Preserve workspace billing architecture as-is.
2. Add a participant capability entitlement model that is separate from WorkspaceLayout billing.
3. Make the entitlement fail closed, resident-specific, time-aware, and non-writable by ordinary browser roles.
4. Do not invent Resident Plus or Professional Pro pricing.
5. Keep resident/professional free-core routes outside the premium capability gate.

Exit: HomeLead Connect can answer independently: `is this identity authorized for this portal?` and `is this authorized identity entitled to this premium capability?`.

### 2. LeadScope data contract

1. Keep `resident_properties` as canonical property identity.
2. Create resident-owned LeadScope project persistence beneath that property.
3. Enforce ownership with RLS and parent-property identity validation.
4. Persist project title/type, measurement evidence, site-condition evidence, scope evidence, informational estimate assumptions/range, and lifecycle timestamps.
5. Never write to internal `estimates`/`estimate_lines` from LeadScope.

Exit: a resident-owned LeadScope project can be securely saved and reopened without crossing into internal CRM estimating.

### 3. LeadScope resident experience

1. Add Resident Portal → LeadScope entry.
2. Add a resident-only `/homeowner-portal/leadscope` route.
3. Gate LeadScope by resident capability entitlement, not workspace billing.
4. Let entitled residents select a saved property or create one through the existing property experience.
5. Capture manual/phone-assisted project quantity and evidence state.
6. Capture scope description and site conditions with known/assumption/unknown/unverifiable semantics.
7. Calculate an informational estimate range only from explicit resident-entered rate assumptions; do not invent market or contractor pricing.
8. Clearly label the result as informational and non-binding.
9. Save and reopen projects.

Exit: an entitled resident can complete the full LeadScope flow on mobile or desktop without using the internal estimator.

### 4. Focused validation

1. Add domain tests for informational range calculation and invalid assumptions.
2. Add static/acceptance contracts for resident route, entitlement separation, persistence separation, and free-core preservation.
3. Add migration-chain staging coverage.
4. Run lint, acceptance, launch audit, and build on the exact branch head.
5. Correct only defects found by those gates.

Exit: exact branch head passes local/static launch verification.

### 5. Pull request and exact-head certification

1. Open a draft PR from the production-derived branch.
2. Freeze a candidate SHA after implementation corrections.
3. Run HomeLead Connect Launch Candidate, Blind Visual Certification, Rendered Quality Gate, and Authenticated Visual Proof on that exact SHA.
4. Inspect real mobile/desktop evidence, especially Resident Portal → LeadScope, entitlement denial, save/reopen, evidence states, and no internal Estimator leakage.
5. Correct defects on the isolated branch and repeat exact-head certification until all required gates pass.

Exit: one exact candidate SHA is certified by all required gates.

### 6. Production promotion boundary

1. Request owner approval for the exact certified SHA only.
2. Merge with expected-head protection.
3. Run HomeLead Connect Production Verification against the resulting production SHA.
4. Keep billing feature flag off unless the separate live Stripe round-trip canary has passed.

Exit: LeadScope implementation is live only after explicit exact-SHA approval and production verification.

### 7. Billing live-round-trip certification

1. Prove authenticated Checkout.
2. Prove signed Stripe webhook receipt and deduplication.
3. Prove `subscriptions` write.
4. Prove `workspace_plan_status` write.
5. Prove trial/active entitlement in the internal workspace.
6. Prove billing portal creation.
7. Prove end-of-period cancellation propagation.
8. Prove payment failure → grace state and post-grace behavior.
9. Only then justify `VITE_BILLING_ENABLED=true`.

Exit: workspace billing may be called launch-certified instead of merely implemented.

### 8. Consolidated final certification

Verify the already-built product as one system:

- public intake → authenticated destination;
- resident/professional/partner portal isolation;
- internal CRM/SaaS role boundaries;
- resident free-core preservation;
- participant capability entitlement behavior;
- LeadScope save/reopen and estimate disclosure;
- internal Estimator separation;
- workspace billing state handling;
- Messages/Documents/Resources continuity;
- international/location-neutral behavior already implemented;
- mobile and desktop quality;
- production-source verification.

Exit: HomeLead Connect is launch-stable for the currently defined product.

## Stop rule after launch

After consolidated certification and production verification, stop automatic feature expansion. Future work is limited to bugs, security/compliance, performance, usability improvements, and evidence-backed improvements from real user usage and feedback.