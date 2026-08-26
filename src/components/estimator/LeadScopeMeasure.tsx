import { useMemo, useState } from "react";
import {
  calculateMaterialQuantity,
  calculateRoomMeasurements,
  measurementEvidenceLabel,
  type MeasurementEvidence,
} from "../../lib/leadscope/measurements";

const evidenceOptions: MeasurementEvidence[] = [
  "customer_confirmed",
  "estimated",
  "needs_professional_verification",
];

export default function LeadScopeMeasure() {
  const [lengthFt, setLengthFt] = useState(0);
  const [widthFt, setWidthFt] = useState(0);
  const [heightFt, setHeightFt] = useState(8);
  const [wastePercent, setWastePercent] = useState(10);
  const [evidence, setEvidence] = useState<MeasurementEvidence>("customer_confirmed");

  const summary = useMemo(
    () => calculateRoomMeasurements({ lengthFt, widthFt, heightFt }),
    [heightFt, lengthFt, widthFt],
  );
  const floorQuantity = useMemo(
    () => calculateMaterialQuantity(summary.floorAreaSqFt, wastePercent),
    [summary.floorAreaSqFt, wastePercent],
  );

  return (
    <section aria-labelledby="leadscope-measure-title" style={sectionStyle}>
      <div style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>LeadScope Measure</p>
          <h2 id="leadscope-measure-title" style={{ margin: "4px 0 6px" }}>Digital project measurements</h2>
          <p style={mutedStyle}>
            Capture project dimensions, calculate quantities, and keep the evidence level attached to the scope. Camera/LiDAR capture will only be labeled device measured when supported capture is actually recorded.
          </p>
        </div>
        <span style={badgeStyle}>{measurementEvidenceLabel(evidence)}</span>
      </div>

      <div style={gridStyle}>
        <MeasurementField label="Length (ft)" value={lengthFt} onChange={setLengthFt} />
        <MeasurementField label="Width (ft)" value={widthFt} onChange={setWidthFt} />
        <MeasurementField label="Height (ft)" value={heightFt} onChange={setHeightFt} />
        <label style={fieldStyle}>
          <span style={labelStyle}>Evidence</span>
          <select value={evidence} onChange={(event) => setEvidence(event.target.value as MeasurementEvidence)} style={inputStyle}>
            {evidenceOptions.map((value) => <option key={value} value={value}>{measurementEvidenceLabel(value)}</option>)}
          </select>
        </label>
      </div>

      <div style={resultGridStyle}>
        <Result label="Floor area" value={`${summary.floorAreaSqFt} sq ft`} />
        <Result label="Perimeter" value={`${summary.perimeterFt} ft`} />
        <Result label="Wall area" value={`${summary.wallAreaSqFt} sq ft`} />
        <Result label="Volume" value={`${summary.volumeCuFt} cu ft`} />
      </div>

      <div style={materialStyle}>
        <label style={fieldStyle}>
          <span style={labelStyle}>Material waste allowance (%)</span>
          <input type="number" min="0" max="100" step="1" value={wastePercent} onChange={(event) => setWastePercent(Math.min(100, Math.max(0, Number(event.target.value) || 0)))} style={inputStyle} />
        </label>
        <div>
          <span style={labelStyle}>Flooring/tile quantity with waste</span>
          <strong style={{ display: "block", fontSize: 24 }}>{floorQuantity.quantityWithWaste} sq ft</strong>
        </div>
      </div>

      <div style={noticeStyle}>
        <strong>Estimate boundary:</strong> LeadScope measurements support preliminary estimates and material quantities. Hidden conditions, code requirements, structural conditions, and final contractor pricing still require professional verification.
      </div>
    </section>
  );
}

function MeasurementField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label style={fieldStyle}>
    <span style={labelStyle}>{label}</span>
    <input type="number" min="0" step="0.01" value={value} onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))} style={inputStyle} />
  </label>;
}

function Result({ label, value }: { label: string; value: string }) {
  return <div style={resultStyle}><span style={mutedStyle}>{label}</span><strong style={{ fontSize: 20 }}>{value}</strong></div>;
}

const sectionStyle = { marginBottom: 24, border: "1px solid #334155", borderRadius: 18, padding: 20, background: "#0f1f3d", color: "#f8fafc" };
const headerStyle = { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" as const };
const eyebrowStyle = { margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase" as const, color: "#93c5fd" };
const mutedStyle = { margin: 0, color: "#cbd5e1", lineHeight: 1.55 };
const badgeStyle = { border: "1px solid #60a5fa", borderRadius: 999, padding: "7px 10px", fontSize: 12, fontWeight: 700, color: "#bfdbfe" };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginTop: 18 };
const fieldStyle = { display: "grid", gap: 6 };
const labelStyle = { fontWeight: 700, fontSize: 13 };
const inputStyle = { minHeight: 44, borderRadius: 10, border: "1px solid #475569", background: "#fff", color: "#0f172a", padding: "10px 12px", fontSize: 16 };
const resultGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginTop: 16 };
const resultStyle = { display: "grid", gap: 5, borderTop: "1px solid #334155", paddingTop: 12 };
const materialStyle = { display: "grid", gridTemplateColumns: "minmax(160px, 240px) 1fr", gap: 18, alignItems: "end", marginTop: 18 };
const noticeStyle = { marginTop: 18, paddingTop: 14, borderTop: "1px solid #334155", color: "#cbd5e1", lineHeight: 1.55, fontSize: 14 };
