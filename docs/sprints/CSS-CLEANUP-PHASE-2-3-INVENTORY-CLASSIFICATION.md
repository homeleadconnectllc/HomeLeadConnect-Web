# HomeLead Connect CSS Visual Reset — PHASE 2-3 Inventory & Classification

**Sprint:** visual/mockup-authority-sprint-20260924  
**Date:** 2026-09-25  
**Commit:** b64507d1261600a9b0b4d6ec931792a695d39b87  

---

## PHASE 2: COMPLETE CSS INVENTORY MAPPED

### Global Entry Points

**src/main.tsx:**
- Line 1: `pathway-outline-effects-20260925.css` (global pathway accent effects)

**Public Routes (Lines 44-50):**
- Conditional load: `mockup-authority-20260924.css` + `home-no-glow-20260925.css` + `public-full-bleed-20260925.css`

**Authenticated Routes:**
- Entry: `app-shell-entry.ts` (structural + base animation guards)
- Presenter: `AuthenticatedStyles.tsx` (36 CSS imports + 2 current authorities)

### Entry Orchestration Chain

```
src/main.tsx
├── pathway-outline-effects-20260925.css (global)
└── Conditional Routing:
    ├── PUBLIC ROUTES:
    │   ├── mockup-authority-20260924.css (current public)
    │   ├── home-no-glow-20260925.css
    │   └── public-full-bleed-20260925.css
    │
    └── AUTHENTICATED ROUTES:
        ├── app-shell-entry.ts
        │   ├── shared-visual-primitives.css
        │   ├── src/index.css (root geometry)
        │   ├── workspace-nav.css
        │   ├── auth-methods.css
        │   ├── auth-mobile-final-authority.css
        │   ├── auth-session-hardening.css
        │   ├── launch-mobile.css
        │   ├── authenticated-mobile-shell-authority.css
        │   ├── agent-fallback-quiet.css
        │   ├── responsive-page-contract.css
        │   ├── legacy-device-compat.css
        │   └── final-release-guard.css
        │
        ├── authenticated-entry.ts (43 workspace-specific files)
        │   └── [All workspace & feature presentation layers]
        │
        └── AuthenticatedStyles.tsx
            ├── [OLD SPRINT-BASED LAYERS - 23 FILES - RETIREMENT TARGETS]
            ├── [Active feature layers - 36 files total from authenticated-entry]
            ├── signed-in-professional-system.css (CURRENT - loads LAST)
            └── connected-app-family-20260923.css (CURRENT - loads LAST)
```

---

## PHASE 3: CSS FILE CLASSIFICATION

### CURRENT VISUAL AUTHORITIES (Load Last - Intentionally Override All)

**These are the approved, current presentation authorities:**

| File | Lines | Status | Purpose |
|------|-------|--------|----------|
| `signed-in-professional-system.css` | 500 | ✅ KEEP | Current authenticated shell + navigation + portal styling |
| `connected-app-family-20260923.css` | 183 | ✅ KEEP | Pathway atmosphere + photography integration into authenticated product |
| `mockup-authority-20260924.css` | 241 | ✅ KEEP | Complete public site presentation (home, pathways, pages, forms, auth) |
| `pathway-outline-effects-20260925.css` | 53 | ✅ KEEP | Pathway card accent effects (resident/professional/partner/community) |

**Status:** All load after legacy layers to prevent regression. Protected from cleanup.

---

### STRUCTURAL / PROTECTED (Safety Guards - Never Delete)

**These contain geometry and structural protection, not presentation:**

| File | Lines | Status | Purpose |
|------|-------|--------|----------|
| `src/index.css` | 241 | ✅ PROTECTED | Root HTML/body/app geometry, navbar geometry, auth page geometry, form controls geometry |
| `shared-visual-primitives.css` | 39+ | ✅ PROTECTED | Runtime-calculated presentation classes (measurements, spacing, margins) |
| `workspace-nav.css` | ? | ✅ PROTECTED | Navigation layout geometry |
| `auth-methods.css` | ? | ✅ PROTECTED | Auth form layout and control geometry |
| `auth-mobile-final-authority.css` | ? | ✅ PROTECTED | Mobile auth geometry |
| `auth-session-hardening.css` | ? | ✅ PROTECTED | Session security (auth containment) |
| `launch-mobile.css` | 57 | ✅ PROTECTED | Mobile containment safety (min-width, overflow, box-sizing) |
| `authenticated-mobile-shell-authority.css` | ? | ✅ PROTECTED | Mobile shell safe-area and layout |
| `agent-fallback-quiet.css` | ? | ✅ PROTECTED | Agent UI fallback safety |
| `responsive-page-contract.css` | ? | ✅ PROTECTED | Responsive behavior contract |
| `legacy-device-compat.css` | ? | ✅ PROTECTED | Legacy device compatibility safeguards |
| `final-release-guard.css` | 54 | ✅ PROTECTED | Overflow clipping, max-width enforcement, mobile overflow protection |
| `frontend-readiness-contract.css` | ? | ✅ PROTECTED | Frontend readiness (overflow-x: clip) |

**Decision:** Never remove. These are structural safety guards, not visual debt.

---

### ACTIVE FEATURE PRESENTATION (Current Functionality)

**These represent active features loaded by authenticated-entry.ts:**

**Mobile & Shell Layers:**
- `mobile-message-shell-controls.css` — Active message shell
- `mobile-app-shell.css` — Mobile shell presentation
- `desktop-workspace-shell.css` — Desktop workspace container

**AI / Agent Layers:**
- `agent-team.css` — Agent team feature
- `contextual-agent-dock.css` — Agent contextual dock
- `agent-premium-v2.css` — Agent premium experience
- `agent-multilingual.css` — Agent multilingual support
- `agent-panel-width-contract.css` — Agent panel sizing
- `command-center-experience.css` — Command center interface
- `agent-proactive-briefing.css` — Agent proactive briefing
- `agent-tutorial.css` — Agent tutorial presentation
- `mobile-agent-placement-contract.css` — Mobile agent placement
- `agent-voice-playback-hotfix.css` — Voice playback fix

**Feature Layers:**
- `responsive-workflows.css` — Workflow responsiveness
- `responsive-ecosystem.css` — Ecosystem responsiveness
- `property-intelligence.css` — Property intelligence feature
- `analytics-hardening.css` — Analytics presentation
- `global-pull-refresh.css` — Pull-to-refresh gesture
- `global-smart-compose.css` — Smart compose UI
- `community-store.css` — Community store feature
- `community-match-deck.css` — Community matching feature
- `workspace-route-cleanup.css` — Route-based layout
- `lead-detail.css` — Lead detail view
- `e4-resources-sourcing.css` — E4 resources workspace
- `mobile-embedded-browser-authority.css` — Mobile browser embed
- `hlc-guidance-clickaway.css` — Guidance UI
- `map-lead-identity-pass.css` — Map identity feature
- `ux-ia-learning-library.css` — Learning library UI
- `ux-ia-parent-pages.css` — Parent pages UI

**Workspace-Specific Presentation:**
- `dashboard-application-workspace.css` — Dashboard workspace
- `leads-application-workspace.css` — Leads workspace
- `jobs-application-workspace.css` — Jobs workspace
- `calendar-application-workspace.css` — Calendar workspace
- `follow-ups-application-workspace.css` — Follow-ups workspace
- `automations-application-workspace.css` — Automations workspace
- `messages-application-workspace.css` — Messages workspace
- `call-center-application-workspace.css` — Call center workspace
- `network-map-application-workspace.css` — Network map workspace
- `community-application-workspace.css` — Community workspace
- `documents-resources-application-workspace.css` — Documents workspace
- `account-portals-application-workspace.css` — Account portals workspace
- `ai-team-application-workspace.css` — AI team workspace

**Status:** ✅ KEEP (actively supporting current features)  
**Note:** These files in `authenticated-entry.ts` are actively imported and support live features. Do not remove without feature verification.

---

### LEGACY SPRINT-BASED PRESENTATION LAYERS (Accumulated CSS Debt - RETIRE)

**These are stacked historical refinements that contradict the current visual authority. They load BEFORE the current authorities, so they are overridden, but they add payload and clutter:**

| File | Sprint/Era | Status | Reason to Retire |
|------|-----------|--------|------------------|
| `calendar-mobile-action-order.css` | Historical | 🔴 RETIRE | Superseded by current mobile & workspace authorities |
| `launch-messaging-simplification.css` | Historical | 🔴 RETIRE | Superseded by current message shell |
| `five-star-mobile-more.css` | Historical | 🔴 RETIRE | Superseded by current mobile shell |
| `mobile-a-plus-sprint-2-shell-closure.css` | A+ Sprint 2 | 🔴 RETIRE | Historical mobile refinement, overridden by current |
| `mobile-a-plus-sprint-4-community-messages.css` | A+ Sprint 4 | 🔴 RETIRE | Historical mobile refinement, overridden by current |
| `mobile-a-plus-sprint-5-community-participation.css` | A+ Sprint 5 | 🔴 RETIRE | Historical mobile refinement, overridden by current |
| `mobile-a-plus-sprint-6-account-portals-resources.css` | A+ Sprint 6 | 🔴 RETIRE | Historical mobile refinement, overridden by current |
| `mobile-a-plus-sprint-7-integrated-accessibility.css` | A+ Sprint 7 | 🔴 RETIRE | Historical mobile refinement, overridden by current |
| `mobile-a-plus-final-device-corrections.css` | A+ Final | 🔴 RETIRE | Historical mobile refinement, overridden by current |
| `provider-professional-profile.css` | Historical | 🔴 RETIRE | Historical feature patch, overridden by workspace authority |
| `e5-intelligence-sandbox.css` | E5 Experiment | 🔴 RETIRE | Experiment layer, overridden by current authority |
| `e6-trial-entitlements.css` | E6 Experiment | 🔴 RETIRE | Experiment layer, overridden by current authority |
| `hlc-unified-settings-index.css` | Historical | 🔴 RETIRE | Superseded by current settings authority |
| `hlc-dashboard-structural-correction.css` | Historical Correction | 🔴 RETIRE | Stacked correction on corrections, overridden |
| `hlc-structural-correction.css` | Historical Correction | 🔴 RETIRE | Stacked correction on corrections, overridden |
| `hlc-purpose-built-workspaces.css` | Historical Workspace | 🔴 RETIRE | Superseded by current workspace authorities |
| `hlc-desktop-mobile-nav-guard.css` | Historical Nav | 🔴 RETIRE | Superseded by current nav authorities |
| `universal-ai-team-launcher.css` | Historical AI | 🔴 RETIRE | Superseded by current AI team authority |
| `jobs-dashboard-a.css` | Old Workspace Iteration | 🔴 RETIRE | Superseded by current jobs workspace |
| `calendar-dashboard-a.css` | Old Workspace Iteration | 🔴 RETIRE | Superseded by current calendar workspace |
| `follow-ups-dashboard-a.css` | Old Workspace Iteration | 🔴 RETIRE | Superseded by current follow-ups workspace |
| `workflow-dashboard-a.css` | Old Workspace Iteration | 🔴 RETIRE | Superseded by current workflow workspace |
| `automations-dashboard-a.css` | Old Workspace Iteration | 🔴 RETIRE | Superseded by current automations workspace |
| `mobile-command-menu-rebuild-20260905.css` | Old Menu Rebuild | 🔴 RETIRE | Not the current menu authority, overridden |
| `dashboard-context-hero.css` | Old Hero Authority | 🔴 RETIRE | Superseded by current dashboard workspace |
| `system-build-tracker.css` | Build Artifact | 🔴 RETIRE | Build-time tracker, not presentation |

**Total Retirement Targets:** 26 files  
**Rationale:** All are overridden by current authorities (signed-in-professional-system + connected-app-family). Removing them:
- ✅ Reduces initial CSS parse payload
- ✅ Eliminates override complexity
- ✅ Clarifies visual ownership
- ✅ Prevents accidental visual regression if current authority loads before them

**Status:** 🔴 Ready for PHASE 4 Dependency Proof before removal

---

### SPECIAL CASE: Runtime Structural Safeguards

**File:** `public/runtime-structural-safeguards-20260919.css` (injected via index.html)  
**Status:** ⚠️ SPLIT REQUIRED

**Contains Both:**
- ✅ Legitimate structural protections (per Instruction 9):
  - Logo visibility safeguards
  - Auth containment rules
  - Drawer geometry
  - Mobile safe-area behavior
  - Work layout containment
  - Messaging constraints
  - AI workspace/chat containment

- 🔴 Obsolete presentation rules (to remove):
  - Retired visual styling mixed in

**Action:** Split into two files before removing presentation portion:
1. `runtime-structural-protection.css` — Keep legitimate structural safeguards only
2. Delete obsolete presentation inline from component CSS

---

## PHASE 4: Dependency Proof (Next Step)

Before removing any sprint-based file, must verify:

1. **Class Usage:** Search for `.class-name` usage in components/pages
2. **CSS Imports:** Search for filename imports in TypeScript
3. **Test Dependencies:** Verify tests don't assert on retired styles
4. **Selector Dependencies:** Check for :is()/:where() combining styles across files
5. **Functional Behavior:** Confirm no hidden structural behavior (animations, transitions, layout)

**Files to Probe:**
- 26 sprint-based retirement targets
- 1 runtime safeguards file (for splitting)

---

## SUMMARY

| Category | Count | Action |
|----------|-------|--------|
| **Current Authorities** | 4 | ✅ KEEP — Load last, prevent override |
| **Structural Protected** | 13 | ✅ KEEP — Safety guards, no presentation |
| **Active Features** | 50+ | ✅ KEEP — Support live functionality |
| **Legacy Sprint Debt** | 26 | 🔴 RETIRE — Overridden, add payload |
| **Safeguards to Split** | 1 | ⚠️ SPLIT — Keep structural, retire obsolete |
| **Total CSS Files (Estimated)** | 94+ | Reducing to ~68 after cleanup |

---

**Next:** PHASE 4 Dependency Proof → PHASE 5 Cleanup → PHASE 6 Normalization → PHASE 7 Verification → PHASE 8 Handoff
