import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

const GUIDANCE: Array<{ prefix: string; title: string; body: string }> = [
  { prefix: "/dashboard", title: "Command Center", body: "Start here for priorities, live work, alerts, and the next action across HomeLead Connect." },
  { prefix: "/leads", title: "Leads", body: "Open a lead to review contact details, qualification, LeadScope, follow-up, and the handoff into scheduled work." },
  { prefix: "/jobs", title: "Jobs", body: "Use this area to open work, update status, schedule appointments, assign providers, and attach job evidence." },
  { prefix: "/messages", title: "Messages", body: "Choose a conversation first. Then send an internal message, use email when intended, or record a voice note." },
  { prefix: "/calendar", title: "Calendar", body: "Choose a start and end time, add useful notes, then schedule the appointment against the correct work record." },
  { prefix: "/network", title: "Provider Network", body: "Filter by specialty and location, review recorded provider information, then offer or invite only when the fit is verified." },
  { prefix: "/providers", title: "Providers", body: "Use exact service and location information. HLC should show recorded facts rather than infer availability or fit." },
  { prefix: "/matching", title: "Community Matching", body: "Review one provider at a time. Like or pass based on the information shown; operational fit stays separate." },
  { prefix: "/documents", title: "Documents", body: "Upload evidence to the correct lead or job so files remain attached to the work they support." },
  { prefix: "/call-center", title: "Call Center", body: "Open the correct contact, place the call through the available phone handoff, then record the outcome and follow-up." },
  { prefix: "/settings", title: "Settings", body: "Manage identity, workspace, billing, devices, alerts, and other account-level controls here." },
];

function humanize(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

function nearbyLabel(control: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
  if (control.id) {
    const explicit = document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(control.id)}"]`);
    if (explicit?.textContent?.trim()) return explicit.textContent.trim();
  }
  const wrapping = control.closest("label");
  if (wrapping?.textContent?.trim()) return wrapping.textContent.trim();
  const previous = control.previousElementSibling;
  if (previous?.tagName === "LABEL" && previous.textContent?.trim()) return previous.textContent.trim();
  return "";
}

function hintFor(control: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
  const raw = nearbyLabel(control) || control.getAttribute("name") || control.getAttribute("id") || control.getAttribute("type") || "field";
  const label = humanize(raw.replace(/\(.*?\)/g, "").trim());
  const key = `${control.getAttribute("name") || ""} ${control.getAttribute("id") || ""} ${label}`.toLowerCase();

  if (key.includes("company")) return "Enter company name";
  if (key.includes("contact") && key.includes("name")) return "Enter contact name";
  if (key.includes("special")) return "Enter exact specialty or trade";
  if (key.includes("city") || key.includes("state") || key.includes("zip") || key.includes("location")) return "Enter city, state, or ZIP";
  if (key.includes("phone")) return "Enter phone number";
  if (key.includes("email")) return "Enter email address";
  if (key.includes("note")) return "Add notes (optional)";
  if (key.includes("search")) return "Search by name or keyword";
  if (key.includes("start")) return "Choose start date and time";
  if (key.includes("end")) return "Choose end date and time";
  return label === "Field" ? "Enter information" : `Enter ${label.toLowerCase()}`;
}

function enhanceFields() {
  const controls = document.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    ".hlc-route-content input, .hlc-route-content select, .hlc-route-content textarea",
  );

  controls.forEach((control) => {
    const type = control instanceof HTMLInputElement ? control.type : "";
    if (["hidden", "checkbox", "radio", "submit", "button", "reset"].includes(type)) return;

    const hint = hintFor(control);
    if (!control.getAttribute("aria-label") && !control.getAttribute("aria-labelledby")) {
      control.setAttribute("aria-label", nearbyLabel(control) || hint);
    }
    control.setAttribute("data-hlc-field-guided", "true");

    if (control instanceof HTMLInputElement && ["date", "time", "datetime-local", "month", "week", "file"].includes(type)) {
      if (!control.title) control.title = hint;
      return;
    }
    if (!(control instanceof HTMLSelectElement) && !control.placeholder) {
      control.placeholder = hint;
    }
  });
}

export default function WorkspaceGuidance() {
  const location = useLocation();
  const guidance = useMemo(
    () => GUIDANCE.find((item) => location.pathname === item.prefix || location.pathname.startsWith(`${item.prefix}/`)) ?? {
      prefix: location.pathname,
      title: "HomeLead Connect",
      body: "Use the page heading and field labels to complete the current task. Open Help whenever you want a quick explanation of this screen.",
    },
    [location.pathname],
  );
  const storageKey = `hlc-guide:${guidance.prefix}`;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    enhanceFields();
    const observer = new MutationObserver(() => enhanceFields());
    const routeContent = document.querySelector(".hlc-route-content");
    if (routeContent) observer.observe(routeContent, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [location.pathname]);

  useEffect(() => {
    const dismissed = typeof window !== "undefined" && window.sessionStorage.getItem(storageKey) === "dismissed";
    setOpen(!dismissed);
  }, [storageKey]);

  function dismiss() {
    if (typeof window !== "undefined") window.sessionStorage.setItem(storageKey, "dismissed");
    setOpen(false);
  }

  return (
    <>
      <button className="hlc-help-trigger" type="button" onClick={() => setOpen(true)} aria-label="Open instructions for this page">?</button>
      {open && (
        <aside className="hlc-route-guide" role="dialog" aria-modal="false" aria-labelledby="hlc-route-guide-title">
          <button className="hlc-route-guide-close" type="button" onClick={dismiss} aria-label="Close instructions">×</button>
          <span>QUICK GUIDE</span>
          <strong id="hlc-route-guide-title">{guidance.title}</strong>
          <p>{guidance.body}</p>
          <button className="hlc-route-guide-dismiss" type="button" onClick={dismiss}>Got it</button>
        </aside>
      )}
    </>
  );
}
