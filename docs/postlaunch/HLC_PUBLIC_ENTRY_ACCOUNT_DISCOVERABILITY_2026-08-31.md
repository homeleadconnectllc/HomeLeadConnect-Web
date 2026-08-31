# HLC Public Entry & Account Discoverability

Baseline: `5146c3da3040b0093b8e5d76fcc3fc40c63415dc`
Classification: Post-launch enhancement

## Canonical app targets

- Sign In → `https://app.homeleadconnect.org/login`
- Create Account → `https://app.homeleadconnect.org/register`
- Request Service → `https://app.homeleadconnect.org/request-service`
- Open HLC → `https://app.homeleadconnect.org/app`
- Professional Application → `https://app.homeleadconnect.org/professional-application`
- Partners → `https://app.homeleadconnect.org/partners`
- Pricing → `https://app.homeleadconnect.org/pricing`

## Carrd placement contract

Every public Carrd page should expose account access without forcing a visitor to discover the app URL manually.

Recommended desktop header actions:
1. `Sign In` → canonical Sign In target.
2. `Create Account` → canonical Create Account target.
3. Keep the page-specific primary CTA, such as `Get Connected` or `Start My Request`, pointed at the appropriate workflow target.

Recommended mobile menu/footer actions:
- Sign In
- Create Account
- Get Connected / Request Service

The Carrd root and audience subdomains may keep their existing content and visual structure; this enhancement does not require redesigning the public ecosystem.

## App-side implementation

The app public home now exposes explicit Sign In and Create Account actions in the sticky account-access header, hero action row, business conversion section, and public resource link row. `/login` and `/register` remain the canonical routes.

## Release boundary

Carrd publishing is separate from the app release because Carrd is not directly writable from the connected development environment. Do not claim Carrd is updated until the live Carrd pages themselves are published and rechecked.
