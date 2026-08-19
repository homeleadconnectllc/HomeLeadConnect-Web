# HLC Real-World Launch Acceptance

This is the final human/device acceptance track. It is intentionally narrow. Do not use it as a reason for broad feature work or cosmetic rewrites.

## Release decision

**PASS** when every required matrix row completes the core journey without a launch-blocking failure.

**BLOCK LAUNCH** only when a failure:

1. hides, covers, or materially obstructs a required control or core content;
2. loses data, mutates the wrong data, duplicates a committed action, or presents saved/complete state when the operation did not succeed;
3. traps keyboard focus, screen-reader focus, navigation, scrolling, or the user inside an overlay/modal;
4. communicates a materially false state that could cause an incorrect business action; or
5. makes a core journey substantially difficult to complete on a supported device/input mode.

Everything else is non-blocking launch follow-up unless repeated evidence shows it materially harms a core journey.

## Core journey

Use a real owner account and production-representative data. Record the device/browser, build SHA, result, and any issue/PR for each run.

**Sign in → Dashboard → Leads → open a lead → communicate → schedule work → create/open the related job → Dashboard**

At every step verify:

- the intended record remains selected and correctly associated;
- success is shown only after persistence succeeds;
- back/forward navigation does not lose or duplicate committed work;
- primary actions remain visible and reachable;
- loading, empty, disabled, and error states do not masquerade as success;
- fixed navigation, agents, menus, toasts, dialogs, and virtual keyboards do not cover the active control or required content.

## Required device/input matrix

| Surface | Required pass | Core checks | Result |
| --- | --- | --- | --- |
| Real iPhone, current Safari | Core journey | touch targets; safe areas; scrolling; virtual keyboard; dialogs; portrait + landscape | ☐ |
| Real Android phone, current Chrome | Core journey | touch targets; back behavior; scrolling; virtual keyboard; dialogs; portrait + landscape | ☐ |
| Tablet, Safari or Chrome | Core journey | responsive navigation; rotation; split/medium-width layout; dialogs; forms | ☐ |
| Desktop/laptop, current Chrome | Core journey | full-width hierarchy; navigation; forms; dialogs; no unexpected fixed overlays | ☐ |
| Desktop/laptop, keyboard only | Core journey | visible focus; logical tab order; Enter/Space activation; Escape/close behavior; no focus trap | ☐ |
| iPhone + VoiceOver | Smoke journey | sign in; dashboard; open lead; reach communication/schedule controls; meaningful names/states | ☐ |
| Android + TalkBack | Smoke journey | sign in; dashboard; open lead; reach communication/schedule controls; meaningful names/states | ☐ |

## Stress-data pass

Run the core surfaces with deliberately ugly but valid data:

- very long customer/company names;
- long email addresses and URLs;
- long unbroken-ish notes/messages;
- missing optional fields;
- many tags/status chips;
- large lead/job/message lists;
- long error text;
- long select/menu labels;
- dates/times near line-wrap boundaries.

**Pass criteria:** content may wrap or scroll, but it must not hide core controls, force destructive horizontal page scrolling, overlap fixed UI, or make record identity ambiguous.

## State checks

Trigger representative states on Dashboard, Leads, Messages, Schedule/Calendar, and Jobs:

- loading;
- empty/no-results;
- recoverable error;
- disabled/permission-limited action;
- successful save/send/create;
- failed save/send/create.

**Pass criteria:** each state is distinguishable, truthful, actionable when appropriate, and does not leave stale success UI behind after failure.

## Orientation and virtual-keyboard checks

On both real phones:

1. open a text-heavy form or message composer in portrait;
2. focus the lowest visible field and open the keyboard;
3. type, scroll, change fields, submit/cancel as appropriate;
4. rotate to landscape while the keyboard is open where the OS permits;
5. dismiss the keyboard and rotate back.

**Pass criteria:** the focused field and submit/cancel controls remain reachable; no permanent layout offset is introduced; no fixed element covers the field; reopening the keyboard remains usable.

## Accessibility smoke criteria

For keyboard, VoiceOver, and TalkBack:

- primary navigation and core actions have meaningful accessible names;
- current/selected/disabled state is conveyed programmatically;
- dialogs announce as dialogs and expose a reachable close path;
- focus moves into opened dialogs/sheets and returns sensibly when closed;
- validation/error feedback is discoverable without visual-only cues;
- no essential action requires hover, drag-only interaction, or precise pointer placement.

Automated Lighthouse/CI results support this pass but do not replace it.

## Acceptance record

For each run capture:

- date/time;
- tester;
- device + OS;
- browser + version;
- deployed build SHA/environment;
- PASS/BLOCKED;
- blocking step, if any;
- screenshot/screen recording when useful;
- linked issue/PR for every blocker.

### Final sign-off

- ☐ iPhone core journey passed
- ☐ Android core journey passed
- ☐ Tablet core journey passed
- ☐ Desktop core journey passed
- ☐ Keyboard-only journey passed
- ☐ VoiceOver smoke passed
- ☐ TalkBack smoke passed
- ☐ Portrait/landscape + virtual-keyboard checks passed
- ☐ Stress-data pass passed
- ☐ Production-data owner journey passed
- ☐ No unresolved launch-blocking acceptance failures

When all boxes are checked against the exact release candidate SHA, frontend real-world acceptance is complete.