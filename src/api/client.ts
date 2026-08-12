import { requireSupabaseConfig, supabase } from "../lib/supabase";

export { supabase };

export async function getCurrentWorkspaceId(): Promise<string> {
  requireSupabaseConfig();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!authData.user) throw new Error("You must be signed in.");

  const { data, error } = await supabase
    .from("profiles")
    .select("workspace_id")
    .eq("user_id", authData.user.id)
    .single();

  if (error) throw error;
  if (!data?.workspace_id) throw new Error("Your profile has no workspace.");

  return data.workspace_id as string;
}
