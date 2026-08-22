# HomeLead Connect — Architecture

```text
HOMELEAD CONNECT LLC
│
│  Founder & Builder — Antoine Washington
├── PUBLIC FRONT DOOR
│   └── HomeLeadConnect.org
└── HOMELEAD CONNECT PLATFORM
    ├── CRM / Operations
    ├── Ken OS — Platform / orchestration layer
    ├── Kendrell — Executive Command AI
    ├── Dion — Operations & BI AI
    └── Diamond — Customer Experience & Community AI
```

## Separation Rules
- Ken OS is a system/platform capability.
- Kendrell is an AI executive persona/capability.
- These names are not interchangeable.
- HomeLead Connect remains the ownership and product-brand context for all platform capabilities.

## Routing Intent
- Executive/cross-company command context → Kendrell.
- Operations, queues, scheduling, assignments, exceptions, BI → Dion.
- Customer/community/service-experience context → Diamond.

## Current Production Facts
- Production app host: Cloudflare Pages, as governed by the current production handoff.
- Production data/auth source: the Supabase project explicitly certified in `CODEX_HANDOFF.md` and current environment configuration.
- Do not copy environment-specific IDs into public-facing materials.

## Verification Boundary
Current repository entrypoints, live runtime services, database schema/migrations, deployment state, and end-to-end AI routing must be re-verified when diagnosing production behavior.
