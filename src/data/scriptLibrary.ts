export type ScriptChannel = "call" | "voicemail" | "sms" | "email" | "in-app";
export type ScriptAudience = "resident" | "professional" | "internal";
export type ScriptStage =
  | "intake"
  | "qualification"
  | "estimate"
  | "matching"
  | "scheduling"
  | "job"
  | "follow-up"
  | "review"
  | "referral"
  | "onboarding"
  | "support";

export type HlcScript = {
  id: string;
  title: string;
  channel: ScriptChannel;
  audience: ScriptAudience;
  stage: ScriptStage;
  purpose: string;
  body: string;
  suggestedActions: string[];
  guardrails: string[];
};

export type ObjectionGuide = {
  id: string;
  objection: string;
  goal: string;
  response: string;
  nextActions: string[];
  avoid: string[];
};

const commonGuardrails = [
  "Identify HomeLead Connect accurately and do not imply HLC performs the service work.",
  "Do not promise price, availability, workmanship, licensing, insurance, or outcomes that have not been verified.",
  "Honor communication consent, opt-out, suppression, and quiet-hour requirements.",
  "Record the disposition and next action on the associated HLC record.",
];

export const scriptLibrary: HlcScript[] = [
  {
    id: "resident-inbound-intake",
    title: "Resident inbound service request",
    channel: "call",
    audience: "resident",
    stage: "intake",
    purpose: "Understand the service need and establish the next HLC step without overselling.",
    body: "Thanks for contacting HomeLead Connect. I can help get your request organized and guide you toward the next step. What are you looking to have repaired, maintained, or improved, and what is happening now?",
    suggestedActions: ["Capture service category", "Confirm property/location", "Capture urgency", "Confirm preferred contact method", "Create or update request"],
    guardrails: commonGuardrails,
  },
  {
    id: "resident-outbound-new-request",
    title: "New request callback",
    channel: "call",
    audience: "resident",
    stage: "qualification",
    purpose: "Follow up on a submitted request and collect the details needed for an estimate, match, or scheduling path.",
    body: "Hi, this is [name] with HomeLead Connect. I’m following up on the service request you submitted. I’d like to make sure we understand the project correctly and help organize the next step. Is now a good time for a quick conversation about what you need?",
    suggestedActions: ["Confirm request details", "Capture timing", "Identify decision-maker/contact", "Determine estimate or matching next step"],
    guardrails: commonGuardrails,
  },
  {
    id: "resident-missed-call-voicemail",
    title: "Missed-call voicemail",
    channel: "voicemail",
    audience: "resident",
    stage: "follow-up",
    purpose: "Leave a concise callback message without disclosing unnecessary project information.",
    body: "Hi, this is [name] with HomeLead Connect following up on your request. When you have a moment, please call us back or reply through the contact method you used with us. We’ll be glad to help with the next step. Thank you.",
    suggestedActions: ["Log voicemail", "Create follow-up", "Use approved text follow-up if consent allows"],
    guardrails: [...commonGuardrails, "Do not leave sensitive project or account details in voicemail."],
  },
  {
    id: "resident-missed-call-text",
    title: "Missed-call text follow-up",
    channel: "sms",
    audience: "resident",
    stage: "follow-up",
    purpose: "Provide a low-friction reply path after an unanswered call.",
    body: "Hi [first name], this is [name] with HomeLead Connect following up on your service request. When you’re free, reply here with a good time to connect and we’ll help organize the next step.",
    suggestedActions: ["Log message", "Set follow-up time", "Stop outreach when opt-out/suppression applies"],
    guardrails: commonGuardrails,
  },
  {
    id: "estimate-follow-up",
    title: "Estimate follow-up",
    channel: "call",
    audience: "resident",
    stage: "estimate",
    purpose: "Confirm the estimate was received and identify questions or the appropriate next action.",
    body: "Hi [first name], this is [name] with HomeLead Connect. I’m checking in on the estimate connected to your project. I wanted to make sure you received it and see whether you have any questions or changes we should document before the next step.",
    suggestedActions: ["Confirm received/viewed", "Capture questions", "Record requested changes", "Advance, hold, or close with reason"],
    guardrails: commonGuardrails,
  },
  {
    id: "matching-introduction",
    title: "Provider match introduction",
    channel: "call",
    audience: "resident",
    stage: "matching",
    purpose: "Explain an HLC match transparently and let the user choose how to proceed.",
    body: "We found a professional in the HLC network whose service category, coverage, and current information appear to fit your request. I can walk you through the profile and available next steps. You’re free to review, save, pass, or request the connection.",
    suggestedActions: ["Open provider profile", "Explain verified evidence", "Record save/pass/request", "Schedule if appropriate"],
    guardrails: [...commonGuardrails, "Do not describe a provider as guaranteed, best, safest, or licensed unless the supporting evidence has been verified and the wording is approved."],
  },
  {
    id: "appointment-confirmation",
    title: "Appointment confirmation",
    channel: "call",
    audience: "resident",
    stage: "scheduling",
    purpose: "Confirm the appointment, participants, location, and expectations.",
    body: "I’m confirming your HomeLead Connect appointment for [date] at [time]. The appointment is for [service/project] at [location]. Is that time still good, and will the people who need to participate in the decision or access be available?",
    suggestedActions: ["Confirm date/time", "Confirm access/participants", "Confirm contact method", "Send reminder"],
    guardrails: commonGuardrails,
  },
  {
    id: "appointment-reschedule",
    title: "Appointment reschedule",
    channel: "call",
    audience: "resident",
    stage: "scheduling",
    purpose: "Recover a scheduling conflict without losing the request.",
    body: "No problem. Let’s find a time that works better. I’ll update the HLC schedule so everyone connected to the appointment has the correct information. What day or time window works best for you?",
    suggestedActions: ["Offer valid availability", "Update appointment", "Notify affected participants", "Confirm new time"],
    guardrails: commonGuardrails,
  },
  {
    id: "post-job-check-in",
    title: "Post-job check-in",
    channel: "call",
    audience: "resident",
    stage: "job",
    purpose: "Confirm the service experience and capture unresolved issues before asking for a review.",
    body: "I’m checking in from HomeLead Connect now that the job is marked complete. Before we close the service journey, did the visit and communication go as expected, or is there anything we should document for follow-up?",
    suggestedActions: ["Capture outcome", "Open issue/recovery if needed", "Confirm completion", "Request review only after unresolved issues are handled"],
    guardrails: commonGuardrails,
  },
  {
    id: "review-request",
    title: "Review request",
    channel: "sms",
    audience: "resident",
    stage: "review",
    purpose: "Invite honest feedback after a completed service experience.",
    body: "Thanks for using HomeLead Connect. If your service journey is complete, we’d appreciate an honest review of your experience. Your feedback helps other people make informed choices and helps professionals improve.",
    suggestedActions: ["Open verified-job review flow", "Do not gate reviews by sentiment", "Log request"],
    guardrails: [...commonGuardrails, "Never condition an incentive on a positive review or discourage negative but genuine feedback."],
  },
  {
    id: "professional-onboarding",
    title: "Professional onboarding welcome",
    channel: "call",
    audience: "professional",
    stage: "onboarding",
    purpose: "Help a service professional complete a useful profile and become ready for opportunities.",
    body: "Welcome to HomeLead Connect. I’ll help you get your professional profile organized so customers and HLC operations can understand what you do, where you work, and when you’re available. We’ll review your services, service area, availability, business details, and any verification information you choose or are required to provide.",
    suggestedActions: ["Complete profile", "Set trades/services", "Set service area", "Set availability", "Review verification status"],
    guardrails: commonGuardrails,
  },
  {
    id: "professional-opportunity-offer",
    title: "Professional opportunity outreach",
    channel: "call",
    audience: "professional",
    stage: "matching",
    purpose: "Present a potential opportunity without implying guaranteed work.",
    body: "HomeLead Connect has a service request that may fit the services and area listed on your profile. I can share the authorized project details so you can decide whether you want to review or accept the opportunity. There’s no obligation to accept it.",
    suggestedActions: ["Verify eligibility", "Share authorized project context", "Record accept/decline", "Move to next eligible professional when declined"],
    guardrails: commonGuardrails,
  },
  {
    id: "support-recovery",
    title: "Service experience recovery",
    channel: "call",
    audience: "resident",
    stage: "support",
    purpose: "Acknowledge a problem, document facts, and route it without making unsupported promises.",
    body: "Thank you for telling me what happened. I’m going to document the issue accurately and make sure it reaches the right HLC workflow. I don’t want to promise an outcome before the details are reviewed, but I can make sure the concern and the next action are recorded clearly.",
    suggestedActions: ["Document facts", "Separate allegation from verified fact", "Escalate to appropriate owner", "Set follow-up expectation"],
    guardrails: commonGuardrails,
  },
];

export const objectionGuides: ObjectionGuide[] = [
  {
    id: "not-ready",
    objection: "I’m not ready yet.",
    goal: "Respect timing while preserving a useful next step.",
    response: "That’s completely fine. Would it be more useful for me to leave the request open for a specific follow-up date, send you information to review, or close it for now?",
    nextActions: ["Schedule follow-up", "Send requested information", "Close with reason"],
    avoid: ["Creating false urgency", "Claiming an offer will disappear unless verified", "Repeated contact after opt-out"],
  },
  {
    id: "need-to-think",
    objection: "I need to think about it.",
    goal: "Identify unanswered questions without pressuring the person.",
    response: "Of course. Before I leave you to review it, is there any part of the estimate, provider information, timing, or process that would help you make the decision with better information?",
    nextActions: ["Answer supported questions", "Send documentation", "Agree on optional follow-up"],
    avoid: ["Pressure tactics", "Invented scarcity", "Arguing with the customer"],
  },
  {
    id: "price-concern",
    objection: "The price is too high.",
    goal: "Clarify scope and available legitimate options without minimizing the concern.",
    response: "I understand. We can review what is included in the scope and whether there are documented alternatives or changes available. I won’t change or promise pricing that hasn’t been approved, but I can make sure your concern is captured and the available options are clear.",
    nextActions: ["Review scope", "Capture requested changes", "Escalate pricing question", "Document outcome"],
    avoid: ["Unapproved discounts", "Misrepresenting financing", "Criticizing competitors"],
  },
  {
    id: "already-have-provider",
    objection: "I already have someone.",
    goal: "Respect the existing relationship and offer HLC only if useful.",
    response: "Understood. If you already have the help you need, I can close the request. If you’d still like a second option or want to keep HLC available for another project, I can note that instead.",
    nextActions: ["Close request", "Keep as optional comparison", "Set future follow-up only with permission"],
    avoid: ["Attacking the existing provider", "Manufacturing doubt", "Continuing to sell after a clear decline"],
  },
  {
    id: "need-another-decision-maker",
    objection: "I need to talk to my spouse/partner/owner first.",
    goal: "Support a complete decision process and avoid forcing an absent decision-maker.",
    response: "That makes sense. Would you prefer to review the information together first, or should we schedule the next conversation for a time when everyone who needs to participate can be available?",
    nextActions: ["Send information", "Schedule with all needed participants", "Document decision-maker status"],
    avoid: ["Pressuring one person to decide for someone else", "Misrepresenting urgency"],
  },
  {
    id: "dont-want-calls",
    objection: "I don’t want phone calls.",
    goal: "Honor communication preference immediately.",
    response: "Absolutely. I’ll update the communication preference. What method, if any, would you prefer us to use for this request?",
    nextActions: ["Update consent/preferences", "Apply suppression when required", "Use only approved requested channel"],
    avoid: ["Calling again without a valid basis", "Trying to talk the person out of an opt-out"],
  },
  {
    id: "provider-not-interested",
    objection: "I’m not interested in this opportunity.",
    goal: "Record the decline cleanly and preserve professional preferences.",
    response: "No problem. I’ll mark this opportunity declined so the workflow can continue. Is the issue this specific project, the service area, timing, or the type of work? That helps us avoid sending you poor-fit opportunities.",
    nextActions: ["Record decline reason", "Update matching preferences if requested", "Move to next eligible professional"],
    avoid: ["Penalizing a provider for a normal decline unless a documented program rule applies", "Pressure"],
  },
];

export const scriptLibrarySections = [
  "Call Scripts",
  "Voicemail",
  "Text & Email",
  "Intake & Qualification",
  "Estimate",
  "Matching",
  "Scheduling",
  "Job & Completion",
  "Follow-Up",
  "Objection Handling",
  "Professional Outreach",
  "Reviews & Referrals",
  "Customer Recovery",
  "Compliance & Safety",
] as const;
