import Link from "next/link";
import { Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FawaterakPendingPage() {
  return (
    <div className="mx-auto max-w-lg p-6" dir="rtl">
      <Card className="border-brand/25">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-brand" />
            الدفع قيد المعالجة
          </CardTitle>
          <CardDescription>
            بعض الطرق (مثل فوري أو أمان) تحتاج وقتاً حتى يُؤكد الدفع. سيتم إشعارك عند اكتمال
            العملية، ويُحدَّث رصيدك تلقائياً.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button asChild className="w-full bg-brand text-white hover:bg-brand/90">
            <Link href="/dashboard/subscriptions">العودة إلى الاشتراكات</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard/subscriptions/payment">صفحة الشحن</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
