# Navigation certification — September 16, 2026

Status: NOT CERTIFIED. No merge or production promotion authorized by this report.

## Interaction gate added under owner approval

GitHub Actions now installs the existing pinned Playwright Chromium runtime and
executes anonymous navigation tests at 320, 390, and 1440 pixels across 30 routes.
The mobile-runtime blocker below is historical and resolved by this CI gate.

First tested interaction candidate: `2f3bbb67dd0b82583c5ca064e93790efa4d13727`.
Run 35104417649, artifact 10449852398: 90 cases executed, 8 passed, 82 failed.
Evidence was downloaded and inspected. Real failures included inset public
headers, incorrect Sign In color, narrow/dark menu content, and missing memorial
and company-invitation headers. Test defects also misclassified closed-details
links as visible and checked menu layout before it settled. These defects are
repaired without removing destination, touch-target, or interaction assertions.

Scoped repairs retain existing invitation logic and memorial content, add shared
headers to those pages, omit their duplicate application chrome, correct public
header containers/menu styling, and retain keyboard focus indicators. All local
launch checks passed; repaired exact-candidate CI evidence must still be reviewed.

## Exact evidence reviewed

Candidate: `8724bf2fb9f5eb83793544f52421e4cca85e9ea5`.
All five pull-request workflows completed successfully. The Front Door Visual
Review run 35099333221 produced artifact 10447013868 at the exact candidate SHA.
Its mobile captures of Home, About, Login, Register, Forgot Password, and Reset
Password were inspected, together with Home and Login desktop captures.

Findings: interior mobile Menu labels are unreadable; About remains inset;
Login desktop navigation is constrained to a narrow column. Therefore automated
success is not sufficient evidence of homepage-matching navigation.

## Root cause and scoped repair

Direct browser inspection of the candidate About page found the Menu text exists
but its computed color is `rgb(17, 24, 39)`, despite the unlayered header rule
requesting white with `!important`. The existing `hlcHardBlankReset` cascade layer
overrides unlayered important declarations. The `hlcRedesign` layer is established
before it. Header and account-container overrides were moved into `hlcRedesign`,
without editing either global reset or protected workspace styles.

The repair passed lint, three visual contracts, 617 acceptance tests, the
181-check static audit, TypeScript, and the production build locally.
These are not rendered proof of the repaired candidate.

## Concrete certification blocker

The supported cloud browser exposes no browser-scoped capabilities and no viewport
or mobile-emulation API. Mobile CI captures establish appearance only; they do not
prove opening/closing the menu or keyboard behavior. A mobile-capable interaction
test runtime is required to close that gate. No unsupported browser mechanism,
TLS bypass, or weakened gate was used.

Not yet verified: repaired rendered appearance, mobile menu interactions, keyboard
navigation across all required public/account routes, and complete route coverage.
The 125-route register remains an inventory, not 125 executed navigation tests.

The PR remains a draft. Production promotion stays blocked until exact-candidate
rendered and interaction evidence passes and required exact-SHA approval is obtained.
