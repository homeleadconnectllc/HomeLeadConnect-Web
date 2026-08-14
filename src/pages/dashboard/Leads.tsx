import { useEffect, useState } from "react";
import { listLeads } from "../../api/leads";
import LeadCard from "../../components/leads/LeadCard";
import type { Lead } from "../../lib/types/database";
import { errorMessage } from "../../lib/errorMessage";

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listLeads()
      .then(setLeads)
      .catch((reason: unknown) =>
        setError(errorMessage(reason, "Unable to load leads.")),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="hlc-leads-page" style={pageStyle}>
      <h1>Leads</h1>
      <p style={{ color: "#64748b" }}>Start an estimate from an existing CRM lead.</p>
      {loading && <p>Loading leads…</p>}
      {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
      {!loading && !error && leads.length === 0 && <p>No leads found.</p>}
      <div className="hlc-leads-list" style={{ display: "grid", gap: 12 }}>
        {leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)}
      </div>
    </main>
  );
}

const pageStyle = {
  width: "min(1000px, calc(100% - 48px))",
  margin: "40px auto",
  fontFamily: "system-ui, sans-serif",
};
