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

const routeLabels: Record<string, string> = {
  "/": "Home",
  "/app": "HomeLead Connect",
  "/dashboard": "Dashboard",
  "/ecosystem": "Ecosystem",
  "/settings": "Settings",
  "/jobs": "Jobs",
  "/calendar": "Calendar",
  "/leads": "Leads",
  "/workflow": "Workflow",
  "/automations": "Automations",
  "/analytics": "Analytics",
  "/network": "Network",
  "/map": "Provider Map",
  "/providers": "Provider Directory",
  "/matching": "Matching",
  "/community": "Community",
  "/community-hub": "Community Hub",
  "/request-service": "Request Service",
  "/login": "Sign In",
  "/register": "Create Account",
  "/hq": "Kendrell HQ",
  "/operations": "Dion Operations",
  "/customer-experience": "Diamond CX",
};

function currency(value: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value || 0));
}

function friendlyRoute(path: string) {
  if (routeLabels[path]) return routeLabels[path];
  const clean = path.split("?")[0].replace(/^\/+|\/+$/g, "");
  if (!clean) return "Home";
  return clean
    .split("/")
    .filter(Boolean)
    .map((part) => part.replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()))
    .join(" · ");
}

export default function AnalyticsKpis() {
  const [traffic, setTraffic] = useState<HlcAnalyticsSummary>(emptyTraffic);
  const [business, setBusiness] = useState<HlcBusinessKpis>(emptyBusiness);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.allSettled([getAnalyticsSummary(30), getBusinessKpis(30)])
      .then(([trafficResult, businessResult]) => {
        if (!active) return;
        if (trafficResult.status === "fulfilled") setTraffic({ ...emptyTraffic, ...trafficResult.value });
        if (businessResult.status === "fulfilled") setBusiness({ ...emptyBusiness, ...businessResult.value });
        if (trafficResult.status === "rejected" || businessResult.status === "rejected") setError("Some KPI sources are still warming up.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refreshKey]);

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

  const topRoutes = traffic.top_paths.slice(0, 6);
  const topRouteMax = Math.max(1, ...topRoutes.map((item) => Number(item.views || 0)));

  return (
    <section className="hlc-dashboard-section hlc-analytics-panel" aria-labelledby="hlc-analytics-title">
      <div className="hlc-section-heading">
        <div>
          <span className="hlc-section-eyebrow">HLC operating window</span>
          <h2 id="hlc-analytics-title">30-day operating snapshot</h2>
          <p>Verified operating and visitor signals for the active reporting window.</p>
        </div>
        <button
          type="button"
          className="hlc-analytics-period-button"
          aria-pressed="true"
          aria-label="Refresh 30-day business intelligence"
          title="Refresh 30-day business intelligence"
          onClick={() => setRefreshKey((value) => value + 1)}
        >
          30 days
        </button>
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

      <h3 style={{ marginTop: 28 }}>Audience &amp; product activity</h3>
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
        <article className="hlc-route-insights-card">
          <div className="hlc-route-insights-heading">
            <div>
              <span className="hlc-section-eyebrow">Page activity</span>
              <h3>Top HLC destinations</h3>
            </div>
            <Route size={20} aria-hidden="true" />
          </div>
          {topRoutes.length ? (
            <div className="hlc-route-insights" role="list" aria-label="Top HLC destinations by page views">
              {topRoutes.map((item) => {
                const views = Number(item.views || 0);
                const width = Math.max(8, Math.round((views / topRouteMax) * 100));
                return (
                  <div className="hlc-route-insight" role="listitem" key={item.path}>
                    <div className="hlc-route-insight-meta">
                      <strong>{friendlyRoute(item.path)}</strong>
                      <span>{views.toLocaleString()} {views === 1 ? "view" : "views"}</span>
                    </div>
                    <div className="hlc-route-insight-track" aria-hidden="true">
                      <span style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p>{loading ? "Loading route activity…" : "Route activity will appear as HLC is used."}</p>}
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
