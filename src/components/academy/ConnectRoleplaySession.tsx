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
    <section className="hlc-premium-panel" style={{ padding: 22, marginTop: 20 }} aria-labelledby="connect-live-roleplay-heading">
      <p style={{ margin: "0 0 6px", fontWeight: 900 }}>LIVE SIMULATION · COACH {scenario.teacher.toUpperCase()}</p>
      <h2 id="connect-live-roleplay-heading" style={{ marginTop: 0 }}>Reactive CONNECT roleplay</h2>
      <p>Speak naturally. The simulated counterpart reacts to what you say. Your official script remains a guardrail, not a speech.</p>

      <label htmlFor="connect-roleplay-variant" style={{ display: "block", fontWeight: 800 }}>Script variant</label>
      <select
        id="connect-roleplay-variant"
        value={variant}
        disabled={messages.length > 0 || busy}
        onChange={(event) => { setVariant(event.target.value as ConnectVariant); reset(); }}
        style={{ minHeight: 44, marginTop: 8 }}
      >
        {scenario.variants.map((item) => <option key={item.id} value={item.variant}>{item.label}</option>)}
      </select>

      {selectedVariant && (
        <details style={{ marginTop: 14 }}>
          <summary style={{ fontWeight: 900, cursor: "pointer" }}>View approved {selectedVariant.label} guardrail</summary>
          <p style={{ whiteSpace: "pre-wrap" }}>{selectedVariant.body}</p>
        </details>
      )}

      <div aria-live="polite" style={{ display: "grid", gap: 10, marginTop: 18 }}>
        {!messages.length && <p style={{ margin: 0 }}>Start the conversation the way you would with a real resident, provider, or partner.</p>}
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} style={{ padding: 12, border: "1px solid currentColor", borderRadius: 12 }}>
            <strong>{message.role === "learner" ? "You" : "Simulated counterpart"}</strong>
            <p style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}>{message.text}</p>
          </div>
        ))}
      </div>

      {!score && (
        <div style={{ marginTop: 18 }}>
          <label htmlFor="connect-roleplay-message" style={{ display: "block", fontWeight: 800 }}>Your response</label>
          <textarea
            id="connect-roleplay-message"
            value={draft}
            disabled={busy}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Respond naturally…"
            rows={4}
            style={{ width: "100%", marginTop: 8 }}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
            <button type="button" onClick={sendTurn} disabled={busy || !draft.trim()}>{busy ? "Working…" : "Send response"}</button>
            <button type="button" onClick={finish} disabled={busy || !messages.some((message) => message.role === "learner")}>Finish & score</button>
            {messages.length > 0 && <button type="button" onClick={reset} disabled={busy}>Restart</button>}
          </div>
        </div>
      )}

      {error && <p role="alert" style={{ fontWeight: 800 }}>{error}</p>}

      {score && (
        <div style={{ marginTop: 22 }} aria-live="polite">
          <h3 style={{ marginBottom: 6 }}>Score: {score.score}/100 · {score.passed ? "Passed" : "Retry recommended"}</h3>
          <p>{score.summary}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,210px),1fr))", gap: 10 }}>
            {CONNECT_SCORING_RUBRIC.map((item) => (
              <div key={item.id} style={{ padding: 12, border: "1px solid currentColor", borderRadius: 12 }}>
                <strong>{item.label}</strong>
                <div>{score.rubricScores[item.id] ?? 0}/{item.weight}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: 16, marginTop: 18 }}>
            <div><strong>Strengths</strong><ul>{score.strengths.map((item) => <li key={item}>{item}</li>)}</ul></div>
            <div><strong>Mistakes</strong><ul>{score.mistakes.map((item) => <li key={item}>{item}</li>)}</ul></div>
            <div><strong>{scenario.teacher[0].toUpperCase() + scenario.teacher.slice(1)} coaching</strong><ul>{score.coaching.map((item) => <li key={item}>{item}</li>)}</ul></div>
          </div>

          <div style={{ padding: 16, border: "1px solid currentColor", borderRadius: 14, marginTop: 18 }}>
            <strong>Controlled CRM disposition recommendation</strong>
            {score.recommendedDispositionId ? (
              <>
                <p style={{ marginBottom: 6 }}>{evidence.dispositions.find((item) => item?.id === score.recommendedDispositionId)?.label ?? score.recommendedDispositionId}</p>
                <p>{score.recommendationReason}</p>
                <p style={{ marginBottom: 0, fontWeight: 900 }}>Recommendation prepared only. No CRM disposition was applied. Confirmation remains required in the authorized CRM workflow.</p>
              </>
            ) : <p style={{ marginBottom: 0 }}>No CRM disposition recommendation was produced for this practice conversation.</p>}
          </div>

          <p style={{ fontWeight: 800 }}>Academy attempt #{score.progress?.attempt_number ?? "—"} · XP awarded {score.progress?.xp_awarded ?? 0}</p>
          <button type="button" onClick={reset}>Retry this scenario</button>
        </div>
      )}
    </section>
  );
}
