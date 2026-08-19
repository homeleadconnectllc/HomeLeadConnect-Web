import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import {
  listConversations,
  listPortalRecipients,
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
  const [sendEmailCopy, setSendEmailCopy] = useState(false);
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
    const draftSubject = subject.trim();
    const draftBody = newBody.trim();
    const shouldSendEmail = sendEmailCopy && Boolean(recipient.email);
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const id = await startPortalConversation({ recipient, subject: draftSubject, body: draftBody });
      setSubject("");
      setNewBody("");
      setRecipientId("");
      setSendEmailCopy(false);
      await load();
      setSelectedId(id);

      if (shouldSendEmail) {
        try {
          await sendPortalEmail({ recipient, subject: draftSubject, body: draftBody, conversationId: id });
          setMessage("Internal conversation started and email sent.");
        } catch (reason) {
          setMessage("Internal conversation started.");
          setError(errorMessage(reason, "The conversation was saved, but the email was not sent."));
        }
      } else {
        setMessage("Internal conversation started.");
      }
    } catch (reason) {
      setError(errorMessage(reason, "Unable to start the conversation."));
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
      setMessage("Internal message posted.");
    } catch (reason) {
      setError(errorMessage(reason, "Unable to post the message."));
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
    <main className="hlc-messages-page" style={pageStyle}>
      <h1>Messages Center</h1>
      <p>Persisted HLC conversation and chat history. External email is sent only when you explicitly select the email option below.</p>
      {composeVoiceNote && !loading && selected && (
        <p role="status" style={{ color: "#075985", fontWeight: 800 }}>
          Voice note mode is ready. The recorder below is attached to the selected conversation.
        </p>
      )}
      {loading && <p>Loading conversations…</p>}
      {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
      {message && <p role="status" style={{ color: "#166534" }}>{message}</p>}

      {!loading && (
        <div className="hlc-messages-layout" style={layoutStyle}>
          <aside className="hlc-messages-conversations" style={panelStyle} aria-label="Chat history">
            <div className="hlc-chat-history-heading">
              <div><span>HISTORY</span><h2>Chats</h2></div>
              <strong>{conversations.length}</strong>
            </div>
            {conversations.length === 0 && <p>No chat history yet.</p>}
            {conversations.map((conversation) => (
              <button
                type="button"
                key={conversation.id}
                className={`hlc-chat-history-item ${conversation.id === selectedId ? "is-selected" : ""}`}
                aria-current={conversation.id === selectedId ? "true" : undefined}
                onClick={() => setSelectedId(conversation.id)}
                style={conversationButtonStyle}
              >
                <strong>{conversation.subject}</strong>
                <span>{latestConversationPreview(conversation)}</span>
                <small>{conversation.messages.length} message{conversation.messages.length === 1 ? "" : "s"} · {new Date(conversation.updated_at).toLocaleString()}</small>
              </button>
            ))}
          </aside>

          <section className="hlc-messages-thread" style={panelStyle}>
            {selected ? <>
              <header className="hlc-message-thread-head">
                <div><span>CONVERSATION HISTORY</span><h2>{selected.subject}</h2></div>
                <strong>{selected.messages.length} message{selected.messages.length === 1 ? "" : "s"}</strong>
              </header>
              <div className="hlc-message-stream" aria-live="polite" aria-label="Persisted chat history">
                {selected.messages.length === 0 && <p>No messages have been recorded in this conversation yet.</p>}
                {selected.messages.map((item) => (
                  <article
                    className={item.sender_user_id === session?.user.id ? "hlc-message-bubble hlc-message-bubble-self" : "hlc-message-bubble"}
                    key={item.id}
                    style={messageStyle}
                  >
                    <p>{item.body}</p>
                    <small>{item.sender_user_id === session?.user.id ? "You" : "Participant"} · {new Date(item.created_at).toLocaleString()} · persisted</small>
                  </article>
                ))}
              </div>

              <form className="hlc-message-reply" onSubmit={send} style={formStyle}>
                <label>Reply
                  <textarea required maxLength={5000} value={reply} onChange={(event) => setReply(event.target.value)} />
                </label>
                <button disabled={busy} type="submit">{busy ? "Posting…" : "Post internal message"}</button>
              </form>

              <section className="hlc-voice-notes">
                <h3>Voice notes</h3>
                <p>Voice notes are deliberate audio messages, not telephone-call recordings.</p>
                {voiceNotes.length === 0 && <p>No voice notes in this conversation.</p>}
                {voiceNotes.map((note) => (
                  <button key={note.id} type="button" onClick={() => playVoiceNote(note)}>
                    Play voice note from {new Date(note.created_at).toLocaleString()}
                  </button>
                ))}
                <VoiceNoteRecorder busy={busy} onUpload={addVoiceNote} focusOnMount={composeVoiceNote} />
              </section>
            </> : <p>Select a chat from your history.</p>}
          </section>
        </div>
      )}

      {recipients.length > 0 && (
        <form className="hlc-message-start" onSubmit={start} style={{ ...panelStyle, marginTop: 20 }}>
          <h2>Start a portal conversation</h2>
          <label>Recipient
            <select
              required
              value={recipientId}
              onChange={(event) => {
                setRecipientId(event.target.value);
                setSendEmailCopy(false);
              }}
            >
              <option value="">Select a linked portal account</option>
              {recipients.map((recipient) => (
                <option key={recipient.linkId} value={recipient.linkId}>
                  {recipient.label}{recipient.email ? ` (${recipient.email})` : ""}
                </option>
              ))}
            </select>
          </label>
          <label>Subject<input required maxLength={160} value={subject} onChange={(event) => setSubject(event.target.value)} /></label>
          <label>Message<textarea required maxLength={5000} value={newBody} onChange={(event) => setNewBody(event.target.value)} /></label>
          {selectedRecipient && (
            <label style={emailOptionStyle}>
              <input
                type="checkbox"
                checked={sendEmailCopy}
                disabled={!selectedRecipient.email || busy}
                onChange={(event) => setSendEmailCopy(event.target.checked)}
              />
              <span>
                <strong>Also send this by email</strong>
                <small>{selectedRecipient.email || "No email address is available for this recipient."}</small>
              </span>
            </label>
          )}
          <button disabled={busy} type="submit">
            {busy ? "Starting…" : sendEmailCopy ? "Start conversation + send email" : "Start internal conversation"}
          </button>
        </form>
      )}
    </main>
  );
}

const pageStyle = { width: "min(1180px, calc(100% - 48px))", margin: "40px auto", fontFamily: "system-ui, sans-serif" };
const layoutStyle = { display: "grid", gridTemplateColumns: "minmax(250px, 0.8fr) minmax(0, 2fr)", gap: 20 };
const panelStyle = { padding: 20, border: "1px solid #e2e8f0", borderRadius: 18 };
const conversationButtonStyle = { display: "grid", gap: 5, width: "100%", marginBottom: 8, padding: 12, textAlign: "left" as const };
const messageStyle = { marginBottom: 10, padding: 12, background: "#f8fafc", borderRadius: 12 };
const formStyle = { display: "grid", gap: 12, marginTop: 18 };
const emailOptionStyle = { display: "flex", gap: 10, alignItems: "flex-start", padding: 12, border: "1px solid #cbd5e1", borderRadius: 12 };
