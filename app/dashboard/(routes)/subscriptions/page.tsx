import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDashboardUrlByRole } from "@/lib/utils";
 
import {
  getAllowedSubjectsForStudent,
  normalizeSubjectForDisplay,
  SUBJECT_OPTIONS,
  SUBJECT_LABEL_BY_VALUE,
} from "@/lib/academics";
import { SubscriptionPurchaseButton } from "./_components/subscription-purchase-button";
import { BalanceSection } from "./_components/balance-section";
 

const WHATSAPP_BASE = "https://wa.me/201112970189";
const ALL_SUBJECTS_VALUE = "ALL_SUBJECTS";

const DEFAULT_FEATURES = [
  "متابعة دورية مع فريق الدعم",
  "الوصول للمحتوى من أي جهاز",
  "سرعة في الرد على الاستفسارات",
  "تنبيهات مواعيد وتجديد الاشتراك",
];

type SubscriptionsPageProps = {
  searchParams: Promise<{ subject?: string }>;
};

export default async function SubscriptionsPage({ searchParams }: SubscriptionsPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return redirect("/");
  }

  if (
    session.user.role === "ADMIN" ||
    session.user.role === "TEACHER" ||
    session.user.role === "ADMIN_ASSISTANT"
  ) {
    return redirect(getDashboardUrlByRole(session.user.role));
  }

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      grade: true,
      division: true,
      curriculum: true,
      secondLanguage: true,
    },
  });

  const now = new Date();
  const testNowIso = null;
  const activeSubscriptionPurchase = await db.purchase.findFirst({
    where: {
      userId: session.user.id,
      status: "ACTIVE",
      expiresAt: { not: null, gt: now },
    },
    orderBy: { expiresAt: "desc" },
    select: {
      expiresAt: true,
    },
  });

  const activeSubscriptionExpiresAt = activeSubscriptionPurchase?.expiresAt ?? null;
  const daysRemaining =
    activeSubscriptionExpiresAt !== null
      ? Math.max(
          0,
          Math.ceil((activeSubscriptionExpiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
        )
      : null;

  const allowedSubjects = getAllowedSubjectsForStudent({
    grade: currentUser?.grade ?? undefined,
    division: currentUser?.division ?? undefined,
    curriculum: currentUser?.curriculum ?? undefined,
    secondLanguage: currentUser?.secondLanguage ?? undefined,
  });

  const knownSubjectValues = new Set(SUBJECT_OPTIONS.map((subject) => subject.value));
  const normalizedAllowedSubjects = Array.from(
    new Set(
      allowedSubjects
        .map((subject) => normalizeSubjectForDisplay(subject))
        .filter((subject): subject is string => Boolean(subject) && knownSubjectValues.has(subject))
    )
  );

  const allowedSubjectOptions = [
    { value: ALL_SUBJECTS_VALUE, label: "كل المواد" },
    ...normalizedAllowedSubjects.map((subject) => ({
      value: subject,
      label: SUBJECT_LABEL_BY_VALUE[subject] ?? subject,
    })),
  ];

  const params = await searchParams;
  const selectedSubjectParam = params?.subject ?? ALL_SUBJECTS_VALUE;
  const selectedSubject = allowedSubjectOptions.some((opt) => opt.value === selectedSubjectParam)
    ? selectedSubjectParam
    : ALL_SUBJECTS_VALUE;

  const plans = await db.$queryRaw<
    Array<{
      id: string;
      title: string;
      description: string | null;
      price: number;
      durationDays: number;
      targetSubject: string;
      features: string[];
      isActive: boolean;
      sortOrder: number;
      createdAt: Date;
      updatedAt: Date;
    }>
  >(
    selectedSubject === ALL_SUBJECTS_VALUE
      ? Prisma.sql`
          SELECT
            id,
            title,
            description,
            price,
            "durationDays" AS "durationDays",
            "targetSubject" AS "targetSubject",
            features,
            "isActive" AS "isActive",
            "sortOrder" AS "sortOrder",
            "createdAt" AS "createdAt",
            "updatedAt" AS "updatedAt"
          FROM "SubscriptionPlan"
          WHERE "isActive" = true
          ORDER BY "sortOrder" ASC, "createdAt" DESC
        `
      : Prisma.sql`
          SELECT
            id,
            title,
            description,
            price,
            "durationDays" AS "durationDays",
            "targetSubject" AS "targetSubject",
            features,
            "isActive" AS "isActive",
            "sortOrder" AS "sortOrder",
            "createdAt" AS "createdAt",
            "updatedAt" AS "updatedAt"
          FROM "SubscriptionPlan"
          WHERE
            "isActive" = true
            AND ("targetSubject" = ${ALL_SUBJECTS_VALUE} OR "targetSubject" = ${selectedSubject})
          ORDER BY "sortOrder" ASC, "createdAt" DESC
        `
  );

  const mergedFeatures = Array.from(
    new Set(plans.flatMap((plan) => plan.features).filter(Boolean))
  );
  const highlights = mergedFeatures.length > 0 ? mergedFeatures.slice(0, 8) : DEFAULT_FEATURES;

  return (
    <div className="p-4 md:p-6 space-y-6" dir="rtl">
      {activeSubscriptionExpiresAt && daysRemaining !== null && (
        <section className="rounded-xl border bg-gradient-to-l from-emerald-50 to-white p-4 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">
                أنت مشترك الآن
              </div>
              <h2 className="mt-2 text-lg font-extrabold md:text-xl">اشتراكك فعّال</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                ينتهي في{" "}
                <span className="font-bold text-slate-900">
                  {activeSubscriptionExpiresAt.toLocaleDateString("ar-EG")}
                </span>
              </p>
            </div>

            <div className="rounded-xl border bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-bold text-muted-foreground">المتبقي</p>
              <p className="mt-1 text-3xl font-extrabold text-emerald-600">{daysRemaining}</p>
              <p className="text-sm font-bold">يوم</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            يمكنك التجديد في أي وقت — سيتم إضافة مدة الخطة إلى اشتراكك الحالي.
          </p>
        </section>
      )}

      <section className="rounded-xl border bg-card p-4 md:p-6">
        <h2 className="mb-4 text-lg font-bold md:text-xl">مميزات الاشتراك</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {highlights.map((feature) => (
            <div
              key={feature}
              className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm"
            >
              {feature}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4 md:p-6">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-bold md:text-xl">اختر مواد اشتراكك</h2>
          <form method="GET" className="flex items-center gap-2">
            <select
              name="subject"
              defaultValue={selectedSubject}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              {allowedSubjectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="h-10 rounded-md bg-brand px-4 text-sm font-semibold text-white hover:bg-brand/90"
            >
              عرض الخطط
            </button>
          </form>
        </div>

        {plans.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            لا توجد خطط اشتراك متاحة حالياً لهذه المادة.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => {
              const planSubjectLabel =
                plan.targetSubject === ALL_SUBJECTS_VALUE
                  ? "كل المواد"
                  : SUBJECT_LABEL_BY_VALUE[plan.targetSubject] ?? plan.targetSubject;
              const planMessage = encodeURIComponent(
                `مرحباً، أريد الاشتراك في خطة "${plan.title}" (${planSubjectLabel})`
              );
              return (
                <div key={plan.id} className="rounded-xl border bg-white p-4 shadow-sm">
                  <div className="mb-3 inline-block rounded-full bg-yellow-300 px-3 py-1 text-xs font-bold">
                    {planSubjectLabel}
                  </div>
                  <h3 className="text-base font-bold">{plan.title}</h3>
                  {plan.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{plan.description}</p>
                  )}
                  <p className="mt-4 text-2xl font-bold text-brand">{plan.price} جنيه</p>
                  <p className="mt-1 text-xs text-muted-foreground">المدة: {plan.durationDays} يوم</p>
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {plan.features.slice(0, 3).map((feature) => (
                      <li key={feature}>• {feature}</li>
                    ))}
                  </ul>
                  <SubscriptionPurchaseButton
                    planId={plan.id}
                    planTitle={plan.title}
                    isSubscribed={Boolean(activeSubscriptionExpiresAt)}
                    className="mt-4"
                  />
                  <a
                    href={`${WHATSAPP_BASE}?text=${planMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    تواصل واتساب
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <BalanceSection />
    </div>
  );
}
