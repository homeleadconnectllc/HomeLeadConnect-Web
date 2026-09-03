import { useMemo, useState } from "react";
import { BarChart3, BrainCircuit, Download, Route, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  buildSimulationActionPlan,
  runForecast,
  runLogisticsScenario,
  type ForecastInputs,
  type LogisticsScenario,
} from "../../lib/intelligenceSandbox";

const initialForecast: ForecastInputs = { monthlyLeads: 48, conversionRate: 35, averageJobHours: 5, weeklyTeamHours: 80, horizonWeeks: 8 };
const initialBaseline: LogisticsScenario = { name: "Baseline", jobs: 18, technicians: 3, serviceMinutes: 180, travelMinutes: 35, workingDays: 5, hoursPerDay: 8 };
const initialCandidate: LogisticsScenario = { ...initialBaseline, name: "Candidate", technicians: 4, travelMinutes: 28 };

function numberValue(value: string) { const next = Number(value); return Number.isFinite(next) ? next : 0; }

function ScenarioEditor({ value, onChange }: { value: LogisticsScenario; onChange: (value: LogisticsScenario) => void }) {
  const set = (key: keyof LogisticsScenario, next: string) => onChange({ ...value, [key]: key === "name" ? next : numberValue(next) });
  return <fieldset className="hlc-scenario-editor"><legend>{value.name} assumptions</legend>
    <label>Scenario name<input value={value.name} maxLength={40} onChange={(event)=>set("name", event.target.value)} /></label>
    <label>Jobs<input type="number" min="0" value={value.jobs} onChange={(event)=>set("jobs", event.target.value)} /></label>
    <label>Technicians<input type="number" min="0" value={value.technicians} onChange={(event)=>set("technicians", event.target.value)} /></label>
    <label>Service minutes / job<input type="number" min="0" value={value.serviceMinutes} onChange={(event)=>set("serviceMinutes", event.target.value)} /></label>
    <label>Travel minutes / job<input type="number" min="0" value={value.travelMinutes} onChange={(event)=>set("travelMinutes", event.target.value)} /></label>
    <label>Working days<input type="number" min="0" value={value.workingDays} onChange={(event)=>set("workingDays", event.target.value)} /></label>
    <label>Hours / day<input type="number" min="0" step="0.5" value={value.hoursPerDay} onChange={(event)=>set("hoursPerDay", event.target.value)} /></label>
  </fieldset>;
}

export default function IntelligenceWorkspace() {
  const { pathname } = useLocation();
  const sandbox = pathname.endsWith("/sandbox");
  const [forecastInput, setForecastInput] = useState(initialForecast);
  const [baseline, setBaseline] = useState(initialBaseline);
  const [candidate, setCandidate] = useState(initialCandidate);
  const forecast = useMemo(()=>runForecast(forecastInput),[forecastInput]);
  const baselineResult = useMemo(()=>runLogisticsScenario(baseline),[baseline]);
  const candidateResult = useMemo(()=>runLogisticsScenario(candidate),[candidate]);
  const setForecast = (key: keyof ForecastInputs, value: string) => setForecastInput((current)=>({ ...current, [key]: numberValue(value) }));

  function exportPlan() {
    const plan = buildSimulationActionPlan(candidateResult);
    const blob = new Blob([JSON.stringify(plan, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "homelead-connect-simulation-review-plan.json"; link.click();
    URL.revokeObjectURL(url);
  }

  return <main className={`hlc-intelligence-workspace ${sandbox ? "is-sandbox" : "is-forecast"}`}>
    <header className="hlc-intelligence-hero"><div><p>DION + KENDRELL INTELLIGENCE</p><h1>{sandbox ? "Logistics Sandbox" : "Forecasting Studio"}</h1><span>{sandbox ? "Compare hypothetical workload and capacity scenarios without changing assignments, appointments, routes, billing, SLAs, or customer records." : "Explore a directional demand-and-capacity estimate with every assumption visible. A forecast is a model, not a recorded outcome."}</span></div><aside><strong>{sandbox ? "SIMULATION ONLY" : "FORECAST"}</strong><small>{sandbox ? "Browser-local assumptions and deterministic calculations. Zero production writes." : "Modeled range from operator-entered assumptions. Validate against authorized source records before acting."}</small></aside></header>

    <nav className="hlc-intelligence-nav" aria-label="Analytics modes"><Link to="/analytics"><BarChart3 size={17}/>REAL DATA</Link><Link className={!sandbox?"is-active":""} to="/analytics/forecasting"><BrainCircuit size={17}/>FORECAST</Link><Link className={sandbox?"is-active":""} to="/analytics/sandbox"><SlidersHorizontal size={17}/>SIMULATION ONLY</Link></nav>

    <section className="hlc-intelligence-boundary"><ShieldCheck size={19}/><div><strong>Deliberate-action boundary</strong><span>Observe → Explain → Explore → Simulate → Compare → Learn. Any real action must move to its authorized canonical workflow.</span></div></section>

    {!sandbox && <><section className="hlc-forecast-layout"><form><div className="hlc-intelligence-section-title"><p>VISIBLE ASSUMPTIONS</p><h2>Demand and capacity model</h2></div>
      <label>Monthly lead baseline<input type="number" min="0" value={forecastInput.monthlyLeads} onChange={(event)=>setForecast("monthlyLeads",event.target.value)}/><small>Operator-entered baseline; not fetched live.</small></label>
      <label>Expected conversion rate (%)<input type="number" min="0" max="100" value={forecastInput.conversionRate} onChange={(event)=>setForecast("conversionRate",event.target.value)}/></label>
      <label>Average hours per job<input type="number" min="0" step="0.5" value={forecastInput.averageJobHours} onChange={(event)=>setForecast("averageJobHours",event.target.value)}/></label>
      <label>Weekly team capacity (hours)<input type="number" min="0" value={forecastInput.weeklyTeamHours} onChange={(event)=>setForecast("weeklyTeamHours",event.target.value)}/></label>
      <label>Forecast horizon (weeks)<input type="number" min="1" max="52" value={forecastInput.horizonWeeks} onChange={(event)=>setForecast("horizonWeeks",event.target.value)}/></label>
    </form><section className="hlc-model-output" aria-live="polite"><p>FORECAST · DIRECTIONAL CONFIDENCE</p><h2>{forecast.expectedJobs} expected jobs</h2><div className="hlc-range-bar"><span style={{width:`${Math.min(100,Math.max(8,forecast.expectedJobs))}%`}}/></div><dl><div><dt>Modeled range</dt><dd>{forecast.lowJobs}–{forecast.highJobs} jobs</dd></div><div><dt>Required hours</dt><dd>{forecast.requiredHours}</dd></div><div><dt>Available hours</dt><dd>{forecast.availableHours}</dd></div><div><dt>Capacity gap</dt><dd className={forecast.capacityGapHours<0?"is-risk":"is-ready"}>{forecast.capacityGapHours} hours</dd></div></dl><small>Range uses ±20% around the modeled result. It is not a probability interval or guarantee.</small></section></section>
      <section className="hlc-intelligence-guidance"><Route size={22}/><div><p>DION GUIDANCE</p><h2>Use the forecast to frame questions—not to manufacture certainty.</h2><ol><li>Open REAL DATA and verify the baseline period.</li><li>Adjust one assumption at a time.</li><li>Document the source and owner for a real operational decision.</li></ol></div></section></>}

    {sandbox && <><section className="hlc-simulation-warning" role="status"><strong>SIMULATION ONLY</strong><span>Controls on this page calculate in memory. They cannot save, assign, schedule, route, bill, change an SLA, or update a customer.</span></section><section className="hlc-scenario-grid"><ScenarioEditor value={baseline} onChange={setBaseline}/><ScenarioEditor value={candidate} onChange={setCandidate}/></section>
      <section className="hlc-comparison-table" aria-label="Scenario comparison"><header><span>MODELED OUTPUT</span><strong>{candidateResult.utilization - baselineResult.utilization > 0 ? "Higher" : "Lower"} candidate utilization</strong></header><div className="hlc-comparison-row"><b>Metric</b><b>{baselineResult.name}</b><b>{candidateResult.name}</b></div>{[["Total workload",`${baselineResult.totalHours} h`,`${candidateResult.totalHours} h`],["Capacity",`${baselineResult.capacityHours} h`,`${candidateResult.capacityHours} h`],["Utilization",`${baselineResult.utilization}%`,`${candidateResult.utilization}%`],["Capacity balance",`${baselineResult.unallocatedHours} h`,`${candidateResult.unallocatedHours} h`],["Feasible",baselineResult.feasible?"Modeled yes":"Modeled no",candidateResult.feasible?"Modeled yes":"Modeled no"]].map((row)=><div className="hlc-comparison-row" key={row[0]}><span>{row[0]}</span><span>{row[1]}</span><span>{row[2]}</span></div>)}</section>
      <section className="hlc-export-plan"><div><p>REVIEW ARTIFACT</p><h2>Export a simulation action plan</h2><span>The export contains assumptions, modeled observations, and review steps only. It does not execute an operational change.</span></div><button type="button" onClick={exportPlan}><Download size={18}/>Export JSON</button></section></>}
  </main>;
}
