import { useCallback, useEffect, useState } from "react";
import { decideContractorAssignment, getContractorPortalData, type ContractorPortalData } from "../../api/portals";
import { errorMessage } from "../../lib/errorMessage";
import { getDocumentUrl, listDocuments, type DocumentRecord } from "../../api/documents";

export default function ContractorPortal() {
  const [data, setData] = useState<ContractorPortalData>({ links: [], assignments: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const load = useCallback(async () => {
    setError("");
    try {
      const [portalData, documentRows] = await Promise.all([getContractorPortalData(), listDocuments()]);
      setData(portalData);
      setDocuments(documentRows);
    }
    catch (reason) { setError(errorMessage(reason, "Unable to load contractor work.")); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    let active = true;
    Promise.all([getContractorPortalData(), listDocuments()])
      .then(([result, documentRows]) => { if (active) { setData(result); setDocuments(documentRows); } })
      .catch((reason: unknown) => { if (active) setError(errorMessage(reason, "Unable to load contractor work.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function decide(id: string, decision: "accepted" | "rejected") {
    setBusy(true); setError(""); setMessage("");
    try {
      await decideContractorAssignment(id, decision);
      await load();
      setMessage(`Offer ${decision}.`);
    } catch (reason) { setError(errorMessage(reason, "Unable to update this offer.")); }
    finally { setBusy(false); }
  }

  async function openDocument(document: DocumentRecord) {
    try { window.open(await getDocumentUrl(document.id, document.storage_path), "_blank", "noopener,noreferrer"); }
    catch (reason) { setError(errorMessage(reason, "Unable to open this document.")); }
  }

  return <main style={pageStyle}>
    <h1>Contractor portal</h1>
    <p>Offers and assigned work for companies explicitly linked to your account.</p>
    {loading && <p>Loading contractor work…</p>}
    {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
    {message && <p role="status" style={{ color: "#166534" }}>{message}</p>}
    {!loading && !error && data.links.length === 0 && <p>No contractor company is linked to this account.</p>}
    {data.links.map((link) => <p key={`${link.workspace_id}:${link.contractor_id}`}><strong>{link.company_name || link.contact_name || "Contractor company"}</strong></p>)}
    {data.assignments.length === 0 && data.links.length > 0 && <p>No job offers or assigned work.</p>}
    {data.assignments.map((assignment) => <article key={assignment.id} style={cardStyle}>
      <h2>{assignment.job.name}</h2>
      <p>Offer {assignment.status}</p>
      {assignment.status === "offered" && <div style={actionsStyle}>
        <button disabled={busy} onClick={() => decide(assignment.id, "accepted")}>Accept offer</button>
        <button disabled={busy} onClick={() => decide(assignment.id, "rejected")}>Reject offer</button>
      </div>}
      {assignment.job.customer && <p>Customer: {assignment.job.customer.name || "Not specified"} · {[assignment.job.customer.phone, assignment.job.customer.email].filter(Boolean).join(" · ")}</p>}
      <h3>Appointments</h3>
      {assignment.appointments.length === 0 ? <p>No appointments.</p> : <ul>{assignment.appointments.map((appointment) => <li key={appointment.id}>{new Date(appointment.appointment_date).toLocaleString()} – {appointment.appointment_end_at?new Date(appointment.appointment_end_at).toLocaleString():"End time unavailable"} · {appointment.status}</li>)}</ul>}
    </article>)}
    {!loading && <section style={cardStyle}>
      <h2>Shared documents</h2>
      {documents.length === 0 ? <p>No documents have been shared with your contractor account.</p> : documents.map((document) => <article key={document.id}>
        <button type="button" onClick={() => openDocument(document)}>{document.filename}</button>
        {` · ${document.entity_type}`}
      </article>)}
    </section>}
  </main>;
}

const pageStyle = { width: "min(960px, calc(100% - 48px))", margin: "40px auto", fontFamily: "system-ui, sans-serif" };
const cardStyle = { marginTop: 16, padding: 20, border: "1px solid #e2e8f0", borderRadius: 14 };
const actionsStyle = { display: "flex", gap: 10, flexWrap: "wrap" as const };
