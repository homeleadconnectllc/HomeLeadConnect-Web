import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateMaterialQuantity,
  calculateRoomMeasurements,
  canRepresentAsVerifiedMeasurement,
  inchesToFeet,
  measurementEvidenceLabel,
} from "./measurements";

test("room measurement math derives floor, perimeter, wall area, and volume", () => {
  assert.deepEqual(calculateRoomMeasurements({ lengthFt: 12, widthFt: 10, heightFt: 8 }), {
    floorAreaSqFt: 120,
    perimeterFt: 44,
    wallAreaSqFt: 352,
    volumeCuFt: 960,
  });
});

test("material quantity adds bounded waste", () => {
  assert.deepEqual(calculateMaterialQuantity(120, 10), {
    baseQuantity: 120,
    wastePercent: 10,
    quantityWithWaste: 132,
  });
  assert.equal(calculateMaterialQuantity(100, 500).wastePercent, 100);
});

test("invalid negative measurement input fails safely to zero", () => {
  assert.deepEqual(calculateRoomMeasurements({ lengthFt: -1, widthFt: Number.NaN, heightFt: 8 }), {
    floorAreaSqFt: 0,
    perimeterFt: 0,
    wallAreaSqFt: 0,
    volumeCuFt: 0,
  });
  assert.equal(inchesToFeet(-12), 0);
});

test("measurement evidence never calls an estimate a device measurement", () => {
  assert.equal(measurementEvidenceLabel("measured"), "Device measured");
  assert.equal(measurementEvidenceLabel("estimated"), "Estimated");
  assert.equal(canRepresentAsVerifiedMeasurement("measured"), true);
  assert.equal(canRepresentAsVerifiedMeasurement("customer_confirmed"), true);
  assert.equal(canRepresentAsVerifiedMeasurement("estimated"), false);
  assert.equal(canRepresentAsVerifiedMeasurement("needs_professional_verification"), false);
});
