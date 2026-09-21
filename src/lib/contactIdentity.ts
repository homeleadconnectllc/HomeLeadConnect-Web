import { normalizeEmailTarget, normalizePhoneTarget } from "./contactTargets";

export type ContactEndpointKind = "phone" | "email";

export type CanonicalContactEndpoint = {
  kind: ContactEndpointKind;
  value: string;
  canonicalKey: string;
};

export type ContactIdentityCandidate = {
  personId: string;
  phones?: Array<string | null | undefined>;
  emails?: Array<string | null | undefined>;
};

export type ContactIdentityResolution =
  | { status: "unmatched"; endpoint: CanonicalContactEndpoint; personIds: [] }
  | { status: "matched"; endpoint: CanonicalContactEndpoint; personIds: [string] }
  | { status: "ambiguous"; endpoint: CanonicalContactEndpoint; personIds: string[] };

function canonicalPhone(value: string | null | undefined) {
  const normalized = normalizePhoneTarget(value);
  if (!normalized) return "";
  const digits = normalized.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return normalized.startsWith("+") ? `+${digits}` : digits;
}

function canonicalEmail(value: string | null | undefined) {
  const normalized = normalizeEmailTarget(value);
  if (!normalized || /[\r\n]/.test(normalized)) return "";
  const at = normalized.lastIndexOf("@");
  if (at <= 0 || at === normalized.length - 1) return "";
  return normalized.toLocaleLowerCase("en-US");
}

export function canonicalizeContactEndpoint(kind: ContactEndpointKind, value: string | null | undefined): CanonicalContactEndpoint | null {
  const canonical = kind === "phone" ? canonicalPhone(value) : canonicalEmail(value);
  if (!canonical) return null;
  return { kind, value: canonical, canonicalKey: `${kind}:${canonical}` };
}

export function resolveContactIdentity(
  kind: ContactEndpointKind,
  value: string | null | undefined,
  candidates: ContactIdentityCandidate[],
): ContactIdentityResolution | null {
  const endpoint = canonicalizeContactEndpoint(kind, value);
  if (!endpoint) return null;

  const personIds = [...new Set(candidates.flatMap((candidate) => {
    const values = kind === "phone" ? candidate.phones ?? [] : candidate.emails ?? [];
    return values.some((candidateValue) => canonicalizeContactEndpoint(kind, candidateValue)?.canonicalKey === endpoint.canonicalKey)
      ? [candidate.personId]
      : [];
  }))];

  if (personIds.length === 0) return { status: "unmatched", endpoint, personIds: [] };
  if (personIds.length === 1) return { status: "matched", endpoint, personIds: [personIds[0]] };
  return { status: "ambiguous", endpoint, personIds };
}

export function requireUnambiguousContactIdentity(resolution: ContactIdentityResolution | null) {
  if (!resolution) throw new Error("A valid contact endpoint is required.");
  if (resolution.status === "ambiguous") {
    throw new Error("This contact endpoint matches more than one person and must be resolved before continuing.");
  }
  return resolution;
}
