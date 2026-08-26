import { useEffect } from "react";
import { listWorkspaceAppointments } from "../../api/appointments";
import { listHlcCalendarEvents } from "../../api/hlcCalendar";

const monthIndexes: Record<string, number> = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
};

function localDateKey(value: string) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function markVisibleMonth(root: Element, itemDates: Set<string>) {
  const heading = root.querySelector<HTMLElement>(".hlc-calendar-mini-heading strong");
  if (!heading) return;

  const [monthName, yearText] = (heading.textContent || "").trim().split(/\s+/);
  const monthIndex = monthIndexes[monthName];
  const year = Number(yearText);
  if (!Number.isInteger(monthIndex) || !Number.isInteger(year)) return;

  root.querySelectorAll<HTMLButtonElement>(".hlc-calendar-mini-grid button").forEach((button) => {
    const day = Number(button.textContent?.trim());
    if (!Number.isInteger(day)) return;
    const key = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const hasItems = itemDates.has(key);
    button.classList.toggle("has-items", hasItems);
    if (hasItems) button.setAttribute("data-has-items", "true");
    else button.removeAttribute("data-has-items");
  });
}

export default function CalendarSignificanceMarkers() {
  useEffect(() => {
    const root = document.querySelector(".hlc-native-calendar");
    if (!root) return;

    let cancelled = false;
    let timer: number | undefined;

    async function refreshMarkers() {
      try {
        const [appointments, events] = await Promise.all([
          listWorkspaceAppointments(),
          listHlcCalendarEvents(),
        ]);
        if (cancelled) return;

        const itemDates = new Set<string>();
        appointments
          .filter((appointment) => appointment.status !== "cancelled")
          .forEach((appointment) => itemDates.add(localDateKey(appointment.appointment_date)));
        events
          .filter((event) => event.status !== "cancelled")
          .forEach((event) => itemDates.add(localDateKey(event.start_at)));

        markVisibleMonth(root, itemDates);
      } catch {
        // Calendar significance markers are visual enhancement only.
      }
    }

    const scheduleRefresh = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => { void refreshMarkers(); }, 50);
    };

    const observer = new MutationObserver(scheduleRefresh);
    observer.observe(root, { childList: true, subtree: true });
    scheduleRefresh();

    return () => {
      cancelled = true;
      observer.disconnect();
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  return null;
}
