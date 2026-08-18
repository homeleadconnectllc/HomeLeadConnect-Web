import { FormEvent, useEffect, useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal, UsersRound } from "lucide-react";
import { createLead, listLeads, type LeadRecord } from "../../api/leads";
import LeadCard from "../../components/leads/LeadCard";
import { errorMessage } from "../../lib/errorMessage";

export default function Leads() {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showAddLead, setShowAddLead] = useState(false);
  const [savingLead, setSavingLead] = useState(false);
  const [createError, setCreateError] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  async function refreshLeads() {
    setError("");
    try {
      setLeads(await listLeads());
    } catch (reason: unknown) {
      setError(errorMessage(reason, "Unable to load leads."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshLeads();
  }, []);

  async function handleCreateLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError("");
    setSavingLead(true);
    try {
      await createLead({ fullName, phone, email, notes });
      setFullName("");
      setPhone("");
      setEmail("");
      setNotes("");
      setShowAddLead(false);
      setLoading(true);
      await refreshLeads();
    } catch (reason: unknown) {
      setCreateError(errorMessage(reason, "Unable to create lead."));
    } finally {
      setSavingLead(false);
    }
  }

  const visibleLeads = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return leads;
    return leads.filter((lead) =>
      [
        lead.full_name,
        lead.email,
        lead.phone,
        lead.status,
        lead.stage,
        lead.priority,
        lead.source,
        lead.lead_code,
        lead.sla_status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized)),
    );
  }, [leads, query]);

  const newLeadCount = leads.filter((lead) =>
    [lead.stage, lead.status]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase() === "new"),
  ).length;
  const highPriorityCount = leads.filter(
    (lead) => lead.priority?.toLowerCase() === "high",
  ).length;
  const scheduledCount = leads.filter((lead) => Boolean(lead.appointment_at)).length;

  return (
    <main className="hlc-leads-page" style={pageStyle}>
      <header className="hlc-leads-header">
        <div>
          <p className="hlc-page-eyebrow">CRM · Opportunity pipeline</p>
          <h1>Leads</h1>
          <p>Qualify each opportunity, make contact, schedule the next step, and move ready homeowners into estimating.</p>
        </div>
        <div className="hlc-leads-summary" aria-label="Lead summary">
          <span><strong>{leads.length}</strong>Total leads</span>
          <span><strong>{newLeadCount}</strong>New</span>
          <span><strong>{highPriorityCount}</strong>High priority</span>
          <span><strong>{scheduledCount}</strong>Scheduled</span>
        </div>
      </header>

      <section className="hlc-leads-toolbar" aria-label="Lead tools">
        <label className="hlc-leads-search">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">Search leads</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, contact, stage, priority, source, or lead code"
          />
        </label>
        <button type="button" onClick={() => setShowAddLead((value) => !value)}>
          <Plus size={17} aria-hidden="true" /> {showAddLead ? "Cancel" : "Add lead"}
        </button>
        <span className="hlc-leads-view-label"><SlidersHorizontal size={17} aria-hidden="true" /> Active pipeline</span>
      </section>

      {showAddLead && (
        <form onSubmit={handleCreateLead} aria-label="Add lead" style={formStyle}>
          <label>
            Name
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} required minLength={2} autoComplete="name" />
          </label>
          <label>
            Phone
            <input value={phone} onChange={(event) => setPhone(event.target.value)} required inputMode="tel" autoComplete="tel" />
          </label>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" />
          </label>
          <label style={{ gridColumn: "1 / -1" }}>
            Notes
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={4000} rows={3} />
          </label>
          {createError && <p role="alert" style={{ color: "#b91c1c", gridColumn: "1 / -1" }}>{createError}</p>}
          <div style={{ gridColumn: "1 / -1" }}>
            <button type="submit" disabled={savingLead}>{savingLead ? "Adding…" : "Add lead"}</button>
          </div>
        </form>
      )}

      <div className="hlc-leads-column-head" aria-hidden="true">
        <span>Homeowner</span><span>Pipeline status</span><span>Next actions</span>
      </div>
      {loading && <p>Loading leads…</p>}
      {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
      {!loading && !error && leads.length === 0 && <p>No leads found.</p>}
      {!loading && !error && leads.length > 0 && visibleLeads.length === 0 && (
        <div className="hlc-leads-empty"><UsersRound size={24} aria-hidden="true" /><strong>No matching leads</strong><span>Try a different name, number, email, stage, priority, source, or lead code.</span></div>
      )}
      <div className="hlc-leads-list" style={{ display: "grid", gap: 12 }}>
        {visibleLeads.map((lead) => <LeadCard key={lead.id} lead={lead} />)}
      </div>
    </main>
  );
}

const pageStyle = {
  width: "min(1000px, calc(100% - 48px))",
  margin: "40px auto",
  fontFamily: "system-ui, sans-serif",
};

const formStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
  margin: "0 0 20px",
};
