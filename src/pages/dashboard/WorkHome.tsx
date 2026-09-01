import { Link } from "react-router-dom";

const workAreas = [
  { title: "Leads", body: "Review incoming requests, qualification, ownership, and the next recorded action.", route: "/leads", action: "Open leads" },
  { title: "Operational matching", body: "Review provider eligibility and fit evidence before any deliberate assignment decision.", route: "/work/matching", action: "Review matching" },
  { title: "Jobs", body: "Track scheduled and active work through documented completion.", route: "/jobs", action: "Open jobs" },
  { title: "Follow-ups", body: "Work overdue, today, upcoming, and completed commitments without losing customer context.", route: "/follow-ups", action: "Open follow-ups" },
  { title: "Calendar", body: "See when appointments, work, and other recorded commitments happen.", route: "/calendar", action: "Open calendar" },
  { title: "Call Center", body: "Handle live operational calling, notes, dispositions, and follow-up from the real workspace.", route: "/call-center", action: "Open Call Center" },
];

const blockers = [
  "Waiting on resident",
  "Waiting on provider",
  "Needs match",
  "Needs appointment",
  "Missing document",
  "Materials not ready",
  "Compliance review",
  "Manager approval",
];

export default function WorkHome() {
  return (
    <main className="hlc-work-home" style={{ width: "min(1160px, calc(100% - 28px))", margin: "34px auto 80px" }}>
      <header className="hlc-premium-panel" style={{ padding: "clamp(22px, 5vw, 38px)", overflow: "hidden" }}>
        <div style={{ display: "grid", gap: 18, gridTemplateColumns: "minmax(0, 1.35fr) minmax(230px, .65fr)", alignItems: "center" }}>
          <div>
            <p style={{ margin: "0 0 8px", fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase", color: "#2563eb" }}>HLC Work · Dion Operations</p>
            <h1 style={{ margin: "0 0 12px", fontSize: "clamp(2.2rem, 6vw, 4.6rem)", lineHeight: 1 }}>Keep the work moving.</h1>
            <p style={{ margin: 0, maxWidth: 760, color: "#475569", fontSize: "1.02rem", lineHeight: 1.65 }}>
              Work is the operational spine for requests, leads, provider fit, appointments, jobs, completion, and follow-up. It shows where to go next without turning Community discovery into a job assignment.
            </p>
          </div>
          <div aria-hidden="true" style={{ minHeight: 190, borderRadius: 24, background: "linear-gradient(145deg, #081426, #123a67)", display: "grid", placeItems: "center", padding: 24, color: "white", textAlign: "center" }}>
            <div>
              <div style={{ fontSize: "3rem", marginBottom: 8 }}>↗</div>
              <strong style={{ display: "block", fontSize: "1.1rem" }}>Request → Completion</strong>
              <small style={{ opacity: .82 }}>One deliberate operational lifecycle</small>
            </div>
          </div>
        </div>
      </header>

      <section aria-labelledby="work-areas-title" style={{ marginTop: 24 }}>
        <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
          <div>
            <p style={{ margin: "0 0 4px", color: "#2563eb", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".08em", fontSize: ".78rem" }}>Operational areas</p>
            <h2 id="work-areas-title" style={{ margin: 0 }}>What needs to happen?</h2>
          </div>
          <Link to="/operations" style={{ fontWeight: 800 }}>Open Dion workspace →</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 265px), 1fr))", gap: 16 }}>
          {workAreas.map((area) => (
            <article key={area.route} className="hlc-premium-panel" style={{ padding: 20, display: "flex", flexDirection: "column", minHeight: 190 }}>
              <h3 style={{ margin: "0 0 8px", fontSize: "1.15rem" }}>{area.title}</h3>
              <p style={{ margin: "0 0 18px", color: "#475569", lineHeight: 1.55, flex: 1 }}>{area.body}</p>
              <Link to={area.route} style={{ fontWeight: 900 }}>{area.action} →</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="hlc-premium-panel" style={{ marginTop: 24, padding: 22 }} aria-labelledby="work-lifecycle-title">
        <p style={{ margin: "0 0 4px", color: "#2563eb", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".08em", fontSize: ".78rem" }}>Lifecycle contract</p>
        <h2 id="work-lifecycle-title" style={{ margin: "0 0 10px" }}>Request → Lead → Match → Appointment → Job → Completion → Follow-Up</h2>
        <p style={{ margin: "0 0 16px", color: "#475569" }}>A record is not “moving” unless HLC can identify its current stage, who owns the next step, the next action, and why it is blocked when progress stops.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {blockers.map((blocker) => <span key={blocker} className="hlc-status-pill">{blocker}</span>)}
        </div>
      </section>

      <section className="hlc-premium-callout" style={{ marginTop: 24, padding: 22 }}>
        <h2 style={{ marginTop: 0 }}>Discovery is not assignment.</h2>
        <p style={{ marginBottom: 8 }}>Community Swipe helps people discover and connect. Operational matching belongs here in Work and requires a deliberate review before assignment.</p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link to="/work/matching" style={{ fontWeight: 900 }}>Review operational fit →</Link>
          <Link to="/community/swipe" style={{ fontWeight: 800 }}>Open Community Swipe →</Link>
        </div>
      </section>
    </main>
  );
}
