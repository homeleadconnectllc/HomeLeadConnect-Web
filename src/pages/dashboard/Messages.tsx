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
  const totalMessages = useMemo(() => conversations.reduce((sum, item) => sum + item.messages.length, 0), [conversations]);

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
    <main className="hlc-messages-workspace">
      <header className="hlc-messages-header">
        <div>
          <p className="hlc-messages-kicker">COMMUNICATIONS</p>
          <h1>Messages</h1>
          <p>Persisted HLC conversations, portal communication, and deliberate voice notes in one operator workspace. External email is sent only when explicitly selected.</p>
        </div>
        <div className="hlc-messages-summary" aria-label="Message workspace summary">
          <span><strong>{conversations.length}</strong><small>Conversations</small></span>
          <span><strong>{totalMessages}</strong><small>Messages</small></span>
          <span><strong>{recipients.length}</strong><small>Portal contacts</small></span>
        </div>
      </header>

      {composeVoiceNote && !loading && selected && (
        <p className="hlc-messages-status is-info" role="status">Voice note mode is ready. The recorder below is attached to the selected conversation.</p>
      )}
      {loading && <p className="hlc-messages-state">Loading conversations…</p>}
      {error && <p className="hlc-messages-status is-error" role="alert">{error}</p>}
      {message && <p className="hlc-messages-status is-success" role="status">{message}</p>}

      {!loading && (
        <div className="hlc-messages-console">
          <aside className="hlc-messages-inbox" aria-label="Chat history">
            <div className="hlc-messages-section-head">
              <div><span>INBOX</span><h2>Conversation queue</h2></div>
              <strong>{conversations.length}</strong>
            </div>
            <div className="hlc-messages-inbox-list">
              {conversations.length === 0 && <p className="hlc-messages-empty">No chat history yet.</p>}
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
                <div><span>ACTIVE CONVERSATION</span><h2>{selected.subject}</h2></div>
                <strong>{selected.messages.length} message{selected.messages.length === 1 ? "" : "s"}</strong>
              </header>

              <div className="hlc-message-stream" aria-live="polite" aria-label="Persisted chat history">
                {selected.messages.length === 0 && <p className="hlc-messages-empty">No messages have been recorded in this conversation yet.</p>}
                {selected.messages.map((item) => (
                  <article
                    className={item.sender_user_id === session?.user.id ? "hlc-message-entry is-self" : "hlc-message-entry"}
                    key={item.id}
                  >
                    <div className="hlc-message-entry-meta">
                      <strong>{item.sender_user_id === session?.user.id ? "You" : "Participant"}</strong>
                      <small>{new Date(item.created_at).toLocaleString()} · persisted</small>
                    </div>
                    <p>{item.body}</p>
                  </article>
                ))}
              </div>

              <form className="hlc-message-composer" onSubmit={send}>
                <label htmlFor="hlc-message-reply">Internal reply</label>
                <textarea id="hlc-message-reply" required maxLength={5000} value={reply} onChange={(event) => setReply(event.target.value)} />
                <div className="hlc-message-composer-actions">
                  <small>Stored in the canonical HLC conversation history.</small>
                  <button disabled={busy} type="submit">{busy ? "Posting…" : "Post internal message"}</button>
                </div>
              </form>

              <section className="hlc-voice-note-console">
                <div className="hlc-messages-section-head">
                  <div><span>AUDIO</span><h3>Voice notes</h3></div>
                  <strong>{voiceNotes.length}</strong>
                </div>
                <p>Voice notes are deliberate audio messages, not telephone-call recordings.</p>
                <div className="hlc-voice-note-list">
                  {voiceNotes.length === 0 && <p className="hlc-messages-empty">No voice notes in this conversation.</p>}
                  {voiceNotes.map((note) => (
                    <button key={note.id} type="button" onClick={() => playVoiceNote(note)}>
                      <span>Play voice note</span><small>{new Date(note.created_at).toLocaleString()}</small>
                    </button>
                  ))}
                </div>
                <VoiceNoteRecorder busy={busy} onUpload={addVoiceNote} focusOnMount={composeVoiceNote} />
              </section>
            </> : <p className="hlc-messages-empty">Select a conversation from the queue.</p>}
          </section>
        </div>
      )}

      {recipients.length > 0 && (
        <form className="hlc-message-start-workspace" onSubmit={start}>
          <div className="hlc-messages-section-head">
            <div><span>NEW CONVERSATION</span><h2>Start portal conversation</h2></div>
            <small>Internal by default</small>
          </div>
          <div className="hlc-message-start-fields">
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
                    {portalRecipientDisplayLabel(recipient)}
                  </option>
                ))}
              </select>
              {selectedRecipient && <small className="hlc-recipient-detail">
                {selectedRecipient.email ? `Email available: ${selectedRecipient.email}` : "Internal portal messaging only"}
              </small>}
            </label>
            <label>Subject<input required maxLength={160} value={subject} onChange={(event) => setSubject(event.target.value)} /></label>
            <label className="hlc-message-start-body">Message<textarea required maxLength={5000} value={newBody} onChange={(event) => setNewBody(event.target.value)} /></label>
          </div>
          {selectedRecipient && (
            <label className="hlc-message-email-option">
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
          <div className="hlc-message-start-actions">
            <small>Email is never sent unless the checkbox above is deliberately selected.</small>
            <button disabled={busy} type="submit">
              {busy ? "Starting…" : sendEmailCopy ? "Start conversation + send email" : "Start internal conversation"}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
