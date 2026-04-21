import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الشروط والأحكام | اكاديمية القمة التعليمية",
  description: "الشروط والأحكام الخاصة باستخدام منصة اكاديمية القمة التعليمية وشراء الدورات.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">الشروط والأحكام</h1>
          <p className="text-muted-foreground">
            باستخدامك لمنصة اكاديمية القمة التعليمية أو قيامك بأي عملية شراء، فأنت توافق على الشروط
            والأحكام التالية.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1) التعريفات</h2>
          <ul className="list-disc space-y-2 pr-6 text-muted-foreground">
            <li>المنصة: موقع/تطبيق اكاديمية القمة التعليمية وخدماته.</li>
            <li>المستخدم: أي زائر أو مسجل على المنصة.</li>
            <li>المحتوى: الدورات، الدروس، الاختبارات، والمواد التعليمية.</li>
            <li>الدفع: أي عملية سداد إلكترونية عبر مزود الدفع المعتمد.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2) إنشاء الحساب واستخدام المنصة</h2>
          <ul className="list-disc space-y-2 pr-6 text-muted-foreground">
            <li>يجب تقديم بيانات صحيحة وحديثة عند التسجيل.</li>
            <li>أنت مسؤول عن الحفاظ على سرية بيانات الدخول واستخدام حسابك.</li>
            <li>يُحظر إساءة استخدام المنصة أو محاولة الوصول غير المصرّح به للأنظمة.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3) المحتوى والملكية الفكرية</h2>
          <ul className="list-disc space-y-2 pr-6 text-muted-foreground">
            <li>جميع حقوق المحتوى محفوظة للمنصة أو للجهات المالكة له.</li>
            <li>
              يُمنع نسخ المحتوى أو إعادة نشره أو مشاركته أو بيعه أو إتاحته للغير بأي وسيلة دون إذن
              كتابي.
            </li>
            <li>يُسمح بالوصول للمحتوى للاستخدام الشخصي التعليمي فقط وفقًا لما توفره المنصة.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4) الأسعار والدفع</h2>
          <ul className="list-disc space-y-2 pr-6 text-muted-foreground">
            <li>قد تتغير الأسعار والعروض من وقت لآخر وفقًا لما يظهر على المنصة.</li>
            <li>يتم تنفيذ عمليات الدفع عبر مزود/بوابة الدفع، وتخضع لشروطه أيضًا.</li>
            <li>قد يتم رفض العملية أو تعليقها في حال وجود اشتباه أو بيانات غير صحيحة.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5) الإلغاء والاسترجاع</h2>
          <p className="text-muted-foreground">
            تخضع عمليات الإلغاء والاسترجاع لسياسة الاسترجاع المنشورة على المنصة. يُرجى مراجعة صفحة
            سياسة الاسترجاع للاطلاع على التفاصيل.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6) حدود المسؤولية</h2>
          <ul className="list-disc space-y-2 pr-6 text-muted-foreground">
            <li>نسعى لتقديم الخدمة بأفضل جودة، لكن لا نضمن خلو المنصة من الأعطال بشكل دائم.</li>
            <li>لا نتحمل مسؤولية أي خسائر غير مباشرة ناتجة عن استخدام المنصة أو تعطلها.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">7) التعديلات</h2>
          <p className="text-muted-foreground">
            قد نقوم بتحديث هذه الشروط من وقت لآخر. يصبح استمرار استخدامك للمنصة بعد نشر التحديثات
            موافقةً عليها.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">8) التواصل</h2>
          <p className="text-muted-foreground">
            للاستفسارات المتعلقة بالشروط والأحكام، يُرجى التواصل عبر صفحة بيانات التواصل والعنوان.
          </p>
        </section>
      </div>
    </div>
  );
}

