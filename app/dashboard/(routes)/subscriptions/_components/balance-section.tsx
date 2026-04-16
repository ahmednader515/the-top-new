"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Wallet, CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function BalanceSection() {
  const [balance, setBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  useEffect(() => {
    void fetchBalance();
  }, []);

  const fetchBalance = async () => {
    setIsLoadingBalance(true);
    try {
      const response = await fetch("/api/user/balance");
      if (response.ok) {
        const data = await response.json();
        setBalance(Number(data.balance ?? 0));
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  return (
    <section className="rounded-xl border bg-card p-4 md:p-6 space-y-4" dir="rtl">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold md:text-xl">الرصيد</h2>
          <p className="text-sm text-muted-foreground">
            اشحن رصيدك عبر بوابة الدفع الإلكترونية ثم اشترك في الخطة المناسبة.
          </p>
        </div>
        <div className="shrink-0 rounded-xl border bg-muted/40 px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground">رصيدك الحالي</p>
          {isLoadingBalance ? (
            <p className="mt-1 text-sm text-muted-foreground">جاري التحميل...</p>
          ) : (
            <p className="mt-1 text-xl font-extrabold text-brand">{balance.toFixed(2)} جنيه</p>
          )}
        </div>
      </div>

      <Card className="border-brand/15">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4 text-brand" />
            شحن الرصيد (Fawaterak)
          </CardTitle>
          <CardDescription>
            ادفع ببطاقة أو المحافظ الإلكترونية المعتمدة. بعد نجاح الدفع يُحدَّث رصيدك تلقائياً.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            asChild
            className="w-full bg-brand hover:bg-brand/90 text-white"
            size="lg"
          >
            <Link href="/dashboard/subscriptions/payment">
              <Wallet className="h-5 w-5 ml-2" />
              الانتقال إلى صفحة الدفع
            </Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

