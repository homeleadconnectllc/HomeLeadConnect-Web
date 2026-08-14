import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { createFollowUp, completeFollowUp, listFollowUps } from "../../api/followUps";
import { listLeads } from "../../api/leads";
import { errorMessage } from "../../lib/errorMessage";
import type { FollowUp, Lead } from "../../lib/types/database";

export default function FollowUps() {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState<FollowUp[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadId, setLeadId] = useState(() => searchParams.get("lead") || "");
  const [scheduledFor, setScheduledFor] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const [followUps, leadRows] = await Promise.all([listFollowUps(), listLeads()]);
    setItems(followUps);
    setLeads(leadRows);
  }

  useEffect(() => {
    Promise.all([listFollowUps(), listLeads()])
      .then(([followUps, leadRows]) => {
        setItems(followUps);
        setLeads(leadRows);
      })
      .catch((reason: unknown) => setError(errorMessage(reason, "Unable to load follow-ups.")))
      .finally(() => setLoading(false));
  }, []);

  async function create(event: FormEvent) {
    event.preventDefault();
    if (!leadId || !scheduledFor) return;
    await run(async () => {
      await createFollowUp({ leadId, scheduledFor: new Date(scheduledFor).toISOString(), notes });
      setScheduledFor("");
      setNotes("");
      await load();
    }, "Follow-up created.");
  }

  async function complete(item: FollowUp) {
    await run(async () => {
      await completeFollowUp(item.id);
      await load();
    }, "Follow-up completed.");
  }

  async function run(action: () => Promise<void>, success: string) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
      setMessage(success);
    } catch (reason) {
      setError(errorMessage(reason, "Unable to update the follow-up."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="hlc-followups-page" style={pageStyle}>
      <h1>Follow-ups</h1>
      <p>Schedule and complete lead follow-up calls.</p>
      {loading && <p>Loading follow-ups…</p>}
      {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
      {message && <p role="status" style={{ color: "#166534" }}>{message}</p>}

      <form className="hlc-followup-form" onSubmit={create} style={cardStyle}>
        <label>Lead
          <select required value={leadId} onChange={(event) => setLeadId(event.target.value)}>
            <option value="">Select a lead</option>
            {leads.map((lead) => <option key={lead.id} value={lead.id_uuid}>{lead.full_name || lead.phone}</option>)}
          </select>
        </label>
        <label>Due date and time
          <input required type="datetime-local" value={scheduledFor} onChange={(event) => setScheduledFor(event.target.value)} />
        </label>
        <label>Notes
          <textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} />
        </label>
        <button disabled={busy || !leadId || !scheduledFor} type="submit">{busy ? "Saving…" : "Create follow-up"}</button>
      </form>

      <section className="hlc-followup-history" style={{ marginTop: 24 }}>
        <h2>Follow-up history</h2>
        {!loading && items.length === 0 && <p>No follow-ups yet.</p>}
        <div className="hlc-followup-list" style={{ display: "grid", gap: 12 }}>
          {items.map((item) => (
            <article className="hlc-followup-card" key={item.id} style={cardStyle}>
              <strong>{item.lead?.full_name || item.lead?.phone || "Lead"}</strong>
              <span>{item.scheduled_for ? new Date(item.scheduled_for).toLocaleString() : "No due date"}</span>
              <span>{item.status === "completed" ? "Completed" : "Pending"}</span>
              {item.notes && <p>{item.notes}</p>}
              {item.status === "pending" && <button disabled={busy} onClick={() => complete(item)}>Mark complete</button>}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

const pageStyle = { width: "min(900px, calc(100% - 32px))", margin: "32px auto", fontFamily: "system-ui, sans-serif" };
const cardStyle = { display: "grid", gap: 10, padding: 18, border: "1px solid #e2e8f0", borderRadius: 12 };
