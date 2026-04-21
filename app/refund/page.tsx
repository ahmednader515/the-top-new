import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سياسة الاسترجاع | اكاديمية القمة التعليمية",
  description: "سياسة الاسترجاع والاستبدال الخاصة بمشتريات الدورات الرقمية على منصة اكاديمية القمة التعليمية.",
};

export default function RefundPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">سياسة الاسترجاع</h1>
          <p className="text-muted-foreground">
            تهدف هذه السياسة لتوضيح حالات الاسترجاع الممكنة لمشتريات الدورات الرقمية على منصة اكاديمية
            القمة التعليمية.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1) طبيعة المنتج</h2>
          <p className="text-muted-foreground">
            المنتجات المقدمة عبر المنصة هي محتوى رقمي (دورات/دروس/اختبارات) يُتاح الوصول إليه بعد إتمام
            عملية الدفع.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2) عدم الاسترجاع بعد إتاحة الوصول</h2>
          <p className="text-muted-foreground">
            بعد تفعيل الوصول إلى المحتوى الرقمي للدورة أو الاشتراك، لا يمكن طلب استرجاع المبلغ، وذلك
            لطبيعة المنتج الرقمي الذي يتم تقديمه فورًا بعد الدفع.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3) الحالات الاستثنائية المقبولة</h2>
          <ul className="list-disc space-y-2 pr-6 text-muted-foreground">
            <li>سحب/خصم مكرر لنفس العملية (Duplicate charge).</li>
            <li>خصم مبلغ خاطئ بسبب خطأ تقني أو خلل في بوابة الدفع.</li>
            <li>تم الدفع بنجاح ولم يتم تفعيل الوصول للمحتوى بسبب خلل تقني مثبت.</li>
          </ul>
          <p className="text-muted-foreground">
            في هذه الحالات، يتم التحقق أولًا ثم اتخاذ الإجراء المناسب (استرجاع/تصحيح/تفعيل الخدمة).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4) طريقة تقديم الطلب</h2>
          <ul className="list-disc space-y-2 pr-6 text-muted-foreground">
            <li>يُرجى التواصل معنا وإرسال رقم العملية/إثبات الدفع ووصف المشكلة.</li>
            <li>قد نطلب معلومات إضافية للمراجعة لدى مزود الدفع.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5) مدة المراجعة</h2>
          <p className="text-muted-foreground">
            تتم مراجعة الطلبات خلال مدة معقولة بحسب طبيعة الحالة، وقد تختلف مدة استرجاع المبلغ النهائي
            وفقًا لإجراءات مزود الدفع والبنك/المحفظة.
          </p>
        </section>
      </div>
    </div>
  );
}

