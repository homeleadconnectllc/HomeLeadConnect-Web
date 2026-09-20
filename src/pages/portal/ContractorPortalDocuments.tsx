import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getDocumentUrl, listDocuments, type DocumentRecord } from "../../api/documents";
import { errorMessage } from "../../lib/errorMessage";

export default function ContractorPortalDocuments() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    listDocuments()
      .then((rows) => { if (active) setDocuments(rows.filter((document) => document.sharing_scope === "contractor")); })
      .catch((reason: unknown) => { if (active) setError(errorMessage(reason, "Unable to load professional shared documents.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function openDocument(document: DocumentRecord) {
    setError("");
    try { window.open(await getDocumentUrl(document.id, document.storage_path), "_blank", "noopener,noreferrer"); }
    catch (reason) { setError(errorMessage(reason, "Unable to open this document.")); }
  }

  return <main className="hlc-ui-page-f9f9b9">
    <header className="hlc-ui-hero-b4d8d2"><p className="hlc-ui-eyebrow-321b33">Professional portal</p><h1 className="hlc-ui-margin-ab79ea">Shared documents</h1><p className="hlc-ui-margin-bottom-fa769a">Only files explicitly shared with your linked professional account are shown here.</p></header>
    <nav aria-label="Professional portal sections" className="hlc-ui-nav-c3daa7"><Link to="/contractor-portal">Work dashboard</Link><Link to="/contractor-portal/profile">Business profile</Link><Link to="/contractor-portal/services">Services & availability</Link><Link to="/messages">Messages</Link><Link to="/contractor-portal/documents" aria-current="page">Documents</Link></nav>
    {loading && <p role="status">Loading shared documents…</p>}
    {error && <p role="alert" className="hlc-ui-error-260ca0">{error}</p>}
    {!loading && !error && documents.length === 0 && <section className="hlc-ui-empty-f0b2c9"><h2>No shared documents yet</h2><p>Files appear here only after an authorized HLC workspace shares them with your professional relationship.</p></section>}
    {!loading && documents.map((document) => <article key={document.id} className="hlc-ui-card-49ed16"><div><strong>{document.filename}</strong><p className="hlc-ui-contractor-portal-documents-e26ea4">{document.entity_type}</p></div><button type="button" onClick={() => void openDocument(document)} className="hlc-ui-primaryButton-2fdf8e">Open document</button></article>)}
  </main>;
}
