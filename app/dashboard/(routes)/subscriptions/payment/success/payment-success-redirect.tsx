"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { sanitizeInternalNextPath } from "@/lib/fawaterak/success-redirect";

const DEFAULT_NEXT = "/dashboard/subscriptions";

/**
 * Full-window redirect after Fawaterak success (escapes nested iframe if any, then hard-navigates).
 */
export function PaymentSuccessRedirect() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const next = sanitizeInternalNextPath(searchParams.get("next"), DEFAULT_NEXT);
    const url = `${window.location.origin}${next}`;
    try {
      if (window.self !== window.top && window.top) {
        window.top.location.replace(url);
        return;
      }
    } catch {
      /* cross-origin top */
    }
    window.location.replace(url);
  }, [searchParams]);

  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6"
      dir="rtl"
    >
      <Loader2 className="h-8 w-8 animate-spin text-brand" aria-hidden />
      <p className="text-sm text-muted-foreground">تم الدفع — جاري التوجيه...</p>
    </div>
  );
}
