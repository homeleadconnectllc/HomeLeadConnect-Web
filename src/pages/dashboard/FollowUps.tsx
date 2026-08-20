import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { createFollowUp, completeFollowUp, listFollowUps } from "../../api/followUps";
import { listLeads } from "../../api/leads";
import { errorMessage } from "../../lib/errorMessage";
import type { FollowUp, Lead } from "../../lib/types/database";

function dueState(item: FollowUp, now: Date) {
  if (item.status === "completed") return "completed";
  if (!item.scheduled_for) return "unscheduled";
  const due = new Date(item.scheduled_for);
  if (due.getTime() < now.getTime()) return "overdue";
  if (due.toDateString() === now.toDateString()) return "today";
  return "upcoming";
}

export default function FollowUps() {
  const [searchParams] = useSearchParams();
  const contextualLeadRecord = searchParams.get("leadRecord");
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

  const contextualLeadId = useMemo(() => {
    if (!contextualLeadRecord) return "";
    const numericLeadId = Number(contextualLeadRecord);
    if (!Number.isInteger(numericLeadId) || numericLeadId <= 0) return "";
    return leads.find((lead) => lead.id === numericLeadId)?.id_uuid || "";
  }, [contextualLeadRecord, leads]);
  const selectedLeadId = leadId || contextualLeadId;

  async function create(event: FormEvent) {
    event.preventDefault();
    if (!selectedLeadId || !scheduledFor) return;
    await run(async () => {
      await createFollowUp({ leadId: selectedLeadId, scheduledFor: new Date(scheduledFor).toISOString(), notes });
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

  const now = useMemo(() => new Date(), [items]);
  const orderedItems = useMemo(() => [...items].sort((a, b) => {
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (a.status !== "completed" && b.status === "completed") return -1;
    return new Date(a.scheduled_for || 0).getTime() - new Date(b.scheduled_for || 0).getTime();
  }), [items]);
  const summary = useMemo(() => ({
    pending: items.filter((item) => item.status === "pending").length,
    today: items.filter((item) => dueState(item, now) === "today").length,
    overdue: items.filter((item) => dueState(item, now) === "overdue").length,
    completed: items.filter((item) => item.status === "completed").length,
  }), [items, now]);

  return (
    <main className="hlc-followups-workspace">
      <header className="hlc-followups-header">
        <div>
          <p className="hlc-followups-kicker">RELATIONSHIP QUEUE</p>
          <h1>Follow-ups</h1>
          <p>Keep every promised callback visible, timed, and connected to the lead that needs the next touch.</p>
        </div>
        <Link className="hlc-followups-leads-link" to="/leads">Open leads</Link>
      </header>

      <section className="hlc-followups-summary" aria-label="Follow-up summary">
        <span><strong>{summary.pending}</strong><small>Pending</small></span>
        <span><strong>{summary.today}</strong><small>Due today</small></span>
        <span><strong>{summary.overdue}</strong><small>Overdue</small></span>
        <span><strong>{summary.completed}</strong><small>Completed</small></span>
      </section>

      {loading && <p className="hlc-followups-state">Loading follow-ups…</p>}
      {error && <p className="hlc-followups-state is-error" role="alert">{error}</p>}
      {message && <p className="hlc-followups-state is-success" role="status">{message}</p>}

      <section className="hlc-followups-layout">
        <form className="hlc-followup-composer" onSubmit={create}>
          <div className="hlc-followup-composer-heading">
            <small>Next touch</small>
            <h2>Schedule follow-up</h2>
            <p>Create one clear commitment with a lead, due time, and useful context.</p>
          </div>
          <label>
            <span>Lead</span>
            <select required value={selectedLeadId} onChange={(event) => setLeadId(event.target.value)}>
              <option value="">Select a lead</option>
              {leads.map((lead) => <option key={lead.id} value={lead.id_uuid}>{lead.full_name || lead.phone}</option>)}
            </select>
          </label>
          <label>
            <span>Due date and time</span>
            <input required type="datetime-local" value={scheduledFor} onChange={(event) => setScheduledFor(event.target.value)} />
          </label>
          <label>
            <span>Notes</span>
            <textarea rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="What should happen on this follow-up?" />
          </label>
          <button className="hlc-followup-create" disabled={busy || !selectedLeadId || !scheduledFor} type="submit">{busy ? "Saving…" : "Create follow-up"}</button>
        </form>

        <section className="hlc-followup-queue" aria-labelledby="hlc-followup-queue-title">
          <div className="hlc-followup-queue-heading">
            <div><small>Execution order</small><h2 id="hlc-followup-queue-title">Follow-up queue</h2></div>
            <span>{items.length} total</span>
          </div>
          <div className="hlc-followup-column-head" aria-hidden="true">
            <span>Lead / context</span><span>Due</span><span>Status / action</span>
          </div>
          {!loading && items.length === 0 && <div className="hlc-followups-empty"><strong>No follow-ups yet.</strong><span>Schedule the next customer touch from this workspace or from a lead.</span></div>}
          <div className="hlc-followup-list">
            {orderedItems.map((item) => {
              const state = dueState(item, now);
              return (
                <article className="hlc-followup-row" data-state={state} key={item.id}>
                  <div className="hlc-followup-identity">
                    <span className="hlc-followup-status-dot" aria-hidden="true" />
                    <div>
                      <strong>{item.lead?.full_name || item.lead?.phone || "Lead"}</strong>
                      {item.notes ? <p>{item.notes}</p> : <small>No notes added</small>}
                    </div>
                  </div>
                  <div className="hlc-followup-due">
                    <span className="hlc-followup-mobile-label">Due</span>
                    <strong>{item.scheduled_for ? new Date(item.scheduled_for).toLocaleString() : "No due date"}</strong>
                    <small>{state === "overdue" ? "Past due" : state === "today" ? "Due today" : state === "completed" ? "Completed" : "Upcoming"}</small>
                  </div>
                  <div className="hlc-followup-actions">
                    <span className="hlc-followup-mobile-label">Status / action</span>
                    <span className="hlc-followup-status">{item.status === "completed" ? "Completed" : "Pending"}</span>
                    {item.status === "pending" && <button disabled={busy} onClick={() => complete(item)}>Mark complete</button>}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
