import { useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import {
  LeadDetail,
  LeadEmptyState,
  LeadFilters,
  LeadForm,
  LeadLoadingState,
  LeadSearch,
  LeadTable,
  useLeads,
} from "../../features/leads";
import type { Lead } from "../../features/leads/types/lead";

export default function Dashboard() {
  const {
    leads,
    loading,
    saving,
    error,
    search,
    setSearch,
    page,
    setPage,
    filters,
    setFilters,
    sort,
    setSort,
    stageOptions,
    sourceOptions,
    workspaceMemberships,
    activeCount,
    newCount,
    highPriorityCount,
    appointmentCount,
    updateLead,
    archiveLead,
    addLead,
  } = useLeads();

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <AppLayout>
      <div style={{ maxWidth: 1500, margin: "0 auto" }}>
        <div style={header}>
          <div>
            <h1 style={{ margin: 0, fontSize: 34 }}>Leads</h1>
            <p style={{ margin: "8px 0 0", color: "#94a3b8" }}>
              Manage homeowner opportunities across your workspaces.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAdd(true)}
            style={primaryButton}
          >
            + Add Lead
          </button>
        </div>

        <div style={cards}>
          <Summary title="Active Leads" value={activeCount} />
          <Summary title="New Leads" value={newCount} />
          <Summary title="High Priority" value={highPriorityCount} />
          <Summary title="Appointments" value={appointmentCount} />
        </div>

        {error && (
          <div style={errorBox} role="alert">
            {error}
          </div>
        )}

        <div style={toolbar}>
          <LeadSearch value={search} onChange={setSearch} />
          <LeadFilters
            filters={filters}
            onChange={setFilters}
            stageOptions={stageOptions}
            sourceOptions={sourceOptions}
          />

          <select
            value={sort}
            onChange={(event) =>
              setSort(
                event.target.value as
                  | "created_at"
                  | "appointment_at"
                  | "priority",
              )
            }
            aria-label="Sort leads"
            style={select}
          >
            <option value="created_at">Newest</option>
            <option value="appointment_at">Appointment</option>
            <option value="priority">Priority</option>
          </select>
        </div>

        {loading ? (
          <LeadLoadingState />
        ) : leads.length === 0 ? (
          <LeadEmptyState onAdd={() => setShowAdd(true)} />
        ) : (
          <>
            <LeadTable
              leads={leads}
              sort={sort}
              onSort={setSort}
              onOpen={setSelectedLead}
              onArchive={(lead) => {
                void archiveLead(lead.id);
              }}
            />

            <div style={pagination}>
              <button
                type="button"
                disabled={page === 0 || saving}
                onClick={() => setPage(Math.max(0, page - 1))}
                style={pageButton}
              >
                Previous
              </button>

              <span style={{ color: "#94a3b8" }}>
                Page {page + 1}
              </span>

              <button
                type="button"
                disabled={leads.length < 25 || saving}
                onClick={() => setPage(page + 1)}
                style={pageButton}
              >
                Next
              </button>
            </div>
          </>
        )}

        {selectedLead && (
          <LeadDetail
            lead={selectedLead}
            saving={saving}
            onClose={() => setSelectedLead(null)}
            onSave={async (updates) => {
              const success = await updateLead(selectedLead.id, updates);

              if (success) {
                setSelectedLead(null);
              }

              return success;
            }}
          />
        )}

        {showAdd && (
          <LeadForm
            saving={saving}
            workspaceIds={workspaceMemberships.map(
              (membership) => membership.workspace_id,
            )}
            onClose={() => setShowAdd(false)}
            onSubmit={addLead}
          />
        )}
      </div>
    </AppLayout>
  );
}

function Summary({ title, value }: { title: string; value: number }) {
  return (
    <div style={card}>
      <div style={{ color: "#94a3b8", fontSize: 13 }}>{title}</div>
      <div style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>
        {value}
      </div>
    </div>
  );
}

const header = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 20,
  flexWrap: "wrap" as const,
};

const cards = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 14,
  marginTop: 26,
};

const card = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 13,
  padding: 18,
};

const toolbar = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap" as const,
  margin: "22px 0 14px",
};

const primaryButton = {
  padding: "11px 17px",
  borderRadius: 9,
  border: 0,
  background: "#2563eb",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

const select = {
  padding: "11px 12px",
  borderRadius: 10,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#fff",
};

const errorBox = {
  marginTop: 18,
  padding: 12,
  borderRadius: 9,
  background: "#450a0a",
  border: "1px solid #7f1d1d",
  color: "#fecaca",
};

const pagination = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 18,
  marginTop: 18,
};

const pageButton = {
  padding: "9px 13px",
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#fff",
  cursor: "pointer",
};
