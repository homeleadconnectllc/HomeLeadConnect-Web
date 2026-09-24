# Connected visual family reconciliation — 2026-09-23

## Owner release gate

The approved front-door family governs both homeleadconnect.org and app.homeleadconnect.org. Home is the public parent composition. The four audience journeys and the corresponding signed-in portals share its photographic, typographic, logo, mist and transition language, while each retains its purpose and accent. The owner must review rendered desktop and 390px family pages before any production promotion. Physical Google Voice handoff proof is a separate pending gate.

## Evidence and source of drift

The historical styles were present in the current tree, including `front-door-rollout-20260913.css`, `front-door-mobile-redesign-20260911.css`, `public-home-final-composition-20260915.css`, `public-final-flat-authority.css`, `desktop-page-archetypes.css`, `premium-portal-family-rollout-20260911.css`, `frontdoor-profile-protocol-20260913.css`, `global-premium-system.css`, `version-a-global-family-authority-20260904.css`, `version-a-protected-geometry-contracts-20260904.css`, `master-visual-system-20260907.css`, and `v1-clarity-dedup-20260910.css`. Git history identifies the September 13 front-door rollout, September 15 composition, September 16 page family imagery and September 11 portal rollout as earlier rendered sources. They represent successive visual work rather than one stylesheet that can safely be reenabled wholesale.

The active `src/main.tsx` entry loaded `public-visual-family-20260919.css` for non-home pages and `standalonePublicHome.ts` loaded `public-home-owner-authority-20260918.css` for Home. The 2026-09-19 public layer explicitly painted light, rectangular heroes and an unrelated light footer, over the earlier blended photographic direction. Historical repeated-`#root` selectors for pathway copy also survived and added large padding even after later normal-specificity rules. For signed-in routes, the 2026-09-22 light app painter was separate from the public family; an SPA login transition did not reliably load `app-shell-entry` at all. The physical iPhone screenshots of dark dashboard panels and unstyled body-portaled More menu confirmed those app problems.

## Repair boundary

The current functional/communications branch stays the base. `connected-visual-family-20260923.css` restores the shared public composition on the active Home and interior entry paths, using the existing distinct route photography. It blends the hero into the page field, assigns resident green, professional cyan, partner gold and community purple, and reduces the footer to one centered official circular mark. The official logo itself opens the public menu, with no separate Menu button. The standalone Home entry mirrors that arrangement. `connected-app-family-20260923.css` carries the same navy/mist identity into the authenticated shell while keeping readable light working space and portal accent boundaries. The mobile contrast repair restores app shell loading after sign-in and fixes the affected panels and More menu.

| Public pathway | Signed-in surface | Accent family |
| --- | --- | --- |
| `/homeowners` | `.hlc-portal-workspace.is-resident` and resident shell | green |
| `/professionals` | `.hlc-portal-workspace.is-professional` and professional shell | blue/cyan |
| `/partners` | `.hlc-portal-workspace.is-partner` and partner shell | gold |
| `/community` | `.hlc-community-v2` and Community workspaces/navigation | purple |

The public accents are pale for photography on dark navy; their app counterparts are deeper so text and controls remain readable on light work surfaces. The visual effects are shared at shell, header, section, link and focus layers. Workflows, sound system state, identity, access and provider behavior do not follow these presentation tokens.

The two owner reference images supplied on September 24 show a curved light trace above blended audience photography, strong type and the four distinct portal colors. The active family now draws a subtle curved trace, blends each pathway hero into its own green, blue, gold or purple field, and groups Home card labels toward the image foot. Smaller app work areas use mist, accent and focus cues rather than covering operational content with dark photography; reduced-motion users retain the same information without hover movement.

During local reconciliation a proposed separate Menu control was implemented briefly, before commit or deployment. The owner clarified that the official logo itself must open the menu. The separate control was removed; `publicLogoMenuContract.test.ts` and `brandSystem.test.ts` continue to require the single official logo trigger, accessible open/close naming and official asset. The earlier test failure reflected the incorrect local interpretation and was corrected before any candidate was created.

No schema, Edge Function, communication transport, provider configuration, role decision, workflow or protected route was changed for the visual release gate. The earlier exact candidate remains superseded only once a new visual candidate is created and certified.

## Proof and owner review

Render Home, /homeowners, /professionals, /partners, /community and /about at 1440px and 390px. Check hero/photo continuity, no horizontal overflow, distinct imagery, readable text, singular logo header/footer, slim navigation, menu usability and compact footer; then inspect login and affected signed-in shell/portal surfaces. Run visual, whole-system, acceptance, launch audit, build and route inventory; five exact-SHA GitHub gates must pass. Publish a nonproduction exact-SHA preview connected only to the test backend. Owner visual signoff and separate owner physical iPhone checks remain pending until reported by the owner.
