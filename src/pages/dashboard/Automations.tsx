import { Link } from "react-router-dom";
import { automationRegistry, type AutomationMode } from "../../config/automation";

const colors: Record<AutomationMode, string> = { AUTOMATIC: "#166534", RECOMMEND: "#1d4ed8", CONFIRM: "#92400e", BLOCKED: "#b91c1c" };

export default function Automations() {
  return <main style={pageStyle}>
    <header style={heroStyle}>
      <p style={eyebrowStyle}>One HLC system · shared automation layer</p>
      <h1 style={{ margin: 0 }}>Automation control plane</h1>
      <p style={{ margin: 0, maxWidth: 820, lineHeight: 1.6 }}>Every automation belongs to the canonical HLC workflow, records, permissions and audit trail. Automatic work handles safe deterministic steps; recommendations expose reasoning; consequential actions require confirmation.</p>
    </header>

    <section style={legendStyle} aria-label="Automation modes">
      <strong>AUTOMATIC:</strong><span>safe deterministic action</span>
      <strong>RECOMMEND:</strong><span>human chooses after reviewing evidence</span>
      <strong>CONFIRM:</strong><span>preview and explicit authorization required</span>
      <strong>BLOCKED:</strong><span>provider, rule, persistence or approval is missing</span>
    </section>

    <div style={gridStyle}>{automationRegistry.map((item) => <article key={`${item.stage}-${item.name}`} style={cardStyle}>
      <div style={headingStyle}><div><p style={stageStyle}>{item.stage} · {item.owner}</p><h2 style={{ margin: "4px 0" }}>{item.name}</h2></div><strong style={{ ...badgeStyle, color: colors[item.mode], borderColor: colors[item.mode] }}>{item.mode}</strong></div>
      <p><strong>Trigger:</strong> {item.trigger}</p>
      <p><strong>Outcome:</strong> {item.outcome}</p>
      <p><strong>Guardrail:</strong> {item.guardrail}</p>
    </article>)}</div>

    <aside style={boundaryStyle}><h2>One-project boundary</h2><p>Public website, accounts, CRM, LeadScope, providers, jobs, communications, Network, Map, Community, billing and agents are modules of one HomeLead Connect product. They reuse canonical identities and records rather than synchronizing duplicate systems.</p><p><strong>Kendrell:</strong> Inside HLC, Kendrell coordinates command, approvals, risk, system health and agent handoffs. Outside HLC, the private owner-assistant environment stays separately secured and may exchange only explicitly authorized HLC context and actions.</p><Link to="/workflow">Open the golden workflow →</Link></aside>
  </main>;
}

const pageStyle = { width: "min(1180px, calc(100% - 32px))", margin: "40px auto", display: "grid", gap: 22 };
const heroStyle = { display: "grid", gap: 12, padding: "clamp(22px,5vw,44px)", borderRadius: 22, color: "#f8fafc", background: "linear-gradient(135deg,#081426,#12365f)" };
const eyebrowStyle = { margin: 0, color: "#60a5fa", fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" as const };
const legendStyle = { display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 12px", padding: 18, border: "1px solid #cbd5e1", borderRadius: 14, background: "#f8fafc" };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,350px),1fr))", gap: 14 };
const cardStyle = { padding: 20, border: "1px solid #cbd5e1", borderRadius: 16, background: "#fff", lineHeight: 1.55 };
const headingStyle = { display: "flex", justifyContent: "space-between", gap: 14, alignItems: "start" };
const stageStyle = { margin: 0, color: "#2563eb", fontSize: 13, fontWeight: 900, textTransform: "uppercase" as const };
const badgeStyle = { border: "1px solid", borderRadius: 999, padding: "5px 8px", fontSize: 11 };
const boundaryStyle = { padding: 22, border: "1px solid #60a5fa", borderRadius: 16, background: "#eff6ff", lineHeight: 1.6 };
