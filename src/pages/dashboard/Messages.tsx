import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import {
  listConversations,
  listPortalRecipients,
  portalRecipientDisplayLabel,
  postInternalMessage,
  sendPortalEmail,
  startPortalConversation,
  type Conversation,
  type PortalRecipient,
} from "../../api/messages";
import { useAuth } from "../../hooks/useAuth";
import { errorMessage } from "../../lib/errorMessage";
import { getVoiceNoteUrl, listVoiceNotes, uploadVoiceNote, type VoiceNote } from "../../api/voiceNotes";
import VoiceNoteRecorder from "../../components/messages/VoiceNoteRecorder";

type DeliveryMode = "internal" | "email";

function latestConversationPreview(conversation: Conversation) {
  const latest = conversation.messages[conversation.messages.length - 1];
  if (!latest?.body) return "No messages in this conversation yet.";
  const normalized = latest.body.replace(/\s+/g, " ").trim();
  return normalized.length > 84 ? `${normalized.slice(0, 81)}…` : normalized;
}

export default function Messages() {
  const { session } = useAuth();
  const [searchParams] = useSearchParams();
  const composeVoiceNote = searchParams.get("compose") === "voice-note";
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [recipients, setRecipients] = useState<PortalRecipient[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [newBody, setNewBody] = useState("");
  const [reply, setReply] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("internal");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);

  const load = useCallback(async () => {
    setError("");
    try {
      const [conversationRows, recipientRows] = await Promise.all([listConversations(), listPortalRecipients()]);
      setConversations(conversationRows);
      setRecipients(recipientRows);
      setSelectedId((current) => current && conversationRows.some((item) => item.id === current) ? current : conversationRows[0]?.id ?? null);
    } catch (reason) {
      setError(errorMessage(reason, "Unable to load messages."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([listConversations(), listPortalRecipients()])
      .then(([conversationRows, recipientRows]) => {
        if (!active) return;
        setConversations(conversationRows);
        setRecipients(recipientRows);
        setSelectedId(conversationRows[0]?.id ?? null);
      })
      .catch((reason: unknown) => {
        if (active) setError(errorMessage(reason, "Unable to load messages."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const selected = useMemo(
    () => conversations.find((item) => item.id === selectedId) ?? null,
    [conversations, selectedId],
  );
  const selectedRecipient = useMemo(
    () => recipients.find((item) => item.linkId === recipientId) ?? null,
    [recipients, recipientId],
  );

  useEffect(() => {
    if (!selectedId) return;
    listVoiceNotes(selectedId)
      .then(setVoiceNotes)
      .catch((reason: unknown) => setError(errorMessage(reason, "Unable to load voice notes.")));
  }, [selectedId]);

  async function start(event: FormEvent) {
    event.preventDefault();
    const recipient = recipients.find((item) => item.linkId === recipientId);
    if (!recipient) return;
    const draftSubject = subject.trim() || "HomeLead Connect message";
    const draftBody = newBody.trim();
    const shouldSendEmail = deliveryMode === "email";
    if (shouldSendEmail && !recipient.email) {
      setError("This contact does not have an email address. Choose Internal instead.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");
    try {
      const id = await startPortalConversation({ recipient, subject: draftSubject, body: draftBody });
      await load();
      setSelectedId(id);

      if (shouldSendEmail) {
        try {
          await sendPortalEmail({ recipient, subject: draftSubject, body: draftBody, conversationId: id });
          setMessage("Email sent and saved in HLC.");
        } catch (reason) {
          setMessage("Conversation saved in HLC.");
          setError(errorMessage(reason, "Email provider failed. The conversation was still saved."));
        }
      } else {
        setMessage("Internal message saved in HLC.");
      }

      setSubject("");
      setNewBody("");
      setRecipientId("");
      setDeliveryMode("internal");
    } catch (reason) {
      setError(errorMessage(reason, "Unable to send this message."));
    } finally {
      setBusy(false);
    }
  }

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!selected || !reply.trim()) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await postInternalMessage(selected.id, reply);
      setReply("");
      await load();
      setMessage("Internal reply saved.");
    } catch (reason) {
      setError(errorMessage(reason, "Unable to post the reply."));
    } finally {
      setBusy(false);
    }
  }

  async function addVoiceNote(file: File, durationSeconds?: number) {
    if (!selected) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await uploadVoiceNote(selected.id, selected.workspace_id, file, durationSeconds);
      setVoiceNotes(await listVoiceNotes(selected.id));
      setMessage("Voice note stored in this conversation.");
    } catch (reason) {
      setError(errorMessage(reason, "Unable to store the voice note."));
    } finally {
      setBusy(false);
    }
  }

  async function playVoiceNote(note: VoiceNote) {
    try {
      const url = await getVoiceNoteUrl(note.storage_path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (reason) {
      setError(errorMessage(reason, "Unable to open the voice note."));
    }
  }

  return (
    <main className="hlc-messages-workspace hlc-messages-launch-simple">
      <header className="hlc-messages-header">
        <div>
          <p className="hlc-messages-kicker">COMMUNICATIONS</p>
          <h1>Messages</h1>
          <p>Choose a contact, choose Email or Internal, write the message, and send. Calls and texts stay in their own workspace.</p>
        </div>
      </header>

      {loading && <p className="hlc-messages-state">Loading conversations…</p>}
      {error && <p className="hlc-messages-status is-error" role="alert">{error}</p>}
      {message && <p className="hlc-messages-status is-success" role="status">{message}</p>}

      {!loading && recipients.length > 0 && (
        <form className="hlc-message-quick-compose" onSubmit={start}>
          <div className="hlc-messages-section-head">
            <div><span>NEW MESSAGE</span><h2>Send a message</h2></div>
          </div>

          <label>Contact
            <select
              required
              value={recipientId}
              onChange={(event) => {
                setRecipientId(event.target.value);
                setDeliveryMode("internal");
                setError("");
              }}
            >
              <option value="">Select a contact</option>
              {recipients.map((recipient) => (
                <option key={recipient.linkId} value={recipient.linkId}>
                  {portalRecipientDisplayLabel(recipient)}{recipient.email ? ` · ${recipient.email}` : ""}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="hlc-message-delivery-choice">
            <legend>Send as</legend>
            <label>
              <input type="radio" name="deliveryMode" value="internal" checked={deliveryMode === "internal"} onChange={() => setDeliveryMode("internal")} />
              <span><strong>Internal</strong><small>HLC conversation only</small></span>
            </label>
            <label className={!selectedRecipient?.email ? "is-disabled" : ""}>
              <input type="radio" name="deliveryMode" value="email" checked={deliveryMode === "email"} disabled={!selectedRecipient?.email} onChange={() => setDeliveryMode("email")} />
              <span><strong>Email</strong><small>{selectedRecipient?.email || "No email available"}</small></span>
            </label>
          </fieldset>

          <label>Message
            <textarea required maxLength={5000} value={newBody} onChange={(event) => setNewBody(event.target.value)} placeholder="Write your message…" />
          </label>

          <details className="hlc-message-subject-details">
            <summary>Optional subject</summary>
            <label>Subject<input maxLength={160} value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="HomeLead Connect message" /></label>
          </details>

          <button className="hlc-message-primary-send" disabled={busy || !recipientId || !newBody.trim()} type="submit">
            {busy ? "Sending…" : deliveryMode === "email" ? "Send email" : "Send internal message"}
          </button>
        </form>
      )}

      {!loading && (
        <div className="hlc-messages-console">
          <aside className="hlc-messages-inbox" aria-label="Conversation history">
            <div className="hlc-messages-section-head">
              <div><span>INBOX</span><h2>Conversations</h2></div>
              <strong>{conversations.length}</strong>
            </div>
            <div className="hlc-messages-inbox-list">
              {conversations.length === 0 && <p className="hlc-messages-empty">No conversation history yet.</p>}
              {conversations.map((conversation) => (
                <button
                  type="button"
                  key={conversation.id}
                  className={`hlc-message-inbox-row ${conversation.id === selectedId ? "is-selected" : ""}`}
                  aria-current={conversation.id === selectedId ? "true" : undefined}
                  onClick={() => setSelectedId(conversation.id)}
                >
                  <span className="hlc-message-inbox-main"><strong>{conversation.subject}</strong><small>{latestConversationPreview(conversation)}</small></span>
                  <span className="hlc-message-inbox-meta"><strong>{conversation.messages.length}</strong><small>{new Date(conversation.updated_at).toLocaleString()}</small></span>
                </button>
              ))}
            </div>
          </aside>

          <section className="hlc-messages-thread">
            {selected ? <>
              <header className="hlc-message-thread-head">
                <div><span>CONVERSATION</span><h2>{selected.subject}</h2></div>
                <strong>{selected.messages.length}</strong>
              </header>

              <div className="hlc-message-stream" aria-live="polite" aria-label="Persisted conversation history">
                {selected.messages.length === 0 && <p className="hlc-messages-empty">No messages yet.</p>}
                {selected.messages.map((item) => (
                  <article className={item.sender_user_id === session?.user.id ? "hlc-message-entry is-self" : "hlc-message-entry"} key={item.id}>
                    <div className="hlc-message-entry-meta">
                      <strong>{item.sender_user_id === session?.user.id ? "You" : "Participant"}</strong>
                      <small>{new Date(item.created_at).toLocaleString()}</small>
                    </div>
                    <p>{item.body}</p>
                  </article>
                ))}
              </div>

              <form className="hlc-message-composer" onSubmit={send}>
                <label htmlFor="hlc-message-reply">Internal reply</label>
                <textarea id="hlc-message-reply" required maxLength={5000} value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Reply inside HLC…" />
                <div className="hlc-message-composer-actions">
                  <small>Internal replies stay in HLC.</small>
                  <button disabled={busy} type="submit">{busy ? "Posting…" : "Post reply"}</button>
                </div>
              </form>

              <details className="hlc-voice-note-console" open={composeVoiceNote || undefined}>
                <summary>Voice notes ({voiceNotes.length})</summary>
                <div className="hlc-voice-note-list">
                  {voiceNotes.length === 0 && <p className="hlc-messages-empty">No voice notes in this conversation.</p>}
                  {voiceNotes.map((note) => (
                    <button key={note.id} type="button" onClick={() => playVoiceNote(note)}>
                      <span>Play voice note</span><small>{new Date(note.created_at).toLocaleString()}</small>
                    </button>
                  ))}
                </div>
                <VoiceNoteRecorder busy={busy} onUpload={addVoiceNote} focusOnMount={composeVoiceNote} />
              </details>
            </> : <p className="hlc-messages-empty">Select a conversation from the inbox.</p>}
          </section>
        </div>
      )}
    </main>
  );
}
