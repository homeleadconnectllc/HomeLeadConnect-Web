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

function percent(value: number | null | undefined) {
  const next = Number(value ?? 0);
  return `${Number.isFinite(next) ? next.toFixed(1) : "0.0"}%`;
}

function boundedPercent(value: number | null | undefined) {
  const next = Number(value ?? 0);
  if (!Number.isFinite(next)) return 0;
  return Math.max(0, Math.min(100, next));
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

  const funnel = useMemo(() => [
    { label: "Lead → estimate", value: boundedPercent(business?.lead_to_estimate_rate) },
    { label: "Estimate → job", value: boundedPercent(business?.estimate_to_job_rate) },
    { label: "Session → request start", value: boundedPercent(requestStartRate) },
    { label: "Known source coverage", value: boundedPercent(growth?.attribution_known_rate) },
  ], [business, growth, requestStartRate]);

  const sourceMax = useMemo(() => Math.max(1, ...(growth?.sources ?? []).map((row) => Number(row.lead_count || 0))), [growth]);
  const referralMax = useMemo(() => Math.max(1, ...(growth?.referral_statuses ?? []).map((row) => Number(row.count || 0))), [growth]);

  async function refresh() {
    setRefreshing(true);
    await loadGrowth();
  }

  return (
    <main className="hlc-command-center hlc-analytics-page">
      <section className="hlc-command-hero hlc-analytics-hero">
        <div className="hlc-command-copy">
          <div className="hlc-command-kicker"><BarChart3 size={15} aria-hidden="true" />Dion · Business &amp; Growth Intelligence</div>
          <h1>HLC Business Intelligence</h1>
          <h2 className="hlc-analytics-context-title">Operating KPIs &amp; Visitor Analytics</h2>
          <p>Canonical workflow performance plus privacy-minimized first-party HLC traffic for the last 30 days. Growth intelligence extends that same evidence with acquisition, attribution, conversion, and Community referral signals.</p>
        </div>
        <div className="hlc-analytics-hero-visual" aria-hidden="true">
          <span className="hlc-analytics-signal is-one" />
          <span className="hlc-analytics-signal is-two" />
          <span className="hlc-analytics-signal is-three" />
          <div><strong>30</strong><small>day evidence window</small></div>
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

          <div className="hlc-analytics-funnel" aria-label="Conversion and evidence rates">
            {funnel.map((item) => <article key={item.label}>
              <div><span>{item.label}</span><strong>{percent(item.value)}</strong></div>
              <div className="hlc-analytics-track" aria-hidden="true"><span style={{ width: `${item.value}%` }} /></div>
            </article>)}
          </div>
        </section>

        <section className="hlc-dashboard-section" aria-labelledby="attribution-heading">
          <div className="hlc-section-heading"><div><span className="hlc-section-eyebrow">Attribution quality</span><h2 id="attribution-heading">Can HLC explain where leads came from?</h2></div></div>
          <div className="hlc-analytics-attribution-grid">
            <article className="hlc-analytics-quality-card">
              <span>Known source coverage</span>
              <strong>{percent(growth?.attribution_known_rate)}</strong>
              <div className="hlc-analytics-ring" style={{ "--hlc-ring-value": `${boundedPercent(growth?.attribution_known_rate) * 3.6}deg` } as React.CSSProperties}><span>{growth?.known_source_leads ?? 0}<small>known</small></span></div>
              <p>{growth?.known_source_leads ?? 0} of {growth?.total_leads ?? 0} recent leads have attributable source evidence.</p>
            </article>
            <article className="hlc-analytics-quality-card is-debt">
              <span>Unknown-source debt</span>
              <strong>{growth?.unknown_source_leads ?? 0}</strong>
              <p>{(growth?.unknown_source_leads ?? 0) > 0 ? "These leads reduce confidence in channel performance. Improve source capture before making channel-spend decisions." : "No unknown-source leads in this window."}</p>
            </article>
          </div>

          <div className="hlc-analytics-bars" aria-label="Lead sources">
            {(growth?.sources ?? []).map((source) => {
              const count = Number(source.lead_count || 0);
              return <article key={source.source}>
                <div><span>{source.source}</span><strong>{count}</strong></div>
                <div className="hlc-analytics-track" aria-hidden="true"><span style={{ width: `${(count / sourceMax) * 100}%` }} /></div>
              </article>;
            })}
            {!growth?.sources?.length && <div className="hlc-empty-state"><h3>No source activity yet</h3><p>No lead-source records were created in this evidence window.</p></div>}
          </div>
        </section>

        <section className="hlc-dashboard-section" aria-labelledby="referrals-heading">
          <div className="hlc-section-heading"><div><span className="hlc-section-eyebrow">Community growth</span><h2 id="referrals-heading">Referral movement</h2></div><UsersRound size={20} aria-hidden="true" /></div>
          <div className="hlc-analytics-bars is-referrals">
            {(growth?.referral_statuses ?? []).map((row) => {
              const count = Number(row.count || 0);
              return <article key={row.status}>
                <div><span>{row.status}</span><strong>{count}</strong></div>
                <div className="hlc-analytics-track" aria-hidden="true"><span style={{ width: `${(count / referralMax) * 100}%` }} /></div>
                <small>Persisted Community referral state</small>
              </article>;
            })}
            {!growth?.referral_statuses?.length && <div className="hlc-empty-state"><h3>No referral movement yet</h3><p>No Community referrals were created in this evidence window.</p></div>}
          </div>
        </section>
      </>}
    </main>
  );
}
