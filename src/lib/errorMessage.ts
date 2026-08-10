export function errorMessage(reason: unknown, fallback: string) {
  if (reason instanceof Error && reason.message) return cleanMessage(reason.message, fallback);

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
    return cleanMessage(reason.message, fallback);
  }

  return fallback;
}

function cleanMessage(message: string, fallback: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("duplicate key")) return "A matching active record already exists.";
  if (normalized.includes("row-level security") || normalized.includes("permission denied")) {
    return "You do not have permission to perform this action.";
  }
  if (normalized.includes("invalid input syntax") || normalized.includes("violates check constraint")) {
    return "One of the submitted values is invalid.";
  }
  if (message.length > 240 || normalized.includes("sqlstate") || normalized.includes("postgres")) return fallback;
  return message;
}
