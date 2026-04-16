"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sanitizeInternalNextPath } from "@/lib/fawaterak/success-redirect";
import { cn } from "@/lib/utils";

const PLUGIN_SRC = "https://app.fawaterk.com/fawaterkPlugin/fawaterkPlugin.min.js";

export type CheckoutPreset =
  | null
  | { mode: "course"; courseId: string; title: string; amount: number }
  | { mode: "plan"; planId: string; title: string; amount: number };

type SessionResponse = {
  token: string;
  envType: "test" | "live";
  hashKey: string;
  style: { listing: "horizontal" | "vertical" };
  version: string;
  requestBody: Record<string, unknown>;
  redirectOutIframe?: boolean;
};

declare global {
  interface Window {
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

type FawaterakPaymentClientProps = {
  preset: CheckoutPreset;
  /** From URL ?next= — success redirect after payment */
  nextOverride?: string | null;
};

export function FawaterakPaymentClient({ preset, nextOverride }: FawaterakPaymentClientProps) {
  const [amount, setAmount] = useState(
    preset ? String(preset.amount) : ""
  );
  const [step, setStep] = useState<"form" | "checkout">("form");
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutPayload, setCheckoutPayload] = useState<SessionResponse | null>(null);

  useEffect(() => {
    if (preset) {
      setAmount(String(preset.amount));
    }
  }, [preset]);

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
        redirectOutIframe: checkoutPayload.redirectOutIframe !== false,
      };
      window.pluginConfig = pluginConfig;
      (globalThis as Record<string, unknown>).pluginConfig = pluginConfig;
      window.fawaterkCheckout(pluginConfig);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      delete window.pluginConfig;
      delete (globalThis as Record<string, unknown>).pluginConfig;
    };
  }, [step, checkoutPayload]);

  const onContinue = useCallback(async () => {
    const iframeDomain = `https://${window.location.hostname}`;

    const defaultSuccess =
      preset?.mode === "course"
        ? "/dashboard"
        : preset?.mode === "plan"
          ? "/dashboard/subscriptions"
          : "/dashboard/subscriptions";
    const successNext = sanitizeInternalNextPath(nextOverride, defaultSuccess);

    let body: Record<string, unknown>;

    if (preset?.mode === "course") {
      body = {
        courseId: preset.courseId,
        iframeDomain,
        next: successNext,
      };
    } else if (preset?.mode === "plan") {
      body = {
        planId: preset.planId,
        iframeDomain,
        next: successNext,
      };
    } else {
      const parsed = parseFloat(amount.replace(/,/g, "."));
      if (!Number.isFinite(parsed) || parsed <= 0) {
        toast.error("أدخل مبلغاً صحيحاً");
        return;
      }
      body = {
        amount: parsed,
        iframeDomain,
        next: successNext,
      };
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/payments/fawaterak/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
  }, [amount, preset, nextOverride]);

  const heading =
    preset?.mode === "course"
      ? "شراء كورس بالبطاقة"
      : preset?.mode === "plan"
        ? "اشتراك بالبطاقة"
        : "شحن الرصيد";

  const sub =
    preset?.mode === "course"
      ? preset.title
      : preset?.mode === "plan"
        ? preset.title
        : "أدخل المبلغ ثم أكمل الدفع عبر Fawaterak.";

  return (
    <div
      className="mx-auto w-full max-w-2xl space-y-5 px-3 py-4 sm:space-y-6 sm:px-4 md:max-w-4xl lg:max-w-6xl xl:max-w-7xl md:py-6 lg:px-6"
      dir="rtl"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold md:text-2xl">{heading}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
        </div>
        <Button variant="outline" size="sm" className="shrink-0 self-start sm:self-center" asChild>
          <a href="/dashboard/subscriptions" className="inline-flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            العودة للاشتراكات
          </a>
        </Button>
      </div>

      {step === "form" && (
        <Card className="border-brand/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-5 w-5 text-brand" />
              {preset ? "المبلغ المستحق" : "المبلغ"}
            </CardTitle>
            <CardDescription>
              {preset
                ? "المبلغ بالجنيه المصري — يطابق سعر الشراء أو الاشتراك."
                : "المبلغ بالجنيه المصري."}
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
                className={cn("text-lg font-semibold", preset && "bg-muted/60")}
                dir="ltr"
                readOnly={Boolean(preset)}
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
          <CardHeader className="border-b bg-muted/30 py-3 sm:py-4">
            <CardTitle className="text-base">إتمام الدفع</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              اختر طريقة الدفع. بعد النجاح ستُوجَّه تلقائياً إلى الصفحة المناسبة.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div
              id="fawaterkDivId"
              className="min-h-[min(70vh,560px)] w-full bg-background sm:min-h-[520px] lg:min-h-[580px]"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
