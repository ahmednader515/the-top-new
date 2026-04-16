const MIN_DEPOSIT_EGP = 1;
const MAX_DEPOSIT_EGP = 200_000;

/**
 * `FAWATERAK_VENDOR_KEY` = API key from Integrations → Fawaterak (same string as `Authorization: Bearer` in REST docs).
 * Alias: `FAWATERAK_API_KEY` if `FAWATERAK_VENDOR_KEY` is unset.
 */
export function getFawaterakSecrets() {
  const vendorKey =
    process.env.FAWATERAK_VENDOR_KEY?.trim() || process.env.FAWATERAK_API_KEY?.trim();
  const providerKey = process.env.FAWATERAK_PROVIDER_KEY?.trim();
  if (!vendorKey || !providerKey) {
    return null;
  }
  return { vendorKey, providerKey };
}

/**
 * Fallback when the client does not send `iframeDomain` — uses NEXT_PUBLIC_APP_URL or
 * FAWATERAK_IFRAME_DOMAIN (full `https://host`, no path).
 */
export function getFawaterakIframeDomainForHashFallback(): string {
  const override = process.env.FAWATERAK_IFRAME_DOMAIN?.trim();
  if (override) {
    const normalized = override.replace(/\/$/, "");
    const u = new URL(normalized.includes("://") ? normalized : `https://${normalized}`);
    return `https://${u.hostname}`;
  }
  const raw = process.env.NEXT_PUBLIC_APP_URL;
  if (!raw?.trim()) {
    throw new Error("NEXT_PUBLIC_APP_URL is not set");
  }
  const url = new URL(raw.trim());
  return `https://${url.hostname}`;
}

export function getPublicAppOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL;
  if (!raw?.trim()) {
    throw new Error("NEXT_PUBLIC_APP_URL is not set");
  }
  return raw.trim().replace(/\/$/, "");
}

/**
 * Must match where your API key was issued:
 * - `test` (default): iframe calls `staging.fawaterk.com` — use keys from your **staging / sandbox** Fawaterak account.
 * - `live`: iframe calls `app.fawaterk.com` — use keys from the **live** dashboard only.
 * If you see "Invalid Token or inactive vendor", you almost always have a test/live key mismatch or an inactive merchant account.
 */
export function getFawaterakEnvType(): "test" | "live" {
  const v = process.env.FAWATERAK_ENV?.toLowerCase();
  return v === "live" ? "live" : "test";
}

export function validateDepositAmount(amount: unknown): number | null {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return null;
  const rounded = Math.round(amount * 100) / 100;
  if (rounded < MIN_DEPOSIT_EGP || rounded > MAX_DEPOSIT_EGP) return null;
  return rounded;
}

export { MIN_DEPOSIT_EGP, MAX_DEPOSIT_EGP };
