import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Plus, Search, SlidersHorizontal, UsersRound } from "lucide-react";
import { createLead, listLeads, type LeadRecord } from "../../api/leads";
import LeadCard from "../../components/leads/LeadCard";
import { errorMessage } from "../../lib/errorMessage";
import "../../styles/leads-application-workspace.css";
import "../../styles/leads-command-header-source-authority.css";

type ResidentType = "Renter" | "Homeowner" | "Property manager" | "Other";

function createLeadErrorMessage(reason: unknown) {
  const message = errorMessage(reason, "Unable to create lead.");
  if (/LEAD_LIMIT_REACHED/i.test(message)) {
    return "Your workspace has reached its lead limit. Review your subscription or contact support before adding another lead.";
  }
  return message;
}

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
  const [residentType, setResidentType] = useState<ResidentType>("Renter");
  const [notes, setNotes] = useState("");

  async function refreshLeads() {
    setError("");
    try { setLeads(await listLeads()); }
    catch (reason: unknown) { setError(errorMessage(reason, "Unable to load leads.")); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    let active = true;
    listLeads()
      .then((data) => { if (active) setLeads(data); })
      .catch((reason: unknown) => { if (active) setError(errorMessage(reason, "Unable to load leads.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function handleCreateLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError("");
    setSavingLead(true);
    try {
      const residentNote = `[Resident type: ${residentType}]`;
      await createLead({ fullName, phone, email, notes: notes.trim() ? `${residentNote}\n${notes.trim()}` : residentNote });
      setFullName(""); setPhone(""); setEmail(""); setResidentType("Renter"); setNotes("");
      setShowAddLead(false); setLoading(true); await refreshLeads();
    } catch (reason: unknown) { setCreateError(createLeadErrorMessage(reason)); }
    finally { setSavingLead(false); }
  }

  const visibleLeads = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return leads;
    return leads.filter((lead) => [lead.full_name, lead.email, lead.phone, lead.status, lead.stage, lead.priority, lead.source, lead.lead_code, lead.sla_status, lead.notes]
      .filter(Boolean).some((value) => String(value).toLowerCase().includes(normalized)));
  }, [leads, query]);

  const newLeadCount = leads.filter((lead) => [lead.stage, lead.status].filter(Boolean).some((value) => String(value).toLowerCase() === "new")).length;
  const highPriorityCount = leads.filter((lead) => lead.priority?.toLowerCase() === "high").length;
  const scheduledCount = leads.filter((lead) => Boolean(lead.appointment_at)).length;

  return (
    <main className="hlc-leads-workspace">
      <section className="hlc-leads-command-surface" aria-labelledby="hlc-leads-title">
        <div className="hlc-leads-command-copy">
          <p className="hlc-page-eyebrow">CRM · Opportunity pipeline</p>
          <h1 id="hlc-leads-title">Leads</h1>
          <p>Qualify renters, homeowners, property managers, and other households; make contact, schedule the next step, and move ready requests into estimating.</p>
        </div>
        <button className="hlc-leads-add-button" type="button" onClick={() => setShowAddLead((value) => !value)}>
          <Plus size={17} aria-hidden="true" /> {showAddLead ? "Cancel" : "Add lead"}
        </button>
      </section>

      <section className="hlc-leads-summary" aria-label="Lead summary">
        <span><strong>{leads.length}</strong><small>Total</small></span>
        <span><strong>{newLeadCount}</strong><small>New</small></span>
        <span><strong>{highPriorityCount}</strong><small>High priority</small></span>
        <span><strong>{scheduledCount}</strong><small>Scheduled</small></span>
      </section>

      <section className="hlc-leads-toolbar" aria-label="Lead tools">
        <div className="hlc-leads-search" role="search">
          <Search size={18} aria-hidden="true" />
          <input aria-label="Search leads" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search renter/homeowner, name, contact, stage, priority, source, or lead code" />
        </div>
        <span className="hlc-leads-view-label"><SlidersHorizontal size={16} aria-hidden="true" /> Active pipeline</span>
      </section>

      {showAddLead && (
        <form className="hlc-leads-create" onSubmit={handleCreateLead} aria-label="Add lead">
          <label>Name<input value={fullName} onChange={(event) => setFullName(event.target.value)} required minLength={2} autoComplete="name" /></label>
          <label>Resident / customer type
            <select value={residentType} onChange={(event) => setResidentType(event.target.value as ResidentType)}>
              <option>Renter</option>
              <option>Homeowner</option>
              <option>Property manager</option>
              <option>Other</option>
            </select>
          </label>
          <label>Phone<input value={phone} onChange={(event) => setPhone(event.target.value)} required inputMode="tel" autoComplete="tel" /></label>
          <label>Email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" /></label>
          <label className="hlc-leads-notes">Notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={4000} rows={3} placeholder="Service need, timing, access notes, or next step" /></label>
          {createError && <p role="alert" className="hlc-leads-error">{createError}</p>}
          <div className="hlc-leads-create-actions"><button type="submit" disabled={savingLead}>{savingLead ? "Adding…" : "Add lead"}</button></div>
        </form>
      )}

      <section className="hlc-leads-pipeline" aria-label="Lead pipeline">
        <div className="hlc-leads-column-head" aria-hidden="true"><span>Household</span><span>Pipeline</span><span>Actions</span></div>
        {loading && <p className="hlc-leads-state">Loading leads…</p>}
        {error && <p role="alert" className="hlc-leads-error">{error}</p>}
        {!loading && !error && leads.length === 0 && <p className="hlc-leads-state">No leads found.</p>}
        {!loading && !error && leads.length > 0 && visibleLeads.length === 0 && (
          <div className="hlc-leads-empty"><UsersRound size={24} aria-hidden="true" /><strong>No matching leads</strong><span>Try a different resident type, name, number, email, stage, priority, source, or lead code.</span></div>
        )}
        <div className="hlc-leads-list">{visibleLeads.map((lead) => <LeadCard key={lead.id} lead={lead} />)}</div>
      </section>
    </main>
  );
}
