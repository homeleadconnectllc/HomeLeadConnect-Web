import { useCallback, useEffect, useMemo, useState } from "react";
import { decideHomeownerEstimate, getHomeownerPortalData, type HomeownerPortalRelationship } from "../../api/portals";
import { errorMessage } from "../../lib/errorMessage";
import { formatCurrency } from "../../lib/estimator/calculations";
import { getDocumentUrl, listDocuments, type DocumentRecord } from "../../api/documents";

export default function HomeownerPortal() {
  const [relationships, setRelationships] = useState<HomeownerPortalRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const load = useCallback(async () => {
    setError("");
    try { const [relationshipRows, documentRows] = await Promise.all([getHomeownerPortalData(), listDocuments()]); setRelationships(relationshipRows); setDocuments(documentRows); }
    catch (reason) { setError(errorMessage(reason, "Unable to load your projects.")); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { let active = true; Promise.all([getHomeownerPortalData(), listDocuments()]).then(([result, documentRows]) => { if (active) { setRelationships(result); setDocuments(documentRows); } }).catch((reason: unknown) => { if (active) setError(errorMessage(reason, "Unable to load your projects.")); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);

  const estimates = useMemo(() => relationships.reduce((sum, item) => sum + item.estimates.length, 0), [relationships]);
  const jobs = useMemo(() => relationships.reduce((sum, item) => sum + item.jobs.length, 0), [relationships]);

  async function decide(id: string, decision: "accepted" | "rejected") { setBusy(true); setError(""); setMessage(""); try { await decideHomeownerEstimate(id, decision); await load(); setMessage(`Estimate ${decision}.`); } catch (reason) { setError(errorMessage(reason, "Unable to update the estimate.")); } finally { setBusy(false); } }
  async function openDocument(document: DocumentRecord) { try { window.open(await getDocumentUrl(document.id, document.storage_path), "_blank", "noopener,noreferrer"); } catch (reason) { setError(errorMessage(reason, "Unable to open this document.")); } }

  return <main className="hlc-portal-workspace is-resident">
    <header className="hlc-portal-header"><div><p className="hlc-account-kicker">RESIDENT PORTAL</p><h1>Your service workspace</h1><p>Estimates, jobs, appointments, and documents explicitly shared with your authenticated portal relationship.</p></div><div className="hlc-portal-summary"><span><strong>{estimates}</strong><small>Estimates</small></span><span><strong>{jobs}</strong><small>Jobs</small></span><span><strong>{documents.length}</strong><small>Shared files</small></span></div></header>
    {loading && <p className="hlc-portal-state">Loading your projects…</p>}{error && <p role="alert" className="hlc-account-status is-error">{error}</p>}{message && <p role="status" className="hlc-account-status is-success">{message}</p>}
    {!loading && !error && relationships.length === 0 && <p className="hlc-portal-state">No projects are linked to this account.</p>}
    <div className="hlc-portal-ledger">
      {relationships.map((relationship) => <section className="hlc-portal-project" key={`${relationship.workspace_id}:${relationship.lead_id}`}>
        <div className="hlc-account-section-head"><div><span>PROJECT</span><h2>{relationship.homeowner_name || "Your project"}</h2></div><strong>{relationship.estimates.length + relationship.jobs.length} records</strong></div>
        <div className="hlc-portal-subsection"><h3>LeadScope estimates</h3>{relationship.estimates.length === 0 && <p>No estimates shared yet.</p>}{relationship.estimates.map((estimate) => <article className="hlc-portal-row" key={estimate.id}><div><strong>{formatCurrency(Number(estimate.total))}</strong><span>{estimate.status}</span><ul>{estimate.lines.map((line) => <li key={line.id}>{line.description} — {line.quantity} × {formatCurrency(Number(line.unit_cost))}</li>)}</ul></div>{estimate.status === "sent" && <div className="hlc-portal-actions"><button disabled={busy} onClick={() => decide(estimate.id, "accepted")}>Accept estimate</button><button disabled={busy} onClick={() => decide(estimate.id, "rejected")}>Reject estimate</button></div>}</article>)}</div>
        <div className="hlc-portal-subsection"><h3>Jobs & appointments</h3>{relationship.jobs.length === 0 && <p>No jobs created yet.</p>}{relationship.jobs.map((job) => <article className="hlc-portal-row" key={job.id}><div><strong>{job.name}</strong><span>{job.status} · {formatCurrency(Number(job.contract_value))}</span>{job.appointments.length === 0 ? <p>No appointments scheduled.</p> : <ul>{job.appointments.map((appointment) => <li key={appointment.id}>{new Date(appointment.appointment_date).toLocaleString()} – {appointment.appointment_end_at ? new Date(appointment.appointment_end_at).toLocaleString() : "End time unavailable"} · {appointment.status}</li>)}</ul>}</div></article>)}</div>
      </section>)}
      {!loading && <section className="hlc-portal-project"><div className="hlc-account-section-head"><div><span>SHARED EVIDENCE</span><h2>Documents & media</h2></div><strong>{documents.length}</strong></div>{documents.length === 0 ? <p className="hlc-portal-state">No documents have been shared with you.</p> : <div>{documents.map((document) => <article className="hlc-portal-file-row" key={document.id}><button type="button" onClick={() => openDocument(document)}>{document.filename}</button><span>{document.entity_type}</span></article>)}</div>}</section>}
    </div>
  </main>;
}
