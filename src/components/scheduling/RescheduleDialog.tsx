import { useState } from "react";
import { requireAppointmentTimeRange } from "../../lib/appointments/timeRange";

type Props = {
  initialStart: string;
  initialEnd: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: (start: string, end: string) => Promise<void>;
};

export default function RescheduleDialog({ initialStart, initialEnd, busy, onCancel, onConfirm }: Props) {
  const [start, setStart] = useState(() => toLocalInputValue(initialStart));
  const [end, setEnd] = useState(() => toLocalInputValue(initialEnd));
  const [error, setError] = useState("");

  async function confirm() {
    let range: ReturnType<typeof requireAppointmentTimeRange>;
    try {
      range = requireAppointmentTimeRange(start, end);
    } catch {
      setError("Enter valid replacement times with the end strictly after the start.");
      return;
    }
    setError("");
    await onConfirm(range.start, range.end);
  }

  return <section role="dialog" aria-modal="true" aria-labelledby="reschedule-heading" className="hlc-ui-dialog-3bb01a">
    <h2 id="reschedule-heading">Reschedule appointment</h2>
    <p>The current appointment will remain in history as cancelled.</p>
    {error && <p role="alert" className="hlc-ui-color-d80273">{error}</p>}
    <label>Replacement start<input autoFocus required type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} /></label>
    <label>Replacement end<input required type="datetime-local" min={start} value={end} onChange={(event) => setEnd(event.target.value)} /></label>
    <div className="hlc-ui-reschedule-dialog-9c4038">
      <button type="button" disabled={busy || !start || !end} onClick={confirm}>{busy ? "Rescheduling…" : "Confirm reschedule"}</button>
      <button type="button" disabled={busy} onClick={onCancel}>Cancel</button>
    </div>
  </section>;
}

function toLocalInputValue(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
