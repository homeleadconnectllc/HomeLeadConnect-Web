export type AppointmentTimeRange = { start: string; end: string };

export class AppointmentTimeRangeError extends Error {
  constructor(message = "Appointment end must be strictly after its start.") {
    super(message);
    this.name = "AppointmentTimeRangeError";
  }
}

export function requireAppointmentTimeRange(start: string, end: string): AppointmentTimeRange {
  const parsedStart = new Date(start);
  const parsedEnd = new Date(end);

  if (!start || !end || Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime()) || parsedEnd.getTime() <= parsedStart.getTime()) {
    throw new AppointmentTimeRangeError();
  }

  return { start: parsedStart.toISOString(), end: parsedEnd.toISOString() };
}
