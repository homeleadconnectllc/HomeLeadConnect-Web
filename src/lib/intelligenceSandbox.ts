export type ForecastInputs = {
  monthlyLeads: number;
  conversionRate: number;
  averageJobHours: number;
  weeklyTeamHours: number;
  horizonWeeks: number;
};

export type ForecastResult = {
  expectedJobs: number;
  lowJobs: number;
  highJobs: number;
  requiredHours: number;
  availableHours: number;
  capacityGapHours: number;
  confidence: "directional";
};

export type LogisticsScenario = {
  name: string;
  jobs: number;
  technicians: number;
  serviceMinutes: number;
  travelMinutes: number;
  workingDays: number;
  hoursPerDay: number;
};

export type LogisticsResult = LogisticsScenario & {
  totalHours: number;
  capacityHours: number;
  utilization: number;
  unallocatedHours: number;
  feasible: boolean;
};

const finiteNonNegative = (value: number) => Number.isFinite(value) ? Math.max(0, value) : 0;
const round = (value: number, places = 1) => Number(value.toFixed(places));

export function runForecast(input: ForecastInputs): ForecastResult {
  const weeks = Math.max(1, Math.round(finiteNonNegative(input.horizonWeeks)));
  const monthlyLeads = finiteNonNegative(input.monthlyLeads);
  const conversion = Math.min(100, finiteNonNegative(input.conversionRate)) / 100;
  const expectedJobs = monthlyLeads * (weeks / 4.33) * conversion;
  const requiredHours = expectedJobs * finiteNonNegative(input.averageJobHours);
  const availableHours = finiteNonNegative(input.weeklyTeamHours) * weeks;
  return {
    expectedJobs: round(expectedJobs),
    lowJobs: round(expectedJobs * 0.8),
    highJobs: round(expectedJobs * 1.2),
    requiredHours: round(requiredHours),
    availableHours: round(availableHours),
    capacityGapHours: round(availableHours - requiredHours),
    confidence: "directional",
  };
}

export function runLogisticsScenario(input: LogisticsScenario): LogisticsResult {
  const jobs = Math.round(finiteNonNegative(input.jobs));
  const technicians = Math.round(finiteNonNegative(input.technicians));
  const workingDays = Math.round(finiteNonNegative(input.workingDays));
  const hoursPerJob = (finiteNonNegative(input.serviceMinutes) + finiteNonNegative(input.travelMinutes)) / 60;
  const totalHours = jobs * hoursPerJob;
  const capacityHours = technicians * workingDays * finiteNonNegative(input.hoursPerDay);
  const utilization = capacityHours === 0 ? (totalHours === 0 ? 0 : 100) : (totalHours / capacityHours) * 100;
  return {
    ...input,
    jobs,
    technicians,
    workingDays,
    totalHours: round(totalHours),
    capacityHours: round(capacityHours),
    utilization: round(utilization),
    unallocatedHours: round(capacityHours - totalHours),
    feasible: totalHours <= capacityHours,
  };
}

export function buildSimulationActionPlan(result: LogisticsResult) {
  return {
    label: "SIMULATION ONLY" as const,
    generatedFrom: "browser-local deterministic scenario" as const,
    scenario: result.name,
    observation: result.feasible
      ? `Modeled capacity exceeds modeled workload by ${Math.max(0, result.unallocatedHours)} hours.`
      : `Modeled workload exceeds modeled capacity by ${Math.abs(result.unallocatedHours)} hours.`,
    reviewSteps: [
      "Validate assumptions against authorized source records.",
      "Review service, travel, break, and availability constraints with the responsible manager.",
      "Use the canonical scheduling and assignment workflows for any real change.",
    ],
    productionWrites: false as const,
  };
}
