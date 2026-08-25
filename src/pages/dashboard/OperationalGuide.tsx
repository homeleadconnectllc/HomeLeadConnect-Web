import { Link } from "react-router-dom";
import { objectionGuides, scriptLibrary } from "../../data/scriptLibrary";

type GuidePage = "help" | "tutorials" | "rules";

type ResourceItem = {
  title: string;
  body?: string;
  steps?: string[];
  actions?: { label: string; to: string }[];
};

const helpItems: ResourceItem[] = [
  { title: "Cannot sign in", body: "Use password recovery first. Staff invited to a company should return through the invitation link so HLC can attach the account to the correct workspace.", actions: [{ label: "Reset password", to: "/forgot-password" }] },
  { title: "Wrong workspace or access", body: "Do not create duplicate accounts or share credentials. An owner/manager should verify Team membership and the assigned role.", actions: [{ label: "Open Team", to: "/team" }] },
  { title: "Workflow is blocked", body: "Open the Golden Workflow and follow the first incomplete stage. Do not manually skip provider acceptance, appointment, completion, or other required lifecycle gates.", actions: [{ label: "Open Workflow", to: "/workflow" }] },
  { title: "Calls or messages", body: "Check Call Center and manual communications. Confirm consent/suppression state before automated delivery. Google Voice can remain the live carrier surface while HLC preserves customer context, outcome, and follow-up.", actions: [{ label: "Call Center", to: "/call-center" }, { label: "Communications", to: "/manual-communications" }] },
  { title: "AI agent problem", body: "Retry once after refreshing. If voice generation or playback fails, the underlying record workflow remains available; do not substitute an AI response for a required authorization or business decision.", actions: [{ label: "Kendrell", to: "/hq" }, { label: "Dion", to: "/operations" }, { label: "Diamond", to: "/customer-experience" }] },
  { title: "Billing or subscription", body: "Owners should use the Billing surface. Do not send card details, API keys, authentication codes, or secret credentials through support messages.", actions: [{ label: "Billing", to: "/settings/billing" }] },
];

const tutorialItems: ResourceItem[] = [
  { title: "Company owner", steps: ["Complete Settings.", "Invite managers/technicians in Team.", "Review Workflow and Automations.", "Confirm Call Center process.", "Run a controlled test request before live volume."], actions: [{ label: "First-day checklist", to: "/start-here" }] },
  { title: "Manager/operator", steps: ["Open Leads.", "Build/review LeadScope.", "Convert approved work into a Job.", "Use provider offer/acceptance and scheduling.", "Record communication outcomes and follow-ups.", "Close completed work accurately."], actions: [{ label: "Golden Workflow", to: "/workflow" }] },
  { title: "Technician", steps: ["Review assigned Jobs.", "Confirm Calendar commitments.", "Use authorized Documents only.", "Record accurate work status.", "Escalate changes rather than bypassing management controls."], actions: [{ label: "Jobs", to: "/jobs" }] },
  { title: "Resident/customer", steps: ["Submit a service request.", "Use the resident portal for estimates, appointments, jobs, messages, and shared documents.", "Review only completed eligible work."], actions: [{ label: "Request Service", to: "/request-service" }] },
  { title: "Professional/provider", steps: ["Complete the professional profile.", "Maintain services, service areas, and availability.", "Accept or decline offers explicitly.", "Follow assignments and schedule.", "Complete work through the canonical job lifecycle."], actions: [{ label: "Professional Portal", to: "/contractor-portal" }] },
  { title: "AI team", body: "Kendrell handles command/risk, Dion operations/BI, and Diamond customer experience/community. Use the agent attached to the work; final permissions still come from HLC roles and database controls." },
];

const ruleItems: ResourceItem[] = [
  { title: "Access", body: "Use individual accounts. Never share passwords. Owners and managers control company-team access; technicians do not receive management authority." },
  { title: "Customer and provider data", body: "Access only records belonging to an authorized workspace or portal relationship. Do not copy private information into unrelated workspaces or public/community content." },
  { title: "Communications", body: "Respect consent, opt-out/suppression, purpose, channel, and applicable calling/texting requirements. Never use automation to bypass a blocked or suppressed destination." },
  { title: "Provider claims", body: "Record credentials and availability factually. Do not fabricate verification, rankings, licenses, service areas, acceptance, completion, or quality claims." },
  { title: "AI", body: "AI agents may summarize and assist within their role. They do not override authorization, legal requirements, customer consent, payment controls, or required workflow state." },
  { title: "Community", body: "No fraud, harassment, fabricated reviews, private-data disclosure, impersonation, spam, or retaliation. Reviews must remain tied to eligible completed HLC work where required." },
  { title: "Security", body: "Never place passwords, OTP codes, secret/API keys, service-role credentials, payment-card data, or private authentication material in notes, messages, tickets, or screenshots." },
  { title: "Incident response", body: "If you suspect incorrect access, disclosure, billing, or automation behavior, stop the affected action, preserve the record/time/page, and escalate to HLC support." },
  { title: "Legal documents", body: "Review the current privacy, terms, and platform disclosure before company rollout. Draft legal language remains subject to professional legal review where marked.", actions: [{ label: "Privacy", to: "/privacy" }, { label: "Terms", to: "/terms" }, { label: "Platform disclosure", to: "/platform-disclosure" }] },
];

const pageCopy = {
  help: { kicker: "RECOVERY DESK", title: "Help Center", body: "Recover quickly when work, access, billing, communications, or a customer journey gets blocked.", count: helpItems.length },
  tutorials: { kicker: "ROLE PLAYBOOKS", title: "Role Tutorials", body: "Use the shortest proven path for each HLC role and workflow.", count: tutorialItems.length },
  rules: { kicker: "OPERATING BOUNDARIES", title: "Rules & Safety", body: "Operate HLC without bypassing privacy, authorization, consent, billing, provider, or community safeguards.", count: ruleItems.length },
} as const;

export default function OperationalGuide({ page }: { page: GuidePage }) {
  const copy = pageCopy[page];
  const items = page === "help" ? helpItems : page === "tutorials" ? tutorialItems : ruleItems;
  return <main className="hlc-resources-workspace">
    <header className="hlc-resources-header">
      <div><p className="hlc-resources-kicker">{copy.kicker}</p><h1>{copy.title}</h1><p>{copy.body}</p></div>
      <div className="hlc-resources-summary" aria-label={`${copy.title} summary`}><span><strong>{copy.count}</strong><small>{page === "rules" ? "Safety areas" : "Guides"}</small></span><span><strong>{scriptLibrary.length}</strong><small>Approved scripts</small></span><span><strong>{objectionGuides.length}</strong><small>Rebuttal guides</small></span></div>
    </header>

    <nav className="hlc-resources-commandbar" aria-label="Resource navigation">
      <Link className={page === "help" ? "is-active" : ""} to="/help">Help Center</Link>
      <Link className={page === "tutorials" ? "is-active" : ""} to="/tutorials">Tutorials</Link>
      <Link className={page === "rules" ? "is-active" : ""} to="/rules">Rules & Safety</Link>
      <Link to="/documents">Documents</Link>
      <Link to="/call-center">Call Center</Link>
    </nav>

    {(page === "help" || page === "tutorials") && <ManualLibrary />}
    {page === "help" && <ScriptLibrary />}

    <section className="hlc-resources-ledger" aria-label={copy.title}>
      <div className="hlc-resources-section-head"><div><span>{page === "rules" ? "POLICY REGISTER" : "OPERATING GUIDES"}</span><h2>{page === "rules" ? "Required boundaries" : "Find the next safe action"}</h2></div><strong>{items.length}</strong></div>
      <div className="hlc-resources-row-list">{items.map((item, index) => <ResourceRow item={item} number={index + 1} key={item.title} />)}</div>
    </section>

    {page === "help" && <section className="hlc-resources-escalation"><div><span>ESCALATION</span><h2>Escalate to HomeLead Connect</h2></div><p>Contact <a href="mailto:homeleadconnect@gmail.com">homeleadconnect@gmail.com</a> or <a href="tel:+17172881785">717-288-1785</a>. Include the page, approximate time, affected workflow/record, and what you expected to happen. Never send passwords, OTP codes, private API keys, service-role credentials, or payment-card data.</p><Link to="/start-here">Return to Start Here</Link></section>}
  </main>;
}

function ResourceRow({ item, number }: { item: ResourceItem; number: number }) {
  return <article className="hlc-resource-row"><span className="hlc-resource-index">{String(number).padStart(2, "0")}</span><div className="hlc-resource-copy"><h3>{item.title}</h3>{item.body && <p>{item.body}</p>}{item.steps && <ol>{item.steps.map(step => <li key={step}>{step}</li>)}</ol>}</div>{item.actions && <div className="hlc-resource-actions">{item.actions.map(action => <Link key={action.to} to={action.to}>{action.label}</Link>)}</div>}</article>;
}

function ScriptLibrary() {
  return <section className="hlc-manual-library" aria-labelledby="hlc-script-library">
    <div className="hlc-resources-section-head"><div><span>APPROVED LANGUAGE LIBRARY</span><h2 id="hlc-script-library">Scripts, talk tracks & rebuttals</h2></div><strong>{scriptLibrary.length + objectionGuides.length}</strong></div>
    <p>Use these approved HLC talk tracks as guidance, keep the conversation natural, and always record the actual disposition and next action on the source record.</p>
    <div className="hlc-manual-list">
      {scriptLibrary.map((script) => <article className="hlc-manual-row" key={script.id}><div><h3>{script.title}</h3><p>{script.body}</p><small>{script.channel} · {script.stage} · {script.audience}</small></div><div><strong>Next</strong><small>{script.suggestedActions.join(" · ")}</small></div></article>)}
      {objectionGuides.map((guide) => <article className="hlc-manual-row" key={guide.id}><div><h3>{guide.objection}</h3><p>{guide.response}</p><small>Goal: {guide.goal}</small></div><div><strong>Next</strong><small>{guide.nextActions.join(" · ")}</small></div></article>)}
    </div>
  </section>;
}

function ManualLibrary() {
  return <section className="hlc-manual-library" aria-labelledby="hlc-digital-manuals">
    <div className="hlc-resources-section-head"><div><span>DIGITAL OPERATIONS LIBRARY</span><h2 id="hlc-digital-manuals">Keep recovery instructions with the app</h2></div><strong>2 manuals</strong></div>
    <p>Open these HLC manuals from any device, use your browser’s Print / Save as PDF option, or download a local copy for offline reference.</p>
    <div className="hlc-manual-list">
      <article className="hlc-manual-row"><div><h3>Technician Troubleshooting Manual</h3><p>Login/access recovery, workflow failures, Google Voice, voice notes, media uploads, billing boundaries, security incidents, and the escalation evidence package.</p></div><div><a href="/manuals/hlc-technician-troubleshooting-manual.html" target="_blank" rel="noreferrer">Open manual</a><a href="/manuals/hlc-technician-troubleshooting-manual.html" download="HLC-Technician-Troubleshooting-Manual.html">Download</a></div></article>
      <article className="hlc-manual-row"><div><h3>Manager Operations Manual</h3><p>Daily opening/closeout, golden workflow, provider operations, scheduling, automation policy, communications, customer status language, incidents, and AI-team boundaries.</p></div><div><a href="/manuals/hlc-manager-operations-manual.html" target="_blank" rel="noreferrer">Open manual</a><a href="/manuals/hlc-manager-operations-manual.html" download="HLC-Manager-Operations-Manual.html">Download</a></div></article>
    </div>
  </section>;
}
