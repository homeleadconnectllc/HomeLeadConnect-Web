# HLC Mobile A+ Blueprint

Status: LOCKED
Date: 2026-08-26
Branch: `postlaunch/mobile-a-plus-20260826`
Base exact release candidate: `d19a826545e454306e776fe20f0aaf5a840ff3ab`

## Governing rule

Every important HLC capability must be A+ on mobile in its mobile-native form. Full mobile capability does not require identical desktop presentation.

The production release line remains frozen. This branch is post-launch enhancement work only until explicitly promoted.

## A+ Core

- Five-tab navigation: Home / Work / Network / Community / More.
- Action-focused Home command center.
- Contextual Kendrell / Dion / Diamond agent.
- Universal search and command.
- Native HLC Calendar.
- Lead/job contextual quick actions.

## A+ Power

- Swipe shortcuts with visible fallback actions.
- Voice notes and dictation.
- Offline/retry queue for field work.
- Customizable Home widgets.
- Advanced mobile analytics.
- Saved scroll/filter/view state.
- Draft recovery.
- Fast optimistic interactions for safe reversible actions.

## A+ Professional

- Large-data workflows transformed into mobile record views.
- Sorting, filtering and search.
- Expandable details.
- Bulk selection mode.
- Dense administration through progressive disclosure.
- Bottom-sheet actions.
- Role-filtered controls.
- Horizontal data/table mode only when genuinely useful.

## Global shell standard

- Persistent bottom navigation: Home / Work / Network / Community / More.
- Compact headers; no desktop sidebar forced onto iPhone.
- Minimum 44-48px interactive targets.
- No more than two visible primary record actions; secondary actions live behind overflow.
- Safe-area aware bottom spacing.
- Fixed UI elements may not overlap each other, page content, the keyboard or the home indicator.
- Contextual agents use one relevant entry point rather than multiple floating bubbles.
- Search/command is globally reachable.
- Every major route has loading, success, empty, error, permission and offline states.

## Home

Purpose: answer `What needs me next?`

Order:
1. Needs Attention: urgent leads, overdue follow-ups, unread messages, job exceptions, failed automations, approvals.
2. Today: next appointment, current/next job, calendar summary, upcoming follow-up.
3. Quick Actions: New lead, Schedule, Message, New job, More.
4. Agent Briefing: one compact role/context-aware Kendrell, Dion or Diamond summary.
5. Recent Work: last touched records.
6. Optional widgets: pipeline, jobs, calendar, messages, revenue, provider activity, community, agent summary.

Customization supports reorder, hide, pin and compact/expanded states without turning Home into a card wall.

## Work

Primary children:
- Golden Workflow
- Leads
- Jobs
- Calendar
- Follow-ups
- Automations
- Estimates / LeadScope when relevant

Mobile uses a compact section rail or hub-to-detail flow rather than giant stacked destination cards.

### Leads

List rows show identity, service/project type, location, status, next action/age and one important indicator.

Primary actions: Call + Next step.
Secondary actions: Message, Schedule, Create job, LeadScope, Assign and other actions behind overflow.

Swipe may expose Call/Message or Complete/Disposition, with visible fallback controls.

Filters open in a bottom sheet and include status, age, source, service, owner, geography, priority, date and saved filters.

Lead detail sections: Overview, Scope, Activity, Appointments, Estimates, Related job, Documents, Notes.

Offline-safe queue candidates: notes, dispositions, follow-up creation and safe status changes.

### Golden Workflow

Mobile is a guided operating sequence, not a squeezed desktop flowchart.

Request -> Lead -> Scope -> Provider -> Schedule -> Job -> Completion.

Show current stage, blockers, missing requirements, next action, owner and timeline.

### Jobs

List rows show job, customer, provider, date, status and next action.

Primary actions: Update + Schedule.

Detail sections: Overview, Schedule, Scope, Documents, Communications, Activity, Completion.

Mobile update sheet supports status, completion, delay, reschedule, note and issue.

Offline queue candidates: field notes, completion checklist, photos and safe status updates.

### Calendar

HLC native calendar remains authoritative.

Keep Day / Week / Month, distinct today/selected/significant-date states, job appointments and HLC-native events.

Mobile enhancements may include agenda day swipe, quick event sheet, filters, cached recent calendar and draft event creation.

### Follow-ups

Group Overdue, Today, Upcoming and Completed.

Swipe shortcuts: Complete and Snooze.
Visible actions: Contact and Complete.

Quick complete sheet captures outcome, disposition, next date and note.

### Automations

Mobile is the control surface: active automations, failures, upcoming runs, last run, pause/resume, safe manual run and audit history.

Advanced visual multi-step editing remains desktop-specialized while every operation stays reachable on mobile.

## Network

Primary children: Matching, Providers, Map, Profiles, Saved.

Search-first entry with filters, saved providers and map/list toggle.

### Matching

Use one candidate at a time or compact ranked rows.
Show provider, trade, service area, availability, match reasons, confidence and verified trust metrics.

Primary: Match + Save.
Secondary: Profile, Message, Map, Skip.

### Provider Directory

Rows: provider, trade, distance/service area, availability, status and one trust metric.

Filters: trade, area, availability, rating, saved and service radius.

Provider detail sections: Overview, Services, Coverage, Availability, Reviews, Jobs, Documents, Contact.

### Map

Map occupies the primary surface with a draggable bottom result sheet.
Controls: Search area, Filters, My location, Recenter, List mode.

No permanent desktop side panel on compact screens.

## Community

Primary children: Feed, Discussions, Campaigns, Events & Updates, Reviews, Referrals and role-gated Moderation.

Content-first presentation rather than dashboard card walls.

### Discussions

Rows show title, author, category, replies and latest activity.
Thread view prioritizes readable content and replies. Diamond is the contextual agent.

### Campaigns

Tabs: Active, Upcoming, Templates, Completed, Analytics.
Campaign record: Overview, Audience, Content, Actions, Schedule, Results.

Creation is a recoverable mobile wizard: Goal -> Audience -> Channel -> Content -> Schedule -> Automation -> Review.

### Events & Updates

Date-grouped list with RSVP, save-calendar, share and related campaign actions.

### Reviews

Views: Recent, Needs response, Positive, Critical.
Quick actions: Reply, related record, flag/report.

### Referrals

Views: Pending, Accepted, Converted, Closed.
Rows show referrer, referred party, status and outcome/value where appropriate.

### Moderation

Role-gated queue with content preview, reporter, reason, age and severity.
Review sheet supports context, resolve, dismiss and escalate. Bulk mode supported.

## More

Grouped long-tail navigation, not a giant flat list.

Communications: Messages, Call Center, Calls & Texts.
Resources: Documents, Help Center, Tutorials, Rules & Safety.
Account: Profile, Resident Portal, Professional Portal, Company/Team.
Administration: Settings, Integrations, Billing, Device Alerts.
AI: AI Team, Kendrell, Dion, Diamond.

Search appears at the top.

## Messages

Conversation list shows contact, latest message, unread state, time and channel.
Swipe: mark read / archive.

Conversation view is full-height with safe keyboard clearance and sticky composer.
Composer supports text, voice, attachment and send.

Voice notes support record, timer/waveform, cancel, preview, send and transcription where supported.
Draft recovery is mandatory.

## Call Center

Mobile prioritizes execution: contact, context, call action, script, disposition and next action.
After-call disposition uses a one-step sheet.

## Calls & Texts

Show contact, channel, permission/consent state, provider launch action and outcome logging.
Never imply browser telephony when it is not actually connected.

## Documents

Searchable/filterable rows show filename, type, linked record, date and sharing state.
Mobile upload entry supports camera, photo library, files and scan where browser/device support exists.

Context is preserved when uploading from a lead/job.
Offline upload retries are visible.

## Help / Tutorials / Rules

Search-first with categories, recent items and contextual help.
Agents may explain approved content but never replace official rules.

## Profile / Portals / Team

Profile uses grouped vertical sections and safe draft preservation.

Resident Portal prioritizes requests, appointments, messages, documents, provider relationship and decisions. Diamond owns contextual guidance.

Professional Portal prioritizes opportunities, jobs, schedule, messages, profile, availability, documents and reviews. Dion owns contextual guidance.

Company/Team uses a list-first mobile view, progressive permission detail and no forced matrix view.

## Settings / Billing / Integrations / Device Alerts

Settings groups Account, Workspace, Notifications, Communications, Integrations, Security, Appearance and Billing and includes settings search.

Billing remains fully capable on mobile and shows authoritative plan, status, renewal, payment state, invoices and entitlements. Consequential financial actions require confirmation.

Integrations show Connected / Needs attention / Not connected / Unsupported / Verification unavailable. Never fabricate green connection states.

Device Alerts show permission state, enabled categories, quiet hours and test action where supported.

## AI Team

Team screen: Kendrell, Dion, Diamond with role, status, latest briefing and workspace entry.

Agent room: context header, transcript, quick prompts, voice/dictation and composer. Do not render a second floating chat bubble once the room is open.

## Universal Search / Command

Prompt: `Search HLC...`

Grouped results may include Leads, Jobs, Providers, People, Appointments, Messages, Documents, Community, Settings and Commands.

Commands may include New lead, Schedule appointment, Create follow-up, Message contact, New job, Open today and Show overdue follow-ups, subject to permissions.

Recent searches and recent commands are preserved.

## Advanced mobile analytics

Default pattern: KPI + change + compact trend. Tap to drill into chart, filters, breakdown, explanation and related records.

Useful domains: lead volume, conversion, response speed, scheduled work, completion, provider performance, revenue/billing, community engagement and source attribution.

`Why did this change?` agent insight is allowed only when backed by real data.

## Large-data / table mode

Default compact mode is record rows.
Expanded mode opens full record detail.
Optional data mode may use horizontal grid with frozen first column, column chooser, sort, filter, search, bulk select and authorized export.

Never use the raw grid as the default mobile presentation.

## Bulk selection

Enter via Select or long-press. Show selected count and a bottom action bar.
Candidate actions: complete, assign, archive, mark read, tag, export. Destructive bulk actions require confirmation.

## Offline / retry subsystem

Global states: Online, Offline, Syncing, N pending.

Retry center shows pending item, type, time, state, retry and cancel.

Good queue candidates: notes, drafts, photos, message drafts, completion checklists, safe status changes and form drafts.

Do not silently queue billing, destructive deletion, high-risk AI writes or irreversible automation execution.

## Saved state / recovery

Preserve scroll position, filters, selected tabs, Calendar date/view, Network map position, search state, draft text and expanded sections where appropriate.

## Motion / feedback

Use restrained press feedback, row confirmation, sheets, progress, skeletons, success feedback and subtle device haptics where available. Avoid decorative bouncing or excessive motion.

## Performance

- Major mobile routes should render meaningful content quickly.
- Interaction feedback must be immediate.
- Target INP <= 200ms at the 75th percentile.
- Lazy-load heavy maps, analytics and desktop-specialized modules.
- Do not load desktop-only complexity simply because a route exists.

## Desktop-specialized presentation

Desktop may remain superior for side-by-side comparison, many-column inspection, broad analytics canvases, complex automation builders, multi-record management, bulk configuration and simultaneous map/list/inspector layouts.

Every core operation must still be reachable on mobile.

# Execution program

Each sprint is cumulative. A sprint does not advance with a known regression in completed A+ behavior.

Each sprint gets:
1. Isolated exact head.
2. Static/type/build/acceptance CI.
3. Rendered mobile quality verification.
4. Physical iPhone visual QA when the change materially affects presentation or interaction.
5. Defect-only correction until clean.
6. Freeze before advancing.

## Sprint 1 — Shell + Home + Universal Search

- Preserve five-tab canonical mobile IA.
- Normalize safe areas, bottom clearance and compact headers.
- Build action-focused Home structure.
- Add globally reachable search/command entry.
- Create command/search result architecture that respects route permissions.
- Ensure contextual agent placement does not collide with nav or keyboard.

Exit: shell stable, Home useful, global search usable, no overlap/white-screen regressions.

## Sprint 2 — Work + Quick Actions + Gestures

- Leads, Jobs, Follow-ups and Golden Workflow compact-native layouts.
- Maximum two primary visible record actions.
- Overflow action menus.
- Swipe shortcuts with visible fallback controls.
- Bottom-sheet filter/sort/status/disposition flows.

Exit: common work can be executed quickly with one-handed navigation.

## Sprint 3 — Network + Map + Filters

- Search-first Network.
- Compact provider result rows.
- Match/save flow.
- Map plus draggable result sheet.
- Bottom-sheet filtering and list/map state preservation.

Exit: provider discovery/matching fully operable without desktop sidebars.

## Sprint 4 — Community + Communications

- Feed/discussions/campaigns/events/reviews/referrals/moderation mobile-native views.
- Messages full-height composer and conversation state.
- Voice-note input foundation.
- Call Center / Calls & Texts execution layouts.

Exit: communications and community workflows are first-class on mobile.

## Sprint 5 — Offline + Drafts + Saved State

- Shared draft persistence.
- Shared view-state persistence.
- Offline status.
- Retry queue and retry center for safe operations.
- Visible failure/recovery states.

Exit: interrupted field work survives connection loss, navigation and reloads where safe.

## Sprint 6 — Analytics + Professional Admin

- Compact KPI/trend/drill-down analytics.
- Large-data row mode plus optional table mode.
- Bulk select/action framework.
- Progressive admin controls.
- Role-filtered team/settings/billing/integration surfaces.

Exit: advanced professional workflows remain fully capable on iPhone.

## Sprint 7 — Full-route iPhone QA + Performance

- Route-by-route iPhone visual audit.
- Touch-target audit.
- Keyboard/safe-area/fixed-layer audit.
- State restoration audit.
- Offline/retry audit.
- Lighthouse/rendered-quality/performance regression review.
- Accessibility review.

Exit: Mobile A+ candidate has exact-head automated evidence and human iPhone visual certification.

# Release discipline

- `main` is never modified by this program without explicit production approval.
- The frozen release candidate is not rewritten for mobile polish.
- New mobile work lives only on this branch or child sprint branches until promoted deliberately.
- No quality threshold may be lowered to make a sprint pass.
- CI green is not a substitute for external-provider proof or physical-device visual QA where those are required.
