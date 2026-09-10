import { supabase } from "./client";

export type InternalNotificationEvent =
  | "resident_request.created"
  | "professional_application.created"
  | "partner_referral.created"
  | "message.incoming"
  | "appointment.scheduled"
  | "appointment.rescheduled"
  | "appointment.cancelled"
  | "appointment.no_show"
  | "follow_up.created"
  | "job.status_changed";

type DispatchInput = {
  eventType: InternalNotificationEvent;
  eventKey: string;
  verificationToken?: string | null;
};

/**
 * Best-effort internal alert dispatch. The canonical business write has already
 * succeeded before this function is called, so notification-provider failure
 * must never roll back or mask the business action.
 */
export async function dispatchInternalNotification(input: DispatchInput): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke("dispatch-internal-notification", {
      body: {
        eventType: input.eventType,
        eventKey: input.eventKey,
        verificationToken: input.verificationToken || null,
      },
    });
    if (error) console.warn("Internal notification dispatch failed", input.eventType, input.eventKey, error);
  } catch (error) {
    console.warn("Internal notification dispatch failed", input.eventType, input.eventKey, error);
  }
}
