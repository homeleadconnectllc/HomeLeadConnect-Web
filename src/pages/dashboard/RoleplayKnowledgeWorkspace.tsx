import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ACADEMY_E3_ROUTES,
  KNOWLEDGE_LIBRARY,
  ROLEPLAY_GUARDRAILS,
  ROLEPLAY_SCENARIOS,
  filterKnowledge,
  type AcademyTeacher,
} from "../../lib/academyKnowledge";

export default function RoleplayKnowledgeWorkspace() {
  const location = useLocation();
  const isRoleplay = location.pathname === ACADEMY_E3_ROUTES.roleplay;
  const [query, setQuery] = useState("");
  const [teacher, setTeacher] = useState<AcademyTeacher | "all">("all");
  const results = useMemo(
    () => filterKnowledge(query, teacher === "all" ? undefined : teacher),
    [query, teacher],
  );

  return (
    <main className="hlc-community-workspace" style={{ width: "min(1120px, calc(100% - 28px))", margin: "32px auto 80px" }}>
      <header className="hlc-community-header">
        <div>
          <p className="hlc-community-kicker">MASTER EXPERIENCE · E3 ROLEPLAY + KNOWLEDGE</p>
          <h1>{isRoleplay ? "Roleplay Studio" : "Academy Knowledge Library"}</h1>
          <p>
            {isRoleplay
              ? "Practice realistic HLC conversations in a clearly labeled simulation environment before applying skills to real work."
              : "Find HLC guidance, tutorials, policy references, and coaching material without duplicating the existing source pages."}
          </p>
        </div>
      </header>

      <nav className="hlc-community-commandbar" aria-label="Roleplay and knowledge navigation">
        <Link to="/academy">Academy</Link>
        <Link to={ACADEMY_E3_ROUTES.roleplay}>Roleplay</Link>
        <Link to={ACADEMY_E3_ROUTES.library}>Knowledge library</Link>
        <Link to="/academy/progress">Progress</Link>
      </nav>

      {isRoleplay ? (
        <>
          <section className="hlc-premium-panel" style={{ padding: 22, marginTop: 20 }}>
            <p style={{ margin: "0 0 6px", fontWeight: 900 }}>SIMULATION ONLY</p>
            <h2 style={{ marginTop: 0 }}>Safe practice boundary</h2>
            <ul>
              {ROLEPLAY_GUARDRAILS.map((guardrail) => <li key={guardrail}>{guardrail}</li>)}
            </ul>
          </section>

          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 16, marginTop: 20 }}>
            {ROLEPLAY_SCENARIOS.map((scenario) => (
              <article className="hlc-premium-panel" key={scenario.id} style={{ padding: 20 }}>
                <p style={{ margin: "0 0 6px", fontWeight: 900 }}>COACH · {scenario.teacher.toUpperCase()}</p>
                <h2 style={{ margin: "0 0 8px" }}>{scenario.title}</h2>
                <p>{scenario.objective}</p>
                <p style={{ fontWeight: 800 }}>Foundation scenario · interactive scoring is not yet enabled.</p>
              </article>
            ))}
          </section>
        </>
      ) : (
        <>
          <section className="hlc-premium-panel" style={{ padding: 22, marginTop: 20 }}>
            <h2 style={{ marginTop: 0 }}>Search HLC knowledge</h2>
            <label htmlFor="knowledge-query" style={{ display: "block", fontWeight: 800 }}>Search guidance</label>
            <input
              id="knowledge-query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try operations, onboarding, policy…"
              style={{ width: "100%", minHeight: 44, marginTop: 8 }}
            />
            <label htmlFor="knowledge-teacher" style={{ display: "block", fontWeight: 800, marginTop: 14 }}>Teacher</label>
            <select
              id="knowledge-teacher"
              value={teacher}
              onChange={(event) => setTeacher(event.target.value as AcademyTeacher | "all")}
              style={{ minHeight: 44, marginTop: 8 }}
            >
              <option value="all">All teachers</option>
              <option value="diamond">Diamond</option>
              <option value="dion">Dion</option>
              <option value="kendrell">Kendrell</option>
            </select>
          </section>

          <section aria-live="polite" style={{ display: "grid", gap: 16, marginTop: 20 }}>
            {results.map((entry) => (
              <article className="hlc-premium-panel" key={entry.id} style={{ padding: 20 }}>
                <p style={{ margin: "0 0 6px", fontWeight: 900 }}>{entry.kind.toUpperCase()} · {entry.teacher.toUpperCase()}</p>
                <h2 style={{ margin: "0 0 8px" }}>{entry.title}</h2>
                <p>{entry.summary}</p>
                <Link to={entry.sourceRoute} style={{ fontWeight: 900 }}>Open canonical source →</Link>
              </article>
            ))}
            {!results.length && <p>No knowledge entries match this search yet.</p>}
          </section>

          <p style={{ marginTop: 20 }}>Library foundation currently indexes {KNOWLEDGE_LIBRARY.length} canonical HLC sources. It does not silently copy or replace those source pages.</p>
        </>
      )}
    </main>
  );
}
