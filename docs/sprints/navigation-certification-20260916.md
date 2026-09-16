# Navigation certification — September 16, 2026

Status: NOT CERTIFIED. No merge or production promotion authorized by this report.

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
