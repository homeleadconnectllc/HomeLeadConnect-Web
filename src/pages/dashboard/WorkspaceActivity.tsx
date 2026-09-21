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

  return <main className="hlc-ui-page-4b18f2">
    <header className="hlc-ui-hero-b4d8d2">
      <p className="hlc-ui-eyebrow-2aae40">Audited workspace history</p>
      <h1 className="hlc-ui-margin-ab79ea">Activity</h1>
      <p className="hlc-ui-margin-bottom-fa769a">Recent HLC workspace events. Browser users can read and append authorized activity, but they cannot rewrite or delete history.</p>
    </header>

    <nav className="hlc-ui-nav-c3daa7" aria-label="Workspace activity links">
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/workflow">Workflow</Link>
      <Link to="/automations">Automations</Link>
      <Link to="/activity" aria-current="page">Activity</Link>
    </nav>

    <label className="hlc-ui-field-082906">Filter activity
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="lead, appointment, automation…" />
    </label>

    {loading && <p role="status">Loading activity…</p>}
    {error && <p role="alert" className="hlc-ui-error-260ca0">{error}</p>}

    {!loading && !error && visible.length === 0 && <section className="hlc-ui-empty-f0b2c9"><h2>No activity in this view</h2><p>Authorized HLC events will appear here as they are recorded.</p></section>}

    <section className="hlc-ui-community-messages-6d16aa" aria-label="Workspace activity timeline">
      {visible.map((item) => <article key={item.id} className="hlc-ui-card-07eef7">
        <div className="hlc-ui-headerRow-09adb4">
          <strong>{humanize(item.event_type)}</strong>
          <time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString()}</time>
        </div>
        <p className="hlc-ui-margin-5c2df3">{item.entity_type || "workspace"}{item.entity_id ? ` · ${item.entity_id}` : ""}</p>
        {item.payload && Object.keys(item.payload).length > 0 && <details><summary>Event details</summary><pre className="hlc-ui-pre-161c2f">{JSON.stringify(item.payload, null, 2)}</pre></details>}
      </article>)}
    </section>
  </main>;
}

function humanize(value: string) {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
