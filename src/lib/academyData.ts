import { supabase } from "./supabase";

export type AcademyAttempt = {
  id: string;
  module_id: string;
  activity_type: "lesson" | "practice" | "simulation" | "assessment";
  attempt_number: number;
  completed: boolean;
  score: number | null;
  threshold: number | null;
  xp_awarded: number;
  created_at: string;
};

export type AcademyCertification = {
  id: string;
  module_id: string;
  assessment_id: string;
  score: number;
  threshold: number;
  teacher: "kendrell" | "dion" | "diamond";
  assessed_at: string;
  expires_at: string | null;
};

export type AcademySnapshot = {
  xpTotal: number;
  attempts: AcademyAttempt[];
  certifications: AcademyCertification[];
};

export async function loadAcademySnapshot(): Promise<AcademySnapshot> {
  const [progress, attempts, certifications] = await Promise.all([
    supabase.from("academy_progress").select("xp_total").maybeSingle(),
    supabase.from("academy_attempts").select("id,module_id,activity_type,attempt_number,completed,score,threshold,xp_awarded,created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("academy_certifications").select("id,module_id,assessment_id,score,threshold,teacher,assessed_at,expires_at").order("assessed_at", { ascending: false }).limit(50),
  ]);

  const error = progress.error ?? attempts.error ?? certifications.error;
  if (error) throw error;

  return {
    xpTotal: Number(progress.data?.xp_total ?? 0),
    attempts: (attempts.data ?? []) as AcademyAttempt[],
    certifications: (certifications.data ?? []) as AcademyCertification[],
  };
}

export async function recordAcademyActivity(input: {
  moduleId: string;
  activityType: "lesson" | "practice" | "simulation";
  completed?: boolean;
  score?: number | null;
  threshold?: number | null;
  assessmentId?: string | null;
  teacher?: "kendrell" | "dion" | "diamond" | null;
}) {
  const { data, error } = await supabase.rpc("academy_record_activity", {
    p_module_id: input.moduleId,
    p_activity_type: input.activityType,
    p_completed: input.completed ?? true,
    p_score: input.score ?? null,
    p_threshold: input.threshold ?? null,
    p_assessment_id: input.assessmentId ?? null,
    p_teacher: input.teacher ?? null,
  });
  if (error) throw error;
  return data as {
    module_id: string;
    activity_type: string;
    attempt_number: number;
    xp_awarded: number;
    certified: boolean;
  };
}
