# LeadScope Measure — Product Map

Status: ACTIVE POST-LAUNCH FEATURE TRACK

## Goal
Turn LeadScope into a measurement-backed pre-estimate product that produces useful project intelligence before an in-person visit while preserving an honest boundary between preliminary HLC estimates and final professional proposals.

## User experience

### Entry
LeadScope → Measure Project

User sees three plain-language options based on capability:
1. Scan my room/project — supported native depth/LiDAR capture.
2. Use my camera — guided photo-assisted measurement and confirmation.
3. Enter measurements — guided manual dimensions.

A fourth path is always available:
4. I need a professional to verify this.

The system chooses the easiest supported path but never hides alternatives.

## Capture tiers

### Tier A — Native depth / LiDAR
Best-confidence remote capture.
- iOS native companion/App Clip or future native HLC app.
- RoomPlan for interior room capture where applicable.
- ARKit scene depth for point/depth measurements on supported LiDAR devices.
- Guided sweep with real-time progress cues.
- Captures walls/openings/room geometry where supported.
- Stores device capability and capture provenance.
- Evidence label: Device measured.

### Tier B — Guided camera capture
For devices without supported depth capture.
- Camera/photo workflow.
- User chooses the surface/object to measure.
- Calibration/reference step where technically valid.
- Edge/point confirmation.
- Retake guidance for poor angles/light.
- Result must state its confidence and method.
- Do not label Device measured unless the capture method produced validated dimensional evidence.

### Tier C — Guided manual ruler
Universal fallback.
- Plain-language fields with diagrams/instructions.
- feet/inches entry.
- common-room presets.
- customer confirms each dimension.
- Evidence label: Customer confirmed.

### Tier D — Professional verification
For structural, hidden, irregular, unsafe, inaccessible, exterior/high-elevation, code-sensitive, or low-confidence conditions.
- Create a verification task/appointment.
- Carry all existing photos and measurements forward so the professional starts with context.
- Evidence label: Needs professional verification.

## Measurement objects

V1 dimensions:
- length
- width
- height
- opening width/height
- object width/height/depth

Derived values:
- floor area
- perimeter
- wall area
- ceiling area
- volume
- opening deductions
- waste-adjusted material quantity
- linear footage

Future trade calculators:
- flooring/tile
- paint/drywall
- trim/baseboard
- roofing
- siding
- fencing
- countertops
- windows/doors
- concrete
- landscaping
- moving volume

## Evidence contract
Every stored measurement records:
- value
- unit
- dimension type
- source method
- evidence label
- capture timestamp
- user/actor
- device capability where available
- confidence where available
- related photo/scan evidence
- professional verification status
- superseded/corrected measurement history

Allowed evidence labels:
- Device measured
- Customer confirmed
- Estimated
- Needs professional verification

## Estimate pipeline
Measurement → derived quantity → scope item → unit-price/labor rule → preliminary total → confidence/risk review → customer report → optional provider/professional verification → final proposal.

Never silently convert an estimated measurement into verified evidence.

## Paid-product packaging
Potential commercial packaging (pricing requires separate business/legal decision):
- Basic LeadScope intake — free.
- Measurement report — paid or promotional.
- Measurement + preliminary estimate — paid.
- Detailed LeadScope package — measurements, quantities, photos, scope and match readiness.
- Fee credit — measurement/estimate fee may be credited toward a booked project if business rules support it.

Do not market preliminary HLC output as a binding contractor quote unless the authorized professional/business workflow supports that claim.

## Alerts
Potential alerts:
- Measurement started but incomplete.
- Measurement confidence too low.
- Missing required dimension.
- Scan/photo retake required.
- Measurement ready for review.
- Professional verification required.
- Measurement superseded.
- Preliminary estimate ready.
- Customer viewed estimate.
- Customer requested provider verification.

## Agent roles
- Diamond: guides resident through capture in simple language and catches confusion.
- Dion: turns verified dimensions into quantities/scope intelligence and flags operational gaps.
- Kendrell: highlights business/risk exceptions and prevents unsupported final-quote claims.

## V1 already implemented on this branch
- deterministic room-measurement math
- floor area, perimeter, wall area, volume
- waste-adjusted material quantity
- evidence states
- evidence labels
- verification guard against calling estimated input a device measurement
- reusable LeadScope Measure UI component
- unit tests for measurement math/evidence

## Next implementation gates
1. Mount LeadScope Measure into the existing `/estimator` workflow.
2. Add measurement persistence schema with workspace/RLS boundaries.
3. Link measurements to lead + estimate.
4. Add opening deductions and additional surfaces.
5. Feed derived quantity into estimate lines deliberately (user review before write).
6. Add report/export representation.
7. Add notifications/alerts.
8. Build guided camera fallback.
9. Prototype native iOS RoomPlan/ARKit companion for supported devices.
10. Validate accuracy ranges by project type before paid marketing claims.
11. Physical QA on supported LiDAR device and non-LiDAR fallback device.
12. Security/privacy review for camera imagery and spatial data.
