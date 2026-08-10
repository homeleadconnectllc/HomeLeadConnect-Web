import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  convertEstimateToJob,
  getEstimate,
  saveEstimate,
  type SaveEstimateInput,
} from "../api/estimates";
import { getLead } from "../api/leads";
import { useAuth } from "../hooks/useAuth";
import {
  calculateEstimate,
  formatCurrency,
  type EstimateLine,
} from "../lib/estimator/calculations";
import type { EstimateStatus, Lead } from "../lib/types/database";
import { errorMessage } from "../lib/errorMessage";

const initialLines: EstimateLine[] = [
  { id: "line-1", description: "Labor", quantity: 1, unitCost: 0 },
  { id: "line-2", description: "Materials", quantity: 1, unitCost: 0 },
];

const editableStatuses: Array<Exclude<EstimateStatus, "converted">> = [
  "draft",
  "sent",
  "accepted",
  "rejected",
];

export default function Estimator() {
  const { session, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const leadParam = searchParams.get("lead");
  const estimateParam = searchParams.get("estimate");
  const leadId = leadParam && /^\d+$/.test(leadParam) ? Number(leadParam) : null;
  const [lead, setLead] = useState<Lead | null>(null);
  const [estimateId, setEstimateId] = useState<string | null>(estimateParam);
  const [jobId, setJobId] = useState<string | null>(null);
  const [lines, setLines] = useState<EstimateLine[]>(initialLines);
  const [markupPercent, setMarkupPercent] = useState(20);
  const [status, setStatus] = useState<EstimateStatus>("draft");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const summary = useMemo(
    () => calculateEstimate(lines, markupPercent),
    [lines, markupPercent],
  );

  useEffect(() => {
    if (!session || leadId === null) return;

    getLead(leadId).then(setLead).catch((reason: unknown) => {
      setError(errorMessage(reason, "Unable to load lead."));
    });
  }, [leadId, session]);

  useEffect(() => {
    if (!session || !estimateParam) return;

    getEstimate(estimateParam)
      .then((estimate) => {
        setEstimateId(estimate.id);
        setMarkupPercent(Number(estimate.markup_percent));
        setStatus(estimate.status);
        setLines(
          (estimate.estimate_lines ?? []).map((line) => ({
            id: line.id,
            description: line.description,
            quantity: Number(line.quantity),
            unitCost: Number(line.unit_cost),
          })),
        );
      })
      .catch((reason: unknown) => {
        setError(errorMessage(reason, "Unable to load estimate."));
      });
  }, [estimateParam, session]);

  function updateLine(
    id: string,
    field: "description" | "quantity" | "unitCost",
    value: string,
  ) {
    setLines((current) =>
      current.map((line) => {
        if (line.id !== id) return line;
        if (field === "description") return { ...line, description: value };
        const numericValue = Number(value);
        return {
          ...line,
          [field]: Number.isFinite(numericValue) ? Math.max(0, numericValue) : 0,
        };
      }),
    );
  }

  function addLine() {
    setLines((current) => [
      ...current,
      { id: crypto.randomUUID(), description: "", quantity: 1, unitCost: 0 },
    ]);
  }

  function removeLine(id: string) {
    setLines((current) => current.filter((line) => line.id !== id));
  }

  async function handleSave() {
    if (!session) {
      setError("Sign in to save this estimate.");
      return;
    }
    if (status === "converted") return;

    setBusy(true);
    setError("");
    setMessage("");
    try {
      const input: SaveEstimateInput = {
        id: estimateId ?? undefined,
        leadId,
        status,
        markupPercent,
        subtotal: summary.subtotal,
        markupAmount: summary.markupAmount,
        total: summary.total,
        lines,
      };
      const saved = await saveEstimate(input);
      setEstimateId(saved.id);
      setStatus(saved.status);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("estimate", saved.id);
      setSearchParams(nextParams, { replace: true });
      setMessage("Estimate saved.");
    } catch (reason) {
      setError(errorMessage(reason, "Unable to save estimate."));
    } finally {
      setBusy(false);
    }
  }

  async function handleConvert() {
    if (!estimateId || status !== "accepted") return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const job = await convertEstimateToJob(estimateId);
      setStatus("converted");
      setJobId(job.id);
      setMessage(`Job created: ${job.name}`);
    } catch (reason) {
      setError(errorMessage(reason, "Unable to convert estimate."));
    } finally {
      setBusy(false);
    }
  }

  const locked = status === "converted";

  return (
    <main style={pageStyle}>
      <div style={{ width: "min(1100px, 100%)", margin: "0 auto" }}>
        <header style={{ marginBottom: 32 }}>
          <p style={eyebrowStyle}>HomeLead Connect</p>
          <h1 style={{ margin: "8px 0", fontSize: "clamp(36px, 6vw, 64px)", letterSpacing: "-2px" }}>
            LeadScope
          </h1>
          <p style={{ margin: 0, maxWidth: 700, color: "#475569", lineHeight: 1.6 }}>
            Build, save, send, accept, and convert an estimate without changing the verified calculation contract.
          </p>
          {leadId !== null && lead && <p><strong>Lead:</strong> {lead.full_name || `Lead #${lead.id}`} · {lead.email || lead.phone}</p>}
          {leadParam && leadId === null && <p role="alert" style={errorStyle}>Invalid lead ID.</p>}
        </header>

        <section className="estimate-layout" style={layoutStyle}>
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div>
                <h2 style={{ margin: 0 }}>Estimate items</h2>
                <p style={{ color: "#64748b", margin: "6px 0 0" }}>Add the work and materials included in the project.</p>
              </div>
              <button type="button" onClick={addLine} disabled={locked}>Add item</button>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {lines.map((line) => (
                <div className="estimate-line" key={line.id} style={lineStyle}>
                  <input aria-label="Item description" value={line.description} disabled={locked}
                    onChange={(event) => updateLine(line.id, "description", event.target.value)} placeholder="Description" style={inputStyle} />
                  <input aria-label="Quantity" type="number" min="0" step="0.01" value={line.quantity} disabled={locked}
                    onChange={(event) => updateLine(line.id, "quantity", event.target.value)} style={inputStyle} />
                  <input aria-label="Unit cost" type="number" min="0" step="0.01" value={line.unitCost} disabled={locked}
                    onChange={(event) => updateLine(line.id, "unitCost", event.target.value)} placeholder="Unit cost" style={inputStyle} />
                  <button type="button" onClick={() => removeLine(line.id)} disabled={locked || lines.length === 1}
                    aria-label={`Remove ${line.description || "item"}`}>Remove</button>
                </div>
              ))}
            </div>
          </div>

          <aside style={summaryStyle}>
            <h2 style={{ marginTop: 0 }}>Estimate summary</h2>
            <label style={{ display: "grid", gap: 8, color: "#cbd5e1", marginBottom: 16 }}>
              Markup %
              <input type="number" min="0" step="1" value={markupPercent} disabled={locked}
                onChange={(event) => setMarkupPercent(Math.max(0, Number(event.target.value)))} style={summaryInputStyle} />
            </label>
            <label style={{ display: "grid", gap: 8, color: "#cbd5e1", marginBottom: 24 }}>
              Status
              <select value={status} disabled={locked} onChange={(event) => setStatus(event.target.value as EstimateStatus)} style={summaryInputStyle}>
                {status === "converted" && <option value="converted">Converted</option>}
                {editableStatuses.map((value) => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}
              </select>
            </label>
            <div style={{ display: "grid", gap: 14 }}>
              <SummaryRow label="Subtotal" value={summary.subtotal} />
              <SummaryRow label={`Markup (${markupPercent}%)`} value={summary.markupAmount} />
              <div style={{ height: 1, background: "#334155", margin: "4px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: 22, fontWeight: 800 }}>
                <span>Total</span><span>{formatCurrency(summary.total)}</span>
              </div>
            </div>

            <div style={{ display: "grid", gap: 10, marginTop: 24 }}>
              {!authLoading && !session && <Link to="/login" style={{ color: "#93c5fd" }}>Sign in to save</Link>}
              <button type="button" onClick={handleSave} disabled={busy || locked || !session}>
                {busy ? "Working…" : estimateId ? "Update estimate" : "Save estimate"}
              </button>
              <button type="button" onClick={handleConvert} disabled={busy || !estimateId || status !== "accepted"}>
                Convert accepted estimate to job
              </button>
              {message && <p role="status" style={{ color: "#86efac", margin: 0 }}>{message}</p>}
              {error && <p role="alert" style={{ color: "#fca5a5", margin: 0 }}>{error}</p>}
              {estimateId && <small style={{ color: "#94a3b8" }}>Estimate ID: {estimateId}</small>}
              {status === "converted" && <Link to={jobId ? `/jobs/${jobId}` : "/jobs"} style={{ color: "#93c5fd" }}>
                {jobId ? "Open created job" : "View jobs"}
              </Link>}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return <div style={{ display: "flex", justifyContent: "space-between", gap: 16, color: "#cbd5e1" }}>
    <span>{label}</span><strong style={{ color: "#fff" }}>{formatCurrency(value)}</strong>
  </div>;
}

const pageStyle = { minHeight: "100vh", background: "#f8fafc", padding: "48px 24px", fontFamily: "system-ui, sans-serif" };
const eyebrowStyle = { margin: 0, color: "#2563eb", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" as const, fontSize: 13 };
const layoutStyle = { display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 320px)", gap: 24, alignItems: "start" };
const panelStyle = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 24, boxShadow: "0 12px 40px rgba(15,23,42,.06)" };
const panelHeaderStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 20 };
const lineStyle = { display: "grid", gridTemplateColumns: "minmax(160px, 1fr) 110px 140px auto", gap: 10, alignItems: "center" };
const inputStyle = { padding: "11px 12px", minWidth: 0 };
const summaryStyle = { background: "#111827", color: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 20px 50px rgba(15,23,42,.18)" };
const summaryInputStyle = { padding: "11px 12px", borderRadius: 8, border: 0 };
const errorStyle = { color: "#b91c1c" };
