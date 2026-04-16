import { Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FawaterakPendingPage() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6 sm:px-6" dir="rtl">
      <Card className="border-brand/25">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-6 w-6 shrink-0 text-brand" />
            الدفع قيد المعالجة
          </CardTitle>
          <CardDescription>
            بعض الطرق (مثل فوري أو أمان) تحتاج وقتاً حتى يُؤكد الدفع. سيتم إشعارك عند اكتمال
            العملية، ويُحدَّث رصيدك تلقائياً.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button asChild className="w-full bg-brand text-white hover:bg-brand/90">
            <a href="/dashboard/subscriptions" target="_top" rel="noopener noreferrer">
              العودة إلى الاشتراكات
            </a>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <a href="/dashboard/subscriptions/payment" target="_top" rel="noopener noreferrer">
              صفحة الشحن
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
