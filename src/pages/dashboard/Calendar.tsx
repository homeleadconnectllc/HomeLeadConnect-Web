import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  cancelAppointment,
  completeAppointment,
  listWorkspaceAppointments,
  markNoShow,
  rescheduleAppointment,
} from "../../api/appointments";
import type { JobAppointment } from "../../lib/types/database";

export default function Calendar() {
  const [appointments, setAppointments] = useState<JobAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setAppointments(await listWorkspaceAppointments());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load schedule.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    listWorkspaceAppointments()
      .then(setAppointments)
      .catch((reason: unknown) =>
        setError(reason instanceof Error ? reason.message : "Unable to load schedule."),
      )
      .finally(() => setLoading(false));
  }, []);

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await action();
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update appointment.");
    } finally {
      setBusy(false);
    }
  }

  async function reschedule(appointment: JobAppointment) {
    const replacement = window.prompt("Replacement date/time (YYYY-MM-DDTHH:mm)");
    if (!replacement) return;
    const date = new Date(replacement);
    if (Number.isNaN(date.getTime())) {
      setError("Enter a valid replacement date and time.");
      return;
    }
    await run(() => rescheduleAppointment(appointment.id, date.toISOString()));
  }

  return (
    <main style={pageStyle}>
      <p><Link to="/jobs">← Jobs</Link></p>
      <h1>Schedule</h1>
      <p style={{ color: "#64748b" }}>Workspace job appointments in chronological order.</p>
      {loading && <p>Loading schedule…</p>}
      {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
      <div style={{ display: "grid", gap: 12 }}>
        {appointments.map((appointment) => (
          <article key={appointment.id} style={cardStyle}>
            <div>
              <strong>{new Date(appointment.appointment_date).toLocaleString()}</strong>
              <div><Link to={`/jobs/${appointment.job_id}`}>{appointment.job?.name || `Job ${appointment.job_id}`}</Link></div>
              <div>{appointment.contractor?.company_name || `Contractor #${appointment.contractor_id}`}</div>
              <small>{appointment.status}</small>
            </div>
            {appointment.status === "scheduled" && <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <button disabled={busy} onClick={() => reschedule(appointment)}>Reschedule</button>
              <button disabled={busy} onClick={() => run(() => completeAppointment(appointment.id))}>Complete</button>
              <button disabled={busy} onClick={() => run(() => cancelAppointment(appointment.id))}>Cancel</button>
              <button disabled={busy} onClick={() => run(() => markNoShow(appointment.id))}>No-show</button>
            </div>}
          </article>
        ))}
        {!loading && appointments.length === 0 && <p>No job appointments scheduled.</p>}
      </div>
    </main>
  );
}

const pageStyle = { width: "min(1000px, calc(100% - 48px))", margin: "40px auto", fontFamily: "system-ui, sans-serif" };
const cardStyle = { display: "flex", justifyContent: "space-between", gap: 20, padding: 18, border: "1px solid #e2e8f0", borderRadius: 12 };
