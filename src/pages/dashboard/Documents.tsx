import { useEffect, useState, type FormEvent } from "react";
import {
  getDocumentUrl,
  listDocuments,
  uploadDocument,
  type DocumentRecord,
} from "../../api/documents";
import { errorMessage } from "../../lib/errorMessage";

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
      setMessage("Document stored and linked.");
    } catch (reason) {
      setError(errorMessage(reason, "Unable to upload the document."));
    } finally {
      setBusy(false);
    }
  }

  async function open(item: DocumentRecord) {
    try {
      window.open(await getDocumentUrl(item.id, item.storage_path), "_blank", "noopener,noreferrer");
    } catch (reason) {
      setError(errorMessage(reason, "Unable to open the document."));
    }
  }

  return (
    <main className="hlc-documents-page" style={{ width: "min(900px,calc(100% - 32px))", margin: "32px auto" }}>
      <h1>Documents and media</h1>
      <p>Private files linked to canonical HLC records. Sharing is explicit.</p>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      <form className="hlc-documents-form" onSubmit={submit} style={{ display: "grid", gap: 12, padding: 20, border: "1px solid #ddd" }}>
        <label>Related record type
          <select name="entityType">
            <option value="lead">Lead</option>
            <option value="estimate">LeadScope estimate</option>
            <option value="job">Job</option>
            <option value="appointment">Appointment</option>
            <option value="contractor">Contractor</option>
            <option value="conversation">Conversation</option>
          </select>
        </label>
        <label>Related record ID<input name="entityId" required /></label>
        <label>Sharing
          <select name="sharingScope">
            <option value="workspace">Workspace only</option>
            <option value="homeowner">Share with linked homeowner</option>
            <option value="contractor">Share with linked contractor</option>
          </select>
        </label>
        <label>File<input name="file" type="file" required /></label>
        <button disabled={busy}>{busy ? "Uploading…" : "Upload document"}</button>
      </form>

      <section className="hlc-documents-list">
        <h2>Files</h2>
        {loading ? <p>Loading…</p> : items.length === 0 ? <p>No documents yet.</p> : items.map((item) => (
          <article className="hlc-document-card" key={item.id}>
            <button type="button" onClick={() => open(item)}>{item.filename}</button>
            <span>{item.entity_type} {item.entity_id}</span>
            <small>{item.sharing_scope}</small>
          </article>
        ))}
      </section>
    </main>
  );
}
