# HLC E4 Resources + Sourcing execution

E4 starts from certified E3 head `2cbf408a6a58b5918ab15f24c8bca94cef897b69` and adds protected Resources, Materials, Suppliers, and Supplier Map routes.

Supplier cards contain category context, provenance, official merchant and locator actions, and explicit external-verification language. HLC has no live merchant price or inventory feed and does not claim a nearest store, endorsement, purchase, delivery, warranty, or availability.

Saved suppliers and material plans use staged user-owned Supabase tables. Browser writes are RPC-only; direct writes remain closed. Material states are `Needed → Considering → Purchased → On Site → Used → Returned`. Optional job links require active workspace membership. The migration stays outside the production release plan until isolated verification and promotion authorization.

Focused contracts cover route protection, truth boundaries, locator actions, material states, RPC-only writes, RLS ownership, job authorization, Dion guidance, and mobile controls. Full verification, isolated runtime proof, device proof, and exact-head certification remain required.
