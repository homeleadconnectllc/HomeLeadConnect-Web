import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CONNECT_BEHAVIOR_RULE,
  CONNECT_FRAMEWORK,
  CONNECT_SCORING_RUBRIC,
  CONNECT_SCRIPT_FOLDERS,
  getConnectScenario,
  resolveConnectScenarioEvidence,
  searchConnectLibrary,
  type ConnectScenario,
  type ConnectVariant,
} from "../../data/connectConversationSystem";
import {
  ACADEMY_E3_ROUTES,
  KNOWLEDGE_LIBRARY,
  ROLEPLAY_GUARDRAILS,
  filterKnowledge,
  type AcademyTeacher,
} from "../../lib/academyKnowledge";

const variantOrder: ConnectVariant[] = ["master", "quick", "standard", "warm", "professional", "high-touch"];

function ScenarioStudy({ scenario }: { scenario: ConnectScenario }) {
  const [variant, setVariant] = useState<ConnectVariant>("standard");
  const selectedVariant = scenario.variants.find((item) => item.variant === variant) ?? scenario.variants[0];
  const evidence = resolveConnectScenarioEvidence(scenario);

  return (
    <article className="hlc-premium-panel" style={{ padding: 22 }}>
      <p style={{ margin: "0 0 6px", fontWeight: 900 }}>COACH · {scenario.teacher.toUpperCase()} · {scenario.difficulty.toUpperCase()}</p>
      <h2 style={{ margin: "0 0 8px" }}>{scenario.title}</h2>
      <p>{scenario.goal}</p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "14px 0" }}>
        {variantOrder.filter((key) => scenario.variants.some((item) => item.variant === key)).map((key) => (
          <button
            type="button"
            key={key}
            onClick={() => setVariant(key)}
            aria-pressed={variant === key}
            style={{ minHeight: 40, padding: "8px 12px", fontWeight: variant === key ? 900 : 700 }}
          >
            {scenario.variants.find((item) => item.variant === key)?.label ?? key}
          </button>
        ))}
      </div>

      <div style={{ padding: 16, border: "1px solid currentColor", borderRadius: 14 }}>
        <p style={{ margin: "0 0 6px", fontWeight: 900 }}>{selectedVariant.label} · {selectedVariant.approved.toUpperCase()}</p>
        <p style={{ whiteSpace: "pre-wrap" }}>{selectedVariant.body}</p>
      </div>

      <details style={{ marginTop: 16 }}>
        <summary style={{ fontWeight: 900, cursor: "pointer" }}>Study this scenario</summary>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: 16, marginTop: 12 }}>
          <div><strong>Use when</strong><ul>{scenario.useWhen.map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div><strong>Do not use when</strong><ul>{scenario.doNotUseWhen.map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div><strong>Required information</strong><ul>{scenario.requiredInformation.map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div><strong>Suggested questions</strong><ul>{scenario.suggestedQuestions.map((item) => <li key={item}>{item}</li>)}</ul></div>
        </div>
        <p><strong>Linked CRM dispositions:</strong> {evidence.dispositions.map((item) => item?.label).filter(Boolean).join(", ") || "None configured"}</p>
        <p><strong>Canonical source scripts:</strong> {evidence.sourceScripts.map((item) => item.title).join(", ") || "None configured"}</p>
      </details>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
        <Link to={`/academy/practice/${scenario.id}`} style={{ fontWeight: 900 }}>Practice this script →</Link>
        <Link to={`${ACADEMY_E3_ROUTES.roleplay}?scenario=${scenario.id}&variant=${variant}`} style={{ fontWeight: 900 }}>Roleplay this script →</Link>
      </div>
    </article>
  );
}

export default function RoleplayKnowledgeWorkspace() {
  const location = useLocation();
  const isRoleplay = location.pathname === ACADEMY_E3_ROUTES.roleplay;
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const requestedScenario = params.get("scenario") ?? "resident-new-request";
  const selectedScenario = getConnectScenario(requestedScenario) ?? getConnectScenario("resident-new-request");
  const [query, setQuery] = useState("");
  const [teacher, setTeacher] = useState<AcademyTeacher | "all">("all");
  const knowledgeResults = useMemo(
    () => filterKnowledge(query, teacher === "all" ? undefined : teacher),
    [query, teacher],
  );
  const connectResults = useMemo(() => searchConnectLibrary(query), [query]);
  const scenarios = useMemo(() => {
    const byId = new Map<string, ConnectScenario>();
    for (const result of connectResults) if (result.scenario) byId.set(result.scenario.id, result.scenario);
    return [...byId.values()];
  }, [connectResults]);

  return (
    <main className="hlc-community-workspace" style={{ width: "min(1120px, calc(100% - 28px))", margin: "32px auto 96px" }}>
      <header className="hlc-community-header">
        <div>
          <p className="hlc-community-kicker">MASTER EXPERIENCE · E3 · CONNECT CONVERSATION SYSTEM™</p>
          <h1>{isRoleplay ? "CONNECT Roleplay Studio" : "CONNECT Script & Knowledge Library"}</h1>
          <p>
            {isRoleplay
              ? "Train against the same approved HLC script structure used in real work, while keeping simulation completely separate from customer and CRM mutations."
              : "Study approved scripts, variants, operating guidance, tutorials, and policy sources from one searchable HLC learning center."}
          </p>
          <p style={{ fontWeight: 900 }}>{CONNECT_BEHAVIOR_RULE}</p>
        </div>
      </header>

      <nav className="hlc-community-commandbar" aria-label="CONNECT academy navigation">
        <Link to="/academy">Academy</Link>
        <Link to={ACADEMY_E3_ROUTES.library}>Scripts & knowledge</Link>
        <Link to={ACADEMY_E3_ROUTES.roleplay}>Roleplay</Link>
        <Link to="/academy/progress">Progress</Link>
      </nav>

      <section className="hlc-premium-panel" style={{ padding: 20, marginTop: 20 }}>
        <h2 style={{ marginTop: 0 }}>The CONNECT framework</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: 12 }}>
          {CONNECT_FRAMEWORK.map((step) => (
            <div key={step.key} style={{ padding: 14, border: "1px solid currentColor", borderRadius: 14 }}>
              <strong>{step.name}</strong>
              <p style={{ marginBottom: 0 }}>{step.purpose}</p>
            </div>
          ))}
        </div>
      </section>

      {isRoleplay ? (
        <>
          <section className="hlc-premium-panel" style={{ padding: 22, marginTop: 20 }}>
            <p style={{ margin: "0 0 6px", fontWeight: 900 }}>SIMULATION ONLY</p>
            <h2 style={{ marginTop: 0 }}>Safe practice boundary</h2>
            <ul>{ROLEPLAY_GUARDRAILS.map((guardrail) => <li key={guardrail}>{guardrail}</li>)}</ul>
          </section>

          {selectedScenario && <section style={{ marginTop: 20 }}><ScenarioStudy scenario={selectedScenario} /></section>}

          <section className="hlc-premium-panel" style={{ padding: 22, marginTop: 20 }}>
            <h2 style={{ marginTop: 0 }}>100-point coaching standard</h2>
            <p>Roleplay is scored on behavior and judgment, not exact recitation.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: 10 }}>
              {CONNECT_SCORING_RUBRIC.map((item) => (
                <div key={item.id} style={{ padding: 12, border: "1px solid currentColor", borderRadius: 12 }}>
                  <strong>{item.label}</strong><div>{item.weight} points</div>
                </div>
              ))}
            </div>
            <p style={{ marginBottom: 0, fontWeight: 800 }}>Reactive AI conversation, score persistence, coaching feedback, retry progression, and controlled CRM disposition preparation are still required before E3 can advance to VERIFIED.</p>
          </section>
        </>
      ) : (
        <>
          <section className="hlc-premium-panel" style={{ padding: 22, marginTop: 20 }}>
            <h2 style={{ marginTop: 0 }}>Search scripts and HLC knowledge</h2>
            <label htmlFor="knowledge-query" style={{ display: "block", fontWeight: 800 }}>Search</label>
            <input id="knowledge-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try resident, callback, policy, operations…" style={{ width: "100%", minHeight: 44, marginTop: 8 }} />
            <label htmlFor="knowledge-teacher" style={{ display: "block", fontWeight: 800, marginTop: 14 }}>Knowledge teacher</label>
            <select id="knowledge-teacher" value={teacher} onChange={(event) => setTeacher(event.target.value as AcademyTeacher | "all")} style={{ minHeight: 44, marginTop: 8 }}>
              <option value="all">All teachers</option><option value="diamond">Diamond</option><option value="dion">Dion</option><option value="kendrell">Kendrell</option>
            </select>
          </section>

          <section style={{ marginTop: 20 }}>
            <h2>Script Library</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,250px),1fr))", gap: 12, marginBottom: 18 }}>
              {CONNECT_SCRIPT_FOLDERS.map((folder) => (
                <div className="hlc-premium-panel" key={folder.id} style={{ padding: 16 }}><strong>{folder.title}</strong><p style={{ marginBottom: 0 }}>{folder.summary}</p></div>
              ))}
            </div>
            <div style={{ display: "grid", gap: 16 }}>
              {scenarios.map((scenario) => <ScenarioStudy key={scenario.id} scenario={scenario} />)}
              {!scenarios.length && <p>No CONNECT scenarios match this search yet.</p>}
            </div>
          </section>

          <section style={{ marginTop: 24 }}>
            <h2>Canonical HLC knowledge</h2>
            <div aria-live="polite" style={{ display: "grid", gap: 16 }}>
              {knowledgeResults.map((entry) => (
                <article className="hlc-premium-panel" key={entry.id} style={{ padding: 20 }}>
                  <p style={{ margin: "0 0 6px", fontWeight: 900 }}>{entry.kind.toUpperCase()} · {entry.teacher.toUpperCase()}</p>
                  <h3 style={{ margin: "0 0 8px" }}>{entry.title}</h3>
                  <p>{entry.summary}</p>
                  <Link to={entry.sourceRoute} style={{ fontWeight: 900 }}>Open canonical source →</Link>
                </article>
              ))}
              {!knowledgeResults.length && <p>No knowledge entries match this search yet.</p>}
            </div>
            <p style={{ marginTop: 20 }}>The library currently indexes {KNOWLEDGE_LIBRARY.length} canonical HLC knowledge sources without silently replacing or modifying those source pages.</p>
          </section>
        </>
      )}
    </main>
  );
}
