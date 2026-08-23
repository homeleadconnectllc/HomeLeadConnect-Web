# HomeLead Connect — Pre-Launch Checklist

Date: 2026-08-23
Branch: `launch/final-global-ux-cert-20260823`
Target: `main`

This checklist is the launch decision record. A launch-critical item must be PASS, explicitly scoped for v1, or have a documented non-blocking limitation before production GO.

## A. Source and CI gates

- [ ] HLC Launch Candidate passes on the exact PR head.
- [ ] HLC Rendered Quality Gate passes on the exact PR head.
- [ ] Production dependency audit reports no high-severity production vulnerability.
- [ ] Acceptance tests include final global UX and voice continuity contracts.
- [ ] Production build succeeds.
- [ ] PR is mergeable against current `main` with no hidden conflict.

## B. Global signed-in visual system

- [ ] Navy/blue workspace surfaces use readable white primary copy and light-blue labels.
- [ ] White inputs/selects/textareas use dark charcoal ink, visible labels, visible borders, and focus states.
- [ ] White-on-white buttons, badges, cards, and empty states are eliminated.
- [ ] Large cards/panels/tiles use flat or near-square geometry; circles/pills are reserved for semantic badges, counts, avatars, and status indicators.
- [ ] Individual leads, customers, residents, providers, jobs, offers, messages, calls, referrals, notifications, and activity records have clear boundaries/dividers and spacing.
- [ ] Mobile bottom navigation never covers working controls or last records.
- [ ] Contextual Kendrell/Dion/Diamond floaters stay in a separate safe lane from business controls.
- [ ] General/system guidance uses the HLC mark instead of a generic `?` floater.
- [ ] Headings and primary page presentation remain aligned and understandable on phone and desktop.

## C. Core route usability

- [ ] Leads: records are individually separated and actions remain obvious.
- [ ] Leads: renter/homeowner/property-manager/other context can be captured and surfaced.
- [ ] Jobs: each job and offer is visibly distinct; status controls remain readable.
- [ ] Messages: history entries are distinct; composer has labels, spacing, controls, and bottom-nav clearance.
- [ ] Estimator/LeadScope: line items are compact, separated, readable, and usable on iPhone.
- [ ] Calendar: scheduling controls remain readable and reachable.
- [ ] Call Center / Manual Communications: individual contacts/history are distinct; operator controls remain readable.
- [ ] Provider Network / Map: horizontal navigation cannot overlap; provider rows are distinct.
- [ ] Provider Map: normal workflow is address/location-first; raw latitude/longitude is advanced management-only verification.
- [ ] Community surfaces: events, reviews, referrals, reports, groups, and empty states use the same readable record/form system.
- [ ] Profile/Settings/Portals/Documents/Help: no light-card leakage, clipped controls, or hidden bottom actions.

## D. Audience and service taxonomy

- [ ] Renters are explicitly represented in service intake and internal lead context.
- [ ] Homeowners are explicitly represented.
- [ ] Property managers/other household relationships remain representable.
- [ ] Professional intake explicitly supports contractors and subcontractors.
- [ ] Professional/service taxonomy includes movers, cleaners, HVAC, painters, roofers, handymen/home repair, electricians, plumbers, landscapers/lawn care, flooring, carpentry, siding/gutters, and other home-service trades.
- [ ] Provider search can find trade/location/address terms without inventing availability, ranking, distance, ETA, routing, dispatch, or live location.

## E. Voice / AI runtime

- [ ] Kendrell backend runtime certification remains PASS.
- [ ] Dion backend runtime certification remains PASS.
- [ ] Diamond backend runtime certification remains PASS.
- [ ] Single-authority playback prevents overlapping voices.
- [ ] Streamed PCM chunks schedule continuously and do not stop active playback between normal chunks.
- [ ] Odd PCM byte boundaries carry into the next network chunk.
- [ ] Explicit stop/new speech request is authoritative and can cancel prior playback.
- [ ] Physical iPhone smoke test confirms no overlap, skipping, premature cutoff, or repeated stale response during normal use.

## F. Workflow, security, communications, billing

- [ ] Golden backend workflow remains PASS.
- [ ] Auth and RLS certification remains PASS.
- [ ] Provider-network cross-workspace tenancy invariant remains deployed and PASS.
- [ ] Production email remains PASS.
- [ ] Device-native/manual calling and texting are presented truthfully as supported v1 communication behavior.
- [ ] Automated Twilio calling/SMS is not advertised as live until a workspace provider connection is actually configured and certified.
- [ ] Existing Stripe subscription remains valid without being disturbed for testing.
- [ ] Historical absence of a consent-backed enrollment record for the pre-existing subscription is documented rather than fabricated.

## G. Production deployment and smoke test

- [ ] Merge only after A passes.
- [ ] Cloudflare production serves the new `main` commit.
- [ ] Public home loads.
- [ ] Login works, including CAPTCHA configuration.
- [ ] Authenticated Command Center loads on iPhone.
- [ ] Leads, Jobs, Messages, Calendar, Profile, Manual Communications, Map, Estimator, and one Community route load on iPhone.
- [ ] One navigation/deep-link smoke test completes without a 404 or stale SPA shell.
- [ ] One non-destructive core workflow action completes successfully.
- [ ] Final physical-iPhone visual check shows no screenshot-level launch blocker.

## Launch decision

- [ ] GO — all launch-critical gates are PASS or explicitly scoped/documented for v1.
- [ ] NO-GO — any auth, persistence, payment-access, core navigation, RLS/security, severe readability, or unusable mobile workflow defect remains.
