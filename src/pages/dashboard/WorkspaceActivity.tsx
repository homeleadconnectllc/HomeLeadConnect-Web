import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { listWorkspaceActivity, type WorkspaceActivity } from "../../api/activity";
import { errorMessage } from "../../lib/errorMessage";

export default function WorkspaceActivityPage() {
  const [items, setItems] = useState<WorkspaceActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    listWorkspaceActivity(200)
      .then((rows) => { if (active) setItems(rows); })
      .catch((reason: unknown) => { if (active) setError(errorMessage(reason, "Unable to load workspace activity.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) => [item.event_type, item.entity_type, item.entity_id, JSON.stringify(item.payload ?? {})]
      .filter(Boolean).some((value) => String(value).toLowerCase().includes(needle)));
  }, [items, query]);

  return <main style={pageStyle}>
    <header style={heroStyle}>
      <p style={eyebrowStyle}>Audited workspace history</p>
      <h1 style={{ margin: 0 }}>Activity</h1>
      <p style={{ marginBottom: 0 }}>Recent HLC workspace events. Browser users can read and append authorized activity, but they cannot rewrite or delete history.</p>
    </header>

    <nav style={navStyle} aria-label="Workspace activity links">
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/workflow">Workflow</Link>
      <Link to="/automations">Automations</Link>
      <Link to="/activity" aria-current="page">Activity</Link>
    </nav>

    <label style={fieldStyle}>Filter activity
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="lead, appointment, automation…" />
    </label>

    {loading && <p role="status">Loading activity…</p>}
    {error && <p role="alert" style={errorStyle}>{error}</p>}

    {!loading && !error && visible.length === 0 && <section style={emptyStyle}><h2>No activity in this view</h2><p>Authorized HLC events will appear here as they are recorded.</p></section>}

    <section style={listStyle} aria-label="Workspace activity timeline">
      {visible.map((item) => <article key={item.id} style={cardStyle}>
        <div style={headerRowStyle}>
          <strong>{humanize(item.event_type)}</strong>
          <time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString()}</time>
        </div>
        <p style={{ margin: "6px 0" }}>{item.entity_type || "workspace"}{item.entity_id ? ` · ${item.entity_id}` : ""}</p>
        {item.payload && Object.keys(item.payload).length > 0 && <details><summary>Event details</summary><pre style={preStyle}>{JSON.stringify(item.payload, null, 2)}</pre></details>}
      </article>)}
    </section>
  </main>;
}

function humanize(value: string) {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const pageStyle = { width: "min(1000px, calc(100% - 32px))", margin: "40px auto", display: "grid", gap: 18 };
const heroStyle = { padding: "clamp(22px,5vw,40px)", borderRadius: 22, color: "#f8fafc", background: "linear-gradient(135deg,#081426,#12365f)" };
const eyebrowStyle = { margin: 0, color: "#60a5fa", fontWeight: 900, textTransform: "uppercase" as const, letterSpacing: ".04em" };
const navStyle = { display: "flex", flexWrap: "wrap" as const, gap: 14 };
const fieldStyle = { display: "grid", gap: 6, fontWeight: 700 };
const listStyle = { display: "grid", gap: 12 };
const cardStyle = { padding: 16, border: "1px solid #cbd5e1", borderRadius: 14, background: "#fff" };
const headerRowStyle = { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" as const };
const emptyStyle = { padding: 24, border: "1px dashed #94a3b8", borderRadius: 16, background: "#f8fafc" };
const errorStyle = { color: "#b91c1c", padding: 14, border: "1px solid #fecaca", borderRadius: 12 };
const preStyle = { marginTop: 8, padding: 12, borderRadius: 10, overflowX: "auto" as const, background: "#0f172a", color: "#e2e8f0", whiteSpace: "pre-wrap" as const };
