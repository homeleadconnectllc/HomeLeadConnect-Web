import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
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

const documentEntityTypes = new Set(["lead", "estimate", "job", "appointment", "contractor", "conversation"]);
const filterScopes = ["all", "workspace", "homeowner", "contractor"] as const;
type FilterScope = (typeof filterScopes)[number];

export default function Documents() {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState<FilterScope>("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const requestedEntityType = searchParams.get("entityType") || "";
  const requestedEntityId = searchParams.get("entityId") || "";
  const initialEntityType = documentEntityTypes.has(requestedEntityType) ? requestedEntityType : "lead";

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

  const entityTypes = useMemo(() => Array.from(new Set(items.map((item) => item.entity_type))).sort(), [items]);
  const fileTypes = useMemo(() => Array.from(new Set(items.map((item) => friendlyType(item.mime_type)))).sort(), [items]);
  const filteredItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      if (entityFilter !== "all" && item.entity_type !== entityFilter) return false;
      if (scopeFilter !== "all" && item.sharing_scope !== scopeFilter) return false;
      if (typeFilter !== "all" && friendlyType(item.mime_type) !== typeFilter) return false;
      if (!needle) return true;
      return [item.filename, item.entity_type, item.entity_id, item.sharing_scope, friendlyType(item.mime_type)]
        .some((value) => value.toLowerCase().includes(needle));
    });
  }, [entityFilter, items, query, scopeFilter, typeFilter]);

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

  function clearFilters() {
    setQuery("");
    setEntityFilter("all");
    setScopeFilter("all");
    setTypeFilter("all");
  }

  return (
    <main className="hlc-documents-workspace">
      <header className="hlc-documents-header">
        <div>
          <p className="hlc-documents-kicker">DOCUMENT OPERATIONS</p>
          <h1>Documents, forms & evidence</h1>
          <p>Keep record-linked files, forms, field evidence and sharing decisions inside HLC. Advanced scan/OCR and e-signature lanes stay visibly separated until their trusted processing backends are connected.</p>
        </div>
        <div className="hlc-documents-summary" aria-label="Evidence workspace summary">
          <span><strong>{items.length}</strong><small>Stored files</small></span>
          <span><strong>{filteredItems.length}</strong><small>Current view</small></span>
          <span><strong>{Object.keys(typeCounts).length}</strong><small>Media types</small></span>
          <span><strong>25 MB</strong><small>Per-file limit</small></span>
        </div>
      </header>

      {error && <p role="alert" className="hlc-documents-status is-error">{error}</p>}
      {message && <p role="status" className="hlc-documents-status is-success">{message}</p>}

      <nav className="hlc-resources-commandbar" aria-label="Document workspace capabilities">
        <a href="#hlc-document-intake-title">Upload</a>
        <a href="#hlc-record-library">Library</a>
        <Link to="/resources/forms">Forms & Checklists</Link>
        <span aria-disabled="true" title="OCR processing backend is not connected yet">Scan / OCR · setup pending</span>
        <span aria-disabled="true" title="Electronic signature backend is not connected yet">E-signatures · setup pending</span>
      </nav>

      <div className="hlc-documents-console">
        <section className="hlc-documents-intake" aria-labelledby="hlc-document-intake-title">
          <div className="hlc-documents-section-head">
            <div><span>INTAKE</span><h2 id="hlc-document-intake-title">Attach evidence</h2></div>
            <small>Private record first</small>
          </div>
          <form className="hlc-documents-form" onSubmit={submit}>
            <label>Related record type
              <select name="entityType" defaultValue={initialEntityType}>
                <option value="lead">Lead / service request</option>
                <option value="estimate">LeadScope estimate</option>
                <option value="job">Job</option>
                <option value="appointment">Appointment</option>
                <option value="contractor">Professional / provider</option>
                <option value="conversation">Conversation</option>
              </select>
            </label>
            <label>Related record ID<input name="entityId" required defaultValue={requestedEntityId} placeholder="Paste or enter the HLC record ID" /></label>
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
          <strong>{filteredItems.length} / {items.length}</strong>
        </div>

        <div className="hlc-documents-form" aria-label="Document filters">
          <label>Search<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filename, record ID, type, sharing scope…" /></label>
          <label>Record type<select value={entityFilter} onChange={(event) => setEntityFilter(event.target.value)}><option value="all">All record types</option>{entityTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
          <label>File type<select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="all">All file types</option>{fileTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
          <label>Sharing<select value={scopeFilter} onChange={(event) => setScopeFilter(event.target.value as FilterScope)}>{filterScopes.map((scope) => <option key={scope} value={scope}>{scope === "all" ? "All sharing scopes" : scope}</option>)}</select></label>
          <button type="button" onClick={clearFilters}>Clear filters</button>
        </div>

        {loading ? <p className="hlc-documents-state">Loading evidence…</p> : items.length === 0 ? <p className="hlc-documents-state">No documents or media yet. Attach the first useful piece of evidence above.</p> : filteredItems.length === 0 ? <p className="hlc-documents-state">No stored evidence matches the current filters.</p> : (
          <div className="hlc-documents-file-list">
            {filteredItems.map((item) => (
              <article className="hlc-document-row" key={item.id}>
                <div className="hlc-document-row-main">
                  <button type="button" onClick={() => open(item)}>{item.filename}</button>
                  <span>{item.entity_type} · {item.entity_id}</span>
                  <small>Added {new Date(item.created_at).toLocaleString()}</small>
                </div>
                <div className="hlc-document-row-meta">
                  <strong>{friendlyType(item.mime_type)}</strong>
                  <span>{sharingLabel(item.sharing_scope)}</span>
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

function sharingLabel(scope: DocumentRecord["sharing_scope"]) {
  if (scope === "homeowner") return "Resident shared";
  if (scope === "contractor") return "Professional shared";
  return "Workspace only";
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
