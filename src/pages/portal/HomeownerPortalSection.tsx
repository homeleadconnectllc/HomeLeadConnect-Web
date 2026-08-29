import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getHomeownerPortalData, type HomeownerPortalRelationship } from "../../api/portals";
import { formatCurrency } from "../../lib/estimator/calculations";
import { errorMessage } from "../../lib/errorMessage";

type PortalSection = "requests" | "appointments" | "jobs";

type QualificationState = {
  label: string;
  detail: string;
  complete: boolean;
};

function resolveQualificationState(relationship: HomeownerPortalRelationship): QualificationState {
  const hasDownstreamEvidence = relationship.estimates.length > 0 || relationship.jobs.length > 0;
  if (hasDownstreamEvidence) {
    return {
      label: "Information review complete",
      detail: "Your request has already advanced beyond information collection into LeadScope or active job work.",
      complete: true,
    };
  }
  return {
    label: "Information review in progress",
    detail: "HLC is still collecting or reviewing the details needed for the next service step.",
    complete: false,
  };
}

export default function HomeownerPortalSection({ section }: { section: PortalSection }) {
  const [relationships, setRelationships] = useState<HomeownerPortalRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getHomeownerPortalData()
      .then((rows) => { if (active) setRelationships(rows); })
      .catch((reason: unknown) => { if (active) setError(errorMessage(reason, "Unable to load your portal records.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const appointments = useMemo(() => relationships.flatMap((relationship) =>
    relationship.jobs.flatMap((job) => job.appointments.map((appointment) => ({ relationship, job, appointment })))), [relationships]);
  const jobs = useMemo(() => relationships.flatMap((relationship) =>
    relationship.jobs.map((job) => ({ relationship, job }))), [relationships]);

  const copy = {
    requests: ["Service requests", "Requests explicitly linked to your signed-in account, with their current LeadScope and job progress."],
    appointments: ["Appointments", "Scheduled visits attached to your linked HLC jobs."],
    jobs: ["Jobs", "Active and completed work created from your linked service requests."],
  }[section];

  return <main style={pageStyle}>
    <header style={heroStyle}>
      <p style={eyebrowStyle}>Homeowners and renters</p>
      <h1 style={{ margin: 0 }}>{copy[0]}</h1>
      <p>{copy[1]}</p>
    </header>
    <nav aria-label="Resident portal sections" style={navStyle}>
      <Link to="/homeowner-portal">Overview</Link>
      <Link to="/request-service">New request</Link>
      <Link to="/homeowner-portal/requests">Requests</Link>
      <Link to="/homeowner-portal/appointments">Appointments</Link>
      <Link to="/homeowner-portal/jobs">Jobs</Link>
      <Link to="/messages">Messages</Link>
      <Link to="/homeowner-portal/documents">Documents</Link>
    </nav>
    {loading && <p role="status">Loading your {section}…</p>}
    {error && <p role="alert" style={errorStyle}>{error}</p>}
    {!loading && !error && section === "requests" && <RequestList relationships={relationships} />}
    {!loading && !error && section === "appointments" && (appointments.length === 0
      ? <EmptyState title="No appointments yet" detail="Confirmed visits will appear here after an HLC job is scheduled. If timing or access details need attention, use Messages instead of guessing at a schedule." action="/messages" actionLabel="Open messages" />
      : appointments.map(({ relationship, job, appointment }) => <article key={appointment.id} style={cardStyle}>
        <p style={eyebrowStyle}>{relationship.homeowner_name || "Your project"}</p>
        <h2 style={{ marginTop: 4 }}>{job.name}</h2>
        <p><strong>{new Date(appointment.appointment_date).toLocaleString()}</strong></p>
        <p>Ends: {appointment.appointment_end_at ? new Date(appointment.appointment_end_at).toLocaleString() : "Not provided"}</p>
        <p>Status: {appointment.status}</p>
        <p><Link to="/messages">Message about this visit</Link></p>
      </article>))}
    {!loading && !error && section === "jobs" && (jobs.length === 0
      ? <EmptyState title="No jobs yet" detail="A job will appear after a linked request and accepted scope advance into active work. You can keep following the request itself while HLC prepares that handoff." action="/homeowner-portal/requests" actionLabel="Open requests" />
      : jobs.map(({ relationship, job }) => <article key={job.id} style={cardStyle}>
        <p style={eyebrowStyle}>{relationship.homeowner_name || "Your project"}</p>
        <h2 style={{ marginTop: 4 }}>{job.name}</h2>
        <p>Status: <strong>{job.status}</strong></p>
        <p>Contract value: {formatCurrency(Number(job.contract_value))}</p>
        <p>{job.appointments.length} linked appointment{job.appointments.length === 1 ? "" : "s"}</p>
        {job.status === "completed" && <section aria-label="Service completion" style={completionStyle}>
          <strong>Service complete</strong>
          <p>This job is recorded as completed. If something still needs attention, report the issue to HLC so it can be reviewed without silently changing the recorded job status.</p>
          <Link to="/messages">Report an issue with this service</Link>
        </section>}
        <div style={navStyle}><Link to="/messages">Open messages</Link><Link to="/homeowner-portal/documents">Open documents</Link>{job.appointments.length > 0 && <Link to="/homeowner-portal/appointments">Open appointments</Link>}</div>
      </article>))}
  </main>;
}

function RequestList({ relationships }: { relationships: HomeownerPortalRelationship[] }) {
  if (relationships.length === 0) return <EmptyState title="No linked requests" detail="Submit a service request or accept a portal invitation to connect an existing request to this account." action="/request-service" actionLabel="Request service" />;
  return relationships.map((relationship) => {
    const sentEstimate = relationship.estimates.find((estimate) => estimate.status === "sent");
    const hasScheduledAppointment = relationship.jobs.some((job) => job.appointments.some((appointment) => appointment.status === "scheduled"));
    const qualification = resolveQualificationState(relationship);
    const next = sentEstimate
      ? { label: "Estimate waiting for your decision", route: "/homeowner-portal", action: "Review estimate" }
      : hasScheduledAppointment
        ? { label: "Your next service visit is scheduled", route: "/homeowner-portal/appointments", action: "Open appointment" }
        : relationship.jobs.length > 0
          ? { label: "Your request has advanced to active job work", route: "/homeowner-portal/jobs", action: "Open job" }
          : relationship.estimates.length > 0
            ? { label: "Your estimate is recorded; HLC is preparing the next real handoff", route: "/messages", action: "Open messages" }
            : { label: "HLC has your request and is collecting the information needed for the next step", route: "/messages", action: "Add information" };

    return <article key={`${relationship.workspace_id}:${relationship.lead_id}`} style={cardStyle}>
      <p style={eyebrowStyle}>Request #{relationship.lead_id}</p>
      <h2 style={{ marginTop: 4 }}>{relationship.homeowner_name || "Service request"}</h2>
      <dl style={factsStyle}>
        <div><dt>Information review</dt><dd>{qualification.complete ? "Complete" : "In progress"}</dd></div>
        <div><dt>LeadScope estimates</dt><dd>{relationship.estimates.length}</dd></div>
        <div><dt>Jobs</dt><dd>{relationship.jobs.length}</dd></div>
        <div><dt>Latest stage</dt><dd>{relationship.jobs.length > 0 ? "Job" : relationship.estimates.length > 0 ? "LeadScope" : "Request"}</dd></div>
      </dl>
      <p><strong>{qualification.label}.</strong> {qualification.detail}</p>
      {relationship.estimates.length === 0
        ? <p>LeadScope details have not been shared yet.</p>
        : <ul>{relationship.estimates.map((estimate) => <li key={estimate.id}>{formatCurrency(Number(estimate.total))} estimate · {estimate.status}</li>)}</ul>}
      <p><strong>Next:</strong> {next.label}</p><p><Link to={next.route}>{next.action}</Link></p>
    </article>;
  });
}

function EmptyState({ title, detail, action, actionLabel }: { title: string; detail: string; action?: string; actionLabel?: string }) {
  return <section style={emptyStyle}><h2>{title}</h2><p>{detail}</p>{action && <Link to={action}>{actionLabel || "Continue"}</Link>}</section>;
}

const pageStyle = { width: "min(960px, calc(100% - 32px))", margin: "40px auto", display: "grid", gap: 18 };
const heroStyle = { padding: "clamp(22px, 5vw, 40px)", borderRadius: 22, color: "#f8fafc", background: "linear-gradient(135deg,#081426,#12365f)" };
const eyebrowStyle = { margin: 0, color: "#2563eb", fontWeight: 900, textTransform: "uppercase" as const, letterSpacing: ".04em" };
const navStyle = { display: "flex", flexWrap: "wrap" as const, gap: 14 };
const cardStyle = { padding: 20, border: "1px solid #dbeafe", borderRadius: 16, background: "#fff" };
const completionStyle = { margin: "16px 0", padding: 16, border: "1px solid #cbd5e1", borderRadius: 12, background: "#f8fafc" };
const emptyStyle = { padding: 24, border: "1px dashed #94a3b8", borderRadius: 16, background: "#f8fafc" };
const factsStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12 };
const errorStyle = { color: "#b91c1c", padding: 16, border: "1px solid #fecaca", borderRadius: 12 };
