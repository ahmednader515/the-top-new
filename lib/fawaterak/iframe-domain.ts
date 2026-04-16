/**
 * fawaterkPlugin sends header `FAWATERAK-DOMAIN: https://` + window.location.hostname.
 * The HMAC `Domain=` value must match what Fawaterak validates against that header.
 */

/** Client should POST `https://${window.location.hostname}` (no path, no trailing slash). */
export function parseClientIframeDomain(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== "https:") return null;
    if (!u.hostname || u.hostname.length > 253) return null;
    return `https://${u.hostname}`;
  } catch {
    return null;
  }
}

/**
 * Some portals expect `Domain=hostname` only (no scheme) in the HMAC string — try
 * FAWATERAK_HMAC_DOMAIN_MODE=hostname if you still get 400 after fixing hostname match.
 */
export function formatDomainStringForIframeHmac(canonicalHttpsDomain: string): string {
  const mode = process.env.FAWATERAK_HMAC_DOMAIN_MODE?.trim().toLowerCase();
  if (mode === "hostname") {
    try {
      return new URL(canonicalHttpsDomain).hostname;
    } catch {
      return canonicalHttpsDomain;
    }
  }
  return canonicalHttpsDomain;
}
