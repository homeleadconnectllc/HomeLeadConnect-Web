import assert from "node:assert/strict";
import test from "node:test";
import { classifyPresentationFeedback, defaultPresentationFeedbackPreferences, isInsideQuietHours } from "./presentationFeedback.ts";

function element(text: string, options: { role?: string; tone?: string; className?: string } = {}) {
  return {
    textContent: text,
    dataset: { tone: options.tone },
    getAttribute: (name: string) => name === "role" ? options.role ?? null : null,
    classList: { contains: (name: string) => options.className?.split(" ").includes(name) ?? false },
  } as unknown as HTMLElement;
}

test("quiet hours support an overnight device-local window", () => {
  const preferences = { ...defaultPresentationFeedbackPreferences, quietHoursStart: "21:00", quietHoursEnd: "08:00" };
  assert.equal(isInsideQuietHours(preferences, new Date(2026, 8, 22, 22, 15)), true);
  assert.equal(isInsideQuietHours(preferences, new Date(2026, 8, 22, 7, 30)), true);
  assert.equal(isInsideQuietHours(preferences, new Date(2026, 8, 22, 13, 0)), false);
});

test("presentation feedback distinguishes progress from persisted completion", () => {
  assert.equal(classifyPresentationFeedback(element("Automation queued.", { role: "status", tone: "progress" })), "progress");
  assert.equal(classifyPresentationFeedback(element("Automation succeeded.", { role: "status", tone: "success" })), "success");
  assert.equal(classifyPresentationFeedback(element("Automation failed.", { role: "alert" })), "error");
});

test("a generic notification is not treated as workflow success", () => {
  assert.equal(classifyPresentationFeedback(element("You have a new notification.", { role: "status" })), null);
});
