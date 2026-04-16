import Link from "next/link";
import { XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FawaterakFailPage() {
  return (
    <div className="mx-auto max-w-lg p-6" dir="rtl">
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-6 w-6" />
            لم يكتمل الدفع
          </CardTitle>
          <CardDescription>
            يمكنك المحاولة مرة أخرى من صفحة شحن الرصيد. إذا تم خصم المبلغ من حسابك ولم يُضف
            الرصيد، تواصل مع الدعم مع إرسال رقم العملية.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button asChild className="w-full bg-brand text-white hover:bg-brand/90">
            <Link href="/dashboard/subscriptions/payment">إعادة المحاولة</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard/subscriptions">الاشتراكات</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
