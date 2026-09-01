import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useAccountAccess } from "../../hooks/useAccountAccess";
import { ACADEMY_PROGRESS_SEQUENCE, ACADEMY_ROUTES, academyTracks, type AcademyAudience } from "../../lib/academyExperience";
import { loadAcademySnapshot, recordAcademyActivity, type AcademySnapshot } from "../../lib/academyData";

function resolveAudience(access: ReturnType<typeof useAccountAccess>): AcademyAudience {
  if (access.business && access.role === "owner") return "owner";
  if (access.business && access.role === "manager") return "manager";
  if (access.business || access.contractor) return "professional";
  return "resident";
}

function pageLabel(pathname: string) {
  if (pathname === ACADEMY_ROUTES.paths) return "Learning Paths";
  if (pathname === ACADEMY_ROUTES.certifications) return "Certifications";
  if (pathname === ACADEMY_ROUTES.progress) return "Progress";
  if (pathname.startsWith(ACADEMY_ROUTES.practicePrefix)) return "Practice";
  return "Academy Home";
}

const starterModules = [
  { id: "customer-care-foundations", title: "Customer care foundations", teacher: "diamond" as const, track: "customer-care" },
  { id: "operations-foundations", title: "Operations foundations", teacher: "dion" as const, track: "operations" },
  { id: "leadership-compliance-foundations", title: "Leadership & compliance foundations", teacher: "kendrell" as const, track: "leadership-compliance" },
];

export default function AcademyWorkspace() {
  const access = useAccountAccess();
  const location = useLocation();
  const { moduleId } = useParams();
  const audience = resolveAudience(access);
  const visibleTracks = useMemo(() => academyTracks.filter((track) => track.audiences.includes(audience)), [audience]);
  const [snapshot, setSnapshot] = useState<AcademySnapshot | null>(null);
  const [runtimeState, setRuntimeState] = useState<"loading" | "ready" | "staged" | "saving">("loading");
  const [message, setMessage] = useState("");

  async function refresh() {
    try {
      const next = await loadAcademySnapshot();
      setSnapshot(next);
      setRuntimeState("ready");
    } catch {
      setRuntimeState("staged");
    }
  }

  useEffect(() => { void refresh(); }, []);

  const activeModule = starterModules.find((item) => item.id === moduleId);
  const activeTrack = activeModule ? visibleTracks.find((track) => track.id === activeModule.track) : null;

  async function completePractice() {
    if (!activeModule) return;
    setRuntimeState("saving");
    setMessage("");
    try {
      const result = await recordAcademyActivity({ moduleId: activeModule.id, activityType: "practice" });
      setMessage(`Practice recorded · attempt ${result.attempt_number} · +${result.xp_awarded} XP`);
      await refresh();
    } catch {
      setRuntimeState("staged");
      setMessage("Progress storage is staged on this isolated branch and is not available in the current runtime yet.");
    }
  }

  return (
    <main className="hlc-community-workspace" style={{ width: "min(1120px, calc(100% - 28px))", margin: "32px auto 80px" }}>
      <header className="hlc-community-header">
        <div>
          <p className="hlc-community-kicker">MASTER EXPERIENCE · E2 ACADEMY + ARCADE</p>
          <h1>{pageLabel(location.pathname)}</h1>
          <p>Learn with Diamond, Dion, and Kendrell through one progression: Learn → Practice → Simulate → Certify → Apply → Progress.</p>
        </div>
        <div className="hlc-premium-panel" style={{ padding: 16, minWidth: 180 }}>
          <strong>{snapshot?.xpTotal ?? 0} XP</strong>
          <p style={{ margin: "6px 0 0" }}>XP tracks progress only. It is not a trust score.</p>
        </div>
      </header>

      <nav className="hlc-community-commandbar" aria-label="Academy navigation">
        <Link to={ACADEMY_ROUTES.home}>Academy</Link>
        <Link to={ACADEMY_ROUTES.paths}>Paths</Link>
        <Link to={ACADEMY_ROUTES.certifications}>Certifications</Link>
        <Link to={ACADEMY_ROUTES.progress}>Progress</Link>
        <Link to="/community/challenges">Arcade challenges</Link>
      </nav>

      {location.pathname === ACADEMY_ROUTES.home && (
        <>
          <section className="hlc-premium-panel" style={{ padding: 22, marginTop: 20 }}>
            <h2 style={{ marginTop: 0 }}>Your progression</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {ACADEMY_PROGRESS_SEQUENCE.map((stage, index) => <span key={stage} style={{ fontWeight: 900 }}>{index + 1}. {stage[0].toUpperCase() + stage.slice(1)}</span>)}
            </div>
          </section>
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 16, marginTop: 20 }}>
            {visibleTracks.map((track) => (
              <article className="hlc-premium-panel" key={track.id} style={{ padding: 20 }}>
                <p style={{ margin: "0 0 5px", fontWeight: 900 }}>TEACHER · {track.teacher.toUpperCase()}</p>
                <h2 style={{ margin: "0 0 8px" }}>{track.title}</h2>
                <p>{track.description}</p>
                <Link to={ACADEMY_ROUTES.paths} style={{ fontWeight: 900 }}>Open learning path →</Link>
              </article>
            ))}
          </section>
        </>
      )}

      {location.pathname === ACADEMY_ROUTES.paths && (
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 16, marginTop: 20 }}>
          {starterModules.filter((module) => visibleTracks.some((track) => track.id === module.track)).map((module) => (
            <article className="hlc-premium-panel" key={module.id} style={{ padding: 20 }}>
              <p style={{ margin: "0 0 6px", fontWeight: 900 }}>{module.teacher.toUpperCase()} · FOUNDATIONS</p>
              <h2 style={{ margin: "0 0 8px" }}>{module.title}</h2>
              <p>Learn the core material, then move into a recorded practice attempt.</p>
              <Link to={`${ACADEMY_ROUTES.practicePrefix}${module.id}`} style={{ fontWeight: 900 }}>Practice module →</Link>
            </article>
          ))}
        </section>
      )}

      {location.pathname.startsWith(ACADEMY_ROUTES.practicePrefix) && (
        <section className="hlc-premium-panel" style={{ padding: 22, marginTop: 20 }}>
          {activeModule && activeTrack ? <>
            <p style={{ margin: "0 0 6px", fontWeight: 900 }}>PRACTICE · {activeTrack.teacher.toUpperCase()}</p>
            <h2 style={{ marginTop: 0 }}>{activeModule.title}</h2>
            <p>Practice attempts use diminishing XP: full credit on attempt one, 25% on attempt two, and zero farming credit after that.</p>
            <button type="button" onClick={completePractice} disabled={runtimeState === "saving"} style={{ minHeight: 44, fontWeight: 900 }}>
              {runtimeState === "saving" ? "Recording…" : "Complete practice"}
            </button>
            {message && <p role="status">{message}</p>}
          </> : <><h2>Module unavailable</h2><p>This module is not available for the current account role.</p><Link to={ACADEMY_ROUTES.paths}>Return to paths</Link></>}
        </section>
      )}

      {location.pathname === ACADEMY_ROUTES.certifications && (
        <section className="hlc-premium-panel" style={{ padding: 22, marginTop: 20 }}>
          <h2 style={{ marginTop: 0 }}>HLC certifications</h2>
          <p>HLC competency records are separate from external licenses and credentials.</p>
          {snapshot?.certifications.length ? snapshot.certifications.map((cert) => (
            <article key={cert.id} style={{ padding: "12px 0", borderTop: "1px solid rgba(148,163,184,.25)" }}>
              <strong>{cert.module_id}</strong>
              <p style={{ margin: "4px 0" }}>Score {cert.score} / threshold {cert.threshold} · Teacher {cert.teacher}</p>
            </article>
          )) : <p>No verified HLC certifications recorded yet.</p>}
        </section>
      )}

      {location.pathname === ACADEMY_ROUTES.progress && (
        <section className="hlc-premium-panel" style={{ padding: 22, marginTop: 20 }}>
          <h2 style={{ marginTop: 0 }}>Learning progress</h2>
          <p><strong>{snapshot?.xpTotal ?? 0} XP</strong> across recorded Academy activity.</p>
          {snapshot?.attempts.length ? snapshot.attempts.slice(0, 12).map((attempt) => (
            <article key={attempt.id} style={{ padding: "12px 0", borderTop: "1px solid rgba(148,163,184,.25)" }}>
              <strong>{attempt.module_id}</strong>
              <p style={{ margin: "4px 0" }}>{attempt.activity_type} · attempt {attempt.attempt_number} · +{attempt.xp_awarded} XP</p>
            </article>
          )) : <p>No recorded attempts yet.</p>}
        </section>
      )}

      {runtimeState === "staged" && <p role="status" style={{ marginTop: 16 }}>Academy routes are wired. Persistence remains staged until the E2 migration is exercised in an authorized isolated runtime.</p>}
    </main>
  );
}
