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
  acceptAssignment,
  cancelAssignment,
  listJobAssignments,
  offerJobToContractor,
  rejectAssignment,
} from "../../api/jobAssignments";
import { getJob, type JobDetailRecord } from "../../api/jobs";
import ContractorCard from "../../components/contractors/ContractorCard";
import { formatCurrency } from "../../lib/estimator/calculations";
import { errorMessage } from "../../lib/errorMessage";
import type {
  Contractor,
  JobAppointment,
  JobAssignment,
} from "../../lib/types/database";

export default function JobDetail() {
  const { jobId } = useParams();
  const [job, setJob] = useState<JobDetailRecord | null>(null);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [assignments, setAssignments] = useState<JobAssignment[]>([]);
  const [appointments, setAppointments] = useState<JobAppointment[]>([]);
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");
  const [newContractor, setNewContractor] = useState({
    companyName: "",
    contactName: "",
    phone: "",
    email: "",
    specialty: "",
    city: "",
    state: "",
    zip: "",
  });
  const [appointmentDate, setAppointmentDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    if (!jobId) return;
    setError("");
    try {
      const [jobData, contractorData, assignmentData, appointmentData] =
        await Promise.all([
          getJob(jobId),
          listContractors(),
          listJobAssignments(jobId),
          listJobAppointments(jobId),
        ]);
      setJob(jobData);
      setContractors(contractorData);
      setAssignments(assignmentData);
      setAppointments(appointmentData);
    } catch (reason) {
      setError(errorMessage(reason, "Unable to load this job."));
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (!jobId) return;
    Promise.all([
      getJob(jobId),
      listContractors(),
      listJobAssignments(jobId),
      listJobAppointments(jobId),
    ])
      .then(([jobData, contractorData, assignmentData, appointmentData]) => {
        setJob(jobData);
        setContractors(contractorData);
        setAssignments(assignmentData);
        setAppointments(appointmentData);
      })
      .catch((reason: unknown) => setError(errorMessage(reason, "Unable to load this job.")))
      .finally(() => setLoading(false));
  }, [jobId]);

  const currentAssignment = assignments.find((item) =>
    item.status === "offered" || item.status === "accepted",
  );
  const futureAppointment = appointments.find(
    (item) => item.status === "scheduled" && new Date(item.appointment_date) > new Date(),
  );
  const scheduledWork = currentAssignment?.status === "accepted" && Boolean(futureAppointment);

  const candidates = useMemo(() => {
    const specialtyNeedle = specialty.trim().toLowerCase();
    const locationNeedle = location.trim().toLowerCase();
    return contractors.filter((contractor) => {
      const specialtyMatches = !specialtyNeedle
        || contractor.specialty?.toLowerCase() === specialtyNeedle;
      const locationText = [contractor.city, contractor.state, contractor.zip]
        .filter(Boolean).join(" ").toLowerCase();
      return specialtyMatches && (!locationNeedle || locationText.includes(locationNeedle));
    });
  }, [contractors, location, specialty]);

  async function run(action: () => Promise<unknown>, successMessage?: string) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
      await load();
      if (successMessage) setMessage(successMessage);
    } catch (reason) {
      setError(errorMessage(reason, "The operation could not be completed."));
    } finally {
      setBusy(false);
    }
  }

  async function offer(contractor: Contractor) {
    if (!jobId) return;
    const contractorName = contractor.company_name || contractor.contact_name || `Contractor #${contractor.id}`;
    await run(
      () => offerJobToContractor(jobId, contractor.id),
      `Job offered to ${contractorName}.`,
    );
  }

  async function addContractor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await createContractor(newContractor);
      setNewContractor({
        companyName: "",
        contactName: "",
        phone: "",
        email: "",
        specialty: "",
        city: "",
        state: "",
        zip: "",
      });
      await load();
    } catch (reason) {
      setError(errorMessage(reason, "Unable to add the contractor."));
    } finally {
      setBusy(false);
    }
  }

  async function schedule() {
    if (!jobId || !appointmentDate) return;
    await run(async () => {
      await scheduleAppointment({
        jobId,
        appointmentDate: new Date(appointmentDate).toISOString(),
        notes,
      });
      setAppointmentDate("");
      setNotes("");
    }, "Appointment scheduled.");
  }

  async function reschedule(appointment: JobAppointment) {
    const replacement = window.prompt(
      "Replacement date/time (YYYY-MM-DDTHH:mm)",
      toLocalInputValue(appointment.appointment_date),
    );
    if (!replacement) return;
    const parsed = new Date(replacement);
    if (Number.isNaN(parsed.getTime())) {
      setError("Enter a valid replacement date and time.");
      return;
    }
    await run(
      () => rescheduleAppointment(appointment.id, parsed.toISOString()),
      "Appointment rescheduled. The original remains in history as cancelled.",
    );
  }

  if (loading) return <main style={pageStyle}><p>Loading job…</p></main>;
  if (!job) return <main style={pageStyle}><p role="alert">{error || "Job not found."}</p></main>;

  return (
    <main style={pageStyle}>
      <p><Link to="/jobs">← Jobs</Link> · <Link to="/calendar">Schedule</Link></p>
      <header style={headerStyle}>
        <div>
          <h1 style={{ marginBottom: 6 }}>{job.name}</h1>
          <p style={{ margin: 0, color: "#475569" }}>
            {formatCurrency(Number(job.contract_value))} · {job.status} · Created {new Date(job.created_at).toLocaleDateString()}
          </p>
          <p>Lead: {job.lead?.full_name || job.lead_id || "None"}</p>
          <p>Source estimate: {job.source_estimate_id} ({job.source_estimate?.status || "unknown"})</p>
        </div>
        <strong style={{ color: scheduledWork ? "#166534" : "#92400e" }}>
          {scheduledWork ? "Scheduled Work" : "Not Scheduled Work"}
        </strong>
      </header>

      {error && <p role="alert" style={errorStyle}>{error}</p>}

      <section style={sectionStyle}>
        <h2>Current contractor assignment</h2>
        {!currentAssignment && <p>No active assignment.</p>}
        {currentAssignment && (
          <div>
            <p><strong>{assignmentName(currentAssignment)}</strong> · {currentAssignment.status}</p>
            <div style={actionsStyle}>
              {currentAssignment.status === "offered" && <>
                <button disabled={busy} onClick={() => run(
                  () => acceptAssignment(currentAssignment.id),
                  `${assignmentName(currentAssignment)} marked accepted.`,
                )}>
                  Operationally mark accepted (v1 admin)
                </button>
                <button disabled={busy} onClick={() => run(
                  () => rejectAssignment(currentAssignment.id),
                  `${assignmentName(currentAssignment)} marked rejected.`,
                )}>Mark rejected</button>
              </>}
              <button disabled={busy} onClick={() => run(
                () => cancelAssignment(currentAssignment.id),
                `Assignment for ${assignmentName(currentAssignment)} cancelled.`,
              )}>Cancel assignment</button>
            </div>
          </div>
        )}

        <h3>Assignment history</h3>
        {assignments.length === 0 ? <p>No assignment history.</p> : (
          <ul>{assignments.map((assignment) => (
            <li key={assignment.id}>
              {assignmentName(assignment)} · {assignment.status} · {new Date(assignment.created_at).toLocaleString()}
            </li>
          ))}</ul>
        )}
      </section>

      <section style={sectionStyle}>
        <h2>Contractor candidates</h2>
        <p style={{ color: "#64748b" }}>
          Workspace contractors only. Filters use exact specialty and recorded city/state/ZIP; no score or availability is inferred.
        </p>
        <form onSubmit={addContractor} style={createFormStyle}>
          <fieldset disabled={busy} style={fieldsetStyle}>
            <legend>Add a workspace contractor</legend>
            <label>Company name<input value={newContractor.companyName}
              onChange={(event) => setNewContractor((current) => ({ ...current, companyName: event.target.value }))} /></label>
            <label>Contact name<input value={newContractor.contactName}
              onChange={(event) => setNewContractor((current) => ({ ...current, contactName: event.target.value }))} /></label>
            <label>Specialty<input value={newContractor.specialty}
              onChange={(event) => setNewContractor((current) => ({ ...current, specialty: event.target.value }))} /></label>
            <label>Phone<input type="tel" value={newContractor.phone}
              onChange={(event) => setNewContractor((current) => ({ ...current, phone: event.target.value }))} /></label>
            <label>Email<input type="email" value={newContractor.email}
              onChange={(event) => setNewContractor((current) => ({ ...current, email: event.target.value }))} /></label>
            <label>City<input value={newContractor.city}
              onChange={(event) => setNewContractor((current) => ({ ...current, city: event.target.value }))} /></label>
            <label>State<input value={newContractor.state}
              onChange={(event) => setNewContractor((current) => ({ ...current, state: event.target.value }))} /></label>
            <label>ZIP<input inputMode="numeric" value={newContractor.zip}
              onChange={(event) => setNewContractor((current) => ({ ...current, zip: event.target.value }))} /></label>
            <button type="submit">Add contractor</button>
          </fieldset>
        </form>
        <h3>Candidate filters</h3>
        <div style={filtersStyle}>
          <input value={specialty} onChange={(event) => setSpecialty(event.target.value)} placeholder="Exact specialty" />
          <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City, state, or ZIP" />
        </div>
        {message && <p role="status" style={{ color: "#166534" }}>{message}</p>}
        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          {candidates.map((contractor) => (
            <ContractorCard key={contractor.id} contractor={contractor}
              disabled={busy || Boolean(currentAssignment)} onOffer={offer} />
          ))}
          {contractors.length === 0
            ? <p>No workspace contractors yet. Add one above to continue.</p>
            : candidates.length === 0 && <p>No contractors match these explicit filters.</p>}
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Appointments</h2>
        <fieldset disabled={busy || currentAssignment?.status !== "accepted"} style={fieldsetStyle}>
          <legend>Schedule work</legend>
          <input type="datetime-local" value={appointmentDate}
            onChange={(event) => setAppointmentDate(event.target.value)} />
          <input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notes (optional)" />
          <button type="button" onClick={schedule} disabled={!appointmentDate}>Schedule appointment</button>
        </fieldset>
        {currentAssignment?.status !== "accepted" && <p>Accept the contractor assignment before scheduling.</p>}
        <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
          {appointments.map((appointment) => (
            <article key={appointment.id} style={appointmentStyle}>
              <div>
                <strong>{new Date(appointment.appointment_date).toLocaleString()}</strong>
                <div>{appointment.contractor?.company_name || `Contractor #${appointment.contractor_id}`} · {appointment.status}</div>
              </div>
              {appointment.status === "scheduled" && <div style={actionsStyle}>
                <button disabled={busy} onClick={() => reschedule(appointment)}>Reschedule</button>
                <button disabled={busy} onClick={() => run(() => completeAppointment(appointment.id), "Appointment completed.")}>Complete</button>
                <button disabled={busy} onClick={() => run(() => cancelAppointment(appointment.id), "Appointment cancelled.")}>Cancel</button>
                <button disabled={busy} onClick={() => run(() => markNoShow(appointment.id), "Appointment marked no-show.")}>No-show</button>
              </div>}
            </article>
          ))}
          {appointments.length === 0 && <p>No appointments.</p>}
        </div>
      </section>
    </main>
  );
}

function assignmentName(assignment: JobAssignment) {
  return assignment.contractor?.company_name
    || assignment.contractor?.contact_name
    || `Contractor #${assignment.contractor_id}`;
}

function toLocalInputValue(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

const pageStyle = { width: "min(1100px, calc(100% - 48px))", margin: "40px auto", fontFamily: "system-ui, sans-serif" };
const headerStyle = { display: "flex", justifyContent: "space-between", gap: 24, padding: 20, background: "#f8fafc", borderRadius: 16 };
const sectionStyle = { marginTop: 24, padding: 20, border: "1px solid #e2e8f0", borderRadius: 16 };
const filtersStyle = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 };
const createFormStyle = { margin: "16px 0 24px" };
const actionsStyle = { display: "flex", flexWrap: "wrap" as const, gap: 8 };
const fieldsetStyle = { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, border: "1px solid #cbd5e1", borderRadius: 10 };
const appointmentStyle = { display: "flex", justifyContent: "space-between", gap: 16, padding: 14, background: "#f8fafc", borderRadius: 10 };
const errorStyle = { color: "#b91c1c" };
