import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "بيانات التواصل والعنوان | اكاديمية القمة التعليمية",
  description: "طرق التواصل الرسمية الخاصة بمنصة اكاديمية القمة التعليمية.",
};

export default function ContactInfoPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">بيانات التواصل والعنوان</h1>
          <p className="text-muted-foreground">
            يمكنك التواصل معنا عبر القنوات التالية لأي استفسار يتعلق بالدفع أو الاشتراكات أو الدعم الفني.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">طرق التواصل</h2>
          <div className="rounded-xl border p-4">
            <div className="space-y-2 text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">واتساب:</span>{" "}
                <a
                  className="underline underline-offset-4 hover:text-foreground"
                  href="https://wa.me/201112970189"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  01112970189
                </a>
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">العنوان</h2>
          <div className="rounded-xl border p-4 text-muted-foreground">
            <p>سيتم إضافة العنوان الرسمي للمنشأة هنا قريبًا.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

