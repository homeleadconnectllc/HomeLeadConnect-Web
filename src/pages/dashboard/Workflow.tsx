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
  { label: "Estimate", description: "Authorized staff prepares and manages the operational estimate for the lead or job.", route: "/estimator", countKey: "estimates", owner: "Dion" },
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

  return <main className="hlc-workflow-page hlc-ui-page-570095" >
    <header className="hlc-ui-hero-e10fa4">
      <p className="hlc-ui-eyebrow-542700">HomeLead Connect service workflow</p>
      <h1 className="hlc-ui-margin-ab79ea">Request to Community</h1>
      <p className="hlc-ui-workflow-0f1307">One traceable path through canonical HomeLead Connect records. Counts come from the current workspace; each action remains subject to its authorization and persistence rules.</p>
    </header>

    {error && <p role="alert" className="hlc-ui-error-c556fa">{error}</p>}
    {!snapshot && !error && <p role="status">Loading workflow records…</p>}

    <ol className="hlc-ui-stageList-635a2b">
      {stages.map((stage, index) => <li className="hlc-workflow-stage hlc-ui-stage-d6a331" key={stage.label} >
        <div className="hlc-workflow-stage-number hlc-ui-number-31cecc" >{index + 1}</div>
        <div className="hlc-workflow-stage-copy hlc-ui-min-width-22a08c" >
          <div className="hlc-ui-titleRow-4cc155"><h2 className="hlc-ui-workflow-5d48e7">{stage.label}</h2></div>
          <p className="hlc-ui-workflow-2cbd1b">{stage.description}</p>
          <p className="hlc-ui-workflow-8e3850">Owner: {stage.owner}</p>
        </div>
        <div className="hlc-workflow-stage-action hlc-ui-action-7979ef" >
          {stage.countKey && <strong className="hlc-ui-count-fe5cd0">{snapshot ? snapshot[stage.countKey] : "—"}</strong>}
          {stage.route ? <Link to={stage.route}>Open stage →</Link> : <span className="hlc-ui-color-acc22d">Build required</span>}
        </div>
      </li>)}
    </ol>

    <aside className="hlc-ui-notice-3d3dc9"><strong>Completion rule:</strong> a later stage never erases the earlier record. Every transition must preserve lineage, authorization, audit history, loading/error states and a safe recovery path.</aside>
  </main>;
}
