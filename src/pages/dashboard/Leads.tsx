import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, UsersRound } from "lucide-react";
import { listLeads } from "../../api/leads";
import LeadCard from "../../components/leads/LeadCard";
import type { Lead } from "../../lib/types/database";
import { errorMessage } from "../../lib/errorMessage";

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    listLeads()
      .then(setLeads)
      .catch((reason: unknown) =>
        setError(errorMessage(reason, "Unable to load leads.")),
      )
      .finally(() => setLoading(false));
  }, []);

  const visibleLeads = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return leads;
    return leads.filter((lead) =>
      [lead.full_name, lead.email, lead.phone, lead.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized)),
    );
  }, [leads, query]);

  const newLeadCount = leads.filter((lead) => (lead.status || "new").toLowerCase() === "new").length;

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
        </div>
      </header>

      <section className="hlc-leads-toolbar" aria-label="Lead tools">
        <label className="hlc-leads-search">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">Search leads</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, phone, email, or status" />
        </label>
        <span className="hlc-leads-view-label"><SlidersHorizontal size={17} aria-hidden="true" /> Active pipeline</span>
      </section>

      <div className="hlc-leads-column-head" aria-hidden="true">
        <span>Homeowner</span><span>Pipeline status</span><span>Next actions</span>
      </div>
      {loading && <p>Loading leads…</p>}
      {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
      {!loading && !error && leads.length === 0 && <p>No leads found.</p>}
      {!loading && !error && leads.length > 0 && visibleLeads.length === 0 && (
        <div className="hlc-leads-empty"><UsersRound size={24} aria-hidden="true" /><strong>No matching leads</strong><span>Try a different name, number, email, or status.</span></div>
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
