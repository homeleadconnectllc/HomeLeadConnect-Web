import { useMemo, useState } from "react";
import {
  CONNECT_SCORING_RUBRIC,
  resolveConnectScenarioEvidence,
  type ConnectScenario,
  type ConnectVariant,
} from "../../data/connectConversationSystem";
import {
  finishConnectRoleplay,
  sendConnectRoleplayTurn,
  type ConnectRoleplayMessage,
  type ConnectRoleplayScore,
} from "../../lib/connectRoleplayData";

export default function ConnectRoleplaySession({ scenario, initialVariant = "standard" }: {
  scenario: ConnectScenario;
  initialVariant?: ConnectVariant;
}) {
  const availableVariants = scenario.variants.map((item) => item.variant);
  const normalizedVariant = availableVariants.includes(initialVariant) ? initialVariant : scenario.variants[0]?.variant ?? "standard";
  const [variant, setVariant] = useState<ConnectVariant>(normalizedVariant);
  const [messages, setMessages] = useState<ConnectRoleplayMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [score, setScore] = useState<ConnectRoleplayScore | null>(null);
  const evidence = useMemo(() => resolveConnectScenarioEvidence(scenario), [scenario]);
  const selectedVariant = scenario.variants.find((item) => item.variant === variant) ?? scenario.variants[0];

  const reset = () => {
    setMessages([]);
    setDraft("");
    setScore(null);
    setError("");
  };

  async function sendTurn() {
    const text = draft.trim();
    if (!text || busy || score) return;
    const nextMessages: ConnectRoleplayMessage[] = [...messages, { role: "learner", text }];
    setMessages(nextMessages);
    setDraft("");
    setBusy(true);
    setError("");
    try {
      const response = await sendConnectRoleplayTurn({ scenarioId: scenario.id, variant, transcript: nextMessages });
      setMessages([...nextMessages, { role: "counterpart", text: response.reply }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "CONNECT could not continue the roleplay.");
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    if (busy || score || !messages.some((message) => message.role === "learner")) return;
    setBusy(true);
    setError("");
    try {
      const result = await finishConnectRoleplay({ scenarioId: scenario.id, variant, transcript: messages });
      setScore(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "CONNECT could not score this roleplay.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="hlc-premium-panel hlc-ui-connect-roleplay-session-c8e8bf"  aria-labelledby="connect-live-roleplay-heading">
      <p className="hlc-ui-connect-roleplay-session-b73f73">LIVE SIMULATION · COACH {scenario.teacher.toUpperCase()}</p>
      <h2 id="connect-live-roleplay-heading" className="hlc-ui-margin-top-a0925a">Reactive CONNECT roleplay</h2>
      <p>Speak naturally. The simulated counterpart reacts to what you say. Your official script remains a guardrail, not a speech.</p>

      <label htmlFor="connect-roleplay-variant" className="hlc-ui-connect-roleplay-session-3165e5">Script variant</label>
      <select
        id="connect-roleplay-variant"
        value={variant}
        disabled={messages.length > 0 || busy}
        onChange={(event) => { setVariant(event.target.value as ConnectVariant); reset(); }}
        className="hlc-ui-connect-roleplay-session-ae33ee"
      >
        {scenario.variants.map((item) => <option key={item.id} value={item.variant}>{item.label}</option>)}
      </select>

      {selectedVariant && (
        <details className="hlc-ui-margin-top-c53ea1">
          <summary className="hlc-ui-connect-roleplay-session-32c3ff">View approved {selectedVariant.label} guardrail</summary>
          <p className="hlc-ui-white-space-092af9">{selectedVariant.body}</p>
        </details>
      )}

      <div aria-live="polite" className="hlc-ui-connect-roleplay-session-21249e">
        {!messages.length && <p className="hlc-ui-margin-ab79ea">Start the conversation the way you would with a real resident, provider, or partner.</p>}
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className="hlc-ui-connect-roleplay-session-18aa29">
            <strong>{message.role === "learner" ? "You" : "Simulated counterpart"}</strong>
            <p className="hlc-ui-connect-roleplay-session-baf145">{message.text}</p>
          </div>
        ))}
      </div>

      {!score && (
        <div className="hlc-ui-margin-top-2bdf8e">
          <label htmlFor="connect-roleplay-message" className="hlc-ui-connect-roleplay-session-3165e5">Your response</label>
          <textarea
            id="connect-roleplay-message"
            value={draft}
            disabled={busy}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Respond naturally…"
            rows={4}
            className="hlc-ui-connect-roleplay-session-ce203b"
          />
          <div className="hlc-ui-connect-roleplay-session-7d9d53">
            <button type="button" onClick={sendTurn} disabled={busy || !draft.trim()}>{busy ? "Working…" : "Send response"}</button>
            <button type="button" onClick={finish} disabled={busy || !messages.some((message) => message.role === "learner")}>Finish & score</button>
            {messages.length > 0 && <button type="button" onClick={reset} disabled={busy}>Restart</button>}
          </div>
        </div>
      )}

      {error && <p role="alert" className="hlc-ui-font-weight-cde913">{error}</p>}

      {score && (
        <div className="hlc-ui-margin-top-6e1958" aria-live="polite">
          <h3 className="hlc-ui-margin-bottom-f85c70">Score: {score.score}/100 · {score.passed ? "Passed" : "Retry recommended"}</h3>
          <p>{score.summary}</p>
          <div className="hlc-ui-connect-roleplay-session-7aa13f">
            {CONNECT_SCORING_RUBRIC.map((item) => (
              <div key={item.id} className="hlc-ui-connect-roleplay-session-18aa29">
                <strong>{item.label}</strong>
                <div>{score.rubricScores[item.id] ?? 0}/{item.weight}</div>
              </div>
            ))}
          </div>

          <div className="hlc-ui-connect-roleplay-session-48ae92">
            <div><strong>Strengths</strong><ul>{score.strengths.map((item) => <li key={item}>{item}</li>)}</ul></div>
            <div><strong>Mistakes</strong><ul>{score.mistakes.map((item) => <li key={item}>{item}</li>)}</ul></div>
            <div><strong>{scenario.teacher[0].toUpperCase() + scenario.teacher.slice(1)} coaching</strong><ul>{score.coaching.map((item) => <li key={item}>{item}</li>)}</ul></div>
          </div>

          <div className="hlc-ui-connect-roleplay-session-9e2913">
            <strong>Controlled CRM disposition recommendation</strong>
            {score.recommendedDispositionId ? (
              <>
                <p className="hlc-ui-margin-bottom-f85c70">{evidence.dispositions.find((item) => item?.id === score.recommendedDispositionId)?.label ?? score.recommendedDispositionId}</p>
                <p>{score.recommendationReason}</p>
                <p className="hlc-ui-connect-roleplay-session-aca28c">Recommendation prepared only. No CRM disposition was applied. Confirmation remains required in the authorized CRM workflow.</p>
              </>
            ) : <p className="hlc-ui-margin-bottom-fa769a">No CRM disposition recommendation was produced for this practice conversation.</p>}
          </div>

          <p className="hlc-ui-font-weight-cde913">Academy attempt #{score.progress?.attempt_number ?? "—"} · XP awarded {score.progress?.xp_awarded ?? 0}</p>
          <button type="button" onClick={reset}>Retry this scenario</button>
        </div>
      )}
    </section>
  );
}
