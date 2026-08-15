import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

type Tutorial = { key: string; title: string; intro: string; steps: string[] };
type TutorialDefinition = { match: (path: string) => boolean; tutorial: Tutorial };

const tutorials: TutorialDefinition[] = [
  { match: (p) => p === "/dashboard", tutorial: { key: "dashboard", title: "Dashboard", intro: "Your mobile and desktop starting point for what needs attention now.", steps: ["Scan priority cards, overdue work, new activity, and today’s schedule before opening individual records.", "Use the mobile work dock for Call, Text, Schedule, Follow Up, and Voice Note without leaving the workflow.", "Tap the contextual AI avatar when you want a summary, next-step guidance, or help interpreting this workspace."] } },
  { match: (p) => p.startsWith("/leads"), tutorial: { key: "leads", title: "Leads", intro: "Work new opportunities from first contact through the next committed action.", steps: ["Open a lead to review contact details, service need, source, status, and communication history.", "Call or text from HLC, then record the outcome so another employee can see exactly what happened.", "Set the next follow-up or move the lead forward so no opportunity is left without an owner or next action."] } },
  { match: (p) => p.startsWith("/estimator"), tutorial: { key: "estimator", title: "LeadScope", intro: "Build and review an estimate from the lead or job record.", steps: ["Add labor and material items with quantity and unit cost.", "Use Shop project materials when you need to compare available third-party material pricing.", "Review markup and customer total before saving the estimate.", "After the customer accepts it, continue into the job workflow rather than creating a disconnected record."] } },
  { match: (p) => p.startsWith("/jobs"), tutorial: { key: "jobs", title: "Jobs", intro: "Coordinate accepted work, assignments, appointments, and completion.", steps: ["Open the job to check status, customer, provider assignment, estimate, and scheduled work.", "Use the explicit offer and acceptance workflow before treating a provider as assigned.", "Schedule the appointment only after the job and assignment are valid, then keep completion and follow-up attached to the same job."] } },
  { match: (p) => p.startsWith("/messages"), tutorial: { key: "messages", title: "Messages", intro: "Keep customer and provider communication tied to the right HLC conversation.", steps: ["Choose the conversation or contact before composing so the message history stays attached to the correct record.", "Use text, notes, attachments, or voice notes as appropriate for the conversation.", "Check the communication history before replying so remote employees do not duplicate outreach or contradict one another."] } },
  { match: (p) => p.startsWith("/calendar"), tutorial: { key: "calendar", title: "Schedule", intro: "Manage appointments, callbacks, jobs, and follow-up timing from one schedule.", steps: ["Open an appointment to confirm the linked job, customer, provider, start time, and end time.", "Use reschedule when the underlying job and assignment remain valid.", "From mobile, jump directly from the scheduled item to call, text, or follow up with the person involved."] } },
  { match: (p) => p.startsWith("/follow-ups"), tutorial: { key: "follow-ups", title: "Follow Ups", intro: "This is the team callback and next-action queue.", steps: ["Work due and overdue items first, then upcoming callbacks and reminders.", "Open the linked lead, customer, job, or conversation before contacting them so you have the full context.", "Complete or reschedule the follow-up with a clear outcome instead of leaving an ambiguous task behind."] } },
  { match: (p) => p.startsWith("/call-center") || p.startsWith("/manual-communications"), tutorial: { key: "call-center", title: "Communications Hub", intro: "Use HLC as the customer-context and follow-up layer around the active phone carrier.", steps: ["Choose the correct company line and contact before starting or logging a communication.", "For Google Voice, HLC can launch Call, Text, and Open Google Voice while ringing and live carrier controls remain in Google Voice.", "After the interaction, record the outcome and next follow-up so the rest of the remote team has an accurate history."] } },
  { match: (p) => p.startsWith("/notifications"), tutorial: { key: "notifications", title: "Alerts", intro: "Review operational events that may need action.", steps: ["Open an alert to see the HLC record it belongs to instead of acting from the notification alone.", "Handle time-sensitive items such as assignments, appointment changes, messages, and follow-up reminders first.", "Clear or act on alerts once the underlying record is handled so the queue stays useful."] } },
  { match: (p) => p.startsWith("/documents"), tutorial: { key: "documents", title: "Documents", intro: "Keep files attached to the authorized HLC record they belong to.", steps: ["Choose the correct lead, job, customer, provider, or conversation before uploading.", "Upload to the private HLC document store and use the registered record to reopen it later.", "Avoid sharing private storage URLs directly; use the authorized HLC workflow instead."] } },
  { match: (p) => p.startsWith("/network") || p.startsWith("/providers") || p.startsWith("/map") || p.startsWith("/matching"), tutorial: { key: "network", title: "Provider Network", intro: "Find and coordinate professionals using recorded service-area and availability data.", steps: ["Review provider profiles, services, service areas, and availability before deciding who fits the work.", "Treat approximate map locations and unverified records as what they are; HLC does not invent distance, rank, or availability.", "Use the explicit offer and acceptance workflow before treating a provider as assigned to a job."] } },
  { match: (p) => p.startsWith("/community"), tutorial: { key: "community", title: "Community", intro: "Use discussions, events, reviews, referrals, and groups without mixing private workspace data into public activity.", steps: ["Choose the community area that matches what you want to post or review.", "Completion-linked reviews require an eligible completed HLC job when that relationship is required.", "Report problematic content through moderation instead of editing another participant’s record."] } },
  { match: (p) => p.startsWith("/analytics"), tutorial: { key: "analytics", title: "Analytics", intro: "Use operational metrics to understand workload and outcomes, not as a substitute for source records.", steps: ["Start with the KPI summary, then open the underlying operational area when a number needs investigation.", "Compare activity and trends using the time period shown on the page.", "Use the source lead, job, appointment, or communication record before taking action on an exception."] } },
  { match: (p) => p.startsWith("/team"), tutorial: { key: "team", title: "Team", intro: "Manage who can work in the HLC workspace and what they are allowed to do.", steps: ["Review each person’s workspace role before assigning operational responsibility.", "Use role permissions rather than sharing owner credentials or exposing billing and HQ controls unnecessarily.", "Keep assignments and follow-ups attached to named users so distributed work stays accountable."] } },
  { match: (p) => p.startsWith("/settings"), tutorial: { key: "settings", title: "Settings", intro: "Configure company, workspace, billing, and communication settings from the appropriate permission level.", steps: ["Use the section that matches the setting you need instead of changing unrelated workspace controls.", "Owner-only and management-only settings remain restricted even when other employees can use the operational feature.", "Review saved changes before returning to daily work, especially phone, billing, and permission settings."] } },
  { match: (p) => p.startsWith("/homeowner-portal"), tutorial: { key: "resident-portal", title: "Resident Portal", intro: "Track requests, appointments, messages, documents, and progress from the resident side.", steps: ["Open the active request or job to see its current status and linked appointment.", "Use portal messaging for questions or updates tied to the request.", "Keep documents and profile information inside the portal rather than sending private workspace records outside HLC."] } },
  { match: (p) => p.startsWith("/contractor-portal"), tutorial: { key: "professional-portal", title: "Professional Portal", intro: "Manage profile information, offers, accepted work, schedules, documents, and job progress.", steps: ["Review new offers and the underlying work details before accepting.", "After acceptance, use the linked job and appointment instead of creating a separate record.", "Keep availability, documents, and completion updates current so the workspace team sees reliable information."] } },
];

function tutorialFor(pathname: string) {
  return tutorials.find((item) => item.match(pathname))?.tutorial ?? null;
}

function seenKey(tutorial: Tutorial) {
  return `hlc-contextual-tutorial-seen:v2:${tutorial.key}`;
}

export default function LiveTutorialDock() {
  const location = useLocation();
  const tutorial = useMemo(() => tutorialFor(location.pathname), [location.pathname]);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const open = Boolean(tutorial && openKey === tutorial.key);
  const current = tutorial?.steps[Math.min(step, tutorial.steps.length - 1)] ?? "";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!tutorial) {
        setOpenKey(null);
        return;
      }
      setStep(0);
      setOpenKey(sessionStorage.getItem(seenKey(tutorial)) === "1" ? null : tutorial.key);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [tutorial]);

  if (!tutorial) return null;

  function closeTutorial() {
    sessionStorage.setItem(seenKey(tutorial), "1");
    setOpenKey(null);
  }

  function next() {
    if (step >= tutorial.steps.length - 1) {
      closeTutorial();
      return;
    }
    setStep((value) => Math.min(tutorial.steps.length - 1, value + 1));
  }

  if (!open) return null;

  return (
    <aside className="hlc-contextual-tutorial" aria-label={`${tutorial.title} tutorial`}>
      <section className="hlc-contextual-tutorial-panel" role="dialog" aria-modal="false" aria-labelledby="hlc-contextual-tutorial-title">
        <div className="hlc-contextual-tutorial-head">
          <div>
            <small>Quick guide</small>
            <strong id="hlc-contextual-tutorial-title">{tutorial.title}</strong>
          </div>
          <button type="button" onClick={closeTutorial} aria-label={`Dismiss ${tutorial.title} tutorial`}>×</button>
        </div>
        {step === 0 && <p className="hlc-contextual-tutorial-intro">{tutorial.intro}</p>}
        <div className="hlc-contextual-tutorial-progress">Step {step + 1} of {tutorial.steps.length}</div>
        <p className="hlc-contextual-tutorial-step">{current}</p>
        <div className="hlc-contextual-tutorial-actions">
          <button type="button" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}>Back</button>
          <button type="button" onClick={next}>{step === tutorial.steps.length - 1 ? "Got it" : "Next"}</button>
        </div>
      </section>
    </aside>
  );
}
