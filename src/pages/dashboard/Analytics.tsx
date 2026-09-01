import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, Eye, RefreshCw, Route, ShieldCheck, UsersRound } from "lucide-react";
import AnalyticsKpis from "../../components/analytics/AnalyticsKpis";
import {
  getAnalyticsSummary,
  getBusinessKpis,
  getGrowthSummary,
  type HlcAnalyticsSummary,
  type HlcBusinessKpis,
  type HlcGrowthSummary,
} from "../../api/analytics";
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
      const [analyticsData, businessData, growthData] = await Promise.all([
        getAnalyticsSummary(30),
        getBusinessKpis(30),
        getGrowthSummary(30),
      ]);
      setAnalytics(analyticsData);
      setBusiness(businessData);
      setGrowth(growthData);
    } catch (reason) {
      setError(errorMessage(reason, "Unable to load Growth operating evidence."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadGrowth(), 0);
    return () => window.clearTimeout(timer);
  }, [loadGrowth]);

  const requestStartRate = useMemo(() => {
    if (!analytics?.sessions) return 0;
    return (Number(analytics.service_request_starts || 0) / Number(analytics.sessions)) * 100;
  }, [analytics]);

  async function refresh() {
    setRefreshing(true);
    await loadGrowth();
  }

  return (
    <main className="hlc-command-center hlc-analytics-page">
      <section className="hlc-command-hero">
        <div className="hlc-command-copy">
          <div className="hlc-command-kicker"><BarChart3 size={15} aria-hidden="true" />Dion · Business &amp; Growth Intelligence</div>
          <h1>HLC Business Intelligence</h1>
          <h2 className="hlc-analytics-context-title">Operating KPIs &amp; Visitor Analytics</h2>
          <p>Canonical workflow performance plus privacy-minimized first-party HLC traffic for the last 30 days. Growth intelligence extends that same evidence with acquisition, attribution, conversion, and Community referral signals.</p>
        </div>
      </section>

      <section className="hlc-system-strip" aria-label="Analytics principles">
        <ShieldCheck size={16} aria-hidden="true" />
        <span>First-party, workspace-scoped measurement</span>
        <span className="hlc-system-divider" />
        <Eye size={16} aria-hidden="true" />
        <span>No fabricated traffic, attribution or outcomes</span>
        <span className="hlc-system-divider" />
        <button type="button" onClick={() => void refresh()} disabled={refreshing}>
          <RefreshCw size={15} aria-hidden="true" /> {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </section>

      <nav className="hlc-intelligence-nav" aria-label="Analytics intelligence modes">
        <Link className="is-active" to="/analytics"><BarChart3 size={17} aria-hidden="true" />REAL DATA</Link>
        <Link to="/analytics/forecasting">FORECAST</Link>
        <Link to="/analytics/sandbox">SIMULATION ONLY</Link>
      </nav>

      <AnalyticsKpis />

      {loading && <p role="status">Loading Growth operating evidence…</p>}
      {error && <p role="alert" className="hlc-account-status is-error">{error}</p>}

      {!loading && !error && <>
        <section className="hlc-dashboard-section" aria-labelledby="growth-scorecard-heading">
          <div className="hlc-section-heading"><div><span className="hlc-section-eyebrow">Growth scorecard</span><h2 id="growth-scorecard-heading">Acquisition, attribution &amp; conversion</h2></div><Route size={20} aria-hidden="true" /></div>
          <div className="hlc-dashboard-kpis">
            <article><strong>{analytics?.sessions ?? 0}</strong><span>Sessions</span></article>
            <article><strong>{business?.leads ?? growth?.total_leads ?? 0}</strong><span>New leads</span></article>
            <article><strong>{percent(business?.lead_to_estimate_rate)}</strong><span>Lead → estimate</span></article>
            <article><strong>{percent(business?.estimate_to_job_rate)}</strong><span>Estimate → job</span></article>
            <article><strong>{growth?.referrals ?? 0}</strong><span>Referrals</span></article>
            <article><strong>{percent(requestStartRate)}</strong><span>Sessions → request start</span></article>
          </div>
        </section>

        <section className="hlc-dashboard-section" aria-labelledby="attribution-heading">
          <div className="hlc-section-heading"><div><span className="hlc-section-eyebrow">Attribution quality</span><h2 id="attribution-heading">Can HLC explain where leads came from?</h2></div></div>
          <div className="hlc-phone-list">
            <article className="hlc-phone-row"><div><strong>Known source coverage</strong><span>{percent(growth?.attribution_known_rate)}</span></div><small>{growth?.known_source_leads ?? 0} of {growth?.total_leads ?? 0} recent leads have attributable source evidence.</small></article>
            <article className="hlc-phone-row"><div><strong>Unknown-source debt</strong><span>{growth?.unknown_source_leads ?? 0}</span></div><small>{(growth?.unknown_source_leads ?? 0) > 0 ? "These leads reduce confidence in channel performance. Improve source capture before making channel-spend decisions." : "No unknown-source leads in this window."}</small></article>
          </div>
          <div className="hlc-settings-ledger">
            {(growth?.sources ?? []).map((source) => <article key={source.source} className="hlc-settings-section"><div className="hlc-account-section-head"><div><span>SOURCE</span><h3>{source.source}</h3></div><strong>{source.lead_count}</strong></div></article>)}
            {!growth?.sources?.length && <p>No lead-source records were created in this evidence window.</p>}
          </div>
        </section>

        <section className="hlc-dashboard-section" aria-labelledby="referrals-heading">
          <div className="hlc-section-heading"><div><span className="hlc-section-eyebrow">Community growth</span><h2 id="referrals-heading">Referral movement</h2></div><UsersRound size={20} aria-hidden="true" /></div>
          <div className="hlc-phone-list">
            {(growth?.referral_statuses ?? []).map((row) => <article className="hlc-phone-row" key={row.status}><div><strong>{row.status}</strong><span>{row.count}</span></div><small>Persisted Community referral state</small></article>)}
            {!growth?.referral_statuses?.length && <p>No Community referrals were created in this evidence window.</p>}
          </div>
        </section>
      </>}
    </main>
  );
}
