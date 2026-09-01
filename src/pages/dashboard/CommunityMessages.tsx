import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  listCommunityMessages,
  listCommunityRelationships,
  respondCommunityConnection,
  sendCommunityMessage,
  type CommunityPrivateMessage,
  type CommunityRelationship,
} from "../../api/communityRelationships";
import { errorMessage } from "../../lib/errorMessage";

export default function CommunityMessages() {
  const [relationships, setRelationships] = useState<CommunityRelationship[]>([]);
  const [selectedPeerId, setSelectedPeerId] = useState<string | null>(null);
  const [messages, setMessages] = useState<CommunityPrivateMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const accepted = useMemo(() => relationships.filter((item) => item.relationship_status === "accepted"), [relationships]);
  const incoming = useMemo(() => relationships.filter((item) => item.relationship_status === "pending" && item.direction === "incoming"), [relationships]);
  const selected = accepted.find((item) => item.peer_user_id === selectedPeerId) ?? null;

  async function refreshRelationships() {
    const rows = await listCommunityRelationships();
    setRelationships(rows);
    const firstAccepted = rows.find((item) => item.relationship_status === "accepted");
    setSelectedPeerId((current) => current && rows.some((item) => item.peer_user_id === current && item.relationship_status === "accepted") ? current : firstAccepted?.peer_user_id ?? null);
  }

  useEffect(() => {
    let active = true;
    void listCommunityRelationships()
      .then((rows) => {
        if (!active) return;
        setRelationships(rows);
        setSelectedPeerId(rows.find((item) => item.relationship_status === "accepted")?.peer_user_id ?? null);
      })
      .catch((reason) => { if (active) setError(errorMessage(reason, "Unable to load Community relationships.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedPeerId) { setMessages([]); return; }
    let active = true;
    setError("");
    void listCommunityMessages(selectedPeerId)
      .then((rows) => { if (active) setMessages(rows); })
      .catch((reason) => { if (active) setError(errorMessage(reason, "Unable to load this Community conversation.")); });
    return () => { active = false; };
  }, [selectedPeerId]);

  async function respond(connectionId: string, accept: boolean) {
    setBusy(true);
    setError("");
    try {
      await respondCommunityConnection(connectionId, accept);
      await refreshRelationships();
    } catch (reason) {
      setError(errorMessage(reason, "Unable to update this Community request."));
    } finally {
      setBusy(false);
    }
  }

  async function send(event: FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!selectedPeerId || !body) return;
    setBusy(true);
    setError("");
    try {
      await sendCommunityMessage(selectedPeerId, body);
      setDraft("");
      setMessages(await listCommunityMessages(selectedPeerId));
    } catch (reason) {
      setError(errorMessage(reason, "Unable to send this Community message."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="hlc-community-workspace" style={{ width: "min(1100px, calc(100% - 28px))", margin: "32px auto 80px" }}>
      <header className="hlc-community-header">
        <div>
          <p className="hlc-community-kicker">COMMUNITY · PRIVATE MESSENGER</p>
          <h1>Relationships first. Messages second.</h1>
          <p>Community conversations unlock only for accepted relationships. Customer, lead, appointment, and job communication stays in operational HLC Messages.</p>
        </div>
      </header>

      <nav className="hlc-community-commandbar" aria-label="Community Messenger navigation">
        <Link to="/community-hub">Community Home</Link>
        <Link to="/community/discover">Discover</Link>
        <Link to="/community/swipe">Swipe Match</Link>
        <Link to="/messages">Operational Messages</Link>
      </nav>

      {error && <p role="alert" className="hlc-match-alert">{error}</p>}
      {loading && <p role="status">Loading Community relationships…</p>}

      {incoming.length > 0 && <section className="hlc-premium-callout" style={{ marginTop: 20, padding: 20 }}>
        <h2 style={{ marginTop: 0 }}>Connection requests</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {incoming.map((item) => <article key={item.connection_id} className="hlc-premium-panel" style={{ padding: 16 }}>
            <strong>{item.peer_full_name || "HLC member"}</strong>
            <p style={{ margin: "6px 0 12px" }}>{item.peer_headline || [item.peer_city, item.peer_state].filter(Boolean).join(", ") || "Community member"}</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" disabled={busy} onClick={() => void respond(item.connection_id, true)}>Accept</button>
              <button type="button" disabled={busy} onClick={() => void respond(item.connection_id, false)}>Decline</button>
            </div>
          </article>)}
        </div>
      </section>}

      <section style={{ display: "grid", gridTemplateColumns: "minmax(220px, .75fr) minmax(0, 2fr)", gap: 16, marginTop: 20 }}>
        <aside className="hlc-premium-panel" style={{ padding: 16 }} aria-label="Accepted Community connections">
          <h2 style={{ marginTop: 0 }}>Connections</h2>
          <div style={{ display: "grid", gap: 8 }}>
            {accepted.map((item) => <button key={item.connection_id} type="button" onClick={() => setSelectedPeerId(item.peer_user_id)} aria-pressed={selectedPeerId === item.peer_user_id} style={{ minHeight: 48, textAlign: "left" }}>
              <strong>{item.peer_full_name || "HLC member"}</strong><br />
              <small>{item.peer_role || "Community member"}</small>
            </button>)}
            {!accepted.length && !loading && <p style={{ margin: 0 }}>No accepted Community connections yet.</p>}
          </div>
        </aside>

        <section className="hlc-premium-panel" style={{ padding: 18, minWidth: 0 }} aria-label="Community conversation">
          {!selected ? <div className="hlc-premium-empty"><h2>No open Community conversation.</h2><p>Accept a connection request or connect with a member in Discover first.</p><Link to="/community/discover" style={{ fontWeight: 900 }}>Discover members →</Link></div> : <>
            <header style={{ borderBottom: "1px solid rgba(148,163,184,.24)", paddingBottom: 12, marginBottom: 14 }}>
              <h2 style={{ margin: 0 }}>{selected.peer_full_name || "HLC member"}</h2>
              <p style={{ margin: "5px 0 0" }}>{selected.peer_headline || "Accepted Community connection"}</p>
            </header>
            <div aria-live="polite" style={{ display: "grid", gap: 10, maxHeight: 440, overflowY: "auto", paddingBottom: 10 }}>
              {messages.map((message) => <article key={message.id} style={{ padding: 12, borderRadius: 12, background: "rgba(148,163,184,.12)" }}>
                <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{message.body}</p>
                <small>{new Date(message.created_at).toLocaleString()}</small>
              </article>)}
              {!messages.length && <p>No messages yet. This conversation is unlocked because the relationship is accepted.</p>}
            </div>
            <form onSubmit={send} style={{ display: "grid", gap: 10, marginTop: 14 }}>
              <label htmlFor="community-message-draft" style={{ fontWeight: 800 }}>Message</label>
              <textarea id="community-message-draft" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={4000} rows={4} placeholder="Write a Community message…" />
              <button type="submit" disabled={busy || !draft.trim()} style={{ minHeight: 46 }}>Send Community message</button>
            </form>
          </>}
        </section>
      </section>

      <section style={{ marginTop: 20 }}>
        <h2>When real work begins</h2>
        <p>Move the relationship into <strong>Start Service Request</strong>. The request, assignment, appointment, job, and operational communication then live in core HLC instead of social chat.</p>
        <Link to="/request-service" style={{ fontWeight: 900 }}>Start a service request →</Link>
      </section>
    </main>
  );
}
