import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getDocumentUrl, listDocuments, type DocumentRecord } from "../../api/documents";
import { errorMessage } from "../../lib/errorMessage";

export default function HomeownerPortalDocuments() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    listDocuments()
      .then((rows) => {
        if (active) setDocuments(rows.filter((document) => document.sharing_scope === "homeowner"));
      })
      .catch((reason: unknown) => {
        if (active) setError(errorMessage(reason, "Unable to load your shared documents."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function openDocument(document: DocumentRecord) {
    setError("");
    try {
      const url = await getDocumentUrl(document.id, document.storage_path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (reason) {
      setError(errorMessage(reason, "Unable to open this document."));
    }
  }

  return <main className="hlc-ui-page-f9f9b9">
    <header className="hlc-ui-hero-340ab8">
      <p className="hlc-ui-eyebrow-2aae40">Homeowners and renters</p>
      <h1 className="hlc-ui-margin-ab79ea">Shared documents</h1>
      <p className="hlc-ui-margin-bottom-fa769a">Only files explicitly shared with your resident portal are shown here.</p>
    </header>

    <nav aria-label="Resident portal sections" className="hlc-ui-nav-c3daa7">
      <Link to="/homeowner-portal">Overview</Link>
      <Link to="/homeowner-portal/requests">Requests</Link>
      <Link to="/homeowner-portal/appointments">Appointments</Link>
      <Link to="/homeowner-portal/jobs">Jobs</Link>
      <Link to="/messages">Messages</Link>
      <Link to="/homeowner-portal/documents" aria-current="page">Documents</Link>
    </nav>

    {loading && <p role="status">Loading your shared documents…</p>}
    {error && <p role="alert" className="hlc-ui-error-339caa">{error}</p>}

    {!loading && !error && documents.length === 0 && <section className="hlc-ui-empty-f0b2c9">
      <h2>No shared documents yet</h2>
      <p>Documents will appear here only after an authorized HLC workspace shares them with your resident portal.</p>
    </section>}

    {!loading && documents.map((document) => <article key={document.id} className="hlc-ui-card-45abaf">
      <div>
        <strong>{document.filename}</strong>
        <p className="hlc-ui-contractor-portal-documents-e26ea4">{document.entity_type} · {formatBytes(document.byte_size)}</p>
      </div>
      <button type="button" onClick={() => void openDocument(document)} className="hlc-ui-openButton-55fdfe">Open document</button>
    </article>)}
  </main>;
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "Size unavailable";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 102.4) / 10} KB`;
  return `${Math.round(bytes / (1024 * 102.4)) / 10} MB`;
}
