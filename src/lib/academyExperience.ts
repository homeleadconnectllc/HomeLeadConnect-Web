export const ACADEMY_ROUTES = {
  home: "/academy",
  paths: "/academy/paths",
  certifications: "/academy/certifications",
  progress: "/academy/progress",
  roleplay: "/academy/roleplay",
  library: "/academy/library",
  practicePrefix: "/academy/practice/",
} as const;

export type AcademyTeacher = "kendrell" | "dion" | "diamond";
export type AcademyAudience = "resident" | "professional" | "manager" | "owner";
export type AcademyProgressStage = "learn" | "practice" | "simulate" | "certify" | "apply" | "progress";

export const ACADEMY_PROGRESS_SEQUENCE: readonly AcademyProgressStage[] = [
  "learn",
  "practice",
  "simulate",
  "certify",
  "apply",
  "progress",
];

export type AcademyTrack = {
  id: string;
  title: string;
  teacher: AcademyTeacher;
  audiences: readonly AcademyAudience[];
  description: string;
};

export const ACADEMY_TRACKS: readonly AcademyTrack[] = [
  {
    id: "customer-care",
    title: "Customer Care & Community",
    teacher: "diamond",
    audiences: ["resident", "professional", "manager", "owner"],
    description: "Communication, reviews, referrals, onboarding, Community conduct, and customer recovery.",
  },
  {
    id: "operations",
    title: "Operations & Service Delivery",
    teacher: "dion",
    audiences: ["professional", "manager", "owner"],
    description: "CRM workflow, scheduling, service matching, scripts, providers, analytics, and call-center execution.",
  },
  {
    id: "leadership-compliance",
    title: "Leadership, Risk & Compliance",
    teacher: "kendrell",
    audiences: ["manager", "owner"],
    description: "Approvals, escalation, governance, compliance, risk, and responsible operating decisions.",
  },
] as const;

// Lower-case alias retained for consumers created during the E2 wiring pass.
export const academyTracks: readonly AcademyTrack[] = ACADEMY_TRACKS;

export type AcademyActivityKind = "lesson" | "practice" | "simulation" | "assessment" | "application";

const XP_BY_ACTIVITY: Record<AcademyActivityKind, number> = {
  lesson: 10,
  practice: 20,
  simulation: 30,
  assessment: 40,
  application: 50,
};

export type AcademyAwardInput = {
  kind: AcademyActivityKind;
  completed: boolean;
  attemptNumber: number;
  verifiedOutcome?: boolean;
};

export function academyXpAward(input: AcademyAwardInput) {
  if (!input.completed) return 0;
  if (input.attemptNumber < 1) return 0;
  if (input.kind === "application" && !input.verifiedOutcome) return 0;

  const base = XP_BY_ACTIVITY[input.kind];
  // Repeated attempts may teach, but cannot be farmed indefinitely for progress currency.
  if (input.attemptNumber === 1) return base;
  if (input.attemptNumber === 2) return Math.floor(base * 0.25);
  return 0;
}

export type CertificationEvidence = {
  assessmentId: string;
  score: number;
  threshold: number;
  assessedAt: string;
  teacher: AcademyTeacher;
  expiresAt?: string | null;
};

export function qualifiesForAcademyCertification(evidence: CertificationEvidence) {
  return Boolean(
    evidence.assessmentId.trim()
      && Number.isFinite(evidence.score)
      && Number.isFinite(evidence.threshold)
      && evidence.threshold > 0
      && evidence.score >= evidence.threshold
      && evidence.assessedAt.trim(),
  );
}

export const ACADEMY_TRUST_BOUNDARIES = {
  certificationIsInternalCompetency: true,
  externalLicenseMustRemainDistinct: true,
  attendanceIsNotCertification: true,
  xpIsNotTrustScore: true,
  communityPopularityIsNotCompetency: true,
} as const;
