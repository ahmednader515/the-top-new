/**
 * Allowed relative paths after Fawaterak success (avoid open redirects).
 */
export function sanitizeInternalNextPath(raw: unknown, fallback: string): string {
  if (typeof raw !== "string" || raw.length === 0) {
    return fallback;
  }
  if (!raw.startsWith("/") || raw.startsWith("//")) {
    return fallback;
  }
  if (raw.includes("://")) {
    return fallback;
  }
  return raw;
}
