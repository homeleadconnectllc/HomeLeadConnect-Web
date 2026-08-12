import { Link } from "react-router-dom";
import { ecosystemAreas, statusPriority, workflowSpine, type EcosystemStatus } from "../../config/ecosystem";

const colors: Record<EcosystemStatus, string> = {
  WORKING: "#166534",
  BROKEN: "#b91c1c",
  MISSING: "#9a3412",
  UNDEFINED: "#7e22ce",
  UNPROVEN: "#92400e",
};

export default function Ecosystem() {
  const areas = [...ecosystemAreas].sort((a, b) => statusPriority(a.status) - statusPriority(b.status));
  return <main style={pageStyle}>
    <header style={heroStyle}>
      <p style={eyebrowStyle}>HomeLead Connect · Integration control plane</p>
      <h1 style={{ margin: 0 }}>Entire ecosystem</h1>
      <p style={{ margin: 0, maxWidth: 760, lineHeight: 1.6 }}>One honest view of how acquisition, identity, CRM, operations, providers, communications, agents, Community, alerts, protection and subscription billing connect. Status changes only after end-to-end evidence.</p>
    </header>

    <section aria-labelledby="workflow-title" style={panelStyle}>
      <h2 id="workflow-title">Canonical workflow</h2>
      <ol style={spineStyle}>{workflowSpine.map((step) => <li key={step} style={stepStyle}>{step}</li>)}</ol>
    </section>

    <section aria-labelledby="areas-title">
      <h2 id="areas-title">System areas</h2>
      <div style={gridStyle}>{areas.map((area) => <article key={area.id} style={cardStyle}>
        <div style={cardHeaderStyle}><div><p style={ownerStyle}>{area.owner}</p><h3 style={{ margin: "4px 0 0" }}>{area.label}</h3></div><strong style={{ ...badgeStyle, color: colors[area.status], borderColor: colors[area.status] }}>{area.status}</strong></div>
        <p style={{ lineHeight: 1.55 }}>{area.summary}</p>
        <p><strong>Next gate:</strong> {area.nextGate}</p>
        <div style={routeListStyle}>{area.routes.map((route) => <Link key={route} to={route}>{route}</Link>)}</div>
      </article>)}</div>
    </section>

    <aside style={noticeStyle}><strong>Truth rule:</strong> A route, component, migration, provider account or successful build alone does not make a capability WORKING. UI, domain logic, persistence, authorization, provider outcome, failure states, mobile behavior and verification evidence must all pass.</aside>
  </main>;
}

const pageStyle = { width: "min(1180px, calc(100% - 32px))", margin: "40px auto", display: "grid", gap: 28 };
const heroStyle = { display: "grid", gap: 12, padding: "clamp(22px, 5vw, 42px)", borderRadius: 22, background: "linear-gradient(135deg, #081426, #0f2c50)", color: "#f8fafc" };
const eyebrowStyle = { margin: 0, color: "#60a5fa", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" as const };
const panelStyle = { padding: 20, border: "1px solid #cbd5e1", borderRadius: 16, background: "#fff" };
const spineStyle = { display: "flex", flexWrap: "wrap" as const, gap: 10, padding: 0, listStyle: "none" };
const stepStyle = { padding: "9px 12px", borderRadius: 999, background: "#e0f2fe", color: "#0c4a6e", fontWeight: 700 };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 16 };
const cardStyle = { display: "grid", alignContent: "start", padding: 20, border: "1px solid #e2e8f0", borderRadius: 16, background: "#fff", boxShadow: "0 12px 30px rgba(15,23,42,.06)" };
const cardHeaderStyle = { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start" };
const ownerStyle = { margin: 0, color: "#2563eb", fontSize: 13, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: ".06em" };
const badgeStyle = { flex: "0 0 auto", border: "1px solid", borderRadius: 999, padding: "5px 8px", fontSize: 12 };
const routeListStyle = { display: "flex", flexWrap: "wrap" as const, gap: 8, marginTop: 8 };
const noticeStyle = { padding: 18, border: "1px solid #f59e0b", borderRadius: 14, background: "#fffbeb", lineHeight: 1.5 };
