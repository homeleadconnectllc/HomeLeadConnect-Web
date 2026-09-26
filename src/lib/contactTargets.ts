export function normalizePhoneTarget(value: string | null | undefined) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const hasLeadingPlus = raw.startsWith("+");
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return `${hasLeadingPlus ? "+" : ""}${digits}`;
}

export function phoneHref(value: string | null | undefined) {
  const target = normalizePhoneTarget(value);
  return target ? `tel:${target}` : "";
}

export function smsHref(value: string | null | undefined) {
  const target = normalizePhoneTarget(value);
  return target ? `sms:${target}` : "";
}

export function normalizeEmailTarget(value: string | null | undefined) {
  return String(value ?? "").trim();
}

export function emailHref(value: string | null | undefined) {
  const target = normalizeEmailTarget(value);
  return target ? `mailto:${encodeURIComponent(target)}` : "";
}
