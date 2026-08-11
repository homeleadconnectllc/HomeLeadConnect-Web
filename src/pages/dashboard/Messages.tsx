import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { listConversations, listPortalRecipients, postInternalMessage, startPortalConversation, type Conversation, type PortalRecipient } from "../../api/messages";
import { useAuth } from "../../hooks/useAuth";
import { errorMessage } from "../../lib/errorMessage";

export default function Messages() {
  const { session } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [recipients, setRecipients] = useState<PortalRecipient[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [newBody, setNewBody] = useState("");
  const [reply, setReply] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [conversationRows, recipientRows] = await Promise.all([listConversations(), listPortalRecipients()]);
      setConversations(conversationRows);
      setRecipients(recipientRows);
      setSelectedId((current) => current && conversationRows.some((item) => item.id === current) ? current : conversationRows[0]?.id ?? null);
    } catch (reason) { setError(errorMessage(reason, "Unable to load messages.")); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([listConversations(), listPortalRecipients()])
      .then(([conversationRows, recipientRows]) => {
        if (!active) return;
        setConversations(conversationRows); setRecipients(recipientRows); setSelectedId(conversationRows[0]?.id ?? null);
      })
      .catch((reason: unknown) => { if (active) setError(errorMessage(reason, "Unable to load messages.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const selected = useMemo(() => conversations.find((item) => item.id === selectedId) ?? null, [conversations, selectedId]);

  async function start(event: FormEvent) {
    event.preventDefault();
    const recipient = recipients.find((item) => item.linkId === recipientId);
    if (!recipient) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const id = await startPortalConversation({ recipient, subject, body: newBody });
      setSubject(""); setNewBody(""); setRecipientId("");
      await load(); setSelectedId(id); setMessage("Internal conversation started.");
    } catch (reason) { setError(errorMessage(reason, "Unable to start the conversation.")); }
    finally { setBusy(false); }
  }

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!selected || !reply.trim()) return;
    setBusy(true); setError(""); setMessage("");
    try { await postInternalMessage(selected.id, reply); setReply(""); await load(); setMessage("Internal message posted."); }
    catch (reason) { setError(errorMessage(reason, "Unable to post the message.")); }
    finally { setBusy(false); }
  }

  return <main style={pageStyle}>
    <h1>Messages</h1>
    <p>Persisted HLC portal messages. SMS and email are separate transports and are not represented as connected here.</p>
    {loading && <p>Loading conversations…</p>}
    {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
    {message && <p role="status" style={{ color: "#166534" }}>{message}</p>}
    {!loading && <div style={layoutStyle}>
      <aside style={panelStyle}>
        <h2>Conversations</h2>
        {conversations.length === 0 && <p>No conversations yet.</p>}
        {conversations.map((conversation) => <button type="button" key={conversation.id}
          onClick={() => setSelectedId(conversation.id)} style={conversationButtonStyle}>
          <strong>{conversation.subject}</strong><br /><small>{new Date(conversation.updated_at).toLocaleString()}</small>
        </button>)}
      </aside>
      <section style={panelStyle}>
        {selected ? <>
          <h2>{selected.subject}</h2>
          <div aria-live="polite">{selected.messages.map((item) => <article key={item.id} style={{ ...messageStyle, marginLeft: item.sender_user_id === session?.user.id ? "15%" : 0 }}>
            <p>{item.body}</p><small>{item.sender_user_id === session?.user.id ? "You" : "Participant"} · {new Date(item.created_at).toLocaleString()} · persisted</small>
          </article>)}</div>
          <form onSubmit={send} style={formStyle}><label>Reply<textarea required maxLength={5000} value={reply} onChange={(event) => setReply(event.target.value)} /></label><button disabled={busy} type="submit">{busy ? "Posting…" : "Post internal message"}</button></form>
        </> : <p>Select a conversation.</p>}
      </section>
    </div>}
    {recipients.length > 0 && <form onSubmit={start} style={{ ...panelStyle, marginTop: 20 }}>
      <h2>Start a portal conversation</h2>
      <label>Recipient<select required value={recipientId} onChange={(event) => setRecipientId(event.target.value)}><option value="">Select a linked portal account</option>{recipients.map((recipient) => <option key={recipient.linkId} value={recipient.linkId}>{recipient.label}{recipient.email ? ` (${recipient.email})` : ""}</option>)}</select></label>
      <label>Subject<input required maxLength={160} value={subject} onChange={(event) => setSubject(event.target.value)} /></label>
      <label>Message<textarea required maxLength={5000} value={newBody} onChange={(event) => setNewBody(event.target.value)} /></label>
      <button disabled={busy} type="submit">{busy ? "Starting…" : "Start internal conversation"}</button>
    </form>}
  </main>;
}

const pageStyle = { width: "min(1100px, calc(100% - 48px))", margin: "40px auto", fontFamily: "system-ui, sans-serif" };
const layoutStyle = { display: "grid", gridTemplateColumns: "minmax(220px, 0.7fr) minmax(0, 2fr)", gap: 20 };
const panelStyle = { padding: 20, border: "1px solid #e2e8f0", borderRadius: 14 };
const conversationButtonStyle = { display: "block", width: "100%", marginBottom: 8, padding: 12, textAlign: "left" as const };
const messageStyle = { marginBottom: 10, padding: 12, background: "#f8fafc", borderRadius: 10 };
const formStyle = { display: "grid", gap: 12, marginTop: 18 };
