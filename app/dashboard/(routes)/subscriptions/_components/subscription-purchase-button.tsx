"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

type SubscriptionPurchaseButtonProps = {
  planId: string;
  planTitle: string;
  className?: string;
};

export function SubscriptionPurchaseButton({
  planId,
  planTitle,
  className,
}: SubscriptionPurchaseButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onPurchaseWithBalance = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/subscriptions/${planId}/purchase`, {
        method: "POST",
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "تعذر تنفيذ الاشتراك");
      }

      const payload = (await response.json()) as {
        chaptersPerCourse: number;
        durationDays: number;
        grantedCoursesCount: number;
        expiresAt: string | null;
      };
      const until =
        payload.expiresAt != null
          ? ` — أحدث تاريخ انتهاء: ${new Date(payload.expiresAt).toLocaleDateString("ar-EG")}`
          : "";
      toast.success(
        `تم الاشتراك في "${planTitle}" بنجاح — ${payload.chaptersPerCourse} دروس/كورس، ${payload.durationDays} يوماً لكل كورس، ${payload.grantedCoursesCount} كورس${until}`
      );
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ أثناء الاشتراك";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("mt-4 grid gap-2", className)}>
      <button
        type="button"
        onClick={onPurchaseWithBalance}
        disabled={isLoading}
        className={cn(
          "inline-flex h-10 w-full items-center justify-center rounded-md text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70",
          "bg-blue-600 text-white hover:bg-blue-700"
        )}
      >
        {isLoading ? "جاري الاشتراك..." : "اشترك من الرصيد"}
      </button>
      <Link
        href={`/dashboard/subscriptions/payment?planId=${encodeURIComponent(planId)}`}
        className={cn(
          "inline-flex h-10 w-full items-center justify-center rounded-md border border-slate-300 bg-white text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
        )}
      >
        ادفع مباشرة بالبطاقة
      </Link>
      <p className="text-center text-[11px] text-muted-foreground leading-snug">
        يُخصم المبلغ من رصيدك فوراً، أو يُحمَّل تلقائياً من بوابة الدفع بنفس سعر الخطة.
      </p>
    </div>
  );
}
