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

export default function Calendar() {
  const [appointments, setAppointments] = useState<JobAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
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
    } catch (reason) {
      setError(errorMessage(reason, "Unable to update appointment."));
    } finally {
      setBusy(false);
    }
  }

  async function reschedule(appointment: JobAppointment) {
    if(!appointment.appointment_end_at){setError("This appointment has no persisted end time and cannot be rescheduled.");return;}
    const replacement = window.prompt("Replacement start (YYYY-MM-DDTHH:mm)",toLocalInputValue(appointment.appointment_date));
    if (!replacement) return;
    const replacementEnd=window.prompt("Replacement end (YYYY-MM-DDTHH:mm)",toLocalInputValue(appointment.appointment_end_at));if(!replacementEnd)return;
    const date = new Date(replacement);
    const end=new Date(replacementEnd);
    if (Number.isNaN(date.getTime())||Number.isNaN(end.getTime())||end<=date) {
      setError("Enter valid replacement times with the end after the start.");
      return;
    }
    await run(
      () => rescheduleAppointment(appointment.id, date.toISOString(),end.toISOString()),
      "Appointment rescheduled. The original remains in history as cancelled.",
    );
  }

  return (
    <main style={pageStyle}>
      <p><Link to="/jobs">← Jobs</Link></p>
      <h1>Schedule</h1>
      <p style={{ color: "#64748b" }}>Workspace job appointments in chronological order.</p>
      {loading && <p>Loading schedule…</p>}
      {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
      {message && <p role="status" style={{ color: "#166534" }}>{message}</p>}
      <div style={{ display: "grid", gap: 12 }}>
        {appointments.map((appointment) => (
          <article className="responsive-record-card" key={appointment.id} style={cardStyle}>
            <div>
              <strong>{new Date(appointment.appointment_date).toLocaleString()} – {appointment.appointment_end_at?new Date(appointment.appointment_end_at).toLocaleString():"End time unavailable"}</strong>
              <div><Link to={`/jobs/${appointment.job_id}`}>{appointment.job?.name || `Job ${appointment.job_id}`}</Link></div>
              <div>{appointment.contractor?.company_name || `Contractor #${appointment.contractor_id}`}</div>
              <small>{appointment.status}</small>
            </div>
            {appointment.status === "scheduled" && <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <button disabled={busy} onClick={() => reschedule(appointment)}>Reschedule</button>
              <button disabled={busy} onClick={() => run(() => completeAppointment(appointment.id), "Appointment completed.")}>Complete</button>
              <button disabled={busy} onClick={() => run(() => cancelAppointment(appointment.id), "Appointment cancelled.")}>Cancel</button>
              <button disabled={busy} onClick={() => run(() => markNoShow(appointment.id), "Appointment marked no-show.")}>No-show</button>
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
function toLocalInputValue(value:string){const date=new Date(value);const offset=date.getTimezoneOffset()*60_000;return new Date(date.getTime()-offset).toISOString().slice(0,16);}
