export type MeasurementEvidence = "measured" | "customer_confirmed" | "estimated" | "needs_professional_verification";

export type MeasurementUnit = "ft" | "in";

export type RoomMeasurements = {
  lengthFt: number;
  widthFt: number;
  heightFt: number;
};

export type MeasurementSummary = {
  floorAreaSqFt: number;
  perimeterFt: number;
  wallAreaSqFt: number;
  volumeCuFt: number;
};

export type MaterialQuantity = {
  baseQuantity: number;
  wastePercent: number;
  quantityWithWaste: number;
};

function nonNegative(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function round(value: number, precision = 2) {
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function inchesToFeet(inches: number) {
  return round(nonNegative(inches) / 12, 4);
}

export function calculateRoomMeasurements(input: RoomMeasurements): MeasurementSummary {
  const length = nonNegative(input.lengthFt);
  const width = nonNegative(input.widthFt);
  const height = nonNegative(input.heightFt);
  const floorAreaSqFt = length * width;
  const perimeterFt = 2 * (length + width);
  return {
    floorAreaSqFt: round(floorAreaSqFt),
    perimeterFt: round(perimeterFt),
    wallAreaSqFt: round(perimeterFt * height),
    volumeCuFt: round(floorAreaSqFt * height),
  };
}

export function calculateMaterialQuantity(baseQuantity: number, wastePercent: number): MaterialQuantity {
  const base = nonNegative(baseQuantity);
  const waste = Math.min(100, nonNegative(wastePercent));
  return {
    baseQuantity: round(base),
    wastePercent: round(waste),
    quantityWithWaste: round(base * (1 + waste / 100)),
  };
}

export function measurementEvidenceLabel(evidence: MeasurementEvidence) {
  switch (evidence) {
    case "measured":
      return "Device measured";
    case "customer_confirmed":
      return "Customer confirmed";
    case "estimated":
      return "Estimated";
    default:
      return "Needs professional verification";
  }
}

export function canRepresentAsVerifiedMeasurement(evidence: MeasurementEvidence) {
  return evidence === "measured" || evidence === "customer_confirmed";
}
