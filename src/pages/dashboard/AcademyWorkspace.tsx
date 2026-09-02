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

  useEffect(() => {
    let active = true;
    void loadAcademySnapshot().then((next) => {
      if (!active) return;
      setSnapshot(next);
      setRuntimeState("ready");
    }).catch(() => {
      if (active) setRuntimeState("staged");
    });
    return () => { active = false; };
  }, []);

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

  const completedAttempts = snapshot?.attempts.length ?? 0;
  const certificationCount = snapshot?.certifications.length ?? 0;

  return (
    <main className="hlc-academy-workspace">
      <header className="hlc-academy-topbar">
        <div>
          <span className="hlc-academy-eyebrow">ACADEMY · LEARN WITH THE HLC TEAM</span>
          <h1>{pageLabel(location.pathname)}</h1>
          <p>Build useful skill through one clear progression: learn, practice, simulate, certify, apply, and improve.</p>
        </div>
        <div className="hlc-academy-score" aria-label="Academy progress summary">
          <strong>{snapshot?.xpTotal ?? 0}</strong><span>XP</span>
          <small>{completedAttempts} attempts · {certificationCount} certifications</small>
        </div>
      </header>

      <nav className="hlc-academy-nav" aria-label="Academy navigation">
        <Link className={location.pathname === ACADEMY_ROUTES.home ? "is-active" : ""} to={ACADEMY_ROUTES.home}>Academy</Link>
        <Link className={location.pathname === ACADEMY_ROUTES.paths ? "is-active" : ""} to={ACADEMY_ROUTES.paths}>Paths</Link>
        <Link className={location.pathname === ACADEMY_ROUTES.certifications ? "is-active" : ""} to={ACADEMY_ROUTES.certifications}>Certifications</Link>
        <Link className={location.pathname === ACADEMY_ROUTES.progress ? "is-active" : ""} to={ACADEMY_ROUTES.progress}>Progress</Link>
        <Link to="/community/challenges">Arcade</Link>
      </nav>

      {location.pathname === ACADEMY_ROUTES.home && (
        <div className="hlc-academy-home-grid">
          <section className="hlc-academy-path" aria-labelledby="academy-progression-title">
            <header><span>YOUR LEARNING PATH</span><h2 id="academy-progression-title">Keep moving forward</h2></header>
            <ol className="hlc-academy-sequence">
              {ACADEMY_PROGRESS_SEQUENCE.map((stage, index) => <li key={stage}><b>{index + 1}</b><span>{stage[0].toUpperCase() + stage.slice(1)}</span></li>)}
            </ol>
          </section>
          <section className="hlc-academy-curriculum" aria-labelledby="academy-curriculum-title">
            <header><span>CURRICULUM</span><h2 id="academy-curriculum-title">Choose your lane</h2></header>
            <div className="hlc-academy-track-list">
              {visibleTracks.map((track) => (
                <article key={track.id}>
                  <div><span>{track.teacher.toUpperCase()}</span><h3>{track.title}</h3><p>{track.description}</p></div>
                  <Link to={ACADEMY_ROUTES.paths}>Open path →</Link>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}

      {location.pathname === ACADEMY_ROUTES.paths && (
        <section className="hlc-academy-curriculum hlc-academy-curriculum-full">
          <header><span>FOUNDATION MODULES</span><h2>Start with the right foundation</h2></header>
          <div className="hlc-academy-module-list">
            {starterModules.filter((module) => visibleTracks.some((track) => track.id === module.track)).map((module, index) => (
              <article key={module.id}>
                <b>{String(index + 1).padStart(2, "0")}</b>
                <div><span>{module.teacher.toUpperCase()}</span><h3>{module.title}</h3><p>Learn the core material, then move into a recorded practice attempt.</p></div>
                <Link to={`${ACADEMY_ROUTES.practicePrefix}${module.id}`}>Practice →</Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {location.pathname.startsWith(ACADEMY_ROUTES.practicePrefix) && (
        <section className="hlc-academy-practice">
          {activeModule && activeTrack ? <>
            <header><span>PRACTICE · {activeTrack.teacher.toUpperCase()}</span><h2>{activeModule.title}</h2></header>
            <p>Practice attempts use diminishing XP: full credit on attempt one, 25% on attempt two, and zero farming credit after that.</p>
            <button type="button" onClick={completePractice} disabled={runtimeState === "saving"}>{runtimeState === "saving" ? "Recording…" : "Complete practice"}</button>
            {message && <p role="status">{message}</p>}
          </> : <><h2>Module unavailable</h2><p>This module is not available for the current account role.</p><Link to={ACADEMY_ROUTES.paths}>Return to paths</Link></>}
        </section>
      )}

      {location.pathname === ACADEMY_ROUTES.certifications && (
        <section className="hlc-academy-records">
          <header><span>VERIFIED HLC COMPETENCY</span><h2>Certifications</h2><p>HLC competency records are separate from external licenses and credentials.</p></header>
          {snapshot?.certifications.length ? snapshot.certifications.map((cert) => (
            <article key={cert.id}><strong>{cert.module_id}</strong><span>Score {cert.score} / {cert.threshold}</span><small>Teacher · {cert.teacher}</small></article>
          )) : <p>No verified HLC certifications recorded yet.</p>}
        </section>
      )}

      {location.pathname === ACADEMY_ROUTES.progress && (
        <section className="hlc-academy-records">
          <header><span>LEARNING HISTORY</span><h2>{snapshot?.xpTotal ?? 0} XP earned</h2></header>
          {snapshot?.attempts.length ? snapshot.attempts.slice(0, 12).map((attempt) => (
            <article key={attempt.id}><strong>{attempt.module_id}</strong><span>{attempt.activity_type} · attempt {attempt.attempt_number}</span><small>+{attempt.xp_awarded} XP</small></article>
          )) : <p>No recorded attempts yet.</p>}
        </section>
      )}

      {runtimeState === "staged" && <p className="hlc-academy-runtime" role="status">Academy routes are wired. Persistence remains staged until the E2 migration is exercised in an authorized isolated runtime.</p>}
    </main>
  );
}
