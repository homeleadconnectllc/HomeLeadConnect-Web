import { Link } from "react-router-dom";

type GuidePage = "help" | "tutorials" | "rules";

const card = { display: "grid", gap: 10, padding: 20, border: "1px solid #cbd5e1", borderRadius: 16, background: "#fff", lineHeight: 1.55 } as const;
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 14 } as const;
const row = { display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" } as const;
const manualAction = { display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 40, padding: "8px 12px", borderRadius: 10, border: "1px solid #bfdbfe", color: "#1d4ed8", background: "#eff6ff", textDecoration: "none", fontWeight: 900 } as const;

export default function OperationalGuide({ page }: { page: GuidePage }) {
  return <main style={{ width: "min(1120px,calc(100% - 32px))", margin: "40px auto", display: "grid", gap: 20 }}>
    <header style={{ display: "grid", gap: 10, padding: "clamp(22px,5vw,40px)", borderRadius: 22, color: "#f8fafc", background: "linear-gradient(135deg,#081426,#12365f)" }}>
      <p style={{ margin: 0, color: "#60a5fa", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".08em" }}>HomeLead Connect · operating knowledge</p>
      <h1 style={{ margin: 0 }}>{page === "help" ? "Help Center" : page === "tutorials" ? "Role Tutorials" : "Rules & Safety"}</h1>
      <p style={{ margin: 0 }}>{page === "help" ? "Recover quickly when work, access, billing, communications, or a customer journey gets blocked." : page === "tutorials" ? "Use the shortest proven path for each HLC role and workflow." : "Operate HLC without bypassing privacy, authorization, consent, billing, provider, or community safeguards."}</p>
    </header>
    {(page === "help" || page === "tutorials") && <ManualLibrary />}
    {page === "help" && <Help />}
    {page === "tutorials" && <Tutorials />}
    {page === "rules" && <Rules />}
  </main>;
}

function ManualLibrary() {
  return <section style={{ ...card, borderColor: "#bfdbfe", background: "linear-gradient(145deg,#f8fbff,#eef6ff)" }} aria-labelledby="hlc-digital-manuals">
    <p style={{ margin: 0, color: "#2563eb", fontSize: 11, fontWeight: 900, letterSpacing: ".12em" }}>DIGITAL OPERATIONS LIBRARY</p>
    <h2 id="hlc-digital-manuals" style={{ margin: 0 }}>Keep the recovery instructions with the app</h2>
    <p style={{ margin: 0, color: "#475569" }}>These manuals are built into HLC as digital files. Open them from any device, use your browser’s Print / Save as PDF option, or download a local copy for offline reference.</p>
    <div style={grid}>
      <article style={{ ...card, boxShadow: "none" }}>
        <h3 style={{ margin: 0 }}>Technician Troubleshooting Manual</h3>
        <p style={{ margin: 0 }}>Login/access recovery, workflow failures, Google Voice, voice notes, media uploads, billing boundaries, security incidents, and the escalation evidence package.</p>
        <div style={row}><a href="/manuals/hlc-technician-troubleshooting-manual.html" target="_blank" rel="noreferrer" style={manualAction}>Open manual</a><a href="/manuals/hlc-technician-troubleshooting-manual.html" download="HLC-Technician-Troubleshooting-Manual.html" style={manualAction}>Download</a></div>
      </article>
      <article style={{ ...card, boxShadow: "none" }}>
        <h3 style={{ margin: 0 }}>Manager Operations Manual</h3>
        <p style={{ margin: 0 }}>Daily opening/closeout, golden workflow, provider operations, scheduling, automation policy, communications, customer status language, incidents, and AI-team boundaries.</p>
        <div style={row}><a href="/manuals/hlc-manager-operations-manual.html" target="_blank" rel="noreferrer" style={manualAction}>Open manual</a><a href="/manuals/hlc-manager-operations-manual.html" download="HLC-Manager-Operations-Manual.html" style={manualAction}>Download</a></div>
      </article>
    </div>
  </section>;
}

function Help() {
  return <>
    <section style={grid}>
      <article style={card}><h2>Cannot sign in</h2><p>Use password recovery first. Staff invited to a company should return through the invitation link so HLC can attach the account to the correct workspace.</p><Link to="/forgot-password">Reset password →</Link></article>
      <article style={card}><h2>Wrong workspace or access</h2><p>Do not create duplicate accounts or share credentials. An owner/manager should verify Team membership and the assigned role.</p><Link to="/team">Open Team →</Link></article>
      <article style={card}><h2>Workflow is blocked</h2><p>Open the Golden Workflow and follow the first incomplete stage. Do not manually skip provider acceptance, appointment, completion, or other required lifecycle gates.</p><Link to="/workflow">Open Workflow →</Link></article>
      <article style={card}><h2>Calls or messages</h2><p>Check Call Center and manual communications. Confirm consent/suppression state before automated delivery. Google Voice can remain the live carrier surface while HLC preserves customer context, outcome, and follow-up.</p><div style={row}><Link to="/call-center">Call Center</Link><Link to="/manual-communications">Communications</Link></div></article>
      <article style={card}><h2>AI agent problem</h2><p>Retry once after refreshing. If voice generation or playback fails, the underlying record workflow remains available; do not substitute an AI response for a required authorization or business decision.</p><div style={row}><Link to="/hq">Kendrell</Link><Link to="/operations">Dion</Link><Link to="/customer-experience">Diamond</Link></div></article>
      <article style={card}><h2>Billing or subscription</h2><p>Owners should use the Billing surface. Do not send card details, API keys, authentication codes, or secret credentials through support messages.</p><Link to="/settings/billing">Billing →</Link></article>
    </section>
    <section style={card}><h2>Escalate to HomeLead Connect</h2><p>Contact <a href="mailto:homeleadconnect@gmail.com">homeleadconnect@gmail.com</a> or <a href="tel:+17172881785">717-288-1785</a>. Include the page, approximate time, affected workflow/record, and what you expected to happen. Never send passwords, OTP codes, private API keys, service-role credentials, or payment-card data.</p><Link to="/start-here">Return to Start Here →</Link></section>
  </>;
}

function Tutorials() {
  return <section style={grid}>
    <article style={card}><h2>Company owner</h2><ol><li>Complete Settings.</li><li>Invite managers/technicians in Team.</li><li>Review Workflow and Automations.</li><li>Confirm Call Center process.</li><li>Run a controlled test request before live volume.</li></ol><Link to="/start-here">Full first-day checklist →</Link></article>
    <article style={card}><h2>Manager/operator</h2><ol><li>Open Leads.</li><li>Build/review LeadScope.</li><li>Convert approved work into a Job.</li><li>Use provider offer/acceptance and scheduling.</li><li>Record communication outcomes and follow-ups.</li><li>Close completed work accurately.</li></ol><Link to="/workflow">Golden Workflow →</Link></article>
    <article style={card}><h2>Technician</h2><ol><li>Review assigned Jobs.</li><li>Confirm Calendar commitments.</li><li>Use authorized Documents only.</li><li>Record accurate work status.</li><li>Escalate changes rather than bypassing management controls.</li></ol><Link to="/jobs">Jobs →</Link></article>
    <article style={card}><h2>Resident/customer</h2><ol><li>Submit a service request.</li><li>Use the resident portal for estimates, appointments, jobs, messages, and shared documents.</li><li>Review only completed eligible work.</li></ol><Link to="/request-service">Request Service →</Link></article>
    <article style={card}><h2>Professional/provider</h2><ol><li>Complete the professional profile.</li><li>Maintain services, service areas, and availability.</li><li>Accept or decline offers explicitly.</li><li>Follow assignments and schedule.</li><li>Complete work through the canonical job lifecycle.</li></ol><Link to="/contractor-portal">Professional Portal →</Link></article>
    <article style={card}><h2>AI team</h2><p>Kendrell handles command/risk, Dion operations/BI, and Diamond customer experience/community. Use the agent attached to the work; final permissions still come from HLC roles and database controls.</p></article>
  </section>;
}

function Rules() {
  return <section style={grid}>
    <article style={card}><h2>Access</h2><p>Use individual accounts. Never share passwords. Owners and managers control company-team access; technicians do not receive management authority.</p></article>
    <article style={card}><h2>Customer and provider data</h2><p>Access only records belonging to an authorized workspace or portal relationship. Do not copy private information into unrelated workspaces or public/community content.</p></article>
    <article style={card}><h2>Communications</h2><p>Respect consent, opt-out/suppression, purpose, channel, and applicable calling/texting requirements. Never use automation to bypass a blocked or suppressed destination.</p></article>
    <article style={card}><h2>Provider claims</h2><p>Record credentials and availability factually. Do not fabricate verification, rankings, licenses, service areas, acceptance, completion, or quality claims.</p></article>
    <article style={card}><h2>AI</h2><p>AI agents may summarize and assist within their role. They do not override authorization, legal requirements, customer consent, payment controls, or required workflow state.</p></article>
    <article style={card}><h2>Community</h2><p>No fraud, harassment, fabricated reviews, private-data disclosure, impersonation, spam, or retaliation. Reviews must remain tied to eligible completed HLC work where required.</p></article>
    <article style={card}><h2>Security</h2><p>Never place passwords, OTP codes, secret/API keys, service-role credentials, payment-card data, or private authentication material in notes, messages, tickets, or screenshots.</p></article>
    <article style={card}><h2>Incident response</h2><p>If you suspect incorrect access, disclosure, billing, or automation behavior, stop the affected action, preserve the record/time/page, and escalate to HLC support.</p></article>
    <article style={card}><h2>Legal documents</h2><p>Review the current privacy, terms, and platform disclosure before company rollout. Draft legal language remains subject to professional legal review where marked.</p><div style={row}><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/platform-disclosure">Platform disclosure</Link></div></article>
  </section>;
}
