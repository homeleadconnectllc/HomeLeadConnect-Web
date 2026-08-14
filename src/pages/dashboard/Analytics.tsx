import { BarChart3, Eye, ShieldCheck, Sparkles } from "lucide-react";
import AnalyticsKpis from "../../components/analytics/AnalyticsKpis";

export default function Analytics() {
  return (
    <main className="hlc-command-center hlc-analytics-page">
      <section className="hlc-command-hero">
        <div className="hlc-command-copy">
          <div className="hlc-command-kicker"><BarChart3 size={15} aria-hidden="true" />HLC Intelligence</div>
          <h1>KPIs, analytics & visitor intelligence</h1>
          <p>Measure the actual HomeLead Connect journey from visitor intent through LeadScope, jobs, providers, scheduling and follow-through.</p>
        </div>
      </section>

      <section className="hlc-system-strip" aria-label="Analytics principles">
        <ShieldCheck size={16} aria-hidden="true" />
        <span>First-party, privacy-minimized measurement</span>
        <span className="hlc-system-divider" />
        <Eye size={16} aria-hidden="true" />
        <span>No fabricated traffic or outcomes</span>
      </section>

      <AnalyticsKpis />

      <section className="hlc-dashboard-section">
        <div className="hlc-section-heading">
          <div>
            <span className="hlc-section-eyebrow">Future intelligence</span>
            <h2>What HLC will learn over time</h2>
          </div>
          <Sparkles size={20} aria-hidden="true" />
        </div>
        <div className="hlc-workspace-grid">
          <article className="hlc-workspace-card"><span className="hlc-workspace-copy"><strong>Demand signals</strong><span>Which services, ZIP codes, seasons and request types create the strongest qualified demand.</span></span></article>
          <article className="hlc-workspace-card"><span className="hlc-workspace-copy"><strong>Estimate intelligence</strong><span>LeadScope conversion, material sourcing behavior, markup performance and estimate acceptance.</span></span></article>
          <article className="hlc-workspace-card"><span className="hlc-workspace-copy"><strong>Provider intelligence</strong><span>Offer response, acceptance, schedule reliability, completion and customer-experience signals.</span></span></article>
          <article className="hlc-workspace-card"><span className="hlc-workspace-copy"><strong>Operations health</strong><span>Follow-up aging, missed calls, voicemail recovery, appointment throughput and workflow bottlenecks.</span></span></article>
          <article className="hlc-workspace-card"><span className="hlc-workspace-copy"><strong>Property & mechanical context</strong><span>Over time HLC can connect authorized property, equipment, maintenance-cycle and service-history evidence without guessing unsupported facts.</span></span></article>
          <article className="hlc-workspace-card"><span className="hlc-workspace-copy"><strong>Agent effectiveness</strong><span>Measure which Kendrell, Dion and Diamond guidance paths help users reach approved next actions faster.</span></span></article>
        </div>
      </section>
    </main>
  );
}
