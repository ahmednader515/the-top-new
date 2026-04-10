"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Wallet, MessageCircle, Copy, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const VODAFONE_CASH_NUMBER = "01112970189";
const WHATSAPP_LINK = "https://wa.me/201112970189";

export function BalanceSection() {
  const [balance, setBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [copiedWalletNumber, setCopiedWalletNumber] = useState(false);

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWalletNumber(true);
    toast.success("تم نسخ الرقم");
    setTimeout(() => setCopiedWalletNumber(false), 2000);
  };

  return (
    <section className="rounded-xl border bg-card p-4 md:p-6 space-y-4" dir="rtl">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold md:text-xl">الرصيد</h2>
          <p className="text-sm text-muted-foreground">
            اشحن رصيدك عبر فودافون كاش ثم اشترك في الخطة المناسبة.
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

      <div className="grid gap-3 md:grid-cols-2">
        <Card className="border-brand/15">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-4 w-4" />
              رقم فودافون كاش
            </CardTitle>
            <CardDescription>انسخ الرقم وحوّل المبلغ من تطبيق فودافون كاش.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-3 rounded-xl border bg-background px-4 py-3">
              <div>
                <p className="text-sm font-bold text-brand" dir="ltr">
                  {VODAFONE_CASH_NUMBER}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">فودافون كاش فقط</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(VODAFONE_CASH_NUMBER)}
                className="h-10 w-10"
                aria-label="نسخ الرقم"
              >
                {copiedWalletNumber ? (
                  <Check className="h-4 w-4 text-brand" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand/15">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageCircle className="h-4 w-4 text-brand" />
              إرسال صورة الإيصال
            </CardTitle>
            <CardDescription>بعد التحويل، أرسل صورة الإيصال وسيتم إضافة الرصيد خلال 24 ساعة.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>حوّل المبلغ على الرقم الموضح</li>
              <li>احفظ صورة الإيصال</li>
              <li>أرسلها لنا على واتساب</li>
            </ol>
            <Button asChild className="w-full bg-brand hover:bg-brand/90 text-white" size="lg">
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5 ml-2" />
                إرسال صورة الإيصال على واتساب
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

