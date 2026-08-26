import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, RefreshCw, Route, UsersRound } from "lucide-react";
import {
  getAnalyticsSummary,
  getBusinessKpis,
  getGrowthSummary,
  type HlcAnalyticsSummary,
  type HlcBusinessKpis,
  type HlcGrowthSummary,
} from "../../api/analytics";
import { errorMessage } from "../../lib/errorMessage";

function percent(value: number | null | undefined) {
  const next = Number(value ?? 0);
  return `${Number.isFinite(next) ? next.toFixed(1) : "0.0"}%`;
}

export default function Growth() {
  const [analytics, setAnalytics] = useState<HlcAnalyticsSummary | null>(null);
  const [business, setBusiness] = useState<HlcBusinessKpis | null>(null);
  const [growth, setGrowth] = useState<HlcGrowthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
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
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const requestStartRate = useMemo(() => {
    if (!analytics?.sessions) return 0;
    return (Number(analytics.service_request_starts || 0) / Number(analytics.sessions)) * 100;
  }, [analytics]);

  async function refresh() {
    setRefreshing(true);
    await load();
  }

  if (loading) {
    return <main className="hlc-command-center hlc-analytics-page"><p role="status">Loading Growth operating evidence…</p></main>;
  }

  return <main className="hlc-command-center hlc-analytics-page">
    <section className="hlc-command-hero">
      <div className="hlc-command-copy">
        <div className="hlc-command-kicker"><Route size={15} aria-hidden="true" />Dion · Growth Intelligence</div>
        <h1>Growth Operating View</h1>
        <h2 className="hlc-analytics-context-title">Acquisition, attribution, conversion &amp; referrals</h2>
        <p>Thirty-day first-party evidence from the existing HLC analytics, CRM funnel and Community referral system. No invented campaign data and no duplicate growth database.</p>
      </div>
    </section>

    {error && <p role="alert" className="hlc-account-status is-error">{error}</p>}

    <section className="hlc-system-strip" aria-label="Growth evidence controls">
      <BarChart3 size={16} aria-hidden="true" />
      <span>30-day evidence window</span>
      <span className="hlc-system-divider" />
      <button type="button" onClick={() => void refresh()} disabled={refreshing}>
        <RefreshCw size={15} aria-hidden="true" /> {refreshing ? "Refreshing…" : "Refresh evidence"}
      </button>
    </section>

    <section className="hlc-dashboard-section" aria-labelledby="growth-scorecard-heading">
      <div className="hlc-section-heading"><div><span className="hlc-section-eyebrow">Growth scorecard</span><h2 id="growth-scorecard-heading">What is moving</h2></div></div>
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
        <article className="hlc-phone-row"><div><strong>Unknown-source debt</strong><span>{growth?.unknown_source_leads ?? 0}</span></div><small>{(growth?.unknown_source_leads ?? 0) > 0 ? "These leads reduce confidence in channel performance. Fix intake/source capture before making spend decisions." : "No unknown-source leads in this window."}</small></article>
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

    <section className="hlc-dashboard-section" aria-labelledby="growth-actions-heading">
      <div className="hlc-section-heading"><div><span className="hlc-section-eyebrow">Operating handoffs</span><h2 id="growth-actions-heading">Act on the evidence</h2></div></div>
      <nav className="hlc-account-inline-links">
        <Link to="/analytics">Full BI</Link>
        <Link to="/leads">Inspect lead pipeline</Link>
        <Link to="/community/referrals">Referral workspace</Link>
        <Link to="/operations">Dion operations</Link>
      </nav>
    </section>
  </main>;
}
