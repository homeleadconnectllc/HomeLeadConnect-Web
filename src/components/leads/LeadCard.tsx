import { Link } from "react-router-dom";
import { Calculator, CalendarClock, Mail, MessageSquare, MoreHorizontal, Phone } from "lucide-react";
import type { CSSProperties } from "react";
import type { LeadRecord } from "../../api/leads";
import PortalInviteButton from "../portal/PortalInviteButton";

const LEAD_ACCENTS = ["#38BDF8", "#2DD4BF", "#FBBF24", "#FB923C", "#60A5FA", "#34D399", "#A78BFA"];

function leadAccent(lead: LeadRecord) {
  const key = String(lead.id_uuid || lead.id || lead.full_name || "lead");
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) hash = ((hash << 5) - hash + key.charCodeAt(index)) | 0;
  return LEAD_ACCENTS[Math.abs(hash) % LEAD_ACCENTS.length];
}

function residentTypeFromNotes(notes: string | null) {
  const match = notes?.match(/\[Resident type:\s*([^\]]+)\]/i);
  return match?.[1]?.trim() || null;
}

function nativePhoneTarget(phone: string | null | undefined) {
  return String(phone || "").replace(/[^\d+*#]/g, "");
}

export default function LeadCard({ lead }: { lead: LeadRecord }) {
  const pipelineLabel = lead.stage || lead.status || "new";
  const appointmentLabel = lead.appointment_at
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(lead.appointment_at))
    : null;
  const accent = leadAccent(lead);
  const rowStyle = { "--lead-accent": accent } as CSSProperties;
  const residentType = residentTypeFromNotes(lead.notes);
  const phoneTarget = nativePhoneTarget(lead.phone);

  const secondaryActions = (
    <>
      {phoneTarget && <a href={`tel:${phoneTarget}`}><Phone size={15} aria-hidden="true" />Call</a>}
      {phoneTarget && <a href={`sms:${phoneTarget}`}><MessageSquare size={15} aria-hidden="true" />Text</a>}
      {lead.phone && <Link to={`/manual-communications?contact=lead:${lead.id}&channel=call`}><MessageSquare size={15} aria-hidden="true" />Log</Link>}
      <PortalInviteButton role="homeowner" targetId={lead.id} email={lead.email} label="Invite" />
    </>
  );

  return (
    <article className="hlc-lead-row" style={rowStyle}>
      <Link className="hlc-lead-identity" to={`/leads/${lead.id}`} aria-label={`Open ${lead.full_name || `lead ${lead.id}`} details`}>
        <span className="hlc-lead-avatar" aria-hidden="true">{(lead.full_name || "L").trim().charAt(0).toUpperCase()}</span>
        <span className="hlc-lead-identity-copy">
          <strong>{lead.full_name || `Lead #${lead.id}`}</strong>
          {residentType && <span className="hlc-lead-resident-type">{residentType}</span>}
          <span className="hlc-lead-contact-line">
            {lead.email && <span><Mail size={13} aria-hidden="true" />{lead.email}</span>}
            {lead.phone && <span><Phone size={13} aria-hidden="true" />{lead.phone}</span>}
          </span>
          <span className="hlc-lead-context">
            <span>Lead #{lead.id}</span>
            {lead.source && <span>Source: {lead.source}</span>}
            {lead.priority && <span>Priority: {lead.priority}</span>}
            {appointmentLabel && <span>Appointment: {appointmentLabel}</span>}
          </span>
        </span>
      </Link>

      <div className="hlc-lead-pipeline-cell">
        <span className="hlc-lead-cell-label">Pipeline</span>
        <strong>{pipelineLabel}</strong>
        {lead.sla_status && <span className="hlc-lead-sla">SLA {lead.sla_status}</span>}
      </div>

      <div className="hlc-lead-actions" aria-label={`Actions for ${lead.full_name || "lead"}`}>
        <Link className="hlc-lead-action-primary" to={`/estimator?lead=${lead.id}`}><Calculator size={15} aria-hidden="true" />Estimate</Link>
        <Link to={`/follow-ups?lead=${lead.id_uuid}`}><CalendarClock size={15} aria-hidden="true" />Follow up</Link>
        <span className="hlc-s2-desktop-secondary">{secondaryActions}</span>
        <details className="hlc-s2-mobile-overflow">
          <summary aria-label={`More actions for ${lead.full_name || "lead"}`}><MoreHorizontal size={17} aria-hidden="true" /><span>More</span></summary>
          <div className="hlc-s2-overflow-menu">{secondaryActions}</div>
        </details>
      </div>
    </article>
  );
}
