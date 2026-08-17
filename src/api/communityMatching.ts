import { getCurrentWorkspaceId, supabase } from "./client";

export type CommunityMatchDecision = {
  contractor_id: number;
  decision: "like" | "pass";
  updated_at: string;
};

export async function listCommunityMatchDecisions(): Promise<CommunityMatchDecision[]> {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase
    .from("community_match_decisions")
    .select("contractor_id,decision,updated_at")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CommunityMatchDecision[];
}

export async function setCommunityMatchDecision(contractorId: number, decision: "like" | "pass") {
  const workspaceId = await getCurrentWorkspaceId();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error("Sign in to use Community Matching.");

  const { error } = await supabase
    .from("community_match_decisions")
    .upsert({
      workspace_id: workspaceId,
      user_id: user.id,
      contractor_id: contractorId,
      decision,
      updated_at: new Date().toISOString(),
    }, { onConflict: "workspace_id,user_id,contractor_id" });
  if (error) throw error;
}

export async function clearCommunityPassDecisions() {
  const workspaceId = await getCurrentWorkspaceId();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error("Sign in to use Community Matching.");

  const { error } = await supabase
    .from("community_match_decisions")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .eq("decision", "pass");
  if (error) throw error;
}
