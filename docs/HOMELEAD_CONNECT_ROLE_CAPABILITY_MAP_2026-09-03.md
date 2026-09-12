# HomeLead Connect Role and Capability Map

Date: 2026-09-03
Status: ACTIVE IA SOURCE OF TRUTH FOR ROLE PLACEMENT

## Rule

HomeLead Connect is one platform with different experiences by participant. A route does not automatically become a navigation item. Every capability must have an owner, audience, parent area, and correct depth.

Classify every existing or discovered capability as one of:
- top-level parent area;
- child page;
- detail screen reached from a record;
- contextual panel/action;
- role-only portal feature;
- SaaS/account administration;
- shared feature exposed only where authorized.

Never flatten the application into feature beside feature.

## Resident experience

Primary purpose: request help, understand service progress, communicate, manage property context, use resident-only tools, and participate in approved shared experiences.

Resident Portal
- Home / overview
- Requests
  - request detail/status
  - related appointments
  - related service job/status
  - related documents
- Appointments
- Jobs / service progress
- Properties
  - property information
  - matches where authorized
- LeadScope — paid resident SaaS capability
  - start measurement
  - supported phone/camera measurement flow
  - review dimensions/evidence
  - project scope
  - informational self-estimate
  - saved LeadScope results
  - entitlement/upgrade boundary
- Documents
- Messages
- Community
- Resources/help
- Profile/account/settings

Resident users do not receive internal CRM queues, workspace administration, provider assignment controls, internal analytics, or operational line-item estimating unless a separate authorized role grants them.

## Professional / provider experience

Primary purpose: maintain provider identity and service capability, receive eligible work, execute assigned work, communicate, schedule, document, learn, and participate in Community.

Professional Portal
- Home / work overview
- Profile
- Services
- Service areas
- Availability
- Eligibility / matching state where appropriate
- Opportunities / offers
  - offer detail
  - accept / decline when authorized
- Assignments / jobs
  - job detail
  - schedule
  - authorized customer/property context
  - documents
  - completion
- Team where provider account supports it
- Messages / calls and communication where authorized
- Documents
- Academy
- Community
- Resources
- Account/settings

Professional users do not receive internal HomeLead Connect owner/admin controls unless separately authorized.

## Partner experience

Primary purpose: partner-specific collaboration without exposing the internal CRM or provider portal wholesale.

Partner Portal
- partner overview
- authorized partner records/workflows
- partner-specific documents/messages/status
- account/profile as implemented

Internal partner management remains an authorized business/workspace capability, not a partner-facing screen.

## Internal HomeLead Connect / CRM experience

Primary purpose: operate requests from intake through completion using canonical records.

Home
- Dashboard attention surface
- important alerts
- upcoming work
- short summaries / quick actions

Work
- Work Home
- Leads
  - Lead Detail
    - contact/request context
    - activity/history
    - Follow-Up actions
    - Operational Estimate entry point
- Operational Estimates
  - existing `/estimator` line-item tool
  - materials/work descriptions
  - quantities
  - unit costs
  - markup
  - estimate status
  - save
  - convert accepted estimate to Job
  - this capability is NOT LeadScope
- Follow-Ups
- Jobs
  - Job Detail
  - assignment/provider context where implemented
  - schedule context where implemented
  - completion/status
- Calendar
- Matching / eligibility
- Provider directory / operational provider context
- Workflow
- Calls & Texts / Call Center
- Documents

Internal CRM navigation should expose parent work areas. Detail screens are reached from their parent records instead of becoming equal navigation destinations.

## SaaS / platform administration

Primary purpose: make HomeLead Connect usable as a secure multi-user software service.

Account & Workspace Administration
- personal Profile
- Settings
  - Workspace
  - Team
  - roles / permissions
  - invitations
  - subscription / Billing
  - trial / entitlement state
  - integrations where implemented
  - security/preferences where implemented
- workspace activity/audit where authorized
- system health / approvals for owner/admin roles

SaaS administration is not ordinary CRM navigation. Billing, roles, tenancy, permissions, subscription state, and workspace controls sit under account/settings/administration.

## Shared authorized experiences

These may appear to more than one role, but placement and available actions depend on role.

Messages
- conversation list
- active conversation
- contextual details

Community
- Community Home
- Discover
- Provider Directory
- Map
- saved relationships
- discussions
- reviews
- referrals
- events
- groups
- challenges
- moderation only where authorized

Resources
- Resources Home
- materials
- suppliers
- forms/checklists
- help
- tutorials
- rules/safety
- documents only where the role's document context permits

Academy
- Academy Home
- paths
- practice
- CONNECT roleplay
- library
- certifications
- progress

AI Team
- Kendrell: owner command, risks, approvals, business overview
- Dion: CRM/operations, providers, scheduling, workflow, analytics
- Diamond: resident/professional experience, Community, Messages, onboarding, reviews/referrals
- contextual access should appear inside relevant work instead of forcing a user to leave the current task

Analytics
- authorized business intelligence only
- Overview
- Forecasting
- Sandbox

## Route placement audit from current router

Current route existence does not equal final navigation placement. Existing router families already support nested behavior and must be mapped accordingly:

- `/leads/:leadId` is a Lead child/detail screen.
- `/jobs/:jobId` is a Job child/detail screen.
- `/documents/scan` is a Documents child action/screen.
- `/analytics/forecasting` and `/analytics/sandbox` are Analytics children.
- `/academy/*` routes are Academy children.
- `/community/*` routes are Community children.
- `/homeowner-portal/*` routes are resident portal children.
- `/contractor-portal/*` routes are professional portal children.
- `/settings/billing` and `/settings/workspace` are Settings/SaaS children.
- `/providers/:providerId` is a provider detail screen.
- `/network/service-areas`, `/network/availability`, `/network/eligibility`, `/network/saved` belong under provider/network/community discovery context rather than top-level navigation.
- `/estimator` is the internal operational estimate surface and must not be presented as resident LeadScope.

## LeadScope correction

LeadScope belongs to the resident feature tree. It is a paid resident SaaS capability centered on phone/camera measurement and resident self-estimating.

The existing operational estimator belongs to internal Work/CRM and remains tied to estimate persistence and job conversion.

Do not merge these concepts merely because both produce an estimate-like result.

## Release rule

Before any route is promoted or declared finished, verify:
1. correct participant/role;
2. correct parent area;
3. correct depth (parent, child, detail, contextual action);
4. no duplicate canonical record ownership;
5. role/access enforcement remains fail-closed;
6. mobile navigation exposes only primary parent areas;
7. desktop navigation groups children under their parents;
8. no missing feature is advertised as live;
9. paid capabilities have a proven entitlement boundary before exposure.

## Current priority

Use this role map while finishing the current production-refinement sequence. Do not pause the visual/certification program to invent missing backend systems. Correct placement/naming where safe; record missing/unproven functionality as a gap and continue toward the live checkpoint.