# Community command bar physical closure — 2026-09-05

Source production baseline: `8a2b4df592714103896149129c8bfaca1cd17b96`

Physical iPhone evidence showed the Community quick-navigation block rendering as a white island with nearly invisible labels (`Discuss`, `Discover`, `Map`, `Reviews`, `Referrals`, `Events`).

Repair scope is visual only:
- restore transparent command-bar container
- restore dark premium quick-navigation buttons
- force readable light button labels
- preserve current Community layout, routes, Diamond CTA, AI Team launcher, mobile tab bar, auth, roles, workspace rules, RLS, and workflows

No backend, database, billing, routing, or product-scope changes.
