import type { CommunicationPurpose, ComplianceResult, ManualCommunicationTransport } from "../api/manualCommunications";

const STORAGE_KEY = "hlc.pending.manual-call.v1";
const MAX_PENDING_AGE_MS = 12 * 60 * 60 * 1000;

export const quickCallOutcomes = [
  { label: "Reached customer", followUp: false },
  { label: "No answer", followUp: true },
  { label: "Left voicemail", followUp: true },
  { label: "Callback requested", followUp: true },
  { label: "Appointment scheduled", followUp: false },
  { label: "Not interested", followUp: false },
] as const;

export type PendingManualCall = {
  contactKey: string;
  transport: ManualCommunicationTransport;
  purpose: CommunicationPurpose;
  complianceCheck: ComplianceResult;
  conversationId: string;
  requestId: string;
  startedAt: number;
};

export function savePendingManualCall(call: PendingManualCall) {
  if (typeof window !== "undefined") window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(call));
}

export function clearPendingManualCall() {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(STORAGE_KEY);
}

export function readPendingManualCall(now = Date.now()): PendingManualCall | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as PendingManualCall;
    if (!value.contactKey || !value.requestId || !value.complianceCheck?.id || now - value.startedAt > MAX_PENDING_AGE_MS) {
      clearPendingManualCall();
      return null;
    }
    return value;
  } catch {
    clearPendingManualCall();
    return null;
  }
}

export function shouldPromptForReturnedCall(call: PendingManualCall | null, now = Date.now()) {
  return Boolean(call && now - call.startedAt >= 1_000 && now - call.startedAt <= MAX_PENDING_AGE_MS);
}

export function suggestedFollowUpLocal(now = new Date()) {
  const followUp = new Date(now);
  followUp.setDate(followUp.getDate() + 1);
  followUp.setSeconds(0, 0);
  const local = new Date(followUp.getTime() - followUp.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}
