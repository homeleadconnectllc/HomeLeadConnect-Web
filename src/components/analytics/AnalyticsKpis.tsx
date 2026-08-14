import { useEffect, useMemo, useState } from "react";
import { Activity, Eye, MousePointerClick, Route, Users } from "lucide-react";
import { getAnalyticsSummary, type HlcAnalyticsSummary } from "../../api/analytics";

const empty: HlcAnalyticsSummary = {
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

export default function AnalyticsKpis() {
  const [summary, setSummary] = useState<HlcAnalyticsSummary>(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getAnalyticsSummary(30)
      .then((next) => { if (active) setSummary({ ...empty, ...next }); })
      .catch(() => { if (active) setError("Analytics are still warming up."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const returningShare = useMemo(() => {
    if (!summary.sessions) return 0;
    return Math.round((summary.authenticated_sessions / summary.sessions) * 100);
  }, [summary]);

  const cards = [
    { label: "30-day sessions", value: summary.sessions, icon: Users },
    { label: "Page views", value: summary.page_views, icon: Eye },
    { label: "Visitor sessions", value: summary.visitor_sessions, icon: Route },
    { label: "Signed-in share", value: `${returningShare}%`, icon: Activity },
    { label: "LeadScope views", value: summary.leadscope_views, icon: MousePointerClick },
    { label: "Material store clicks", value: summary.material_store_clicks, icon: MousePointerClick },
  ];

  return (
    <section className="hlc-dashboard-section hlc-analytics-panel" aria-labelledby="hlc-analytics-title">
      <div className="hlc-section-heading">
        <div>
          <span className="hlc-section-eyebrow">Business intelligence</span>
          <h2 id="hlc-analytics-title">Traffic & conversion KPIs</h2>
          <p>First-party HLC activity from the last 30 days. No cross-site fingerprinting.</p>
        </div>
        <span className="hlc-agent-team-chip">30 days</span>
      </div>

      <div className="hlc-analytics-kpi-grid">
        {cards.map(({ label, value, icon: Icon }) => (
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
          {summary.top_paths.length ? <ol>
            {summary.top_paths.slice(0, 6).map((item) => <li key={item.path}><span>{item.path}</span><strong>{item.views}</strong></li>)}
          </ol> : <p>{loading ? "Loading route activity…" : "Route activity will appear as HLC is used."}</p>}
        </article>
        <article>
          <h3>Intent signals</h3>
          <dl>
            <div><dt>Sign-in starts</dt><dd>{summary.sign_in_starts}</dd></div>
            <div><dt>Service-request starts</dt><dd>{summary.service_request_starts}</dd></div>
            <div><dt>LeadScope views</dt><dd>{summary.leadscope_views}</dd></div>
            <div><dt>Store clicks</dt><dd>{summary.material_store_clicks}</dd></div>
          </dl>
          {error && <p role="status">{error}</p>}
        </article>
      </div>
    </section>
  );
}
