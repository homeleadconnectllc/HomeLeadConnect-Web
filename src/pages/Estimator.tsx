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
    <main className="hlc-ui-page-d4fa89">
      <div className="hlc-ui-estimator-bf88ee">
        <header className="hlc-ui-margin-bottom-06dcf3">
          <p className="hlc-ui-eyebrow-e4e43e">HomeLead Connect</p>
          <h1 className="hlc-ui-estimator-1f2fa9">
            LeadScope
          </h1>
          <p className="hlc-ui-estimator-036a3c">
            Build the customer estimate, review the total, save it, and convert an accepted estimate into a job.
          </p>
          {leadId !== null && lead && <p className="hlc-ui-color-549bcd"><strong>Lead:</strong> {lead.full_name || `Lead #${lead.id}`} · {lead.email || lead.phone}</p>}
          {leadParam && leadId === null && <p role="alert" className="hlc-ui-color-d80273">Invalid lead ID.</p>}
        </header>

        <section className="estimate-layout hlc-ui-layout-401ed7" >
          <div className="hlc-ui-panel-843e5e">
            <div className="hlc-ui-panelHeader-e3bb84">
              <div>
                <h2 className="hlc-ui-estimator-36e3d1">Work and materials</h2>
                <p className="hlc-ui-estimator-e77f7d">
                  Enter each part of the project, how many are needed, and the cost for one unit.
                </p>
              </div>
              <button type="button" onClick={addLine} disabled={locked}>Add another item</button>
            </div>

            <div className="hlc-ui-estimator-247aeb">
              {lines.map((line, index) => (
                <div className="estimate-line hlc-ui-line-1172f7" key={line.id} >
                  <div className="hlc-ui-itemNumber-7709b6">Item {index + 1}</div>

                  <label className="hlc-ui-field-7cddc4">
                    <span className="hlc-ui-label-9393ed">What is this item?</span>
                    <span className="hlc-ui-help-ae4659">Example: Labor, drywall, faucet, paint</span>
                    <input
                      aria-label={`Item ${index + 1} description`}
                      value={line.description}
                      disabled={locked}
                      onChange={(event) => updateLine(line.id, "description", event.target.value)}
                      placeholder="Enter work or material"
                      className="hlc-ui-input-ace66c"
                    />
                  </label>

                  <label className="hlc-ui-field-7cddc4">
                    <span className="hlc-ui-label-9393ed">Quantity</span>
                    <span className="hlc-ui-help-ae4659">How many?</span>
                    <input
                      aria-label={`Item ${index + 1} quantity`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.quantity}
                      disabled={locked}
                      onChange={(event) => updateLine(line.id, "quantity", event.target.value)}
                      className="hlc-ui-input-ace66c"
                    />
                  </label>

                  <label className="hlc-ui-field-7cddc4">
                    <span className="hlc-ui-label-9393ed">Cost per item ($)</span>
                    <span className="hlc-ui-help-ae4659">Enter the price for one unit</span>
                    <input
                      aria-label={`Item ${index + 1} cost per item`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.unitCost}
                      disabled={locked}
                      onChange={(event) => updateLine(line.id, "unitCost", event.target.value)}
                      placeholder="0.00"
                      className="hlc-ui-input-ace66c"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => removeLine(line.id)}
                    disabled={locked || lines.length === 1}
                    aria-label={`Remove ${line.description || `item ${index + 1}`}`}
                    className="hlc-ui-removeButton-8738e2"
                  >
                    Remove item
                  </button>
                </div>
              ))}
            </div>
          </div>

          <aside className="hlc-ui-summary-bfe9ab">
            <h2 className="hlc-ui-margin-top-a0925a">LeadScope summary</h2>
            <label className="hlc-ui-summaryField-0b24c2">
              <span className="hlc-ui-summaryLabel-97c99b">Markup percentage</span>
              <span className="hlc-ui-summaryHelp-6f54e5">Amount added above the item subtotal</span>
              <input
                type="number"
                min="0"
                step="1"
                value={markupPercent}
                disabled={locked}
                onChange={(event) => setMarkupPercent(Math.max(0, Number(event.target.value)))}
                className="hlc-ui-summaryInput-986758"
              />
            </label>

            <label className="hlc-ui-summaryField-0b24c2">
              <span className="hlc-ui-summaryLabel-97c99b">Estimate status</span>
              <span className="hlc-ui-summaryHelp-6f54e5">Draft until it is sent or accepted</span>
              <select
                value={status}
                disabled={locked}
                onChange={(event) => setStatus(event.target.value as EstimateStatus)}
                className="hlc-ui-summaryInput-986758"
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

            <div className="hlc-ui-estimator-2c3d83">
              <SummaryRow label="Items subtotal" value={summary.subtotal} />
              <SummaryRow label={`Markup (${markupPercent}%)`} value={summary.markupAmount} />
              <div className="hlc-ui-estimator-b968a6" />
              <div className="hlc-ui-estimator-5ac6ef">
                <span>Customer total</span><span>{formatCurrency(summary.total)}</span>
              </div>
            </div>

            <div className="hlc-ui-estimator-7852a6">
              {!authLoading && !session && <Link to="/login" className="hlc-ui-color-5a7678">Sign in to save</Link>}
              <button type="button" onClick={handleSave} disabled={busy || locked || !session}>
                {busy ? "Working…" : estimateId ? "Update LeadScope estimate" : "Save LeadScope estimate"}
              </button>
              <button type="button" onClick={handleConvert} disabled={busy || !estimateId || status !== "accepted"}>
                Create job from accepted estimate
              </button>
              {message && message !== "LeadScope estimate saved." && <p role="status" className="hlc-ui-estimator-6503ff">{message}</p>}
              {error && <p role="alert" className="hlc-ui-estimator-4ac42b">{error}</p>}
              {status === "converted" && <Link to={jobId ? `/jobs/${jobId}` : "/jobs"} className="hlc-ui-color-5a7678">
                {jobId ? "Open created job" : "View jobs"}
              </Link>}
            </div>
          </aside>
        </section>

        {(message === "LeadScope estimate saved." || estimateId) && (
          <section aria-label="Saved LeadScope estimate" className="hlc-ui-savedState-535878">
            {message === "LeadScope estimate saved." && (
              <div role="status" className="hlc-ui-successRow-2a8abc">
                <span aria-hidden="true" className="hlc-ui-successIcon-136abb">✓</span>
                <strong>Estimate saved</strong>
              </div>
            )}
            {estimateId && (
              <div className="hlc-ui-savedMeta-db24de">
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
  return <div className="hlc-ui-estimator-a9a9c4">
    <span>{label}</span><strong className="hlc-ui-color-eedb26">{formatCurrency(value)}</strong>
  </div>;
}
