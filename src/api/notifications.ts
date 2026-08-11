import { supabase } from "./client";

export type NotificationRecord = {
  id: string;
  notification_type: string;
  title: string;
  body: string;
  deep_link: string;
  created_at: string;
  read_at: string | null;
};

export async function listNotifications() {
  const { data, error } = await supabase.from("notifications")
    .select("id,notification_type,title,body,deep_link,created_at,read_at")
    .order("created_at", { ascending: false }).limit(100);
  if (error) throw error;
  return (data ?? []) as NotificationRecord[];
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}
