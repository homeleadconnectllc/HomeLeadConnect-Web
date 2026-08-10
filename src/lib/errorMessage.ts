export function errorMessage(reason: unknown, fallback: string) {
  if (reason instanceof Error && reason.message) return reason.message;

  if (
    reason
    && typeof reason === "object"
    && "message" in reason
    && typeof reason.message === "string"
    && reason.message
  ) {
    return reason.message;
  }

  return fallback;
}
