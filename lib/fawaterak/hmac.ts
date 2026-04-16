import crypto from "crypto";

/**
 * Iframe checkout hash (Fawaterak docs: HMAC-SHA256 over Domain + ProviderKey).
 * `domain` must match the plugin’s `FAWATERAK-DOMAIN` / dashboard iframe settings (often `https://your-hostname`).
 */
export function generateIframeHashKey(
  vendorKey: string,
  domain: string,
  providerKey: string
): string {
  const queryParam = `Domain=${domain}&ProviderKey=${providerKey}`;
  return crypto.createHmac("sha256", vendorKey).update(queryParam).digest("hex");
}

/**
 * Paid webhook hash verification (Fawaterak web-hook docs).
 */
export function generatePaidWebhookHashKey(
  vendorKey: string,
  invoiceId: number,
  invoiceKey: string,
  paymentMethod: string
): string {
  const queryParam = `InvoiceId=${invoiceId}&InvoiceKey=${invoiceKey}&PaymentMethod=${paymentMethod}`;
  return crypto.createHmac("sha256", vendorKey).update(queryParam).digest("hex");
}

export function timingSafeEqualHex(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "hex");
    const bufB = Buffer.from(b, "hex");
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}
