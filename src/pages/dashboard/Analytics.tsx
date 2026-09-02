import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, RefreshCw, ShieldCheck } from "lucide-react";
import AnalyticsKpis from "../../components/analytics/AnalyticsKpis";
import { getAnalyticsSummary, getBusinessKpis, getGrowthSummary, type HlcAnalyticsSummary, type HlcBusinessKpis, type HlcGrowthSummary } from "../../api/analytics";
import { errorMessage } from "../../lib/errorMessage";
import { Link } from "react-router-dom";

function percent(value: number | null | undefined) {
  const next = Number(value ?? 0);
  return `${Number.isFinite(next) ? next.toFixed(1) : "0.0"}%`;
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<HlcAnalyticsSummary | null>(null);
  const [business, setBusiness] = useState<HlcBusinessKpis | null>(null);
  const [growth, setGrowth] = useState<HlcGrowthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadGrowth = useCallback(async () => {
    setError("");
    try {
      const [analyticsData, businessData, growthData] = await Promise.all([getAnalyticsSummary(30), getBusinessKpis(30), getGrowthSummary(30)]);
      setAnalytics(analyticsData); setBusiness(businessData); setGrowth(growthData);
    } catch (reason) {
      setError(errorMessage(reason, "Unable to load Growth operating evidence."));
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => void loadGrowth(), 0); return () => window.clearTimeout(timer); }, [loadGrowth]);

  const requestStartRate = useMemo(() => {
    if (!analytics?.sessions) return 0;
    return (Number(analytics.service_request_starts || 0) / Number(analytics.sessions)) * 100;
  }, [analytics]);

  async function refresh() { setRefreshing(true); await loadGrowth(); }

  return (
    <main className="hlc-analytics-workspace">
      <header className="hlc-analytics-topbar">
        <div>
          <span className="hlc-analytics-eyebrow">HLC Business Intelligence · DION</span>
          <h1>Operating KPIs &amp; Visitor Analytics</h1>
          <p>Canonical workflow performance plus privacy-minimized first-party HLC traffic for the last 30 days.</p>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={refreshing}><RefreshCw size={16} aria-hidden="true" />{refreshing ? "Refreshing…" : "Refresh data"}</button>
      </header>

      <nav className="hlc-analytics-nav" aria-label="Analytics modes">
        <Link className="is-active" to="/analytics">Overview</Link>
        <Link to="/analytics/forecasting">Forecast</Link>
        <Link to="/analytics/sandbox">Simulation</Link>
      </nav>

      <section className="hlc-analytics-trustline" aria-label="Analytics principles">
        <span><ShieldCheck size={15} aria-hidden="true" />Workspace-scoped</span>
        <span><Eye size={15} aria-hidden="true" />No fabricated traffic or outcomes</span>
        <small>Last 30 days</small>
      </section>

      <section className="hlc-analytics-kpi-band" aria-label="Core analytics metrics"><AnalyticsKpis /></section>

      {loading && <p role="status">Loading Growth operating evidence…</p>}
      {error && <p role="alert" className="hlc-account-status is-error">{error}</p>}

      {!loading && !error && <div className="hlc-analytics-grid">
        <section className="hlc-analytics-primary" aria-labelledby="growth-scorecard-heading">
          <header><span>OPERATING FUNNEL</span><h2 id="growth-scorecard-heading">Acquisition to completed work</h2></header>
          <div className="hlc-analytics-metric-list">
            <article><span>Sessions</span><strong>{analytics?.sessions ?? 0}</strong></article>
            <article><span>New leads</span><strong>{business?.leads ?? growth?.total_leads ?? 0}</strong></article>
            <article><span>Lead → estimate</span><strong>{percent(business?.lead_to_estimate_rate)}</strong></article>
            <article><span>Estimate → job</span><strong>{percent(business?.estimate_to_job_rate)}</strong></article>
            <article><span>Referrals</span><strong>{growth?.referrals ?? 0}</strong></article>
            <article><span>Session → request start</span><strong>{percent(requestStartRate)}</strong></article>
          </div>
        </section>

        <aside className="hlc-analytics-insight" aria-labelledby="analytics-insight-title">
          <span>DION · EVIDENCE CHECK</span>
          <h2 id="analytics-insight-title">Can HLC explain where growth came from?</h2>
          <dl>
            <div><dt>Known source coverage</dt><dd>{percent(growth?.attribution_known_rate)}</dd></div>
            <div><dt>Unknown-source leads</dt><dd>{growth?.unknown_source_leads ?? 0}</dd></div>
            <div><dt>Recorded referrals</dt><dd>{growth?.referrals ?? 0}</dd></div>
          </dl>
          <p>{(growth?.unknown_source_leads ?? 0) > 0 ? "Improve source capture before making channel-spend decisions." : "Source evidence is complete for this window."}</p>
        </aside>

        <section className="hlc-analytics-table" aria-labelledby="source-performance-title">
          <header><span>ATTRIBUTION</span><h2 id="source-performance-title">Lead sources</h2></header>
          <div role="table" aria-label="Lead source performance">
            <div role="row" className="hlc-analytics-table-head"><span role="columnheader">Source</span><span role="columnheader">Leads</span></div>
            {(growth?.sources ?? []).map((source) => <div role="row" key={source.source}><span role="cell">{source.source}</span><strong role="cell">{source.lead_count}</strong></div>)}
            {!growth?.sources?.length && <p>No lead-source records were created in this evidence window.</p>}
          </div>
        </section>

        <section className="hlc-analytics-table" aria-labelledby="community-growth-title">
          <header><span>COMMUNITY GROWTH</span><h2 id="community-growth-title">Referral movement</h2></header>
          <div role="table" aria-label="Referral movement">
            <div role="row" className="hlc-analytics-table-head"><span role="columnheader">Status</span><span role="columnheader">Count</span></div>
            {(growth?.referral_statuses ?? []).map((row) => <div role="row" key={row.status}><span role="cell">{row.status}</span><strong role="cell">{row.count}</strong></div>)}
            {!growth?.referral_statuses?.length && <p>No Community referrals were created in this evidence window.</p>}
          </div>
        </section>
      </div>}
    </main>
  );
}
