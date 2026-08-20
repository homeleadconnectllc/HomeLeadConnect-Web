import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  getDocumentUrl,
  listDocuments,
  uploadDocument,
  type DocumentRecord,
} from "../../api/documents";
import { errorMessage } from "../../lib/errorMessage";

const captureGuidance = [
  ["Start wide", "Show the room, area, roof section, appliance, fixture, or exterior location so the issue has context."],
  ["Move closer", "Add clear close-ups of damage, leaks, cracks, stains, loose parts, error codes, or the exact service area."],
  ["Capture labels", "When safe, photograph model/serial plates, equipment labels, breaker labels, or other useful identifiers."],
  ["Use video deliberately", "Keep clips short and steady. Video is best when motion, sound, operation, or a path through the property matters."],
] as const;

export default function Documents() {
  const [items, setItems] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setItems(await listDocuments());
  }

  useEffect(() => {
    listDocuments()
      .then(setItems)
      .catch((reason: unknown) => setError(errorMessage(reason, "Unable to load documents.")))
      .finally(() => setLoading(false));
  }, []);

  const typeCounts = useMemo(() => items.reduce((counts, item) => {
    const type = friendlyType(item.mime_type);
    counts[type] = (counts[type] ?? 0) + 1;
    return counts;
  }, {} as Record<string, number>), [items]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const file = form.get("file");
    if (!(file instanceof File) || !file.size) return;

    setBusy(true);
    setError("");
    setMessage("");
    try {
      await uploadDocument({
        entityType: String(form.get("entityType")),
        entityId: String(form.get("entityId")),
        sharingScope: String(form.get("sharingScope")),
        file,
      });
      await load();
      formElement.reset();
      setMessage("Evidence stored, linked to the selected HLC record, and ready for the sharing scope you chose.");
    } catch (reason) {
      setError(errorMessage(reason, "Unable to upload this file."));
    } finally {
      setBusy(false);
    }
  }

  async function open(item: DocumentRecord) {
    try {
      window.open(await getDocumentUrl(item.id, item.storage_path), "_blank", "noopener,noreferrer");
    } catch (reason) {
      setError(errorMessage(reason, "Unable to open this document."));
    }
  }

  return (
    <main className="hlc-documents-workspace">
      <header className="hlc-documents-header">
        <div>
          <p className="hlc-documents-kicker">RECORD EVIDENCE</p>
          <h1>Documents & media</h1>
          <p>Attach useful evidence to the correct HLC record, keep sharing scope explicit, and make the next operator or professional understand the work without guessing.</p>
        </div>
        <div className="hlc-documents-summary" aria-label="Evidence workspace summary">
          <span><strong>{items.length}</strong><small>Stored files</small></span>
          <span><strong>25 MB</strong><small>Per-file limit</small></span>
          <span><strong>{Object.keys(typeCounts).length}</strong><small>Media types</small></span>
        </div>
      </header>

      {error && <p role="alert" className="hlc-documents-status is-error">{error}</p>}
      {message && <p role="status" className="hlc-documents-status is-success">{message}</p>}

      <div className="hlc-documents-console">
        <section className="hlc-documents-intake" aria-labelledby="hlc-document-intake-title">
          <div className="hlc-documents-section-head">
            <div><span>INTAKE</span><h2 id="hlc-document-intake-title">Attach evidence</h2></div>
            <small>Private record first</small>
          </div>
          <form className="hlc-documents-form" onSubmit={submit}>
            <label>Related record type
              <select name="entityType">
                <option value="lead">Lead / service request</option>
                <option value="estimate">LeadScope estimate</option>
                <option value="job">Job</option>
                <option value="appointment">Appointment</option>
                <option value="contractor">Professional / provider</option>
                <option value="conversation">Conversation</option>
              </select>
            </label>
            <label>Related record ID<input name="entityId" required placeholder="Paste or enter the HLC record ID" /></label>
            <label>Who should be able to see it?
              <select name="sharingScope">
                <option value="workspace">HLC workspace only</option>
                <option value="homeowner">Share with linked resident</option>
                <option value="contractor">Share with linked professional</option>
              </select>
            </label>
            <label className="hlc-documents-file-input">
              <strong>Choose a document, photo, or short video</strong>
              <span>PDF, Word, text, JPEG, PNG, WebP, MP4, MOV, or WebM. Maximum 25 MB per file.</span>
              <input name="file" type="file" accept=".pdf,.docx,.txt,image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm" required />
            </label>
            <button disabled={busy}>{busy ? "Uploading securely…" : "Attach to HLC record"}</button>
          </form>
        </section>

        <aside className="hlc-documents-guidance" aria-labelledby="hlc-capture-guide">
          <div className="hlc-documents-section-head"><div><span>FIELD GUIDE</span><h2 id="hlc-capture-guide">Capture useful evidence</h2></div></div>
          <div className="hlc-documents-guidance-list">
            {captureGuidance.map(([title, body], index) => (
              <div className="hlc-documents-guidance-row" key={title}>
                <strong>{index + 1}</strong><div><h3>{title}</h3><p>{body}</p></div>
              </div>
            ))}
          </div>
          <div className="hlc-documents-privacy">
            <strong>Protect private information.</strong>
            <p>Avoid faces when they are not needed, mail, IDs, payment information, passwords, security codes, computer screens, children, or unrelated private areas. Upload only material relevant to the HLC record.</p>
          </div>
        </aside>
      </div>

      <section className="hlc-documents-library" aria-labelledby="hlc-record-library">
        <div className="hlc-documents-section-head">
          <div><span>RECORD LIBRARY</span><h2 id="hlc-record-library">Stored evidence</h2></div>
          <strong>{items.length}</strong>
        </div>
        {loading ? <p className="hlc-documents-state">Loading evidence…</p> : items.length === 0 ? <p className="hlc-documents-state">No documents or media yet. Attach the first useful piece of evidence above.</p> : (
          <div className="hlc-documents-file-list">
            {items.map((item) => (
              <article className="hlc-document-row" key={item.id}>
                <div className="hlc-document-row-main">
                  <button type="button" onClick={() => open(item)}>{item.filename}</button>
                  <span>{item.entity_type} · {item.entity_id}</span>
                </div>
                <div className="hlc-document-row-meta">
                  <strong>{friendlyType(item.mime_type)}</strong>
                  <span>{item.sharing_scope}</span>
                  <small>{formatBytes(item.byte_size)}</small>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "Size unavailable";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 102.4) / 10} KB`;
  return `${Math.round(bytes / (1024 * 102.4)) / 10} MB`;
}

function friendlyType(mime: string) {
  if (mime.startsWith("image/")) return "Photo";
  if (mime.startsWith("video/")) return "Video";
  if (mime === "application/pdf") return "PDF";
  if (mime.includes("wordprocessingml")) return "Word document";
  if (mime === "text/plain") return "Text";
  return "File";
}
