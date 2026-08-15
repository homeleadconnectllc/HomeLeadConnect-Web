import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

type Tutorial = { title: string; steps: string[] };

const tutorials: Array<{ match: (path: string) => boolean; tutorial: Tutorial }> = [
  { match: (p) => p.startsWith("/leads"), tutorial: { title: "Working a lead", steps: ["Review the contact and service request details.", "Use LeadScope when you are ready to estimate the work.", "Record the next follow-up so the lead does not get lost."] } },
  { match: (p) => p.startsWith("/estimator"), tutorial: { title: "Build a LeadScope estimate", steps: ["Add labor and material items with quantity and unit cost.", "Use Shop project materials to compare third-party material pricing.", "Review markup and customer total, then save the estimate.", "After the customer accepts it, create the job from the accepted estimate."] } },
  { match: (p) => p.startsWith("/jobs"), tutorial: { title: "Move a job forward", steps: ["Review the job summary and current provider assignment.", "Offer the job to an eligible provider and send portal access when needed.", "Wait for the provider to accept through the protected portal.", "After acceptance, schedule the appointment and continue the workflow."] } },
  { match: (p) => p.startsWith("/calendar"), tutorial: { title: "Manage appointments", steps: ["Open the appointment tied to the job and provider.", "Confirm the scheduled start and end time.", "Use reschedule only when the job and assignment remain valid."] } },
  { match: (p) => p.startsWith("/call-center") || p.startsWith("/manual-communications"), tutorial: { title: "Handle communications", steps: ["Confirm the business number/provider status before relying on call features.", "Incoming, missed, and voicemail events appear only when provider evidence reaches HLC.", "Record a disposition or manual communication outcome so the operational record stays accurate."] } },
  { match: (p) => p.startsWith("/documents"), tutorial: { title: "Work with documents", steps: ["Choose the correct HLC record before uploading.", "Upload the file to the private HLC document store.", "Open registered documents from their authorized record and avoid sharing private storage URLs directly."] } },
  { match: (p) => p.startsWith("/community"), tutorial: { title: "Use HLC Community", steps: ["Choose discussions, events, reviews, referrals, groups, or moderation.", "Completion-linked reviews require an eligible completed HLC job.", "Report content through moderation instead of editing another participant's record."] } },
  { match: (p) => p.startsWith("/network") || p.startsWith("/providers") || p.startsWith("/map"), tutorial: { title: "Use the provider network", steps: ["Browse provider profiles and recorded service capabilities.", "Check service areas and availability before making workflow assumptions.", "Save providers for later without treating saved status as verification or acceptance."] } },
  { match: () => true, tutorial: { title: "HomeLead Connect workspace", steps: ["Use the left workspace navigation on desktop or the Menu drawer on mobile.", "Open the relevant HLC record rather than working from disconnected notes.", "Use the floating agent for page-specific guidance and Notifications for new operational events."] } },
];

export default function LiveTutorialDock() {
  const location = useLocation();
  const tutorial = useMemo(() => tutorials.find((item) => item.match(location.pathname))!.tutorial, [location.pathname]);
  const [openFor, setOpenFor] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const open = openFor === location.pathname;
  const current = tutorial.steps[Math.min(step, tutorial.steps.length - 1)];

  function toggle() {
    if (open) setOpenFor(null);
    else { setStep(0); setOpenFor(location.pathname); }
  }

  return (
    <aside style={hostStyle} aria-label="Live HLC tutorial">
      {open && (
        <section style={panelStyle}>
          <div style={headStyle}>
            <div><small style={eyebrowStyle}>Live tutorial</small><strong style={{ display: "block" }}>{tutorial.title}</strong></div>
            <button type="button" onClick={() => setOpenFor(null)}>Close</button>
          </div>
          <div style={progressStyle}>Step {step + 1} of {tutorial.steps.length}</div>
          <p style={{ margin: 0, lineHeight: 1.55 }}>{current}</p>
          <div style={actionsStyle}>
            <button type="button" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}>Back</button>
            <button type="button" onClick={() => setStep((value) => Math.min(tutorial.steps.length - 1, value + 1))} disabled={step === tutorial.steps.length - 1}>Next</button>
          </div>
        </section>
      )}
      <button type="button" onClick={toggle} style={triggerStyle} aria-expanded={open}>
        <span aria-hidden="true" style={{ fontSize: 20 }}>?</span>
        <span><strong>Guide me</strong><small style={{ display: "block", opacity: .75 }}>Live tutorial</small></span>
      </button>
    </aside>
  );
}

const hostStyle = { position: "fixed" as const, zIndex: 1290, left: "max(14px, env(safe-area-inset-left))", bottom: "max(14px, env(safe-area-inset-bottom))", display: "grid", gap: 8, justifyItems: "center", maxWidth: "min(390px, calc(100vw - 28px))" };
const panelStyle = { width: "min(370px, calc(100vw - 28px))", boxSizing: "border-box" as const, padding: 16, border: "1px solid #cbd5e1", borderRadius: 16, background: "#fff", color: "#0f172a", boxShadow: "0 22px 60px rgba(15,23,42,.28)", textAlign: "center" as const };
const headStyle = { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" as const };
const eyebrowStyle = { color: "#2563eb", fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" as const };
const progressStyle = { marginBottom: 8, color: "#475569", fontSize: 13, fontWeight: 800 };
const actionsStyle = { display: "flex", flexWrap: "wrap" as const, gap: 8, marginTop: 14, justifyContent: "center" };
const triggerStyle = { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, minHeight: 52, padding: "9px 14px", border: "1px solid #1d4ed8", borderRadius: 999, background: "#eff6ff", color: "#1e3a8a", fontWeight: 800, boxShadow: "0 12px 30px rgba(37,99,235,.18)", cursor: "pointer", textAlign: "center" as const };
