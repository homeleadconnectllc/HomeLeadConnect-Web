import { useEffect, useMemo, useState } from "react";
import { Activity, BriefcaseBusiness, CalendarDays, Eye, Gauge, MousePointerClick, PhoneCall, Route, Users } from "lucide-react";
import {
  getAnalyticsSummary,
  getBusinessKpis,
  type HlcAnalyticsSummary,
  type HlcBusinessKpis,
} from "../../api/analytics";

const emptyTraffic: HlcAnalyticsSummary = {
  days: 30,
  page_views: 0,
  sessions: 0,
  authenticated_sessions: 0,
  visitor_sessions: 0,
  leadscope_views: 0,
  material_store_clicks: 0,
  sign_in_starts: 0,
  service_request_starts: 0,
  top_paths: [],
  events: [],
};

const emptyBusiness: HlcBusinessKpis = {
  days: 30,
  leads: 0,
  estimates: 0,
  accepted_estimates: 0,
  converted_estimates: 0,
  lead_to_estimate_rate: 0,
  estimate_acceptance_rate: 0,
  estimate_to_job_rate: 0,
  jobs: 0,
  job_value: 0,
  open_estimate_value: 0,
  assignments: 0,
  accepted_assignments: 0,
  assignment_acceptance_rate: 0,
  appointments: 0,
  completed_appointments: 0,
  pending_followups: 0,
  overdue_followups: 0,
  calls: 0,
  missed_calls: 0,
  voicemails: 0,
};

function currency(value: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value || 0));
}

export default function AnalyticsKpis() {
  const [traffic, setTraffic] = useState<HlcAnalyticsSummary>(emptyTraffic);
  const [business, setBusiness] = useState<HlcBusinessKpis>(emptyBusiness);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.allSettled([getAnalyticsSummary(30), getBusinessKpis(30)])
      .then(([trafficResult, businessResult]) => {
        if (!active) return;
        if (trafficResult.status === "fulfilled") setTraffic({ ...emptyTraffic, ...trafficResult.value });
        if (businessResult.status === "fulfilled") setBusiness({ ...emptyBusiness, ...businessResult.value });
        if (trafficResult.status === "rejected" || businessResult.status === "rejected") setError("Some KPI sources are still warming up.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const signedInShare = useMemo(() => {
    if (!traffic.sessions) return 0;
    return Math.round((traffic.authenticated_sessions / traffic.sessions) * 100);
  }, [traffic]);

  const operatingCards = [
    { label: "New leads", value: business.leads, icon: Users },
    { label: "Lead → LeadScope", value: `${business.lead_to_estimate_rate}%`, icon: Gauge },
    { label: "LeadScope → job", value: `${business.estimate_to_job_rate}%`, icon: BriefcaseBusiness },
    { label: "Provider acceptance", value: `${business.assignment_acceptance_rate}%`, icon: Activity },
    { label: "Job value", value: currency(business.job_value), icon: BriefcaseBusiness },
    { label: "Appointments", value: business.appointments, icon: CalendarDays },
    { label: "Overdue follow-ups", value: business.overdue_followups, icon: Activity },
    { label: "Missed / voicemail", value: `${business.missed_calls} / ${business.voicemails}`, icon: PhoneCall },
  ];

  const trafficCards = [
    { label: "30-day sessions", value: traffic.sessions, icon: Users },
    { label: "Page views", value: traffic.page_views, icon: Eye },
    { label: "Visitor sessions", value: traffic.visitor_sessions, icon: Route },
    { label: "Signed-in share", value: `${signedInShare}%`, icon: Activity },
    { label: "LeadScope views", value: traffic.leadscope_views, icon: MousePointerClick },
    { label: "Material store clicks", value: traffic.material_store_clicks, icon: MousePointerClick },
  ];

  return (
    <section className="hlc-dashboard-section hlc-analytics-panel" aria-labelledby="hlc-analytics-title">
      <div className="hlc-section-heading">
        <div>
          <span className="hlc-section-eyebrow">HLC business intelligence</span>
          <h2 id="hlc-analytics-title">Operating KPIs & visitor analytics</h2>
          <p>Canonical workflow performance plus privacy-minimized first-party HLC traffic for the last 30 days.</p>
        </div>
        <span className="hlc-agent-team-chip">30 days</span>
      </div>

      <h3>Operating performance</h3>
      <div className="hlc-analytics-kpi-grid hlc-analytics-kpi-grid-operating">
        {operatingCards.map(({ label, value, icon: Icon }) => (
          <article className="hlc-analytics-kpi" key={label}>
            <Icon size={18} aria-hidden="true" />
            <strong>{loading ? "—" : value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </div>

      <div className="hlc-analytics-detail-grid">
        <article>
          <h3>Workflow truth</h3>
          <dl>
            <div><dt>LeadScope estimates</dt><dd>{business.estimates}</dd></div>
            <div><dt>Accepted / converted</dt><dd>{business.accepted_estimates} / {business.converted_estimates}</dd></div>
            <div><dt>Open estimate value</dt><dd>{currency(business.open_estimate_value)}</dd></div>
            <div><dt>Jobs created</dt><dd>{business.jobs}</dd></div>
            <div><dt>Provider offers / accepted</dt><dd>{business.assignments} / {business.accepted_assignments}</dd></div>
            <div><dt>Pending follow-ups</dt><dd>{business.pending_followups}</dd></div>
            <div><dt>Calls</dt><dd>{business.calls}</dd></div>
          </dl>
        </article>
        <article>
          <h3>Conversion health</h3>
          <dl>
            <div><dt>Lead → LeadScope</dt><dd>{business.lead_to_estimate_rate}%</dd></div>
            <div><dt>LeadScope acceptance</dt><dd>{business.estimate_acceptance_rate}%</dd></div>
            <div><dt>LeadScope → job</dt><dd>{business.estimate_to_job_rate}%</dd></div>
            <div><dt>Provider acceptance</dt><dd>{business.assignment_acceptance_rate}%</dd></div>
            <div><dt>Completed appointments</dt><dd>{business.completed_appointments}</dd></div>
          </dl>
        </article>
      </div>

      <h3 style={{ marginTop: 28 }}>Audience & product activity</h3>
      <div className="hlc-analytics-kpi-grid">
        {trafficCards.map(({ label, value, icon: Icon }) => (
          <article className="hlc-analytics-kpi" key={label}>
            <Icon size={18} aria-hidden="true" />
            <strong>{loading ? "—" : value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </div>

      <div className="hlc-analytics-detail-grid">
        <article>
          <h3>Top HLC routes</h3>
          {traffic.top_paths.length ? <ol>
            {traffic.top_paths.slice(0, 6).map((item) => <li key={item.path}><span>{item.path}</span><strong>{item.views}</strong></li>)}
          </ol> : <p>{loading ? "Loading route activity…" : "Route activity will appear as HLC is used."}</p>}
        </article>
        <article>
          <h3>Intent signals</h3>
          <dl>
            <div><dt>Sign-in starts</dt><dd>{traffic.sign_in_starts}</dd></div>
            <div><dt>Service-request starts</dt><dd>{traffic.service_request_starts}</dd></div>
            <div><dt>LeadScope views</dt><dd>{traffic.leadscope_views}</dd></div>
            <div><dt>Material store clicks</dt><dd>{traffic.material_store_clicks}</dd></div>
          </dl>
          {error && <p role="status">{error}</p>}
        </article>
      </div>
    </section>
  );
}
