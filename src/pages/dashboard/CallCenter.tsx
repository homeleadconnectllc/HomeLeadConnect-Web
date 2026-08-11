import { useEffect, useState } from "react";
import {
  listBusinessPhones,
  listCallSessions,
  recordCallDisposition,
  type BusinessPhone,
  type CallSession,
} from "../../api/telephony";
import { errorMessage } from "../../lib/errorMessage";

export default function CallCenter() {
  const [phones, setPhones] = useState<BusinessPhone[]>([]);
  const [calls, setCalls] = useState<CallSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCalls() {
    setCalls(await listCallSessions());
  }

  useEffect(() => {
    Promise.all([listBusinessPhones(), listCallSessions()])
      .then(([phoneRows, callRows]) => {
        setPhones(phoneRows);
        setCalls(callRows);
      })
      .catch((reason: unknown) => setError(errorMessage(reason, "Unable to load telephony.")))
      .finally(() => setLoading(false));
  }, []);

  async function saveDisposition(id: string) {
    const value = window.prompt("Call disposition");
    if (!value) return;
    try {
      setError("");
      await recordCallDisposition(id, value);
      await loadCalls();
    } catch (reason) {
      setError(errorMessage(reason, "Unable to save disposition."));
    }
  }

  return (
    <main style={{ width: "min(1000px, calc(100% - 32px))", margin: "32px auto" }}>
      <h1>Call center</h1>
      <p>One operational view of manual and programmable calls. Provider evidence controls call state.</p>
      {loading && <p role="status">Loading calls…</p>}
      {error && <p role="alert">{error}</p>}

      <section aria-labelledby="business-numbers-heading">
        <h2 id="business-numbers-heading">Business numbers</h2>
        {!loading && phones.length === 0
          ? <p>Phone provider setup required.</p>
          : phones.map((phone) => (
            <article key={phone.id}>
              <strong>{phone.display_name}: {phone.phone_number}</strong>
              {` · ${phone.provider_type} · ${phone.readiness_state}`}
              {phone.browser_calling_enabled ? " · browser calling" : ""}
            </article>
          ))}
      </section>

      <section aria-labelledby="call-history-heading">
        <h2 id="call-history-heading">Call history</h2>
        {!loading && calls.length === 0
          ? <p>No call sessions.</p>
          : calls.map((call) => (
            <article key={call.id}>
              <strong>{call.direction || "unknown"} · {call.normalized_state || "requested"}</strong>
              {` · ${new Date(call.started_at).toLocaleString()}`}
              {call.subject_type ? ` · ${call.subject_type} ${call.subject_id}` : " · Unknown caller"}
              {call.disposition ? ` · ${call.disposition}` : ""}
              <button type="button" onClick={() => saveDisposition(call.id)}>Record disposition</button>
            </article>
          ))}
      </section>
    </main>
  );
}
