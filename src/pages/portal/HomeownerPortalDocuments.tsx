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

  return <main style={pageStyle}>
    <header style={heroStyle}>
      <p style={eyebrowStyle}>Homeowners and renters</p>
      <h1 style={{ margin: 0 }}>Shared documents</h1>
      <p style={{ marginBottom: 0 }}>Only files explicitly shared with your resident portal are shown here.</p>
    </header>

    <nav aria-label="Resident portal sections" style={navStyle}>
      <Link to="/homeowner-portal">Overview</Link>
      <Link to="/homeowner-portal/requests">Requests</Link>
      <Link to="/homeowner-portal/appointments">Appointments</Link>
      <Link to="/homeowner-portal/jobs">Jobs</Link>
      <Link to="/messages">Messages</Link>
      <Link to="/homeowner-portal/documents" aria-current="page">Documents</Link>
    </nav>

    {loading && <p role="status">Loading your shared documents…</p>}
    {error && <p role="alert" style={errorStyle}>{error}</p>}

    {!loading && !error && documents.length === 0 && <section style={emptyStyle}>
      <h2>No shared documents yet</h2>
      <p>Documents will appear here only after an authorized HLC workspace shares them with your resident portal.</p>
    </section>}

    {!loading && documents.map((document) => <article key={document.id} style={cardStyle}>
      <div>
        <strong>{document.filename}</strong>
        <p style={{ margin: "6px 0 0", color: "#475569" }}>{document.entity_type} · {formatBytes(document.byte_size)}</p>
      </div>
      <button type="button" onClick={() => void openDocument(document)} style={openButtonStyle}>Open document</button>
    </article>)}
  </main>;
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "Size unavailable";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 102.4) / 10} KB`;
  return `${Math.round(bytes / (1024 * 102.4)) / 10} MB`;
}

const pageStyle = { width: "min(960px, calc(100% - 32px))", margin: "40px auto", display: "grid", gap: 18 };
const heroStyle = { padding: "clamp(22px, 5vw, 40px)", borderRadius: 22, color: "#f8fafc", background: "linear-gradient(135deg,#081426,#12365f)" };
const eyebrowStyle = { margin: 0, color: "#60a5fa", fontWeight: 900, textTransform: "uppercase" as const, letterSpacing: ".04em" };
const navStyle = { display: "flex", flexWrap: "wrap" as const, gap: 14 };
const cardStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" as const, padding: 20, border: "1px solid #dbeafe", borderRadius: 16, background: "#fff" };
const emptyStyle = { padding: 24, border: "1px dashed #94a3b8", borderRadius: 16, background: "#f8fafc" };
const errorStyle = { color: "#b91c1c", padding: 16, border: "1px solid #fecaca", borderRadius: 12 };
const openButtonStyle = { minHeight: 44, padding: "10px 16px", border: "1px solid #0f172a", borderRadius: 10, background: "#0f172a", color: "#fff", fontWeight: 800, cursor: "pointer" };
