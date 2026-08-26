# HomeLead Connect — Global Screen Layout System

Status: LOCKED DESIGN + UX PROGRAM STANDARD
Branch: postlaunch/global-five-star-quality-20260826

This document converts the HLC Five-Star Product Standard into a route-by-route screen architecture system. It applies to every public page, authenticated workspace, portal, modal, drawer, sheet, detail view, inspector, form, error/loading/empty state, mobile layout and desktop layout.

## Objective

Every HLC screen must be:
- immediately understandable;
- optimized around the user’s most likely task;
- easy to navigate without training;
- visually professional and recognizably HLC;
- creative where creativity improves the task rather than adding decoration;
- consistent enough to learn once, but specialized enough that every workflow uses the right interaction model;
- mobile-first and desktop-complete;
- evidence-first and honest about data, integrations, measurements and system state.

## Global hierarchy rule

Every screen follows this reading and action order unless a stronger task-specific reason is documented:

1. Where am I?
2. What matters right now?
3. What can I do next?
4. What records/evidence support the decision?
5. What changed recently?
6. What else can I inspect or do?
7. Where do I go next?

The most important information and primary action stay high in the reading order. Secondary controls move lower, into overflow, More, inspectors, or progressive disclosure rather than competing for attention.

## Global navigation model

### Mobile

Canonical bottom navigation remains limited to five parent destinations:
- Home
- Work
- Network
- Community
- More

Rules:
- Bottom navigation is always visually distinct from page content.
- Current location is obvious.
- Primary work never hides behind More when it is a common daily action.
- Global Search is easily discoverable from More and may be surfaced contextually where search is central to the task.
- Deep sub-pages use clear back/context navigation without replacing the five-parent mental model.
- Bottom navigation, agent launcher, alerts and keyboard must occupy separate safe viewport lanes.

### Desktop

- Persistent or collapsible grouped workspace navigation.
- Page title/context at top of work canvas.
- Search available without burying it.
- Detail-heavy routes may use list/detail or workspace/inspector split views.
- Desktop must use width productively, not stretch a narrow mobile column across the screen.

## HLC screen archetypes

Every route must choose one primary archetype. Mixing archetypes requires a documented usability reason.

### A. Command Center
Use for Dashboard, HQ and executive/operational overview surfaces.

Anatomy:
- status/priority strip;
- critical alerts;
- compact KPI rail;
- today/next queue;
- quick actions;
- agent summary;
- recent changes.

Avoid:
- giant hero branding;
- decorative card walls;
- making KPIs more prominent than work requiring action.

### B. Work Queue
Use for Leads, Jobs, Follow Ups, Notifications, moderation queues and similar operational lists.

Anatomy:
- compact title + count/status;
- search/filter/sort rail;
- dense readable rows;
- clear priority/status metadata;
- one obvious row-level next action;
- detail drill-in;
- useful empty state.

Mobile:
- rows become stacked record anatomy, not isolated floating bubbles.
- most important identity + status + next action remain visible without expanding.

Desktop:
- dense rows/table-like rhythm;
- optional detail inspector.

### C. Record Detail / Decision Workspace
Use for lead detail, job detail, provider detail, estimate detail and other single-record work.

Anatomy:
- identity + status + ownership;
- next recommended action;
- decision/action rail;
- timeline/history;
- related records;
- documents/evidence;
- communication shortcuts;
- agent context.

Avoid:
- duplicating the same metadata in multiple cards;
- hiding the next action below history.

### D. Builder / Calculator
Use for LeadScope, Estimate, forms/checklists, measurement and configuration workflows.

Anatomy:
- clear step/purpose;
- guided inputs;
- inline explanation/examples;
- live calculated output;
- evidence/confidence labels;
- review before irreversible write;
- save/progress state;
- next workflow handoff.

LeadScope Measure uses this archetype with progressive capture options:
- Scan project;
- Use camera;
- Enter measurements;
- Professional verification.

### E. Schedule / Time Workspace
Use for Calendar, appointments and time-bound follow-up planning.

Anatomy:
- today/current period context;
- upcoming/overdue distinctions;
- clear time/date controls;
- linked record context;
- reschedule/create actions;
- conflict/status feedback;
- mobile agenda-first mode where appropriate.

### F. Communication Console
Use for Messages, Call Center and manual communications.

Anatomy:
- conversation/call context;
- canonical history;
- participant identity;
- composer/action controls;
- disposition/outcome;
- follow-up handoff;
- delivery/evidence state.

Avoid:
- raw technical provider information in the main workflow;
- multiple competing composers.

### G. Discovery / Network
Use for provider directory, matching, map and profile discovery.

Anatomy:
- search + meaningful filters;
- result count/state;
- list/map relationship;
- provider identity, trade, service area, availability evidence;
- save/match/contact/open-profile actions;
- transparent confidence/eligibility state.

### H. Community / Participation
Use for Community Home, discussions, reviews, referrals, events and moderation.

Anatomy:
- clear participation mode;
- discovery/feed or queue;
- creation action;
- trust/safety tools;
- reporting/moderation access;
- context-aware Diamond assistance.

### I. Resource / Knowledge Workspace
Use for Documents, Help, Tutorials, Rules & Safety, forms and manuals.

Anatomy:
- search;
- categorized navigation;
- recent/relevant items;
- preview/detail;
- task handoff;
- contextual help links from operational routes.

### J. Settings / Administration
Use for Settings, Team, Billing, Company and Integrations.

Anatomy:
- grouped categories;
- current state first;
- plain-language consequences;
- permissions/authority labels;
- save/confirmation feedback;
- destructive action safeguards;
- no unnecessary dashboard-style cards.

### K. Public Conversion / Information
Use for public Home, Request Service, Professionals, Pricing, Trust and related public pages.

Anatomy:
- immediate value proposition;
- one primary action;
- proof/clarification;
- short task-oriented sections;
- clear transition into app or request flow;
- legal/trust context where relevant.

### L. Authentication / Recovery
Use for Login, Register, Forgot Password, Reset Password and invitation acceptance.

Anatomy:
- one focused task;
- minimal distractions;
- understandable alternate method;
- visible recovery path;
- safe autofill/password-manager behavior;
- clear success/error states.

## Action hierarchy

Every screen may expose many capabilities, but visual priority is limited:

- Primary: one dominant next action for the current task.
- Secondary: 1–3 nearby alternatives.
- Tertiary: overflow, More, secondary rail or inspector.
- Destructive: separated, clearly labeled and confirmed when necessary.

No screen should present 8 equally prominent buttons.

## Search standard

Search is a navigation and discovery tool, not an afterthought.

Global Search should support:
- work records;
- people/providers;
- tools/features;
- settings/resources.

Contextual search should be used on high-volume collections such as Leads, Jobs, Providers, Documents and Community.

Search UX should include useful suggestions/scopes where appropriate, preserve the current task, and avoid forcing users through navigation trees when they already know what they need.

## Creative feature-use standard

Creativity is encouraged when it shortens work or improves understanding. Examples:
- LeadScope camera/LiDAR/manual measurement tiers;
- smart next-action recommendations on records;
- map + list coordination for provider discovery;
- timeline-based job/lead history instead of scattered metadata;
- context-aware agent help rather than generic chat;
- actionable alerts that deep-link directly into the correct record/action;
- Smart Compose suggestions that remain optional and editable;
- role-aware quick actions;
- progressive disclosure of advanced controls;
- visual confidence/evidence labels for measurements, matches and integrations;
- guided empty states that create the first useful record rather than merely saying “No data.”

Creative interactions must not introduce ambiguity, hidden gestures, fake automation, accessibility barriers or decorative complexity.

## Visual composition rules

- Deep navy/blue continuous canvas.
- White used primarily for text and contained input/control surfaces, never giant page-sized backgrounds.
- No purple branding.
- Avoid generic SaaS card walls.
- Prefer spacing, alignment, dividers, rails and hierarchy over enclosing everything in boxes.
- Reserve rounded shapes for compact semantic controls such as avatars, status indicators, icon buttons and small input affordances.
- Official transparent circular HLC mark only.
- Agent launcher is circular/avatar-first when closed.
- Important content stays aligned to predictable columns/edges.
- Mobile first viewport must show useful work, not decorative branding.
- Desktop layouts should become more information-efficient rather than simply larger.

## Mobile quality requirements

At 320–430 CSS px:
- no page-level horizontal scroll;
- no clipped text/buttons/chips;
- 16px-or-larger form text to avoid unwanted iOS zoom where appropriate;
- comfortable touch targets and spacing;
- keyboard does not cover the primary input/action;
- bottom navigation clears content;
- agent/alert overlays clear navigation and keyboard;
- safe areas respected;
- long labels wrap or reflow intentionally;
- tables transform into usable mobile record structures.

## Desktop quality requirements

- meaningful multi-column use where it improves comparison or inspection;
- sidebar/group navigation remains clear;
- optional list/detail inspectors for dense operational work;
- no excessive max-width leaving critical application screens as tiny centered phone columns;
- keyboard/focus navigation works;
- hover only enhances, never reveals the only action;
- dense operational screens remain readable at laptop sizes.

## Empty, loading, error and success states

Every route must explicitly design all four.

Empty:
- explain what belongs here;
- offer the best first action.

Loading:
- communicate what is loading;
- avoid layout collapse/jump where possible.

Error:
- plain-language problem;
- preserve user input/work;
- recovery/retry or safe next step.

Success:
- confirm what changed;
- point to what comes next;
- avoid unnecessary modal celebration that interrupts work.

## Alerts standard

Every alert must answer:
- What happened?
- Why does it matter?
- What should I do?
- Where do I go?

Alerts deep-link to the relevant record/action when possible and must not expose backend jargon as user-facing copy.

## Agent placement standard

Agents enhance the route rather than becoming a second application over it.

- One contextual agent owner per authenticated shell.
- Closed state: compact circular avatar-first launcher.
- Open state: bounded panel/sheet with route context.
- No duplicate launcher while open.
- Agent identity chosen by work context.
- Agent should offer likely next help, not generic “How can I help?” everywhere.
- Agent recommendations never override authorization or evidence.

## Route review scorecard

Every route receives 0–2 points for each category:
- Clarity
- Navigation
- Task priority
- Visual hierarchy
- Mobile ergonomics
- Desktop efficiency
- Search/discovery
- Error recovery
- Accessibility
- Agent usefulness
- Alert usefulness
- Data/evidence transparency
- Backend wiring
- Performance
- Polish/brand consistency

Maximum: 30.

Release interpretation:
- 28–30: Five-Star candidate
- 25–27: acceptable only with documented minor follow-up
- 20–24: improvement required
- below 20: not a launch-quality route

A high design score cannot override broken authorization, backend wiring, security or physical-device defects.

## Review method

For every route:
1. Identify user + top task.
2. Assign screen archetype.
3. Capture current mobile + desktop state.
4. Score current state.
5. Identify highest-friction 1–3 issues.
6. Redesign around top task before adding features.
7. Verify navigation/search/agents/alerts.
8. Verify backend and authorization wiring.
9. Run automated and rendered checks.
10. Physical iPhone QA.
11. Desktop QA.
12. Rescore and record evidence.

## Non-negotiable outcome

HLC does not ship a route merely because it is functional. Every launch-critical route must be clear, navigable, professionally composed, visually consistent, task-efficient, accessible, wired end-to-end, and physically verified on the devices it claims to support.
