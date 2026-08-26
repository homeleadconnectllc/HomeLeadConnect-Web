import { getCurrentWorkspaceId, supabase } from "./client";

export type HlcCalendarEventType = "meeting" | "reminder" | "task" | "focus" | "other";
export type HlcCalendarEventStatus = "scheduled" | "completed" | "cancelled";

export type HlcCalendarEvent = {
  id: string;
  workspace_id: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string;
  all_day: boolean;
  event_type: HlcCalendarEventType;
  status: HlcCalendarEventStatus;
  linked_type: string | null;
  linked_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

const calendarColumns =
  "id,workspace_id,title,description,start_at,end_at,all_day,event_type,status,linked_type,linked_id,created_by,created_at,updated_at";

export async function listHlcCalendarEvents(): Promise<HlcCalendarEvent[]> {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase
    .from("hlc_calendar_events")
    .select(calendarColumns)
    .eq("workspace_id", workspaceId)
    .order("start_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as HlcCalendarEvent[];
}

export async function createHlcCalendarEvent(input: {
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  allDay?: boolean;
  eventType?: HlcCalendarEventType;
}): Promise<HlcCalendarEvent> {
  const workspaceId = await getCurrentWorkspaceId();
  if (!input.title.trim()) throw new Error("Add an event title.");
  if (new Date(input.endAt).getTime() <= new Date(input.startAt).getTime()) {
    throw new Error("Event end time must be after the start time.");
  }

  const { data, error } = await supabase
    .from("hlc_calendar_events")
    .insert({
      workspace_id: workspaceId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      start_at: input.startAt,
      end_at: input.endAt,
      all_day: Boolean(input.allDay),
      event_type: input.eventType ?? "meeting",
    })
    .select(calendarColumns)
    .single();

  if (error) throw error;
  return data as HlcCalendarEvent;
}

export async function setHlcCalendarEventStatus(
  eventId: string,
  status: HlcCalendarEventStatus,
): Promise<HlcCalendarEvent> {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase
    .from("hlc_calendar_events")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("workspace_id", workspaceId)
    .eq("id", eventId)
    .select(calendarColumns)
    .single();

  if (error) throw error;
  return data as HlcCalendarEvent;
}

export async function deleteHlcCalendarEvent(eventId: string): Promise<void> {
  const workspaceId = await getCurrentWorkspaceId();
  const { error } = await supabase
    .from("hlc_calendar_events")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("id", eventId);

  if (error) throw error;
}
