import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWorkflowSnapshot, type WorkflowSnapshot } from "../../api/workflow";
import { errorMessage } from "../../lib/errorMessage";

type Stage = {
  label: string;
  description: string;
  route?: string;
  countKey?: keyof WorkflowSnapshot;
  owner: "Kendrell" | "Dion" | "Diamond";
};

const stages: Stage[] = [
  { label: "Request", description: "Homeowner or renter submits a service need.", route: "/request-service", countKey: "requests", owner: "Diamond" },
  { label: "Lead", description: "CRM creates one traceable lead without duplication.", route: "/leads", countKey: "leads", owner: "Dion" },
  { label: "LeadScope", description: "Service details, property, urgency, scope, photos and notes are organized.", route: "/estimator", countKey: "leadScopes", owner: "Dion" },
  { label: "Match", description: "Eligible providers are ranked using approved rules.", route: "/matching", countKey: "jobs", owner: "Dion" },
  { label: "Provider Offer", description: "Qualified providers receive and accept or decline an opportunity.", route: "/jobs", countKey: "providerOffers", owner: "Dion" },
  { label: "Assignment", description: "One provider becomes responsible for the request.", route: "/jobs", countKey: "acceptedAssignments", owner: "Dion" },
  { label: "Schedule", description: "Appointment is confirmed with participants and calendar records.", route: "/calendar", countKey: "appointments", owner: "Dion" },
  { label: "Job", description: "Assignment becomes an active, trackable service job.", route: "/jobs", countKey: "jobs", owner: "Dion" },
  { label: "Communication", description: "Calls, texts, emails, messages, files and history remain attached.", route: "/messages", countKey: "conversations", owner: "Diamond" },
  { label: "Completion", description: "Work outcome, documentation and final status are recorded.", route: "/jobs", countKey: "completedJobs", owner: "Dion" },
  { label: "Review", description: "Customer submits verified feedback.", route: "/community/reviews", owner: "Diamond" },
  { label: "Referral", description: "Eligible referral is tracked with consent and attribution.", route: "/community/referrals", owner: "Diamond" },
  { label: "Community", description: "Approved outcomes contribute to discussions, reputation and engagement.", route: "/community-hub", owner: "Diamond" },
];

export default function Workflow() {
  const [snapshot, setSnapshot] = useState<WorkflowSnapshot | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getWorkflowSnapshot()
      .then(setSnapshot)
      .catch((reason: unknown) => setError(errorMessage(reason, "Unable to load workflow records.")));
  }, []);

  return <main className="hlc-workflow-page" style={pageStyle}>
    <header style={heroStyle}>
      <p style={eyebrowStyle}>HLC golden service workflow</p>
      <h1 style={{ margin: 0 }}>Request to Community</h1>
      <p style={{ margin: 0, maxWidth: 760, lineHeight: 1.6 }}>One traceable path through canonical HLC records. Counts come from the current workspace; each action remains subject to its authorization and persistence rules.</p>
    </header>

    {error && <p role="alert" style={errorStyle}>{error}</p>}
    {!snapshot && !error && <p role="status">Loading workflow records…</p>}

    <ol style={stageListStyle}>
      {stages.map((stage, index) => <li className="hlc-workflow-stage" key={stage.label} style={stageStyle}>
        <div className="hlc-workflow-stage-number" style={numberStyle}>{index + 1}</div>
        <div className="hlc-workflow-stage-copy" style={{ minWidth: 0 }}>
          <div style={titleRowStyle}><h2 style={{ margin: 0, fontSize: 20 }}>{stage.label}</h2></div>
          <p style={{ margin: "8px 0", color: "#475569", lineHeight: 1.5 }}>{stage.description}</p>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Owner: {stage.owner}</p>
        </div>
        <div className="hlc-workflow-stage-action" style={actionStyle}>
          {stage.countKey && <strong style={countStyle}>{snapshot ? snapshot[stage.countKey] : "—"}</strong>}
          {stage.route ? <Link to={stage.route}>Open stage →</Link> : <span style={{ color: "#64748b" }}>Build required</span>}
        </div>
      </li>)}
    </ol>

    <aside style={noticeStyle}><strong>Completion rule:</strong> a later stage never erases the earlier record. Every transition must preserve lineage, authorization, audit history, loading/error states and a safe recovery path.</aside>
  </main>;
}

const pageStyle = { width: "min(1100px, calc(100% - 32px))", margin: "40px auto", display: "grid", gap: 22 };
const heroStyle = { display: "grid", gap: 12, padding: "clamp(22px, 5vw, 42px)", borderRadius: 22, background: "linear-gradient(135deg, #081426, #0f2c50)", color: "#f8fafc" };
const eyebrowStyle = { margin: 0, color: "#60a5fa", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" as const };
const stageListStyle = { display: "grid", gap: 12, padding: 0, margin: 0, listStyle: "none" };
const stageStyle = { display: "grid", gridTemplateColumns: "44px minmax(0, 1fr) auto", gap: 16, alignItems: "center", padding: 18, border: "1px solid #cbd5e1", borderRadius: 16, background: "#fff" };
const numberStyle = { display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 999, background: "#dbeafe", color: "#1d4ed8", fontWeight: 900 };
const titleRowStyle = { display: "flex", alignItems: "center", flexWrap: "wrap" as const, gap: 10 };
const actionStyle = { display: "grid", justifyItems: "end", gap: 6, textAlign: "right" as const };
const countStyle = { fontSize: 24, color: "#0f172a" };
const errorStyle = { color: "#b91c1c", padding: 14, border: "1px solid #fecaca", borderRadius: 12, background: "#fef2f2" };
const noticeStyle = { padding: 18, border: "1px solid #f59e0b", borderRadius: 14, background: "#fffbeb", lineHeight: 1.5 };
