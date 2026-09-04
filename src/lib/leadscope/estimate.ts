export type LeadScopeMeasurementUnit = "sq_ft" | "linear_ft" | "each" | "custom";

export type ResidentEstimateInput = {
  quantity: number;
  rateLow: number;
  rateHigh: number;
};

export type ResidentEstimateRange = {
  low: number;
  high: number;
  method: "resident_rate_assumption";
};

function assertFiniteNonNegative(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${label} must be a non-negative number.`);
}

export function calculateResidentEstimateRange(input: ResidentEstimateInput): ResidentEstimateRange {
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) throw new Error("Project quantity must be greater than zero.");
  assertFiniteNonNegative(input.rateLow, "Low rate assumption");
  assertFiniteNonNegative(input.rateHigh, "High rate assumption");
  if (input.rateHigh < input.rateLow) throw new Error("High rate assumption must be at least the low rate assumption.");
  const low = Math.round(input.quantity * input.rateLow * 100) / 100;
  const high = Math.round(input.quantity * input.rateHigh * 100) / 100;
  return { low, high, method: "resident_rate_assumption" };
}

export function measurementUnitLabel(unit: LeadScopeMeasurementUnit) {
  if (unit === "sq_ft") return "square feet";
  if (unit === "linear_ft") return "linear feet";
  if (unit === "each") return "items";
  return "units";
}
