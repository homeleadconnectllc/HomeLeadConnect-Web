import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  cancelAppointment,
  completeAppointment,
  listJobAppointments,
  markNoShow,
  rescheduleAppointment,
  scheduleAppointment,
} from "../../api/appointments";
import { createContractor, listContractors } from "../../api/contractors";
import {
  cancelAssignment,
  listJobAssignments,
  offerJobToContractor,
} from "../../api/jobAssignments";
import { getJob, type JobDetailRecord } from "../../api/jobs";
import ContractorCard from "../../components/contractors/ContractorCard";
import PortalInviteButton from "../../components/portal/PortalInviteButton";
import { formatCurrency } from "../../lib/estimator/calculations";
import { errorMessage } from "../../lib/errorMessage";
import RescheduleDialog from "../../components/scheduling/RescheduleDialog";
import type {
  Contractor,
  JobAppointment,
  JobAssignment,
} from "../../lib/types/database";
import "./JobDetail.css";

export default function JobDetail() {
  const { jobId } = useParams();
  const [job, setJob] = useState<JobDetailRecord | null>(null);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [assignments, setAssignments] = useState<JobAssignment[]>([]);
  const [appointments, setAppointments] = useState<JobAppointment[]>([]);
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");
  const [newContractor, setNewContractor] = useState({ companyName: "", contactName: "", phone: "", email: "", specialty: "", city: "", state: "", zip: "" });
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentEndAt, setAppointmentEndAt] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rescheduling, setRescheduling] = useState<JobAppointment | null>(null);

  const load = useCallback(async () => {
    if (!jobId) return;
    setError("");
    try {
      const [jobData, contractorData, assignmentData, appointmentData] = await Promise.all([getJob(jobId), listContractors(), listJobAssignments(jobId), listJobAppointments(jobId)]);
      setJob(jobData); setContractors(contractorData); setAssignments(assignmentData); setAppointments(appointmentData);
    } catch (reason) { setError(errorMessage(reason, "Unable to load this job.")); }
    finally { setLoading(false); }
  }, [jobId]);

  useEffect(() => {
    if (!jobId) return;
    Promise.all([getJob(jobId), listContractors(), listJobAssignments(jobId), listJobAppointments(jobId)])
      .then(([jobData, contractorData, assignmentData, appointmentData]) => { setJob(jobData); setContractors(contractorData); setAssignments(assignmentData); setAppointments(appointmentData); })
      .catch((reason: unknown) => setError(errorMessage(reason, "Unable to load this job.")))
      .finally(() => setLoading(false));
  }, [jobId]);

  const currentAssignment = assignments.find((item) => item.status === "offered" || item.status === "accepted");
  const futureAppointment = appointments.find((item) => item.status === "scheduled" && new Date(item.appointment_date) > new Date());
  const scheduledWork = currentAssignment?.status === "accepted" && Boolean(futureAppointment);

  const candidates = useMemo(() => {
    const specialtyNeedle = specialty.trim().toLowerCase();
    const locationNeedle = location.trim().toLowerCase();
    return contractors.filter((contractor) => {
      const specialtyMatches = !specialtyNeedle || contractor.specialty?.toLowerCase() === specialtyNeedle;
      const locationText = [contractor.city, contractor.state, contractor.zip].filter(Boolean).join(" ").toLowerCase();
      return specialtyMatches && (!locationNeedle || locationText.includes(locationNeedle));
    });
  }, [contractors, location, specialty]);

  async function run(action: () => Promise<unknown>, successMessage?: string) {
    setBusy(true); setError(""); setMessage("");
    try { await action(); await load(); if (successMessage) setMessage(successMessage); return true; }
    catch (reason) { setError(errorMessage(reason, "The operation could not be completed.")); return false; }
    finally { setBusy(false); }
  }

  async function offer(contractor: Contractor) {
    if (!jobId) return;
    const contractorName = contractor.company_name || contractor.contact_name || `Contractor #${contractor.id}`;
    await run(() => offerJobToContractor(jobId, contractor.id), `Job offered to ${contractorName}.`);
  }

  async function addContractor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try { await createContractor(newContractor); setNewContractor({ companyName: "", contactName: "", phone: "", email: "", specialty: "", city: "", state: "", zip: "" }); await load(); }
    catch (reason) { setError(errorMessage(reason, "Unable to add the contractor.")); }
    finally { setBusy(false); }
  }

  async function schedule() {
    if (!jobId || !appointmentDate || !appointmentEndAt) return;
    if (new Date(appointmentEndAt) <= new Date(appointmentDate)) { setError("Appointment end must be after its start."); return; }
    await run(async () => { await scheduleAppointment({ jobId, appointmentDate: new Date(appointmentDate).toISOString(), appointmentEndAt: new Date(appointmentEndAt).toISOString(), notes }); setAppointmentDate(""); setAppointmentEndAt(""); setNotes(""); }, "Appointment scheduled.");
  }

  async function reschedule(start: string, end: string) {
    if (!rescheduling) return;
    const succeeded = await run(() => rescheduleAppointment(rescheduling.id, start, end), "Appointment rescheduled. The original remains in history as cancelled.");
    if (succeeded) setRescheduling(null);
  }

  if (loading) return <main className="hlc-job-detail"><p>Loading job…</p></main>;
  if (!job) return <main className="hlc-job-detail"><p role="alert">{error || "Job not found."}</p></main>;

  return (
    <main className="hlc-job-detail">
      <nav className="hlc-job-detail__crumbs" aria-label="Job navigation"><Link to="/jobs">← Jobs</Link><span aria-hidden="true">·</span><Link to="/calendar">Schedule</Link></nav>
      <header className="hlc-job-detail__header">
        <div>
          <h1>{job.name}</h1>
          <p className="hlc-job-detail__meta">{formatCurrency(Number(job.contract_value))} · {job.status} · Created {new Date(job.created_at).toLocaleDateString()}</p>
          <p>Lead: {job.lead?.full_name || job.lead_id || "None"}</p>
          <p className="hlc-job-detail__source-estimate">LeadScope estimate · {job.source_estimate?.status || "unknown"} · <Link to={`/estimator?estimate=${job.source_estimate_id}`}>Open source estimate</Link></p>
        </div>
        <strong className="hlc-job-detail__status" style={{ color: scheduledWork ? "#166534" : "#92400e" }}>{scheduledWork ? "Scheduled Work" : "Not Scheduled Work"}</strong>
      </header>
      {error && <p role="alert" className="hlc-job-detail__error">{error}</p>}
      {rescheduling?.appointment_end_at && <RescheduleDialog initialStart={rescheduling.appointment_date} initialEnd={rescheduling.appointment_end_at} busy={busy} onCancel={() => setRescheduling(null)} onConfirm={reschedule} />}
      <section className="hlc-job-detail__section"><h2>Current contractor assignment</h2>{!currentAssignment && <p>No active assignment.</p>}{currentAssignment && <div><p><strong>{assignmentName(currentAssignment)}</strong> · {currentAssignment.status}</p><div className="hlc-job-detail__actions">{currentAssignment.status === "offered" && <p>The linked contractor must accept or reject this offer in the contractor portal.</p>}<button disabled={busy} onClick={() => run(() => cancelAssignment(currentAssignment.id), `Assignment for ${assignmentName(currentAssignment)} cancelled.`)}>Cancel assignment</button></div></div>}<h3>Assignment history</h3>{assignments.length === 0 ? <p>No assignment history.</p> : <ul className="hlc-job-detail__history">{assignments.map((assignment) => <li key={assignment.id}>{assignmentName(assignment)} · {assignment.status} · {new Date(assignment.created_at).toLocaleString()}</li>)}</ul>}</section>
      <section className="hlc-job-detail__section"><h2>Contractor candidates</h2><p style={{ color: "#64748b" }}>Workspace contractors only. Filters use exact specialty and recorded city/state/ZIP; no score or availability is inferred.</p><form onSubmit={addContractor} className="hlc-job-detail__form"><fieldset disabled={busy} className="hlc-job-detail__fieldset"><legend>Add a workspace contractor</legend><label>Company name<input value={newContractor.companyName} onChange={(event) => setNewContractor((current) => ({ ...current, companyName: event.target.value }))} /></label><label>Contact name<input value={newContractor.contactName} onChange={(event) => setNewContractor((current) => ({ ...current, contactName: event.target.value }))} /></label><label>Specialty<input value={newContractor.specialty} onChange={(event) => setNewContractor((current) => ({ ...current, specialty: event.target.value }))} /></label><label>Phone<input type="tel" value={newContractor.phone} onChange={(event) => setNewContractor((current) => ({ ...current, phone: event.target.value }))} /></label><label>Email<input type="email" value={newContractor.email} onChange={(event) => setNewContractor((current) => ({ ...current, email: event.target.value }))} /></label><label>City<input value={newContractor.city} onChange={(event) => setNewContractor((current) => ({ ...current, city: event.target.value }))} /></label><label>State<input value={newContractor.state} onChange={(event) => setNewContractor((current) => ({ ...current, state: event.target.value }))} /></label><label>ZIP<input inputMode="numeric" value={newContractor.zip} onChange={(event) => setNewContractor((current) => ({ ...current, zip: event.target.value }))} /></label><button type="submit">Add contractor</button></fieldset></form><h3>Candidate filters</h3><div className="hlc-job-detail__filters"><input value={specialty} onChange={(event) => setSpecialty(event.target.value)} placeholder="Exact specialty" /><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City, state, or ZIP" /></div>{message && <p role="status" style={{ color: "#166534" }}>{message}</p>}<div className="hlc-job-detail__candidate-list">{candidates.map((contractor) => <div key={contractor.id} className="hlc-job-detail__candidate"><ContractorCard contractor={contractor} disabled={busy || Boolean(currentAssignment)} onOffer={offer} /><PortalInviteButton role="contractor" targetId={contractor.id} email={contractor.email} label="Invite to contractor portal" /></div>)}{contractors.length === 0 ? <p>No workspace contractors yet. Add one above to continue.</p> : candidates.length === 0 && <p>No contractors match these explicit filters.</p>}</div></section>
      <section className="hlc-job-detail__section"><h2>Appointments</h2><fieldset disabled={busy || currentAssignment?.status !== "accepted"} className="hlc-job-detail__fieldset"><legend>Schedule work</legend><label>Start<input type="datetime-local" value={appointmentDate} onChange={(event) => setAppointmentDate(event.target.value)} /></label><label>End<input type="datetime-local" value={appointmentEndAt} min={appointmentDate} onChange={(event) => setAppointmentEndAt(event.target.value)} /></label><label>Notes<input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notes (optional)" /></label><button type="button" onClick={schedule} disabled={!appointmentDate || !appointmentEndAt}>Schedule appointment</button></fieldset>{currentAssignment?.status !== "accepted" && <p>Accept the contractor assignment before scheduling.</p>}<div className="hlc-job-detail__appointment-list">{appointments.map((appointment) => <article key={appointment.id} className="hlc-job-detail__appointment"><div><strong>{formatAppointmentRange(appointment)}</strong><div>{appointment.contractor?.company_name || `Contractor #${appointment.contractor_id}`} · {appointment.status}</div></div>{appointment.status === "scheduled" && <div className="hlc-job-detail__actions"><button disabled={busy || !appointment.appointment_end_at} title={!appointment.appointment_end_at ? "This historical appointment has no persisted end time." : undefined} onClick={() => setRescheduling(appointment)}>Reschedule</button><button disabled={busy} onClick={() => run(() => completeAppointment(appointment.id), "Appointment completed.")}>Complete</button><button disabled={busy} onClick={() => run(() => cancelAppointment(appointment.id), "Appointment cancelled.")}>Cancel</button><button disabled={busy} onClick={() => run(() => markNoShow(appointment.id), "Appointment marked no-show.")}>No-show</button></div>}</article>)}{appointments.length === 0 && <p>No appointments.</p>}</div></section>
    </main>
  );
}

function assignmentName(assignment: JobAssignment) { return assignment.contractor?.company_name || assignment.contractor?.contact_name || `Contractor #${assignment.contractor_id}`; }
function formatAppointmentRange(appointment: JobAppointment) { return `${new Date(appointment.appointment_date).toLocaleString()} – ${appointment.appointment_end_at ? new Date(appointment.appointment_end_at).toLocaleString() : "End time unavailable"}`; }
