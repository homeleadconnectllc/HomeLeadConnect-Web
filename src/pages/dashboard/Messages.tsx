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
type MessagesView = "inbox" | "thread" | "compose";

function latestConversationPreview(conversation: Conversation) {
  const latest = conversation.messages[conversation.messages.length - 1];
  if (!latest?.body) return "No messages in this conversation yet.";
  const normalized = latest.body.replace(/\s+/g, " ").trim();
  return normalized.length > 84 ? `${normalized.slice(0, 81)}…` : normalized;
}

function conversationInitial(conversation: Conversation) {
  const label = conversation.subject?.trim() || "HLC";
  return label.slice(0, 1).toUpperCase();
}

export default function Messages() {
  const { session } = useAuth();
  const [searchParams] = useSearchParams();
  const composeVoiceNote = searchParams.get("compose") === "voice-note";
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [recipients, setRecipients] = useState<PortalRecipient[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<MessagesView>("inbox");
  const [subject, setSubject] = useState("");
  const [newBody, setNewBody] = useState("");
  const [reply, setReply] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("internal");
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [recipientsLoading, setRecipientsLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [recipientError, setRecipientError] = useState("");
  const [message, setMessage] = useState("");
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);

  const loadConversations = useCallback(async () => {
    setError("");
    try {
      const conversationRows = await listConversations();
      setConversations(conversationRows);
      setSelectedId((current) => current && conversationRows.some((item) => item.id === current) ? current : null);
      return conversationRows;
    } catch (reason) {
      setError(errorMessage(reason, "Unable to load conversations."));
      return [] as Conversation[];
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  const loadRecipients = useCallback(async () => {
    setRecipientError("");
    setRecipientsLoading(true);
    try {
      setRecipients(await listPortalRecipients());
    } catch (reason) {
      setRecipientError(errorMessage(reason, "Unable to load contacts for a new message."));
    } finally {
      setRecipientsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    listConversations()
      .then((conversationRows) => {
        if (!active) return;
        setConversations(conversationRows);
        if (composeVoiceNote && conversationRows[0]) {
          setSelectedId(conversationRows[0].id);
          setView("thread");
        }
      })
      .catch((reason: unknown) => {
        if (active) setError(errorMessage(reason, "Unable to load conversations."));
      })
      .finally(() => {
        if (active) setConversationsLoading(false);
      });

    listPortalRecipients()
      .then((recipientRows) => {
        if (active) setRecipients(recipientRows);
      })
      .catch((reason: unknown) => {
        if (active) setRecipientError(errorMessage(reason, "Unable to load contacts for a new message."));
      })
      .finally(() => {
        if (active) setRecipientsLoading(false);
      });

    return () => { active = false; };
  }, [composeVoiceNote]);

  const selected = useMemo(
    () => conversations.find((item) => item.id === selectedId) ?? null,
    [conversations, selectedId],
  );
  const selectedRecipient = useMemo(
    () => recipients.find((item) => item.linkId === recipientId) ?? null,
    [recipients, recipientId],
  );
  const sendEmailCopy = deliveryMode === "email";

  useEffect(() => {
    if (!selectedId) return;
    listVoiceNotes(selectedId)
      .then(setVoiceNotes)
      .catch((reason: unknown) => setError(errorMessage(reason, "Unable to load voice notes.")));
  }, [selectedId]);

  function openInbox() {
    setView("inbox");
    setSelectedId(null);
    setVoiceNotes([]);
    setReply("");
    setMessage("");
  }

  function openConversation(id: string) {
    setVoiceNotes([]);
    setSelectedId(id);
    setView("thread");
    setError("");
    setMessage("");
  }

  function openNewMessage() {
    setView("compose");
    setSelectedId(null);
    setVoiceNotes([]);
    setError("");
    setMessage("");
    if (!recipientsLoading && recipients.length === 0 && recipientError) void loadRecipients();
  }

  async function start(event: FormEvent) {
    event.preventDefault();
    const recipient = recipients.find((item) => item.linkId === recipientId);
    if (!recipient) return;
    const draftSubject = subject.trim() || "HomeLead Connect message";
    const draftBody = newBody.trim();
    const shouldSendEmail = sendEmailCopy;
    if (shouldSendEmail && !recipient.email) {
      setError("This contact does not have an email address. Choose HLC message instead.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");
    try {
      const id = await startPortalConversation({ recipient, subject: draftSubject, body: draftBody });
      await loadConversations();
      setVoiceNotes([]);
      setSelectedId(id);
      setView("thread");

      if (shouldSendEmail) {
        try {
          await sendPortalEmail({ recipient, subject: draftSubject, body: draftBody, conversationId: id });
          setMessage("Email sent and saved in HLC.");
        } catch (reason) {
          setMessage("Conversation saved in HLC.");
          setError(errorMessage(reason, "Email could not be sent. The conversation was still saved."));
        }
      } else {
        setMessage("Message saved in HLC.");
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
      await loadConversations();
      setSelectedId(selected.id);
      setMessage("Reply saved in HLC.");
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
    <main className="hlc-messages-workspace hlc-messages-app-shell" data-messages-view={view}>
      <header className="hlc-messages-app-topbar">
        <div>
          <p className="hlc-messages-kicker">MESSAGES</p>
          <h1>Conversations</h1>
        </div>
        {view === "inbox" && (
          <button className="hlc-messages-new-action" type="button" onClick={openNewMessage}>New Message</button>
        )}
      </header>

      {composeVoiceNote && !conversationsLoading && selected && (
        <p className="hlc-messages-status is-info" role="status">Voice note mode is ready. The recorder is attached to this conversation.</p>
      )}
      {error && <p className="hlc-messages-status is-error" role="alert">{error}</p>}
      {message && <p className="hlc-messages-status is-success" role="status">{message}</p>}

      <div className="hlc-messaging-frame">
        <aside className={`hlc-conversation-list-panel${view === "inbox" ? " is-active" : ""}`} aria-label="Message inbox">
          <div className="hlc-conversation-list-heading">
            <div>
              <span>Inbox</span>
              <strong>{conversations.length}</strong>
            </div>
            <p>Recent conversations</p>
          </div>

          {conversationsLoading ? (
            <p className="hlc-messages-state">Loading conversations…</p>
          ) : (
            <div className="hlc-messages-inbox-list hlc-messages-progressive-inbox">
              {conversations.length === 0 && <p className="hlc-messages-empty">No conversations yet. Start a new message when you are ready.</p>}
              {conversations.map((conversation) => (
                <button
                  type="button"
                  key={conversation.id}
                  className={`hlc-message-inbox-row${selectedId === conversation.id ? " is-selected" : ""}`}
                  onClick={() => openConversation(conversation.id)}
                >
                  <span className="hlc-message-avatar" aria-hidden="true">{conversationInitial(conversation)}</span>
                  <span className="hlc-message-inbox-main">
                    <strong>{conversation.subject}</strong>
                    <small>{latestConversationPreview(conversation)}</small>
                  </span>
                  <span className="hlc-message-inbox-meta">
                    <small>{new Date(conversation.updated_at).toLocaleDateString()}</small>
                    <strong>{conversation.messages.length}</strong>
                  </span>
                </button>
              ))}
            </div>
          )}
        </aside>

        <section className={`hlc-conversation-stage${view !== "inbox" ? " is-active" : ""}`} aria-label="Conversation workspace">
          {view === "inbox" && (
            <div className="hlc-conversation-empty-stage">
              <span aria-hidden="true">HLC</span>
              <h2>Select a conversation</h2>
              <p>Choose a message from the inbox or start a new conversation.</p>
              <button type="button" onClick={openNewMessage}>New Message</button>
            </div>
          )}

          {view === "compose" && (
            <section className="hlc-message-compose-view" aria-label="New message">
              <div className="hlc-messages-view-toolbar">
                <button type="button" className="hlc-messages-back-action" onClick={openInbox}>← Back to inbox</button>
              </div>
              <form className="hlc-message-quick-compose" onSubmit={start}>
                <div className="hlc-message-stage-heading">
                  <span>NEW MESSAGE</span>
                  <h2>Start a conversation</h2>
                </div>

                {recipientError && <p className="hlc-messages-status is-error" role="alert">{recipientError}</p>}
                {recipientsLoading ? (
                  <p className="hlc-messages-state">Loading contacts…</p>
                ) : recipients.length === 0 ? (
                  <div className="hlc-messages-empty-action">
                    <p className="hlc-messages-empty">No message contacts are available right now.</p>
                    <button type="button" onClick={() => void loadRecipients()}>Retry contacts</button>
                  </div>
                ) : (
                  <>
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
                            {portalRecipientDisplayLabel(recipient)}
                          </option>
                        ))}
                      </select>
                      {selectedRecipient && <small>{selectedRecipient.email ? `Email available: ${selectedRecipient.email}` : "HLC message only"}</small>}
                    </label>

                    <fieldset className="hlc-message-delivery-choice">
                      <legend>Send using</legend>
                      <label>
                        <input type="radio" name="deliveryMode" value="internal" checked={deliveryMode === "internal"} onChange={() => setDeliveryMode("internal")} />
                        <span><strong>HLC message</strong><small>Keep this conversation inside HLC</small></span>
                      </label>
                      <label className={!selectedRecipient?.email ? "is-disabled" : ""}>
                        <input type="radio" name="deliveryMode" value="email" checked={sendEmailCopy} disabled={!selectedRecipient?.email} onChange={() => setDeliveryMode("email")} />
                        <span><strong>Email</strong><small>Send an email and save it here</small></span>
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
                      {busy ? "Sending…" : sendEmailCopy ? "Send email" : "Send message"}
                    </button>
                  </>
                )}
              </form>
            </section>
          )}

          {view === "thread" && (
            <section className="hlc-messages-thread hlc-messages-progressive-thread" aria-label="Conversation">
              <div className="hlc-messages-view-toolbar">
                <button type="button" className="hlc-messages-back-action" onClick={openInbox}>← Back to inbox</button>
                <button type="button" className="hlc-messages-new-secondary" onClick={openNewMessage}>New Message</button>
              </div>

              {selected ? <>
                <header className="hlc-message-thread-head">
                  <div>
                    <span>CONVERSATION</span>
                    <h2>{selected.subject}</h2>
                    <small>{selected.messages.length} {selected.messages.length === 1 ? "message" : "messages"}</small>
                  </div>
                </header>

                <div className="hlc-message-stream" aria-live="polite" aria-label="Conversation history">
                  {selected.messages.length === 0 && <p className="hlc-messages-empty">No messages have been recorded in this conversation yet.</p>}
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
                  <label htmlFor="hlc-message-reply">Reply</label>
                  <textarea id="hlc-message-reply" required maxLength={5000} value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Write a reply…" />
                  <div className="hlc-message-composer-actions">
                    <small>Replies stay in this HLC conversation.</small>
                    <button disabled={busy || !reply.trim()} type="submit">{busy ? "Sending…" : "Send reply"}</button>
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
              </> : (
                <div className="hlc-messages-empty-action">
                  <p className="hlc-messages-empty">This conversation is no longer available.</p>
                  <button type="button" onClick={openInbox}>Return to inbox</button>
                </div>
              )}
            </section>
          )}
        </section>
      </div>
    </main>
  );
}