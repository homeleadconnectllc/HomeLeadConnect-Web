import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { decideContractorAssignment, getContractorPortalData, type ContractorPortalData } from "../../api/portals";
import { errorMessage } from "../../lib/errorMessage";
import { getDocumentUrl, listDocuments, type DocumentRecord } from "../../api/documents";

type ProfessionalNextStep = { title: string; detail: string; route?: string; action?: string };

function resolveProfessionalNextStep(data: ContractorPortalData): ProfessionalNextStep {
  if (data.links.length === 0) {
    return { title: "Connect your professional profile", detail: "Start with the professional application or use an approved portal invitation. An email match alone never grants provider access.", route: "/professional-application", action: "Open professional application" };
  }

  const offer = data.assignments.find((assignment) => assignment.status === "offered");
  if (offer) {
    return { title: "Review your work offer", detail: "A real assignment is waiting for your accept or reject decision below. Review the customer and appointment information before deciding." };
  }

  const scheduled = data.assignments.find((assignment) => assignment.appointments.some((appointment) => appointment.status === "scheduled"));
  if (scheduled) {
    return { title: "Prepare for scheduled work", detail: "Your assignment has a scheduled visit. Review the appointment below and use Messages if timing, access, or job details need clarification.", route: "/messages", action: "Open messages" };
  }

  const active = data.assignments.find((assignment) => !["rejected", "completed", "cancelled"].includes(assignment.status));
  if (active) {
    return { title: "Continue your assigned work", detail: "Your assignment is active. Keep communication and shared evidence inside the portal-safe Messages and Documents surfaces.", route: "/contractor-portal/documents", action: "Open documents" };
  }

  return { title: "Keep your work profile ready", detail: "No offer currently needs action. Confirm your services, service area, and availability so HLC has current provider-declared operating facts.", route: "/contractor-portal/services", action: "Review services & availability" };
}

export default function ContractorPortal() {
  const [data, setData] = useState<ContractorPortalData>({ links: [], assignments: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const load = useCallback(async () => { setError(""); try { const [portalData, documentRows] = await Promise.all([getContractorPortalData(), listDocuments()]); setData(portalData); setDocuments(documentRows); } catch (reason) { setError(errorMessage(reason, "Unable to load contractor work.")); } finally { setLoading(false); } }, []);
  useEffect(() => { let active = true; Promise.all([getContractorPortalData(), listDocuments()]).then(([result, documentRows]) => { if (active) { setData(result); setDocuments(documentRows); } }).catch((reason: unknown) => { if (active) setError(errorMessage(reason, "Unable to load contractor work.")); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  async function decide(id: string, decision: "accepted" | "rejected") { setBusy(true); setError(""); setMessage(""); try { await decideContractorAssignment(id, decision); await load(); setMessage(`Offer ${decision}.`); } catch (reason) { setError(errorMessage(reason, "Unable to update this offer.")); } finally { setBusy(false); } }
  async function openDocument(document: DocumentRecord) { try { window.open(await getDocumentUrl(document.id, document.storage_path), "_blank", "noopener,noreferrer"); } catch (reason) { setError(errorMessage(reason, "Unable to open this document.")); } }

  const offered = data.assignments.filter((assignment) => assignment.status === "offered").length;
  const nextStep = useMemo(() => resolveProfessionalNextStep(data), [data]);
  return <main className="hlc-portal-workspace is-professional">
    <header className="hlc-portal-header"><div><p className="hlc-account-kicker">PROFESSIONAL PORTAL</p><h1>Assignment workspace</h1><p>Offers and assigned work for professional companies explicitly linked to your authenticated portal relationship.</p></div><div className="hlc-portal-summary"><span><strong>{data.assignments.length}</strong><small>Assignments</small></span><span><strong>{offered}</strong><small>Offers awaiting decision</small></span><span><strong>{documents.length}</strong><small>Shared files</small></span></div></header>
    <nav aria-label="Professional portal sections" className="hlc-portal-actions"><Link to="/contractor-portal">Work dashboard</Link><Link to="/contractor-portal/profile">Business profile</Link><Link to="/contractor-portal/services">Services & availability</Link><Link to="/messages">Messages</Link><Link to="/contractor-portal/documents">Documents</Link></nav>
    {!loading && !error && <section className="hlc-portal-project" aria-labelledby="professional-next-step"><div className="hlc-account-section-head"><div><span>WHAT'S NEXT</span><h2 id="professional-next-step">{nextStep.title}</h2></div></div><p>{nextStep.detail}</p>{nextStep.route && <div className="hlc-portal-actions"><Link to={nextStep.route}>{nextStep.action}</Link></div>}</section>}
    {loading && <p className="hlc-portal-state">Loading contractor work…</p>}{error && <p role="alert" className="hlc-account-status is-error">{error}</p>}{message && <p role="status" className="hlc-account-status is-success">{message}</p>}
    {!loading && !error && data.links.length === 0 && <p className="hlc-portal-state">No contractor company is linked to this account.</p>}
    {data.links.length > 0 && <section className="hlc-portal-identity"><span>LINKED COMPANY</span>{data.links.map((link) => <strong key={`${link.workspace_id}:${link.contractor_id}`}>{link.company_name || link.contact_name || "Contractor company"}</strong>)}</section>}
    <section className="hlc-portal-project"><div className="hlc-account-section-head"><div><span>WORK QUEUE</span><h2>Offers & assigned jobs</h2></div><strong>{data.assignments.length}</strong></div>{data.assignments.length === 0 && data.links.length > 0 && <p className="hlc-portal-state">No job offers or assigned work. Keep services and availability current while you wait for a real opportunity.</p>}<div>{data.assignments.map((assignment) => <article className="hlc-portal-row" key={assignment.id}><div><strong>{assignment.job.name}</strong><span>Offer {assignment.status}</span>{assignment.job.customer && <p>Customer: {assignment.job.customer.name || "Not specified"} · {[assignment.job.customer.phone, assignment.job.customer.email].filter(Boolean).join(" · ")}</p>}<h3>Appointments</h3>{assignment.appointments.length === 0 ? <p>No appointments.</p> : <ul>{assignment.appointments.map((appointment) => <li key={appointment.id}>{new Date(appointment.appointment_date).toLocaleString()} – {appointment.appointment_end_at ? new Date(appointment.appointment_end_at).toLocaleString() : "End time unavailable"} · {appointment.status}</li>)}</ul>}<div className="hlc-portal-actions"><Link to="/messages">Message about work</Link><Link to="/contractor-portal/documents">Open documents</Link></div></div>{assignment.status === "offered" && <div className="hlc-portal-actions"><button disabled={busy} onClick={() => decide(assignment.id, "accepted")}>Accept offer</button><button disabled={busy} onClick={() => decide(assignment.id, "rejected")}>Reject offer</button></div>}</article>)}</div></section>
    {!loading && <section className="hlc-portal-project"><div className="hlc-account-section-head"><div><span>SHARED EVIDENCE</span><h2>Documents</h2></div><strong>{documents.length}</strong></div>{documents.length === 0 ? <p className="hlc-portal-state">No documents have been shared with your contractor account.</p> : <div>{documents.map((document) => <article className="hlc-portal-file-row" key={document.id}><button type="button" onClick={() => openDocument(document)}>{document.filename}</button><span>{document.entity_type}</span></article>)}</div>}</section>}
  </main>;
}
