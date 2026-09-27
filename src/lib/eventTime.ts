export function suggestedEventStart(selectedDate?: Date, now = new Date()) {
  const useSelectedDay = Boolean(selectedDate && selectedDate.getTime() > new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime());
  const start = useSelectedDay ? new Date(selectedDate!) : new Date(now);
  if (useSelectedDay) {
    start.setHours(9, 0, 0, 0);
  } else {
    start.setMinutes(Math.ceil((start.getMinutes() + 1) / 30) * 30, 0, 0);
  }
  const offset = start.getTimezoneOffset() * 60_000;
  return new Date(start.getTime() - offset).toISOString().slice(0, 16);
}
