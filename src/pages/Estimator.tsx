import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  convertEstimateToJob,
  getEstimate,
  saveEstimate,
  type SaveEstimateInput,
} from "../api/estimates";
import { getLead } from "../api/leads";
import MaterialShopLinks from "../components/estimator/MaterialShopLinks";
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

  useEffect(() => {
    if (message !== "LeadScope estimate saved.") return;
    const timer = window.setTimeout(() => setMessage(""), 4200);
    return () => window.clearTimeout(timer);
  }, [message]);

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
      setError("Sign in to save this LeadScope estimate.");
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
      setMessage("LeadScope estimate saved.");
    } catch (reason) {
      setError(errorMessage(reason, "Unable to save LeadScope estimate."));
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
      setError(errorMessage(reason, "Unable to convert LeadScope estimate."));
    } finally {
      setBusy(false);
    }
  }

  const locked = status === "converted";
  const savedEstimateHref = estimateId
    ? `/estimator?estimate=${encodeURIComponent(estimateId)}${leadId !== null ? `&lead=${leadId}` : ""}`
    : "/estimator";
  const shortenedEstimateId = estimateId ? `${estimateId.slice(0, 8)}…${estimateId.slice(-4)}` : "";

  return (
    <main style={pageStyle}>
      <div style={{ width: "min(1100px, 100%)", margin: "0 auto" }}>
        <header style={{ marginBottom: 32 }}>
          <p style={eyebrowStyle}>HomeLead Connect</p>
          <h1 style={{ margin: "8px 0", fontSize: "clamp(36px, 6vw, 64px)", letterSpacing: "-2px", color: "#0f172a" }}>
            LeadScope
          </h1>
          <p style={{ margin: 0, maxWidth: 700, color: "#475569", lineHeight: 1.6 }}>
            Build the customer estimate, review the total, save it, and convert an accepted estimate into a job.
          </p>
          {leadId !== null && lead && <p style={{ color: "#334155" }}><strong>Lead:</strong> {lead.full_name || `Lead #${lead.id}`} · {lead.email || lead.phone}</p>}
          {leadParam && leadId === null && <p role="alert" style={errorStyle}>Invalid lead ID.</p>}
        </header>

        <section className="estimate-layout" style={layoutStyle}>
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div>
                <h2 style={{ margin: 0, color: "#0f172a" }}>Work and materials</h2>
                <p style={{ color: "#64748b", margin: "6px 0 0" }}>
                  Enter each part of the project, how many are needed, and the cost for one unit.
                </p>
              </div>
              <button type="button" onClick={addLine} disabled={locked}>Add another item</button>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              {lines.map((line, index) => (
                <div className="estimate-line" key={line.id} style={lineStyle}>
                  <div style={itemNumberStyle}>Item {index + 1}</div>

                  <label style={fieldStyle}>
                    <span style={labelStyle}>What is this item?</span>
                    <span style={helpStyle}>Example: Labor, drywall, faucet, paint</span>
                    <input
                      aria-label={`Item ${index + 1} description`}
                      value={line.description}
                      disabled={locked}
                      onChange={(event) => updateLine(line.id, "description", event.target.value)}
                      placeholder="Enter work or material"
                      style={inputStyle}
                    />
                  </label>

                  <label style={fieldStyle}>
                    <span style={labelStyle}>Quantity</span>
                    <span style={helpStyle}>How many?</span>
                    <input
                      aria-label={`Item ${index + 1} quantity`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.quantity}
                      disabled={locked}
                      onChange={(event) => updateLine(line.id, "quantity", event.target.value)}
                      style={inputStyle}
                    />
                  </label>

                  <label style={fieldStyle}>
                    <span style={labelStyle}>Cost per item ($)</span>
                    <span style={helpStyle}>Enter the price for one unit</span>
                    <input
                      aria-label={`Item ${index + 1} cost per item`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.unitCost}
                      disabled={locked}
                      onChange={(event) => updateLine(line.id, "unitCost", event.target.value)}
                      placeholder="0.00"
                      style={inputStyle}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => removeLine(line.id)}
                    disabled={locked || lines.length === 1}
                    aria-label={`Remove ${line.description || `item ${index + 1}`}`}
                    style={removeButtonStyle}
                  >
                    Remove item
                  </button>
                </div>
              ))}
            </div>
          </div>

          <aside style={summaryStyle}>
            <h2 style={{ marginTop: 0 }}>LeadScope summary</h2>
            <label style={summaryFieldStyle}>
              <span style={summaryLabelStyle}>Markup percentage</span>
              <span style={summaryHelpStyle}>Amount added above the item subtotal</span>
              <input
                type="number"
                min="0"
                step="1"
                value={markupPercent}
                disabled={locked}
                onChange={(event) => setMarkupPercent(Math.max(0, Number(event.target.value)))}
                style={summaryInputStyle}
              />
            </label>

            <label style={summaryFieldStyle}>
              <span style={summaryLabelStyle}>Estimate status</span>
              <span style={summaryHelpStyle}>Draft until it is sent or accepted</span>
              <select
                value={status}
                disabled={locked}
                onChange={(event) => setStatus(event.target.value as EstimateStatus)}
                style={summaryInputStyle}
              >
                {status === "converted" && <option value="converted">Converted to job</option>}
                {editableStatuses.map((value) => (
                  <option key={value} value={value}>
                    {value === "draft" ? "Draft — still being prepared" :
                      value === "sent" ? "Sent — customer has received it" :
                      value === "accepted" ? "Accepted — ready to create job" :
                      "Rejected — customer declined"}
                  </option>
                ))}
              </select>
            </label>

            <div style={{ display: "grid", gap: 14 }}>
              <SummaryRow label="Items subtotal" value={summary.subtotal} />
              <SummaryRow label={`Markup (${markupPercent}%)`} value={summary.markupAmount} />
              <div style={{ height: 1, background: "#334155", margin: "4px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: 22, fontWeight: 800 }}>
                <span>Customer total</span><span>{formatCurrency(summary.total)}</span>
              </div>
            </div>

            <div style={{ display: "grid", gap: 10, marginTop: 24 }}>
              {!authLoading && !session && <Link to="/login" style={{ color: "#93c5fd" }}>Sign in to save</Link>}
              <button type="button" onClick={handleSave} disabled={busy || locked || !session}>
                {busy ? "Working…" : estimateId ? "Update LeadScope estimate" : "Save LeadScope estimate"}
              </button>
              <button type="button" onClick={handleConvert} disabled={busy || !estimateId || status !== "accepted"}>
                Create job from accepted estimate
              </button>
              {message && message !== "LeadScope estimate saved." && <p role="status" style={{ color: "#86efac", margin: 0 }}>{message}</p>}
              {error && <p role="alert" style={{ color: "#fca5a5", margin: 0 }}>{error}</p>}
              {status === "converted" && <Link to={jobId ? `/jobs/${jobId}` : "/jobs"} style={{ color: "#93c5fd" }}>
                {jobId ? "Open created job" : "View jobs"}
              </Link>}
            </div>
          </aside>
        </section>

        {(message === "LeadScope estimate saved." || estimateId) && (
          <section aria-label="Saved LeadScope estimate" style={savedStateStyle}>
            {message === "LeadScope estimate saved." && (
              <div role="status" style={successRowStyle}>
                <span aria-hidden="true" style={successIconStyle}>✓</span>
                <strong>Estimate saved</strong>
              </div>
            )}
            {estimateId && (
              <div style={savedMetaStyle}>
                <small>Estimate {shortenedEstimateId}</small>
                <Link to={savedEstimateHref}>View saved estimate</Link>
              </div>
            )}
          </section>
        )}

        <MaterialShopLinks />
      </div>
    </main>
  );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return <div style={{ display: "flex", justifyContent: "space-between", gap: 16, color: "#cbd5e1" }}>
    <span>{label}</span><strong style={{ color: "#fff" }}>{formatCurrency(value)}</strong>
  </div>;
}

const pageStyle = { minHeight: "100vh", background: "#f8fafc", padding: "48px 24px", fontFamily: "system-ui, sans-serif", color: "#0f172a" };
const eyebrowStyle = { margin: 0, color: "#2563eb", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" as const, fontSize: 13 };
const layoutStyle = { display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 320px)", gap: 24, alignItems: "start" };
const panelStyle = { background: "#fff", color: "#0f172a", border: "1px solid #e2e8f0", borderRadius: 20, padding: 24, boxShadow: "0 12px 40px rgba(15,23,42,.06)" };
const panelHeaderStyle = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 20, flexWrap: "wrap" as const };
const lineStyle = { display: "grid", gap: 14, padding: 16, border: "1px solid #e2e8f0", borderRadius: 14, background: "#f8fafc" };
const itemNumberStyle = { fontSize: 13, fontWeight: 800, color: "#2563eb", textTransform: "uppercase" as const, letterSpacing: ".06em" };
const fieldStyle = { display: "grid", gap: 5 };
const labelStyle = { color: "#0f172a", fontWeight: 750, fontSize: 15 };
const helpStyle = { color: "#475569", fontSize: 13, lineHeight: 1.4 };
const inputStyle = { padding: "12px 13px", minWidth: 0, width: "100%", boxSizing: "border-box" as const, borderRadius: 9, border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", fontSize: 16 };
const removeButtonStyle = { justifySelf: "start", padding: "9px 14px" };
const summaryStyle = { background: "#111827", color: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 20px 50px rgba(15,23,42,.18)" };
const summaryFieldStyle = { display: "grid", gap: 6, color: "#e2e8f0", marginBottom: 18 };
const summaryLabelStyle = { color: "#fff", fontWeight: 750 };
const summaryHelpStyle = { color: "#cbd5e1", fontSize: 13, lineHeight: 1.4 };
const summaryInputStyle = { padding: "12px 13px", borderRadius: 8, border: "1px solid #475569", background: "#fff", color: "#0f172a", fontSize: 16, width: "100%", boxSizing: "border-box" as const };
const savedStateStyle = { display: "grid", gap: 6, width: "min(1100px, 100%)", margin: "14px auto 10px", padding: "10px 14px", boxSizing: "border-box" as const, border: "1px solid #bbf7d0", borderRadius: 12, background: "#f0fdf4", color: "#14532d" };
const successRowStyle = { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 24 };
const successIconStyle = { display: "inline-grid", placeItems: "center", width: 22, height: 22, borderRadius: 999, background: "#16a34a", color: "#fff", fontWeight: 900 };
const savedMetaStyle = { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" as const, color: "#334155" };
const errorStyle = { color: "#b91c1c" };
