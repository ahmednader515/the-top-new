"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CreditCard, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const PLUGIN_SRC = "https://app.fawaterk.com/fawaterkPlugin/fawaterkPlugin.min.js";

type SessionResponse = {
  /** Bearer token for getPaymentmethods — required by fawaterkPlugin (same as dashboard API key). */
  token: string;
  envType: "test" | "live";
  hashKey: string;
  style: { listing: "horizontal" | "vertical" };
  version: string;
  requestBody: Record<string, unknown>;
};

declare global {
  interface Window {
    /** Fawaterak’s script expects this global (see official iframe docs: `var pluginConfig = {...}`). */
    pluginConfig?: Record<string, unknown>;
    fawaterkCheckout?: (config?: Record<string, unknown>) => void;
  }
}

function loadFawaterkScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("no window"));
      return;
    }
    if (window.fawaterkCheckout) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${PLUGIN_SRC}"]`);
    if (existing) {
      if (window.fawaterkCheckout) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("فشل تحميل بوابة الدفع")));
      return;
    }
    const script = document.createElement("script");
    script.src = PLUGIN_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("فشل تحميل بوابة الدفع"));
    document.body.appendChild(script);
  });
}

async function waitForCheckoutFn(maxMs = 20000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    if (typeof window !== "undefined" && typeof window.fawaterkCheckout === "function") {
      return;
    }
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error("timeout");
}

export function FawaterakPaymentClient() {
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"form" | "checkout">("form");
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutPayload, setCheckoutPayload] = useState<SessionResponse | null>(null);
  const [hostname, setHostname] = useState<string | null>(null);

  useEffect(() => {
    setHostname(window.location.hostname);
  }, []);

  useEffect(() => {
    if (step !== "checkout" || !checkoutPayload) return;
    const timer = window.setTimeout(() => {
      if (typeof window.fawaterkCheckout !== "function") {
        toast.error("لم يتم العثور على دالة الدفع");
        return;
      }
      const pluginConfig: Record<string, unknown> = {
        token: checkoutPayload.token,
        envType: checkoutPayload.envType,
        hashKey: checkoutPayload.hashKey,
        style: checkoutPayload.style,
        version: checkoutPayload.version,
        requestBody: checkoutPayload.requestBody,
      };
      // Minified plugin references global `pluginConfig` by name (same as docs’ `var pluginConfig = {...}`).
      window.pluginConfig = pluginConfig;
      globalThis.pluginConfig = pluginConfig;
      window.fawaterkCheckout(pluginConfig);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      delete window.pluginConfig;
      delete globalThis.pluginConfig;
    };
  }, [step, checkoutPayload]);

  const onContinue = useCallback(async () => {
    const parsed = parseFloat(amount.replace(/,/g, "."));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error("أدخل مبلغاً صحيحاً");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/payments/fawaterak/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsed,
          // Must match fawaterkPlugin header `FAWATERAK-DOMAIN: https://` + location.hostname
          iframeDomain: `https://${window.location.hostname}`,
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "تعذر بدء الدفع");
      }
      const data = (await res.json()) as SessionResponse;
      if (!data.token?.trim() || !data.hashKey?.trim()) {
        throw new Error("إعدادات الدفع غير مكتملة من الخادم");
      }

      await loadFawaterkScript();
      await waitForCheckoutFn();

      setCheckoutPayload(data);
      setStep("checkout");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "حدث خطأ";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [amount]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6" dir="rtl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">شحن الرصيد</h1>
          <p className="text-sm text-muted-foreground">
            الدفع عبر Fawaterak — اختر طريقة الدفع داخل الإطار أدناه.
          </p>
        </div>
        <Button variant="outline" asChild size="sm">
          <Link href="/dashboard/subscriptions">
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة للاشتراكات
          </Link>
        </Button>
      </div>

      <Alert className="border-brand/25 bg-muted/30" dir="rtl">
        <Info className="h-4 w-4" />
        <AlertTitle className="text-sm">إذا ظهرت رسالة «Invalid Token or inactive vendor»</AlertTitle>
        <AlertDescription className="text-xs text-muted-foreground space-y-2">
          <p>
            مفتاح الـ API يجب أن يكون من <strong>نفس بيئة</strong> التشغيل: الافتراضي{" "}
            <code className="rounded bg-muted px-1">FAWATERAK_ENV=test</code> يستخدم{" "}
            <span dir="ltr">staging.fawaterk.com</span> — انسخ المفتاح من{" "}
            <strong>البيئة التجريبية</strong>. إذا كان مفتاحك من لوحة الإنتاج فاضبط{" "}
            <code className="rounded bg-muted px-1">FAWATERAK_ENV=live</code>.
          </p>
          <p>
            تأكد أن حقل <strong>IFRAM Domains</strong> في لوحة Fawaterak يحتوي على{" "}
            <strong>نفس النطاق الذي تفتحه في المتصفح</strong> (مثلاً{" "}
            <span dir="ltr" className="whitespace-nowrap">
              https://thetop-lms.vercel.app
            </span>{" "}
            بدون شرطة مائلة في النهاية، كما في الوثائق). أضف منفصلةً{" "}
            <span dir="ltr" className="whitespace-nowrap">
              https://localhost
            </span>{" "}
            إذا كنت تختبر على الجهاز محلياً.
          </p>
          <p>
            تأكد أن <code className="rounded bg-muted px-1">FAWATERAK_PROVIDER_KEY</code> مطابق لـ{" "}
            <span dir="ltr">providerKey</span> في لوحة التحكم، وأعد نسخ مفتاح الـ API حرفياً (تأكد من عدم
            الخلط بين الرقم <span dir="ltr">5</span> والحرف <span dir="ltr">s</span> في النسخ).
          </p>
        </AlertDescription>
      </Alert>

      {hostname === "localhost" && (
        <Alert dir="rtl" className="border-amber-600/50 bg-amber-500/10 text-foreground">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-sm text-amber-900 dark:text-amber-100">
            التطوير على localhost
          </AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground space-y-1">
            <p>
              الإضافة ترسل للخادم النطاق:{" "}
              <code dir="ltr" className="rounded bg-muted px-1">
                https://localhost
              </code>
              . يجب إضافة هذا العنوان بالضبط في{" "}
              <strong>Integrations → IFRAM Domains</strong> في Fawaterak، أو افتح الموقع من نفس{" "}
              <strong>نطاق الإنتاج</strong> المسجّل (مثلاً{" "}
              <span dir="ltr">thetop-lms.vercel.app</span>) بدلاً من localhost.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {step === "form" && (
        <Card className="border-brand/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-5 w-5 text-brand" />
              المبلغ
            </CardTitle>
            <CardDescription>
              أدخل المبلغ بالجنيه المصري، ثم اضغط متابعة لعرض طرق الدفع.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">المبلغ (جنيه)</Label>
              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                min={1}
                step="0.01"
                placeholder="مثال: 500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg font-semibold"
                dir="ltr"
              />
            </div>
            <Button
              type="button"
              className={cn("w-full bg-brand text-white hover:bg-brand/90")}
              size="lg"
              disabled={isLoading}
              onClick={() => void onContinue()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  جاري التحميل...
                </>
              ) : (
                "متابعة الدفع"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "checkout" && (
        <Card className="border-brand/20 overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-base">إتمام الدفع</CardTitle>
            <CardDescription>
              اختر طريقة الدفع من القائمة. بعد النجاح يُحدَّث رصيدك تلقائياً خلال لحظات.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div
              id="fawaterkDivId"
              className="min-h-[420px] w-full bg-background"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
