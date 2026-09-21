import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ConnectRoleplaySession from "../../components/academy/ConnectRoleplaySession";
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
    <article className="hlc-premium-panel hlc-ui-padding-fef9b1" >
      <p className="hlc-ui-connect-roleplay-session-b73f73">COACH · {scenario.teacher.toUpperCase()} · {scenario.difficulty.toUpperCase()}</p>
      <h2 className="hlc-ui-margin-3e47b1">{scenario.title}</h2>
      <p>{scenario.goal}</p>

      <div className="hlc-ui-roleplay-knowledge-workspace-552bc9">
        {variantOrder.filter((key) => scenario.variants.some((item) => item.variant === key)).map((key) => (
          <button
            type="button"
            key={key}
            onClick={() => setVariant(key)}
            aria-pressed={variant === key}
            className="hlc-roleplay-variant"
          >
            {scenario.variants.find((item) => item.variant === key)?.label ?? key}
          </button>
        ))}
      </div>

      <div className="hlc-ui-roleplay-knowledge-workspace-5cf477">
        <p className="hlc-ui-connect-roleplay-session-b73f73">{selectedVariant.label} · {selectedVariant.approved.toUpperCase()}</p>
        <p className="hlc-ui-white-space-092af9">{selectedVariant.body}</p>
      </div>

      <details className="hlc-ui-margin-top-92c18f">
        <summary className="hlc-ui-connect-roleplay-session-32c3ff">Study this scenario</summary>
        <div className="hlc-ui-roleplay-knowledge-workspace-e08a6b">
          <div><strong>Use when</strong><ul>{scenario.useWhen.map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div><strong>Do not use when</strong><ul>{scenario.doNotUseWhen.map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div><strong>Required information</strong><ul>{scenario.requiredInformation.map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div><strong>Suggested questions</strong><ul>{scenario.suggestedQuestions.map((item) => <li key={item}>{item}</li>)}</ul></div>
        </div>
        <p><strong>Linked CRM dispositions:</strong> {evidence.dispositions.map((item) => item?.label).filter(Boolean).join(", ") || "None configured"}</p>
        <p><strong>Canonical source scripts:</strong> {evidence.sourceScripts.map((item) => item.title).join(", ") || "None configured"}</p>
      </details>

      <div className="hlc-ui-roleplay-knowledge-workspace-bd2a5f">
        <Link to={`/academy/practice/${scenario.id}`} className="hlc-ui-font-weight-52ee95">Practice this script →</Link>
        <Link to={`${ACADEMY_E3_ROUTES.roleplay}?scenario=${scenario.id}&variant=${variant}`} className="hlc-ui-font-weight-52ee95">Roleplay this script →</Link>
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
  const requestedVariant = variantOrder.includes(params.get("variant") as ConnectVariant) ? params.get("variant") as ConnectVariant : "standard";
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
    <main className="hlc-community-workspace hlc-ui-roleplay-knowledge-workspace-b35e3b" >
      <header className="hlc-community-header">
        <div>
          <p className="hlc-community-kicker">MASTER EXPERIENCE · E3 · CONNECT CONVERSATION SYSTEM™</p>
          <h1>{isRoleplay ? "CONNECT Roleplay Studio" : "CONNECT Script & Knowledge Library"}</h1>
          <p>
            {isRoleplay
              ? "Train against the same approved HLC script structure used in real work, while keeping simulation completely separate from customer and CRM mutations."
              : "Study approved scripts, variants, operating guidance, tutorials, and policy sources from one searchable HLC learning center."}
          </p>
          <p className="hlc-ui-font-weight-52ee95">{CONNECT_BEHAVIOR_RULE}</p>
        </div>
      </header>

      <nav className="hlc-community-commandbar" aria-label="CONNECT academy navigation">
        <Link to="/academy">Academy</Link>
        <Link to={ACADEMY_E3_ROUTES.library}>Scripts & knowledge</Link>
        <Link to={ACADEMY_E3_ROUTES.roleplay}>Roleplay</Link>
        <Link to="/academy/progress">Progress</Link>
      </nav>

      <section className="hlc-premium-panel hlc-ui-roleplay-knowledge-workspace-c7c240" >
        <h2 className="hlc-ui-margin-top-a0925a">The CONNECT framework</h2>
        <div className="hlc-ui-roleplay-knowledge-workspace-021f5d">
          {CONNECT_FRAMEWORK.map((step) => (
            <div key={step.key} className="hlc-ui-roleplay-knowledge-workspace-ee7d5b">
              <strong>{step.name}</strong>
              <p className="hlc-ui-margin-bottom-fa769a">{step.purpose}</p>
            </div>
          ))}
        </div>
      </section>

      {isRoleplay ? (
        <>
          <section className="hlc-premium-panel hlc-ui-connect-roleplay-session-c8e8bf" >
            <p className="hlc-ui-connect-roleplay-session-b73f73">SIMULATION ONLY</p>
            <h2 className="hlc-ui-margin-top-a0925a">Safe practice boundary</h2>
            <ul>{ROLEPLAY_GUARDRAILS.map((guardrail) => <li key={guardrail}>{guardrail}</li>)}</ul>
          </section>

          {selectedScenario && <section className="hlc-ui-margin-top-eee3f8"><ScenarioStudy scenario={selectedScenario} /></section>}
          {selectedScenario && <ConnectRoleplaySession key={`${selectedScenario.id}:${requestedVariant}`} scenario={selectedScenario} initialVariant={requestedVariant} />}

          <section className="hlc-premium-panel hlc-ui-connect-roleplay-session-c8e8bf" >
            <h2 className="hlc-ui-margin-top-a0925a">100-point coaching standard</h2>
            <p>Roleplay is scored on behavior and judgment, not exact recitation.</p>
            <div className="hlc-ui-roleplay-knowledge-workspace-cc6a99">
              {CONNECT_SCORING_RUBRIC.map((item) => (
                <div key={item.id} className="hlc-ui-connect-roleplay-session-18aa29">
                  <strong>{item.label}</strong><div>{item.weight} points</div>
                </div>
              ))}
            </div>
            <p className="hlc-ui-roleplay-knowledge-workspace-363aea">The source path now includes reactive roleplay, trusted score persistence, coach feedback, retry progression, and recommendation-only CRM disposition preparation. E3 still requires exact-head runtime, security, CI, and rendered evidence before any status advancement.</p>
          </section>
        </>
      ) : (
        <>
          <section className="hlc-premium-panel hlc-ui-connect-roleplay-session-c8e8bf" >
            <h2 className="hlc-ui-margin-top-a0925a">Search scripts and HLC knowledge</h2>
            <label htmlFor="knowledge-query" className="hlc-ui-connect-roleplay-session-3165e5">Search</label>
            <input id="knowledge-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try resident, callback, policy, operations…" className="hlc-ui-roleplay-knowledge-workspace-c39c55" />
            <label htmlFor="knowledge-teacher" className="hlc-ui-roleplay-knowledge-workspace-6284f2">Knowledge teacher</label>
            <select id="knowledge-teacher" value={teacher} onChange={(event) => setTeacher(event.target.value as AcademyTeacher | "all")} className="hlc-ui-connect-roleplay-session-ae33ee">
              <option value="all">All teachers</option><option value="diamond">Diamond</option><option value="dion">Dion</option><option value="kendrell">Kendrell</option>
            </select>
          </section>

          <section className="hlc-ui-margin-top-eee3f8">
            <h2>Script Library</h2>
            <div className="hlc-ui-roleplay-knowledge-workspace-3a24da">
              {CONNECT_SCRIPT_FOLDERS.map((folder) => (
                <div className="hlc-premium-panel hlc-ui-padding-3b0d88" key={folder.id} ><strong>{folder.title}</strong><p className="hlc-ui-margin-bottom-fa769a">{folder.summary}</p></div>
              ))}
            </div>
            <div className="hlc-ui-estimator-247aeb">
              {scenarios.map((scenario) => <ScenarioStudy key={scenario.id} scenario={scenario} />)}
              {!scenarios.length && <p>No CONNECT scenarios match this search yet.</p>}
            </div>
          </section>

          <section className="hlc-ui-margin-top-66d8b5">
            <h2>Canonical HLC knowledge</h2>
            <div aria-live="polite" className="hlc-ui-estimator-247aeb">
              {knowledgeResults.map((entry) => (
                <article className="hlc-premium-panel hlc-ui-padding-46e678" key={entry.id} >
                  <p className="hlc-ui-connect-roleplay-session-b73f73">{entry.kind.toUpperCase()} · {entry.teacher.toUpperCase()}</p>
                  <h3 className="hlc-ui-margin-3e47b1">{entry.title}</h3>
                  <p>{entry.summary}</p>
                  <Link to={entry.sourceRoute} className="hlc-ui-font-weight-52ee95">Open canonical source →</Link>
                </article>
              ))}
              {!knowledgeResults.length && <p>No knowledge entries match this search yet.</p>}
            </div>
            <p className="hlc-ui-margin-top-eee3f8">The library currently indexes {KNOWLEDGE_LIBRARY.length} canonical HLC knowledge sources without silently replacing or modifying those source pages.</p>
          </section>
        </>
      )}
    </main>
  );
}
