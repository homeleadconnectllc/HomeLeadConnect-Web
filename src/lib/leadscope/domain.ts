export type EvidenceState =
  | "known"
  | "unknown"
  | "assumption"
  | "unverifiable";

export class EvidenceContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EvidenceContractError";
  }
}

export type PropertyEvidence<T = unknown> = {
  value: T | null;
  state: EvidenceState;
  source?: string;
  note?: string;
};

function validateEvidence(evidence: PropertyEvidence): void {
  if (evidence.state === "known" && evidence.value === null) {
    throw new EvidenceContractError(
      "Known evidence must contain a non-null value.",
    );
  }

  if (
    (evidence.state === "unknown" || evidence.state === "unverifiable") &&
    evidence.value !== null
  ) {
    throw new EvidenceContractError(
      `${evidence.state} evidence must have a null value.`,
    );
  }
}

export type EvidenceQuality = {
  total: number;
  known: number;
  unknown: number;
  assumption: number;
  unverifiable: number;
  knownRatio: number;
};

export type SiteAssessmentDetermination =
  | "supported"
  | "insufficient_evidence"
  | "undetermined";

export type QualificationReadiness =
  | "ready_for_domain_review"
  | "not_ready"
  | "undetermined";

export type PropertyIntelligenceProfile = {
  leadId: string;
  workspaceId: string;
  propertyAddress: PropertyEvidence<string>;
  propertyType: PropertyEvidence<string>;
  measurements: PropertyEvidence<Record<string, number>>;
  siteConditions: PropertyEvidence<string>;
  scopeDescription: PropertyEvidence<string>;
  siteAssessment: SiteAssessmentDetermination;
  qualificationReadiness: QualificationReadiness;
};

export function createEvidence<T>(
  value: T | null,
  state: EvidenceState,
  options?: {
    source?: string;
    note?: string;
  },
): PropertyEvidence<T> {
  const evidence = {
    value,
    state,
    ...options,
  };

  validateEvidence(evidence);

  return evidence;
}

export function calculateEvidenceQuality(
  evidence: Array<PropertyEvidence | undefined>,
): EvidenceQuality {
  const assessed = evidence.filter(
    (item): item is PropertyEvidence => item !== undefined,
  );

  assessed.forEach(validateEvidence);

  const total = assessed.length;
  const known = assessed.filter((item) => item.state === "known").length;
  const unknown = assessed.filter((item) => item.state === "unknown").length;
  const assumption = assessed.filter(
    (item) => item.state === "assumption",
  ).length;
  const unverifiable = assessed.filter(
    (item) => item.state === "unverifiable",
  ).length;

  return {
    total,
    known,
    unknown,
    assumption,
    unverifiable,
    knownRatio: total === 0 ? 0 : known / total,
  };
}

export function determineSiteAssessment(
  evidence: Array<PropertyEvidence | undefined>,
): SiteAssessmentDetermination {
  const assessed = evidence.filter(
    (item): item is PropertyEvidence => item !== undefined,
  );

  assessed.forEach(validateEvidence);

  if (assessed.length === 0) {
    return "undetermined";
  }

  if (
    assessed.some(
      (item) =>
        item.state === "unknown" ||
        item.state === "unverifiable",
    )
  ) {
    return "insufficient_evidence";
  }

  return "supported";
}

export function determineQualificationReadiness(
  evidence: Array<PropertyEvidence | undefined>,
): QualificationReadiness {
  const assessed = evidence.filter(
    (item): item is PropertyEvidence => item !== undefined,
  );

  assessed.forEach(validateEvidence);

  if (assessed.length === 0) {
    return "undetermined";
  }

  if (
    assessed.some(
      (item) =>
        item.state === "unknown" ||
        item.state === "unverifiable",
    )
  ) {
    return "not_ready";
  }

  if (assessed.every((item) => item.state === "known" || item.state === "assumption")) {
    return "ready_for_domain_review";
  }

  return "undetermined";
}

export function createPropertyIntelligenceProfile(input: {
  leadId: string;
  workspaceId: string;
  propertyAddress: PropertyEvidence<string>;
  propertyType: PropertyEvidence<string>;
  measurements: PropertyEvidence<Record<string, number>>;
  siteConditions: PropertyEvidence<string>;
  scopeDescription: PropertyEvidence<string>;
}): PropertyIntelligenceProfile {
  const evidence = [
    input.propertyAddress,
    input.propertyType,
    input.measurements,
    input.siteConditions,
    input.scopeDescription,
  ];

  evidence.forEach(validateEvidence);

  return {
    ...input,
    siteAssessment: determineSiteAssessment(evidence),
    qualificationReadiness:
      determineQualificationReadiness(evidence),
  };
}
