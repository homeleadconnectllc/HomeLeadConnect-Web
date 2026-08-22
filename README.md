# HomeLead Connect

HomeLead Connect LLC builds a connected service platform for residents, service professionals, businesses, and partners.

**Public front door:** HomeLeadConnect.org  
**Public tagline:** **Smarter Connections. Better Service Experiences.**

## Canonical Platform Architecture

```text
HOMELEAD CONNECT LLC
│
├── Public Front Door
│   └── HomeLeadConnect.org
│
└── HomeLead Connect Platform
    ├── CRM / Operations
    ├── Ken OS — platform / orchestration layer
    ├── Kendrell — Executive Command AI
    ├── Dion — Operations & BI AI
    └── Diamond — Customer Experience & Community AI
```

HomeLead Connect is the master brand. Kendrell, Dion, and Diamond are specialized AI capabilities within the platform, not independent product brands.

## Application Stack

The current web application uses:

- React 19
- TypeScript 6
- Vite 8
- React Router 7
- Supabase Auth + Postgres + RLS
- TanStack Query
- React Hook Form + Zod
- Framer Motion

Production environment and data-source details are governed by `CODEX_HANDOFF.md` and current environment configuration. Do not copy internal environment identifiers into public-facing materials.

## Development

```bash
npm install
npm run dev
```

## Verification

Run the full launch verification suite before declaring a change launch-ready:

```bash
npm run verify:launch
```

This runs linting, acceptance tests, the static launch audit, and the production build.

## Governance

Canonical project governance is maintained in:

- `docs/governance/PROJECT_TRUTH.md`
- `docs/governance/ARCHITECTURE.md`
- `docs/governance/AI_GOVERNANCE.md`
- `docs/governance/BRAND_SYSTEM.md`
- `docs/governance/ASSET_REGISTRY.md`
- `docs/governance/DECISION_LOG.md`
- `docs/governance/ROADMAP.md`

`PROJECT_TRUTH.md` contains verified/current governing facts. `ROADMAP.md` contains planned work and must not be treated as production truth.

## Public / Private Boundary

Public materials should communicate benefits, outcomes, trust, and product value. Proprietary workflows, internal AI implementation, database design, infrastructure, orchestration, security-sensitive details, and competitive implementation specifics remain private unless explicitly approved for disclosure.
