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
import { errorMessage } from "../../lib/errorMessage";
import RescheduleDialog from "../../components/scheduling/RescheduleDialog";

export default function Calendar() {
  const [appointments, setAppointments] = useState<JobAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rescheduling, setRescheduling] = useState<JobAppointment | null>(null);

  const load = useCallback(async () => {
    setError("");
    try {
      setAppointments(await listWorkspaceAppointments());
    } catch (reason) {
      setError(errorMessage(reason, "Unable to load schedule."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    listWorkspaceAppointments()
      .then(setAppointments)
      .catch((reason: unknown) =>
        setError(errorMessage(reason, "Unable to load schedule.")),
      )
      .finally(() => setLoading(false));
  }, []);

  async function run(action: () => Promise<unknown>, successMessage: string) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
      await load();
      setMessage(successMessage);
      return true;
    } catch (reason) {
      setError(errorMessage(reason, "Unable to update appointment."));
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function reschedule(start: string, end: string) {
    if (!rescheduling) return;
    const succeeded = await run(
      () => rescheduleAppointment(rescheduling.id, start, end),
      "Appointment rescheduled. The original remains in history as cancelled.",
    );
    if (succeeded) setRescheduling(null);
  }

  return (
    <main style={pageStyle}>
      <p><Link to="/jobs">← Jobs</Link></p>
      <h1>Schedule</h1>
      <p style={{ color: "#64748b" }}>Workspace job appointments in chronological order.</p>
      {loading && <p>Loading schedule…</p>}
      {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
      {message && <p role="status" style={{ color: "#166534" }}>{message}</p>}
      {rescheduling?.appointment_end_at && <RescheduleDialog initialStart={rescheduling.appointment_date} initialEnd={rescheduling.appointment_end_at} busy={busy} onCancel={() => setRescheduling(null)} onConfirm={reschedule} />}
      <div style={{ display: "grid", gap: 12 }}>
        {appointments.map((appointment) => (
          <article className="responsive-record-card" key={appointment.id} style={cardStyle}>
            <div>
              <strong>{new Date(appointment.appointment_date).toLocaleString()} – {appointment.appointment_end_at ? new Date(appointment.appointment_end_at).toLocaleString() : "End time unavailable"}</strong>
              <div><Link to={`/jobs/${appointment.job_id}`}>{appointment.job?.name || `Job ${appointment.job_id}`}</Link></div>
              <div>{appointment.contractor?.company_name || `Contractor #${appointment.contractor_id}`}</div>
              <small>{appointment.status}</small>
            </div>
            {appointment.status === "scheduled" && <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <button disabled={busy || !appointment.appointment_end_at} title={!appointment.appointment_end_at ? "This historical appointment has no persisted end time." : undefined} onClick={() => setRescheduling(appointment)}>Reschedule</button>
              <button disabled={busy} onClick={() => run(() => completeAppointment(appointment.id), "Appointment completed.")}>Complete</button>
              <button disabled={busy} onClick={() => run(() => cancelAppointment(appointment.id), "Appointment cancelled.")}>Cancel</button>
              <button disabled={busy} onClick={() => run(() => markNoShow(appointment.id), "Appointment marked no-show.")}>No-show</button>
            </div>}
          </article>
        ))}
        {!loading && !error && appointments.length === 0 && <p>No job appointments scheduled.</p>}
      </div>
    </main>
  );
}

const pageStyle = { width: "min(1000px, calc(100% - 48px))", margin: "40px auto", fontFamily: "system-ui, sans-serif" };
const cardStyle = { display: "flex", justifyContent: "space-between", gap: 20, padding: 18, border: "1px solid #e2e8f0", borderRadius: 12 };
