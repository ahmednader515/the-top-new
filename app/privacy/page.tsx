import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سياسة الخصوصية | اكاديمية القمة التعليمية",
  description: "سياسة الخصوصية الخاصة بمنصة اكاديمية القمة التعليمية وكيفية جمع واستخدام البيانات.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">سياسة الخصوصية</h1>
          <p className="text-muted-foreground">
            توضح هذه السياسة كيفية جمع واستخدام ومشاركة وحماية بياناتك عند استخدام منصة اكاديمية
            القمة التعليمية.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1) البيانات التي نجمعها</h2>
          <ul className="list-disc space-y-2 pr-6 text-muted-foreground">
            <li>بيانات الحساب مثل الاسم وبيانات التواصل عند التسجيل.</li>
            <li>بيانات الاستخدام مثل الصفحات التي تزورها وتفاعلاتك مع المحتوى.</li>
            <li>بيانات تقنية مثل نوع الجهاز والمتصفح وعنوان IP لأغراض الأمان والتحسين.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2) كيفية استخدام البيانات</h2>
          <ul className="list-disc space-y-2 pr-6 text-muted-foreground">
            <li>إنشاء الحساب وتقديم الخدمات التعليمية وإدارة اشتراكاتك ومشترياتك.</li>
            <li>تحسين تجربة المستخدم وجودة المحتوى ودعم العملاء.</li>
            <li>الالتزام بالمتطلبات القانونية ومنع الاحتيال وحماية المنصة.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3) الدفع ومعالجة عمليات السداد</h2>
          <p className="text-muted-foreground">
            تتم معالجة عمليات الدفع عبر مزود/بوابة دفع معتمدة. قد تتم مشاركة بيانات لازمة لإتمام
            عملية السداد (مثل قيمة العملية ومعرّفاتها) مع مزود الدفع. لا نقوم بتخزين بيانات بطاقات
            الدفع على خوادمنا.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4) مشاركة البيانات</h2>
          <ul className="list-disc space-y-2 pr-6 text-muted-foreground">
            <li>قد نشارك بيانات محدودة مع مقدمي الخدمات (مثل الاستضافة ومزود الدفع) لتقديم الخدمة.</li>
            <li>قد نكشف عن البيانات إذا طُلب ذلك بموجب القانون أو لحماية حقوقنا ومنع إساءة الاستخدام.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5) الاحتفاظ بالبيانات</h2>
          <p className="text-muted-foreground">
            نحتفظ ببياناتك للمدة اللازمة لتقديم الخدمات أو للامتثال للالتزامات القانونية وحل النزاعات
            وتطبيق الاتفاقيات.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6) حماية البيانات</h2>
          <p className="text-muted-foreground">
            نستخدم إجراءات أمنية معقولة لحماية البيانات. ومع ذلك لا يمكن ضمان أمان المعلومات بنسبة
            100% عبر الإنترنت.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">7) حقوقك</h2>
          <ul className="list-disc space-y-2 pr-6 text-muted-foreground">
            <li>يمكنك تحديث بيانات حسابك من خلال إعدادات الحساب إن توفرت.</li>
            <li>يمكنك طلب حذف الحساب أو الاستفسار عن بياناتك عبر بيانات التواصل.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">8) تحديثات السياسة</h2>
          <p className="text-muted-foreground">
            قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سيتم نشر النسخة المحدثة على هذه الصفحة.
          </p>
        </section>
      </div>
    </div>
  );
}

