# HomeLead Connect Visual System Reference

Status: Canonical implementation reference

This document records the approved visual direction for HomeLead Connect screens. It defines the design language, not a requirement to duplicate any one reference layout.

## Core environment

- Deep navy / charcoal continuous workspace
- HomeLead Blue for primary interaction and active navigation
- White used selectively for contrast, not as repeated floating-card walls
- Supporting neutral used for subdued text, dividers, metadata, and inactive states
- Subtle separators preferred over bright borders
- Compact, purposeful controls with restrained corner geometry
- Dense operating surfaces that still preserve readable breathing room
- Calm, premium, professional presentation rather than decorative SaaS card grids

## Brand ownership

HomeLead Connect remains the master brand across all product surfaces.

Department accents identify responsibility only:

- Kendrell — Amber `#F59E0B`
- Dion — Indigo `#6366F1`
- Diamond — Emerald `#10B981`

Department accents must not turn the agents into unrelated visual brands.

## Screen-family rules

### Auth

- One continuous account-access surface
- No giant white rounded card
- No nested footer card
- Tabs behave like navigation with understated active state
- Inputs and primary actions use restrained radius and height
- Footer/help copy must retain readable contrast

### Dashboards / operations

- Canvas-first layout
- KPI rails, rows, dividers, tables, and compact work queues instead of repeated floating cards
- Role color appears as a narrow accent, state, or metadata cue

### Tables / lists

- Quiet row separators
- Restrained hover state
- No bright boxed row treatment

### Calendar / messages / settings

- Continuous workspace structure
- Section hierarchy through spacing, typography, and dividers
- Inspectors/dialogs may be contained surfaces when containment is semantically useful

### Legal / contact / public utility screens

- Professional editorial hierarchy
- Broad flat sections with restrained boundaries
- Fewer decorative containers
- Consistent HLC typography and navigation

## Non-goals

- Do not copy a reference screen pixel-for-pixel.
- Do not introduce fabricated business metrics to make layouts look populated.
- Do not replace approved HLC logo artwork with generated approximations.
- Do not weaken accessibility, security, or workflow behavior for visual consistency.

## Implementation rule

Prefer shared visual authorities and screen-family contracts over page-specific emergency overrides. Any late-stage override must be narrow, documented, and protected by regression tests.
