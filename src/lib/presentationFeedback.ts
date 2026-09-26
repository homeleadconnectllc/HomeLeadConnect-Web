export type PresentationFeedbackTone = "progress" | "success" | "error" | "attention";

export type PresentationFeedbackPreferences = {
  enabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
};

export const PRESENTATION_FEEDBACK_STORAGE_KEY = "hlc-presentation-feedback";

export const defaultPresentationFeedbackPreferences: PresentationFeedbackPreferences = {
  enabled: true,
  quietHoursEnabled: true,
  quietHoursStart: "21:00",
  quietHoursEnd: "08:00",
};

function minuteOfDay(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0;
  return Math.max(0, Math.min(1439, (hours * 60) + minutes));
}

export function isInsideQuietHours(preferences: PresentationFeedbackPreferences, date = new Date()) {
  if (!preferences.quietHoursEnabled) return false;
  const start = minuteOfDay(preferences.quietHoursStart);
  const end = minuteOfDay(preferences.quietHoursEnd);
  const now = (date.getHours() * 60) + date.getMinutes();
  if (start === end) return true;
  return start < end ? now >= start && now < end : now >= start || now < end;
}

export function loadPresentationFeedbackPreferences(): PresentationFeedbackPreferences {
  if (typeof window === "undefined") return defaultPresentationFeedbackPreferences;
  try {
    const stored = JSON.parse(window.localStorage.getItem(PRESENTATION_FEEDBACK_STORAGE_KEY) || "null") as Partial<PresentationFeedbackPreferences> | null;
    return stored ? { ...defaultPresentationFeedbackPreferences, ...stored } : defaultPresentationFeedbackPreferences;
  } catch {
    return defaultPresentationFeedbackPreferences;
  }
}

export function savePresentationFeedbackPreferences(preferences: PresentationFeedbackPreferences) {
  window.localStorage.setItem(PRESENTATION_FEEDBACK_STORAGE_KEY, JSON.stringify(preferences));
  window.dispatchEvent(new CustomEvent("hlc:presentation-feedback-preferences", { detail: preferences }));
}

export function classifyPresentationFeedback(element: HTMLElement): PresentationFeedbackTone | null {
  const text = element.textContent?.trim().toLowerCase() || "";
  const declaredTone = element.dataset.tone;
  if (element.getAttribute("role") === "alert" || declaredTone === "error" || element.classList.contains("is-error") || /\b(failed|failure|unable|error|blocked|declined|rejected)\b/.test(text)) return "error";
  if (declaredTone === "success" || element.classList.contains("is-success") || /\b(saved|success|succeeded|completed|received|published|accepted|recorded)\b/.test(text)) return "success";
  if (/\b(attention|required|warning|overdue|retry)\b/.test(text)) return "attention";
  if (/\b(queued|processing|running|loading|checking|sending|submitting)\b/.test(text)) return "progress";
  return null;
}
