import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FawaterakSuccessPage() {
  return (
    <div className="mx-auto max-w-lg p-6" dir="rtl">
      <Card className="border-brand/25">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-brand">
            <CheckCircle2 className="h-6 w-6" />
            تم الدفع بنجاح
          </CardTitle>
          <CardDescription>
            جاري تحديث رصيدك. إذا لم يظهر الرصيد فوراً، انتظر قليلاً ثم حدّث الصفحة.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full bg-brand text-white hover:bg-brand/90">
            <Link href="/dashboard/subscriptions">العودة إلى الاشتراكات</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
