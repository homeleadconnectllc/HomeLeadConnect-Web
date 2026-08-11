# HLC communications compliance basis

Status: implementation input for Pennsylvania V1; attorney review required before production outbound communications.

HLC's deterministic communication gate is deny-by-default. It records the requested channel, purpose, direction, automation/voice/recording flags, provider readiness, consent evidence, suppression state, DNC screening state, decision, reasons, actor, workspace, and timestamp. AI and transport adapters must not bypass that result.

The gate distinguishes service, appointment, lead-follow-up, and marketing purposes. That distinction matters because the FTC describes purely informational calls differently from calls made to induce a purchase, and Pennsylvania identifies exceptions to its telephone-solicitation definition. The software does not infer that a call qualifies for an exception; uncertain marketing/DNC cases return `REVIEW`.

Current official implementation sources:

- FTC, “Complying with the Telemarketing Sales Rule”: calling-time restrictions, entity-specific and National Do Not Call duties, caller-ID and abandonment requirements. https://www.ftc.gov/business-guidance/resources/complying-telemarketing-sales-rule
- FTC, Telemarketing Sales Rule: current rule and rulemaking materials. https://www.ftc.gov/legal-library/browse/rules/telemarketing-sales-rule
- Pennsylvania Office of Attorney General, Telemarketing Registration: registration and Pennsylvania DNC administration. https://www.attorneygeneral.gov/businesses-and-organizations/telemarketing-registration/
- Pennsylvania Office of Attorney General, Telemarketing FAQ: current Pennsylvania solicitation definition, listed exceptions, DNC subscription and screening expectations. https://www.attorneygeneral.gov/businesses-and-organizations/telemarketing-registration/telemarketing-frequently-asked-questions/
- Pennsylvania General Assembly, Telemarketer Registration Act. https://www.legis.state.pa.us/WU01/LI/LI/US/HTM/1996/0/0147..HTM

The current gate uses the federal/PA 8 a.m.–9 p.m. Eastern window only for outbound marketing calls. It does not invent quiet-hour rules for other channels or infer a contact's state from free-text notes. Missing structured location or current DNC evidence causes review rather than an unsupported allow.

Before production enablement, counsel must review purpose classification, consent language/scope, automated or prerecorded/AI voice use, recording/transcription consent, retention periods, registration/exemption status, DNC acquisition/scrubbing procedures, and channel-specific opt-out behavior.
