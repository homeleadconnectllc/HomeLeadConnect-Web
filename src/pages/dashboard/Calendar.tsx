import { useCallback, useEffect, useMemo, useState } from "react";
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
import "../../styles/calendar-premium.css";

type CalendarView = "day" | "week" | "month";

const statusLabels = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
} as const;

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfWeek(date: Date) {
  const next = startOfDay(date);
  const day = next.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + mondayOffset);
  return next;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function sameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function appointmentRange(appointment: JobAppointment) {
  const start = formatTime(appointment.appointment_date);
  const end = appointment.appointment_end_at ? formatTime(appointment.appointment_end_at) : "End time unavailable";
  return `${start} – ${end}`;
}

function contractorName(appointment: JobAppointment) {
  return appointment.contractor?.company_name || appointment.contractor?.contact_name || `Contractor #${appointment.contractor_id}`;
}

export default function Calendar() {
  const [appointments, setAppointments] = useState<JobAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rescheduling, setRescheduling] = useState<JobAppointment | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [view, setView] = useState<CalendarView>("day");

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
    load();
  }, [load]);

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

  const now = useMemo(() => new Date(), []);
  const today = useMemo(() => startOfDay(now), [now]);

  const visibleAppointments = useMemo(() => {
    const sorted = [...appointments].sort(
      (a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime(),
    );

    if (view === "day") {
      return sorted.filter((appointment) => sameDay(new Date(appointment.appointment_date), selectedDate));
    }

    if (view === "week") {
      const start = startOfWeek(selectedDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      return sorted.filter((appointment) => {
        const date = new Date(appointment.appointment_date);
        return date >= start && date < end;
      });
    }

    return sorted.filter((appointment) => sameMonth(new Date(appointment.appointment_date), selectedDate));
  }, [appointments, selectedDate, view]);

  const selectedAppointment =
    appointments.find((appointment) => appointment.id === selectedId) || visibleAppointments[0] || null;

  const todayCount = appointments.filter((appointment) => sameDay(new Date(appointment.appointment_date), today)).length;
  const weekStart = startOfWeek(today);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekCount = appointments.filter((appointment) => {
    const date = new Date(appointment.appointment_date);
    return date >= weekStart && date < weekEnd;
  }).length;
  const completedThisMonth = appointments.filter(
    (appointment) => appointment.status === "completed" && sameMonth(new Date(appointment.appointment_date), today),
  ).length;
  const noShowsThisMonth = appointments.filter(
    (appointment) => appointment.status === "no_show" && sameMonth(new Date(appointment.appointment_date), today),
  ).length;

  const upcoming = useMemo(
    () =>
      appointments
        .filter(
          (appointment) =>
            new Date(appointment.appointment_date) >= now &&
            appointment.status !== "cancelled" &&
            appointment.status !== "no_show",
        )
        .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
        .slice(0, 3),
    [appointments, now],
  );

  function moveDate(direction: -1 | 1) {
    const next = new Date(selectedDate);
    if (view === "day") next.setDate(next.getDate() + direction);
    if (view === "week") next.setDate(next.getDate() + direction * 7);
    if (view === "month") next.setMonth(next.getMonth() + direction);
    setSelectedDate(startOfDay(next));
    setSelectedId(null);
  }

  const monthGrid = useMemo(() => {
    const first = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const last = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    const mondayIndex = first.getDay() === 0 ? 6 : first.getDay() - 1;
    const days: Array<Date | null> = Array.from({ length: mondayIndex }, () => null);
    for (let day = 1; day <= last.getDate(); day += 1) {
      days.push(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day));
    }
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [selectedDate]);

  return (
    <main className="hlc-calendar-page">
      <div className="hlc-calendar-ambient hlc-calendar-ambient-one" />
      <div className="hlc-calendar-ambient hlc-calendar-ambient-two" />

      <header className="hlc-calendar-header">
        <div>
          <div className="hlc-calendar-breadcrumbs"><Link to="/jobs">Work</Link><span>/</span><span>Calendar</span></div>
          <div className="hlc-calendar-title-row">
            <span className="hlc-calendar-title-icon" aria-hidden="true">▣</span>
            <div>
              <h1>Schedule</h1>
              <p>Manage job appointments and meetings across the HLC workspace.</p>
            </div>
          </div>
        </div>
        <Link className="hlc-calendar-primary-link" to="/jobs">View jobs <span>→</span></Link>
      </header>

      <section className="hlc-calendar-kpis" aria-label="Schedule summary">
        <article><span className="hlc-calendar-kpi-icon">◫</span><div><small>Today&apos;s appointments</small><strong>{todayCount}</strong><span>{todayCount === 1 ? "appointment" : "appointments"} today</span></div></article>
        <article><span className="hlc-calendar-kpi-icon purple">◩</span><div><small>This week</small><strong>{weekCount}</strong><span>Total appointments</span></div></article>
        <article><span className="hlc-calendar-kpi-icon green">✓</span><div><small>Completed</small><strong>{completedThisMonth}</strong><span>This month</span></div></article>
        <article><span className="hlc-calendar-kpi-icon red">!</span><div><small>No shows</small><strong>{noShowsThisMonth}</strong><span>This month</span></div></article>
      </section>

      {loading && <div className="hlc-calendar-banner">Loading schedule…</div>}
      {error && <div className="hlc-calendar-banner error" role="alert">{error}</div>}
      {message && <div className="hlc-calendar-banner success" role="status">{message}</div>}
      {rescheduling?.appointment_end_at && (
        <RescheduleDialog
          initialStart={rescheduling.appointment_date}
          initialEnd={rescheduling.appointment_end_at}
          busy={busy}
          onCancel={() => setRescheduling(null)}
          onConfirm={reschedule}
        />
      )}

      <section className="hlc-calendar-workspace">
        <div className="hlc-calendar-board">
          <div className="hlc-calendar-toolbar">
            <div className="hlc-calendar-nav-controls">
              <button type="button" onClick={() => { setSelectedDate(today); setSelectedId(null); }}>Today</button>
              <button type="button" aria-label="Previous period" onClick={() => moveDate(-1)}>‹</button>
              <button type="button" aria-label="Next period" onClick={() => moveDate(1)}>›</button>
              <div className="hlc-calendar-date-label"><span aria-hidden="true">◫</span>{formatDate(selectedDate)}</div>
            </div>
            <div className="hlc-calendar-view-switch" aria-label="Calendar view">
              {(["day", "week", "month"] as CalendarView[]).map((option) => (
                <button key={option} type="button" className={view === option ? "active" : ""} onClick={() => { setView(option); setSelectedId(null); }}>
                  {option[0].toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="hlc-calendar-period-label">
            <span>{view === "day" ? "Daily schedule" : view === "week" ? "Weekly schedule" : "Monthly schedule"}</span>
            <strong>{visibleAppointments.length} {visibleAppointments.length === 1 ? "appointment" : "appointments"}</strong>
          </div>

          <div className="hlc-calendar-timeline">
            {!loading && !error && visibleAppointments.length === 0 && (
              <div className="hlc-calendar-empty">
                <span aria-hidden="true">◫</span>
                <h2>No appointments in this view</h2>
                <p>Your workspace is clear for this period. Schedule work from an accepted job assignment.</p>
                <Link to="/jobs">Open jobs</Link>
              </div>
            )}

            {visibleAppointments.map((appointment) => {
              const active = selectedAppointment?.id === appointment.id;
              return (
                <button
                  type="button"
                  key={appointment.id}
                  className={`hlc-calendar-event status-${appointment.status}${active ? " selected" : ""}`}
                  onClick={() => setSelectedId(appointment.id)}
                >
                  <div className="hlc-calendar-event-time">
                    <strong>{formatTime(appointment.appointment_date)}</strong>
                    <span>{appointment.appointment_end_at ? formatTime(appointment.appointment_end_at) : "Open end"}</span>
                  </div>
                  <div className="hlc-calendar-event-copy">
                    <div className="hlc-calendar-event-heading">
                      <strong>{appointment.job?.name || `Job ${appointment.job_id}`}</strong>
                      <span className={`hlc-calendar-status status-${appointment.status}`}>{statusLabels[appointment.status]}</span>
                    </div>
                    <span>{contractorName(appointment)}</span>
                    {appointment.notes && <small>{appointment.notes}</small>}
                  </div>
                  <span className="hlc-calendar-event-arrow" aria-hidden="true">→</span>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="hlc-calendar-detail-panel">
          {selectedAppointment ? (
            <>
              <div className="hlc-calendar-detail-heading">
                <span className={`hlc-calendar-status status-${selectedAppointment.status}`}>{statusLabels[selectedAppointment.status]}</span>
                <h2>{selectedAppointment.job?.name || `Job ${selectedAppointment.job_id}`}</h2>
                <p>{contractorName(selectedAppointment)}</p>
              </div>

              <dl className="hlc-calendar-detail-list">
                <div><dt>Date</dt><dd>{formatDate(new Date(selectedAppointment.appointment_date))}</dd></div>
                <div><dt>Time</dt><dd>{appointmentRange(selectedAppointment)}</dd></div>
                <div><dt>Contractor</dt><dd>{contractorName(selectedAppointment)}</dd></div>
                <div><dt>Job ID</dt><dd>{selectedAppointment.job_id}</dd></div>
                {selectedAppointment.notes && <div><dt>Notes</dt><dd>{selectedAppointment.notes}</dd></div>}
              </dl>

              <div className="hlc-calendar-detail-actions">
                <Link className="primary" to={`/jobs/${selectedAppointment.job_id}`}>View job details <span>→</span></Link>
                {selectedAppointment.status === "scheduled" && (
                  <>
                    <button disabled={busy || !selectedAppointment.appointment_end_at} onClick={() => setRescheduling(selectedAppointment)}>Reschedule</button>
                    <button disabled={busy} onClick={() => run(() => completeAppointment(selectedAppointment.id), "Appointment completed.")}>Complete appointment</button>
                    <button className="danger" disabled={busy} onClick={() => run(() => cancelAppointment(selectedAppointment.id), "Appointment cancelled.")}>Cancel appointment</button>
                    <button className="danger muted" disabled={busy} onClick={() => run(() => markNoShow(selectedAppointment.id), "Appointment marked no-show.")}>Mark no-show</button>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="hlc-calendar-detail-empty"><span>◫</span><h2>No appointment selected</h2><p>Select an appointment to see job details and actions.</p></div>
          )}

          <div className="hlc-calendar-mini-month">
            <div className="hlc-calendar-mini-heading">
              <button type="button" onClick={() => moveDate(-1)} aria-label="Previous month">‹</button>
              <strong>{new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(selectedDate)}</strong>
              <button type="button" onClick={() => moveDate(1)} aria-label="Next month">›</button>
            </div>
            <div className="hlc-calendar-mini-weekdays">{["M", "T", "W", "T", "F", "S", "S"].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
            <div className="hlc-calendar-mini-grid">
              {monthGrid.map((date, index) => date ? (
                <button
                  type="button"
                  key={date.toISOString()}
                  className={`${sameDay(date, selectedDate) ? "selected" : ""}${sameDay(date, today) ? " today" : ""}`}
                  onClick={() => { setSelectedDate(startOfDay(date)); setView("day"); setSelectedId(null); }}
                >
                  {date.getDate()}
                </button>
              ) : <span key={`empty-${index}`} />)}
            </div>
          </div>
        </aside>
      </section>

      <section className="hlc-calendar-upcoming">
        <div className="hlc-calendar-section-heading"><div><small>Forward look</small><h2>Upcoming</h2></div><Link to="/jobs">View all jobs</Link></div>
        <div className="hlc-calendar-upcoming-grid">
          {upcoming.length > 0 ? upcoming.map((appointment) => (
            <button type="button" key={appointment.id} className={`hlc-calendar-upcoming-card status-${appointment.status}`} onClick={() => { setSelectedDate(startOfDay(new Date(appointment.appointment_date))); setSelectedId(appointment.id); setView("day"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              <span>{new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(new Date(appointment.appointment_date))}</span>
              <strong>{appointment.job?.name || `Job ${appointment.job_id}`}</strong>
              <small>{appointmentRange(appointment)}</small>
              <em>{contractorName(appointment)}</em>
            </button>
          )) : <div className="hlc-calendar-upcoming-empty">No upcoming scheduled appointments.</div>}
        </div>
      </section>
    </main>
  );
}
