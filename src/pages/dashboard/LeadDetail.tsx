import { useEffect, useState } from "react";
import { ArrowLeft, CalendarClock, Calculator, Mail, MessageSquare, Phone, BriefcaseBusiness } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getLead, type LeadRecord } from "../../api/leads";
import { errorMessage } from "../../lib/errorMessage";

function displayDate(value: string | null | undefined) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function LeadDetail() {
  const { leadId } = useParams();
  const parsedLeadId = Number(leadId);
  const validLeadId = Number.isInteger(parsedLeadId) && parsedLeadId > 0 ? parsedLeadId : null;
  const [lead, setLead] = useState<LeadRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (validLeadId === null) return;
    let active = true;
    getLead(validLeadId)
      .then((record) => { if (active) setLead(record); })
      .catch((reason: unknown) => { if (active) setError(errorMessage(reason, "Unable to load this lead.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [validLeadId]);

  if (validLeadId === null) return <main className="hlc-lead-detail-page"><Link to="/leads">← Back to Leads</Link><p role="alert">Invalid lead record.</p></main>;
  if (loading) return <main className="hlc-lead-detail-page"><p role="status">Loading lead…</p></main>;
  if (error || !lead) return <main className="hlc-lead-detail-page"><Link to="/leads">← Back to Leads</Link><p role="alert">{error || "Lead not found."}</p></main>;

  const pipeline = lead.stage || lead.status || "new";
  return (
    <main className="hlc-lead-detail-page">
      <Link className="hlc-lead-detail-back" to="/leads"><ArrowLeft size={18} aria-hidden="true" />Back to Leads</Link>

      <header className="hlc-lead-detail-hero">
        <div className="hlc-lead-detail-avatar" aria-hidden="true">{(lead.full_name || "L").trim().charAt(0).toUpperCase()}</div>
        <div>
          <p className="hlc-page-eyebrow">Lead profile</p>
          <h1>{lead.full_name || `Lead #${lead.id}`}</h1>
          <div className="hlc-lead-detail-meta">
            {lead.lead_code && <span>#{lead.lead_code}</span>}
            <span>{pipeline}</span>
            {lead.priority && <span>{lead.priority} priority</span>}
            {lead.sla_status && <span>SLA: {lead.sla_status}</span>}
          </div>
        </div>
      </header>

      <section className="hlc-lead-detail-actions" aria-label="Lead actions">
        {lead.phone && <Link to={`/manual-communications?contact=lead:${lead.id}&channel=call`}><Phone size={18} aria-hidden="true" />Call</Link>}
        <Link to={`/manual-communications?contact=lead:${lead.id}`}><MessageSquare size={18} aria-hidden="true" />Communicate</Link>
        <Link to={`/follow-ups?lead=${lead.id_uuid}`}><CalendarClock size={18} aria-hidden="true" />Follow up</Link>
        <Link to={`/estimator?lead=${lead.id}`}><Calculator size={18} aria-hidden="true" />Create estimate</Link>
      </section>

      <div className="hlc-lead-detail-grid">
        <section className="hlc-lead-detail-panel">
          <h2>Contact information</h2>
          <dl>
            <div><dt>Email</dt><dd>{lead.email ? <a href={`mailto:${lead.email}`}><Mail size={16} aria-hidden="true" />{lead.email}</a> : "Not provided"}</dd></div>
            <div><dt>Phone</dt><dd>{lead.phone ? <a href={`tel:${lead.phone}`}><Phone size={16} aria-hidden="true" />{lead.phone}</a> : "Not provided"}</dd></div>
            <div><dt>Source</dt><dd>{lead.source || "Not recorded"}</dd></div>
            <div><dt>Lead ID</dt><dd>{lead.lead_code ? `#${lead.lead_code}` : String(lead.id)}</dd></div>
          </dl>
        </section>

        <section className="hlc-lead-detail-panel">
          <h2>Notes</h2>
          <p className="hlc-lead-detail-notes">{lead.notes?.trim() || "No notes have been recorded for this lead yet."}</p>
        </section>

        <section className="hlc-lead-detail-panel">
          <h2>Pipeline details</h2>
          <dl>
            <div><dt>Status</dt><dd>{lead.status || "Not set"}</dd></div>
            <div><dt>Stage</dt><dd>{lead.stage || "Not set"}</dd></div>
            <div><dt>Priority</dt><dd>{lead.priority || "Not set"}</dd></div>
            <div><dt>Conversion score</dt><dd>{lead.conversion_score ?? "Not scored"}</dd></div>
          </dl>
        </section>

        <section className="hlc-lead-detail-panel">
          <h2>Schedule & history</h2>
          <dl>
            <div><dt>Appointment</dt><dd>{displayDate(lead.appointment_at)}</dd></div>
            <div><dt>Appointment status</dt><dd>{lead.appointment_status || "Not scheduled"}</dd></div>
            <div><dt>Next follow-up</dt><dd>{displayDate(lead.next_follow_up_at)}</dd></div>
            <div><dt>Created</dt><dd>{displayDate(lead.created_at)}</dd></div>
            <div><dt>Last updated</dt><dd>{displayDate(lead.updated_at)}</dd></div>
          </dl>
        </section>
      </div>

      <section className="hlc-lead-related-work" aria-label="Related lead work">
        <h2>Related work</h2>
        <div>
          <Link to={`/follow-ups?lead=${lead.id_uuid}`}><CalendarClock size={18} aria-hidden="true" /><span><strong>Follow-ups</strong><small>Review or schedule the next action</small></span></Link>
          <Link to={`/manual-communications?contact=lead:${lead.id}`}><MessageSquare size={18} aria-hidden="true" /><span><strong>Communication</strong><small>Call, text, and communication history</small></span></Link>
          <Link to={`/estimator?lead=${lead.id}`}><Calculator size={18} aria-hidden="true" /><span><strong>Estimates</strong><small>Create or continue estimating</small></span></Link>
          <Link to="/jobs"><BriefcaseBusiness size={18} aria-hidden="true" /><span><strong>Jobs</strong><small>Review work created from accepted estimates</small></span></Link>
        </div>
      </section>
    </main>
  );
}
