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

  return <main style={pageStyle}>
    <header style={heroStyle}><p style={eyebrowStyle}>Professional portal</p><h1 style={{ margin: 0 }}>Shared documents</h1><p style={{ marginBottom: 0 }}>Only files explicitly shared with your linked professional account are shown here.</p></header>
    <nav aria-label="Professional portal sections" style={navStyle}><Link to="/contractor-portal">Work dashboard</Link><Link to="/contractor-portal/profile">Business profile</Link><Link to="/contractor-portal/services">Services & availability</Link><Link to="/messages">Messages</Link><Link to="/contractor-portal/documents" aria-current="page">Documents</Link></nav>
    {loading && <p role="status">Loading shared documents…</p>}
    {error && <p role="alert" style={errorStyle}>{error}</p>}
    {!loading && !error && documents.length === 0 && <section style={emptyStyle}><h2>No shared documents yet</h2><p>Files appear here only after an authorized HLC workspace shares them with your professional relationship.</p></section>}
    {!loading && documents.map((document) => <article key={document.id} style={cardStyle}><div><strong>{document.filename}</strong><p style={{ margin: "6px 0 0", color: "#475569" }}>{document.entity_type}</p></div><button type="button" onClick={() => void openDocument(document)} style={primaryButtonStyle}>Open document</button></article>)}
  </main>;
}

const pageStyle = { width: "min(960px, calc(100% - 32px))", margin: "40px auto", display: "grid", gap: 18 };
const heroStyle = { padding: "clamp(22px,5vw,40px)", borderRadius: 22, color: "#f8fafc", background: "linear-gradient(135deg,#081426,#12365f)" };
const eyebrowStyle = { margin: 0, color: "#818cf8", fontWeight: 900, textTransform: "uppercase" as const, letterSpacing: ".04em" };
const navStyle = { display: "flex", flexWrap: "wrap" as const, gap: 14 };
const cardStyle = { display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center", flexWrap: "wrap" as const, padding: 20, border: "1px solid #cbd5e1", borderRadius: 16, background: "#fff" };
const emptyStyle = { padding: 24, border: "1px dashed #94a3b8", borderRadius: 16, background: "#f8fafc" };
const primaryButtonStyle = { minHeight: 44, padding: "10px 16px", border: "1px solid #0f172a", borderRadius: 10, background: "#0f172a", color: "#fff", fontWeight: 900 };
const errorStyle = { color: "#b91c1c", padding: 14, border: "1px solid #fecaca", borderRadius: 12 };
