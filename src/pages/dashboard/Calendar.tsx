import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  cancelAppointment,
  completeAppointment,
  listWorkspaceAppointments,
  markNoShow,
  rescheduleAppointment,
} from "../../api/appointments";
import {
  createHlcCalendarEvent,
  deleteHlcCalendarEvent,
  listHlcCalendarEvents,
  setHlcCalendarEventStatus,
  type HlcCalendarEvent,
  type HlcCalendarEventType,
} from "../../api/hlcCalendar";
import type { JobAppointment } from "../../lib/types/database";
import { errorMessage } from "../../lib/errorMessage";
import RescheduleDialog from "../../components/scheduling/RescheduleDialog";
import "../../styles/calendar-premium.css";
import "../../styles/hlc-native-calendar.css";

type CalendarView = "day" | "week" | "month";
type SelectedItem = { kind: "appointment"; id: number } | { kind: "event"; id: string } | null;

type ScheduleItem =
  | { kind: "appointment"; id: number; start: string; end: string | null; title: string; subtitle: string; status: string; notes: string | null }
  | { kind: "event"; id: string; start: string; end: string; title: string; subtitle: string; status: string; notes: string | null };

const appointmentStatusLabels = {
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
  next.setDate(next.getDate() + (day === 0 ? -6 : 1 - day));
  return next;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function sameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function inSelectedPeriod(value: string, selectedDate: Date, view: CalendarView) {
  const date = new Date(value);
  if (view === "day") return sameDay(date, selectedDate);
  if (view === "month") return sameMonth(date, selectedDate);
  const start = startOfWeek(selectedDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return date >= start && date < end;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(date);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function localInputValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function contractorName(appointment: JobAppointment) {
  return appointment.contractor?.company_name || appointment.contractor?.contact_name || `Contractor #${appointment.contractor_id}`;
}

function eventTypeLabel(type: HlcCalendarEventType) {
  return ({ meeting: "Meeting", reminder: "Reminder", task: "Task", focus: "Focus block", other: "Other" } as const)[type];
}

export default function Calendar() {
  const now = useMemo(() => new Date(), []);
  const today = useMemo(() => startOfDay(now), [now]);
  const [appointments, setAppointments] = useState<JobAppointment[]>([]);
  const [nativeEvents, setNativeEvents] = useState<HlcCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rescheduling, setRescheduling] = useState<JobAppointment | null>(null);
  const [selected, setSelected] = useState<SelectedItem>(null);
  const [selectedDate, setSelectedDate] = useState(today);
  const [view, setView] = useState<CalendarView>("day");
  const [newEventOpen, setNewEventOpen] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const [appointmentRows, eventRows] = await Promise.all([listWorkspaceAppointments(), listHlcCalendarEvents()]);
      setAppointments(appointmentRows);
      setNativeEvents(eventRows);
    } catch (reason) {
      setError(errorMessage(reason, "Unable to load the HLC calendar."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const allItems = useMemo<ScheduleItem[]>(() => [
    ...appointments.map((appointment) => ({
      kind: "appointment" as const,
      id: appointment.id,
      start: appointment.appointment_date,
      end: appointment.appointment_end_at,
      title: appointment.job?.name || `Job ${appointment.job_id}`,
      subtitle: contractorName(appointment),
      status: appointment.status,
      notes: appointment.notes,
    })),
    ...nativeEvents.map((event) => ({
      kind: "event" as const,
      id: event.id,
      start: event.start_at,
      end: event.end_at,
      title: event.title,
      subtitle: eventTypeLabel(event.event_type),
      status: event.status,
      notes: event.description,
    })),
  ].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()), [appointments, nativeEvents]);

  const visibleItems = useMemo(() => allItems.filter((item) => inSelectedPeriod(item.start, selectedDate, view)), [allItems, selectedDate, view]);

  const selectedAppointment = selected?.kind === "appointment" ? appointments.find((row) => row.id === selected.id) ?? null : null;
  const selectedEvent = selected?.kind === "event" ? nativeEvents.find((row) => row.id === selected.id) ?? null : null;

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true); setError(""); setMessage("");
    try {
      await action();
      await load();
      setMessage(success);
      return true;
    } catch (reason) {
      setError(errorMessage(reason, "Unable to update the HLC calendar."));
      return false;
    } finally { setBusy(false); }
  }

  async function reschedule(start: string, end: string) {
    if (!rescheduling) return;
    const ok = await run(() => rescheduleAppointment(rescheduling.id, start, end), "Appointment rescheduled.");
    if (ok) setRescheduling(null);
  }

  async function createEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const start = String(form.get("start"));
    const end = String(form.get("end"));
    const ok = await run(() => createHlcCalendarEvent({
      title: String(form.get("title")),
      description: String(form.get("description") || ""),
      startAt: new Date(start).toISOString(),
      endAt: new Date(end).toISOString(),
      eventType: String(form.get("eventType")) as HlcCalendarEventType,
    }), "HLC calendar event created.");
    if (ok) {
      setNewEventOpen(false);
      setSelectedDate(startOfDay(new Date(start)));
      setView("day");
    }
  }

  function moveDate(direction: -1 | 1) {
    const next = new Date(selectedDate);
    if (view === "day") next.setDate(next.getDate() + direction);
    if (view === "week") next.setDate(next.getDate() + direction * 7);
    if (view === "month") next.setMonth(next.getMonth() + direction);
    setSelectedDate(startOfDay(next));
    setSelected(null);
  }

  const weekStart = startOfWeek(today);
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 7);
  const todayCount = allItems.filter((item) => sameDay(new Date(item.start), today) && item.status !== "cancelled").length;
  const weekCount = allItems.filter((item) => { const date = new Date(item.start); return date >= weekStart && date < weekEnd && item.status !== "cancelled"; }).length;
  const nativeCount = nativeEvents.filter((event) => event.status === "scheduled").length;
  const appointmentCount = appointments.filter((appointment) => appointment.status === "scheduled").length;

  const monthGrid = useMemo(() => {
    const first = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const last = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    const mondayIndex = first.getDay() === 0 ? 6 : first.getDay() - 1;
    const days: Array<Date | null> = Array.from({ length: mondayIndex }, () => null);
    for (let day = 1; day <= last.getDate(); day += 1) days.push(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day));
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [selectedDate]);

  const defaultStart = useMemo(() => {
    const value = new Date(selectedDate);
    value.setHours(9, 0, 0, 0);
    return localInputValue(value);
  }, [selectedDate]);
  const defaultEnd = useMemo(() => {
    const value = new Date(selectedDate);
    value.setHours(10, 0, 0, 0);
    return localInputValue(value);
  }, [selectedDate]);

  return (
    <main className="hlc-calendar-page hlc-native-calendar">
      <header className="hlc-calendar-header">
        <div>
          <div className="hlc-calendar-breadcrumbs"><Link to="/jobs">Work</Link><span>/</span><span>Calendar</span></div>
          <div className="hlc-calendar-title-row">
            <span className="hlc-calendar-title-icon" aria-hidden="true">▣</span>
            <div><h1>HLC Calendar</h1><p>Your workspace schedule is authoritative here. Google Calendar is optional, not required.</p></div>
          </div>
        </div>
        <div className="hlc-native-calendar-header-actions">
          <button type="button" className="hlc-calendar-primary-link" onClick={() => setNewEventOpen(true)}>+ New event</button>
          <Link className="hlc-calendar-primary-link secondary" to="/jobs">View jobs <span>→</span></Link>
        </div>
      </header>

      <section className="hlc-calendar-kpis" aria-label="Calendar summary">
        <article><span className="hlc-calendar-kpi-icon">◫</span><div><small>Today</small><strong>{todayCount}</strong><span>scheduled items</span></div></article>
        <article><span className="hlc-calendar-kpi-icon">◩</span><div><small>This week</small><strong>{weekCount}</strong><span>calendar items</span></div></article>
        <article><span className="hlc-calendar-kpi-icon green">✓</span><div><small>Job appointments</small><strong>{appointmentCount}</strong><span>active</span></div></article>
        <article><span className="hlc-calendar-kpi-icon">＋</span><div><small>HLC events</small><strong>{nativeCount}</strong><span>active</span></div></article>
      </section>

      {loading && <div className="hlc-calendar-banner">Loading HLC Calendar…</div>}
      {error && <div className="hlc-calendar-banner error" role="alert">{error}</div>}
      {message && <div className="hlc-calendar-banner success" role="status">{message}</div>}

      {newEventOpen && (
        <section className="hlc-native-event-composer" aria-label="Create HLC calendar event">
          <div className="hlc-native-event-composer-heading"><div><small>HLC native event</small><h2>New calendar event</h2></div><button type="button" onClick={() => setNewEventOpen(false)}>Close</button></div>
          <form onSubmit={createEvent}>
            <label>Title<input name="title" required maxLength={200} placeholder="Team meeting, reminder, focus block…" /></label>
            <label>Type<select name="eventType" defaultValue="meeting"><option value="meeting">Meeting</option><option value="reminder">Reminder</option><option value="task">Task</option><option value="focus">Focus block</option><option value="other">Other</option></select></label>
            <label>Start<input name="start" type="datetime-local" required defaultValue={defaultStart} /></label>
            <label>End<input name="end" type="datetime-local" required defaultValue={defaultEnd} /></label>
            <label className="wide">Notes<textarea name="description" rows={3} placeholder="Optional notes" /></label>
            <button className="hlc-calendar-primary-link wide" type="submit" disabled={busy}>{busy ? "Saving…" : "Create HLC event"}</button>
          </form>
        </section>
      )}

      {rescheduling?.appointment_end_at && <RescheduleDialog initialStart={rescheduling.appointment_date} initialEnd={rescheduling.appointment_end_at} busy={busy} onCancel={() => setRescheduling(null)} onConfirm={reschedule} />}

      <section className="hlc-calendar-workspace">
        <div className="hlc-calendar-board">
          <div className="hlc-calendar-toolbar">
            <div className="hlc-calendar-nav-controls">
              <button type="button" onClick={() => { setSelectedDate(today); setSelected(null); }}>Today</button>
              <button type="button" aria-label="Previous period" onClick={() => moveDate(-1)}>‹</button>
              <button type="button" aria-label="Next period" onClick={() => moveDate(1)}>›</button>
              <div className="hlc-calendar-date-label"><span aria-hidden="true">◫</span>{formatDate(selectedDate)}</div>
            </div>
            <div className="hlc-calendar-view-switch" aria-label="Calendar view">
              {(["day", "week", "month"] as CalendarView[]).map((option) => <button key={option} type="button" className={view === option ? "active" : ""} onClick={() => { setView(option); setSelected(null); }}>{option[0].toUpperCase() + option.slice(1)}</button>)}
            </div>
          </div>

          <div className="hlc-calendar-period-label"><span>{view} schedule</span><strong>{visibleItems.length} {visibleItems.length === 1 ? "item" : "items"}</strong></div>
          <div className="hlc-calendar-timeline">
            {!loading && visibleItems.length === 0 && <div className="hlc-calendar-empty"><span>◫</span><h2>No calendar items here</h2><p>Create an HLC event or schedule a job appointment.</p><button type="button" onClick={() => setNewEventOpen(true)}>Create event</button></div>}
            {visibleItems.map((item) => {
              const active = selected?.kind === item.kind && selected.id === item.id;
              return <button type="button" key={`${item.kind}-${item.id}`} className={`hlc-calendar-event status-${item.status}${item.kind === "event" ? " native" : ""}${active ? " selected" : ""}`} onClick={() => setSelected({ kind: item.kind, id: item.id } as SelectedItem)}>
                <div className="hlc-calendar-event-time"><strong>{formatTime(item.start)}</strong><span>{item.end ? formatTime(item.end) : "Open end"}</span></div>
                <div className="hlc-calendar-event-copy"><div className="hlc-calendar-event-heading"><strong>{item.title}</strong><span className={`hlc-calendar-status status-${item.status}`}>{item.kind === "event" ? "HLC event" : item.status}</span></div><span>{item.subtitle}</span>{item.notes && <small>{item.notes}</small>}</div>
                <span className="hlc-calendar-event-arrow">→</span>
              </button>;
            })}
          </div>
        </div>

        <aside className="hlc-calendar-detail-panel">
          {selectedAppointment ? <>
            <div className="hlc-calendar-detail-heading"><span className={`hlc-calendar-status status-${selectedAppointment.status}`}>{appointmentStatusLabels[selectedAppointment.status]}</span><h2>{selectedAppointment.job?.name || `Job ${selectedAppointment.job_id}`}</h2><p>{contractorName(selectedAppointment)}</p></div>
            <div className="hlc-calendar-detail-actions">
              <Link className="primary" to={`/jobs/${selectedAppointment.job_id}`}>View job details <span>→</span></Link>
              {selectedAppointment.status === "scheduled" && <>
                <button disabled={busy || !selectedAppointment.appointment_end_at} onClick={() => setRescheduling(selectedAppointment)}>Reschedule</button>
                <button disabled={busy} onClick={() => void run(() => completeAppointment(selectedAppointment.id), "Appointment completed.")}>Complete appointment</button>
                <button className="danger" disabled={busy} onClick={() => void run(() => cancelAppointment(selectedAppointment.id), "Appointment cancelled.")}>Cancel appointment</button>
                <button className="danger muted" disabled={busy} onClick={() => void run(() => markNoShow(selectedAppointment.id), "Appointment marked no-show.")}>Mark no-show</button>
              </>}
            </div>
            <dl className="hlc-calendar-detail-list"><div><dt>Date</dt><dd>{formatDate(new Date(selectedAppointment.appointment_date))}</dd></div><div><dt>Time</dt><dd>{formatTime(selectedAppointment.appointment_date)} – {selectedAppointment.appointment_end_at ? formatTime(selectedAppointment.appointment_end_at) : "Open end"}</dd></div><div><dt>Contractor</dt><dd>{contractorName(selectedAppointment)}</dd></div><div><dt>Calendar</dt><dd>HLC native schedule</dd></div>{selectedAppointment.notes && <div><dt>Notes</dt><dd>{selectedAppointment.notes}</dd></div>}</dl>
          </> : selectedEvent ? <>
            <div className="hlc-calendar-detail-heading"><span className={`hlc-calendar-status status-${selectedEvent.status}`}>{eventTypeLabel(selectedEvent.event_type)}</span><h2>{selectedEvent.title}</h2><p>HLC workspace event</p></div>
            <div className="hlc-calendar-detail-actions">
              {selectedEvent.status === "scheduled" && <button disabled={busy} onClick={() => void run(() => setHlcCalendarEventStatus(selectedEvent.id, "completed"), "HLC event completed.")}>Mark complete</button>}
              {selectedEvent.status === "scheduled" && <button className="danger" disabled={busy} onClick={() => void run(() => setHlcCalendarEventStatus(selectedEvent.id, "cancelled"), "HLC event cancelled.")}>Cancel event</button>}
              <button className="danger muted" disabled={busy} onClick={() => void run(async () => { await deleteHlcCalendarEvent(selectedEvent.id); setSelected(null); }, "HLC event deleted.")}>Delete event</button>
            </div>
            <dl className="hlc-calendar-detail-list"><div><dt>Date</dt><dd>{formatDate(new Date(selectedEvent.start_at))}</dd></div><div><dt>Time</dt><dd>{formatTime(selectedEvent.start_at)} – {formatTime(selectedEvent.end_at)}</dd></div><div><dt>Type</dt><dd>{eventTypeLabel(selectedEvent.event_type)}</dd></div><div><dt>Status</dt><dd>{selectedEvent.status}</dd></div>{selectedEvent.description && <div><dt>Notes</dt><dd>{selectedEvent.description}</dd></div>}</dl>
          </> : <div className="hlc-calendar-detail-empty"><span>◫</span><h2>HLC Calendar</h2><p>Select an appointment or native event to manage it.</p><button type="button" onClick={() => setNewEventOpen(true)}>+ New event</button></div>}

          <div className="hlc-calendar-mini-month">
            <div className="hlc-calendar-mini-heading"><button type="button" onClick={() => moveDate(-1)}>‹</button><strong>{new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(selectedDate)}</strong><button type="button" onClick={() => moveDate(1)}>›</button></div>
            <div className="hlc-calendar-mini-weekdays">{["M","T","W","T","F","S","S"].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
            <div className="hlc-calendar-mini-grid">{monthGrid.map((date, index) => date ? <button type="button" key={date.toISOString()} className={`${sameDay(date, selectedDate) ? "selected" : ""}${sameDay(date, today) ? " today" : ""}`} onClick={() => { setSelectedDate(startOfDay(date)); setView("day"); setSelected(null); }}>{date.getDate()}</button> : <span key={`empty-${index}`} />)}</div>
          </div>
        </aside>
      </section>
    </main>
  );
}
