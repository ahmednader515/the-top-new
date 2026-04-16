import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { PaymentSuccessRedirect } from "./payment-success-redirect";

function SuccessFallback() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6" dir="rtl">
      <Loader2 className="h-8 w-8 animate-spin text-brand" aria-hidden />
      <p className="text-sm text-muted-foreground">جاري التحميل...</p>
    </div>
  );
}

export default function FawaterakSuccessPage() {
  return (
    <Suspense fallback={<SuccessFallback />}>
      <PaymentSuccessRedirect />
    </Suspense>
  );
}
