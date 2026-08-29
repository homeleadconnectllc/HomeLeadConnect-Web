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

function incrementDateCount(counts: Map<string, number>, value: string) {
  const key = localDateKey(value);
  counts.set(key, (counts.get(key) ?? 0) + 1);
}

function ensureLegend(root: Element) {
  const miniMonth = root.querySelector<HTMLElement>(".hlc-calendar-mini-month");
  if (!miniMonth || miniMonth.querySelector(".hlc-calendar-mini-legend")) return;

  const legend = document.createElement("div");
  legend.className = "hlc-calendar-mini-legend";
  legend.setAttribute("aria-label", "Calendar marker legend");
  legend.innerHTML = '<span class="hlc-calendar-mini-legend-dot" aria-hidden="true"></span><span>Scheduled work</span>';
  miniMonth.appendChild(legend);
}

function markVisibleMonth(root: Element, itemDates: Map<string, number>) {
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
    const count = itemDates.get(key) ?? 0;
    const hasItems = count > 0;
    const dateLabel = `${monthName} ${day}, ${year}`;

    button.classList.toggle("has-items", hasItems);
    button.setAttribute("aria-label", hasItems ? `${dateLabel}, ${count} scheduled ${count === 1 ? "item" : "items"}` : dateLabel);

    if (hasItems) {
      button.setAttribute("data-has-items", "true");
      button.setAttribute("data-scheduled-count", String(count));
      button.title = `${count} scheduled ${count === 1 ? "item" : "items"}`;
    } else {
      button.removeAttribute("data-has-items");
      button.removeAttribute("data-scheduled-count");
      button.removeAttribute("title");
    }
  });

  ensureLegend(root);
}

export default function CalendarSignificanceMarkers() {
  useEffect(() => {
    const root = document.querySelector(".hlc-native-calendar");
    if (!root) return;
    const calendarRoot: Element = root;

    let cancelled = false;
    let timer: number | undefined;

    async function refreshMarkers() {
      try {
        const [appointments, events] = await Promise.all([
          listWorkspaceAppointments(),
          listHlcCalendarEvents(),
        ]);
        if (cancelled) return;

        const scheduledDates = new Map<string, number>();
        appointments
          .filter((appointment) => appointment.status === "scheduled")
          .forEach((appointment) => incrementDateCount(scheduledDates, appointment.appointment_date));
        events
          .filter((event) => event.status === "scheduled")
          .forEach((event) => incrementDateCount(scheduledDates, event.start_at));

        markVisibleMonth(calendarRoot, scheduledDates);
      } catch {
        // Calendar significance markers are a visual enhancement only.
      }
    }

    const scheduleRefresh = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => { void refreshMarkers(); }, 50);
    };

    const observer = new MutationObserver(scheduleRefresh);
    observer.observe(calendarRoot, { childList: true, subtree: true });
    scheduleRefresh();

    return () => {
      cancelled = true;
      observer.disconnect();
      if (timer) window.clearTimeout(timer);
      calendarRoot.querySelector(".hlc-calendar-mini-legend")?.remove();
    };
  }, []);

  return null;
}
