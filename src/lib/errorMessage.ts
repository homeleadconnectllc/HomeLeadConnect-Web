export function errorMessage(reason: unknown, fallback: string) {
  if (
    reason
    && typeof reason === "object"
    && "message" in reason
    && typeof reason.message === "string"
    && reason.message
  ) {
    const code = "code" in reason && typeof reason.code === "string" ? reason.code : "";
    if (code === "23505") return "A matching active record already exists.";
    if (code === "42501") return "You do not have permission to perform this action.";
    if (code === "22P02") return "One of the submitted values is invalid.";
    if (code === "PGRST116") return "The requested record was not found or is no longer available.";
    // Database diagnostics can contain SQL and private schema details.
    if (/^(?:PGRST|[0-9A-Z]{5}$)/i.test(code)) return SERVICE_UNAVAILABLE;
    return cleanMessage(reason.message, fallback);
  }

  return fallback;
}

const SERVICE_UNAVAILABLE = "Service temporarily unavailable. Please try again.";

function cleanMessage(message: string, fallback: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid api key")) {
    return SERVICE_UNAVAILABLE;
  }
  if (normalized.includes("duplicate key")) return "A matching active record already exists.";
  if (normalized.includes("row-level security") || normalized.includes("permission denied")) {
    return "You do not have permission to perform this action.";
  }
  if (normalized.includes("invalid input syntax") || normalized.includes("violates check constraint")) {
    return "One of the submitted values is invalid.";
  }
  if (/\b(?:column|relation|schema|table|function|constraint)\b.*\b(?:does not exist|not found|missing|cache|violat)/i.test(message)
    || /\b(?:sqlstate|postgres|postgrest|supabase|pgrst\d+|database error|syntax error at|query failed|could not find the .*column|failed to fetch)\b/i.test(message)) {
    return SERVICE_UNAVAILABLE;
  }
  if (message.length > 240) return fallback;
  return message;
}
