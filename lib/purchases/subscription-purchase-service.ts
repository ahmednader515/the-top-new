import { Prisma } from "@prisma/client";

import { db, type DbTransactionClient } from "@/lib/db";
import { getAllowedCourseDivisionTargets, getAllowedSubjectsForStudent } from "@/lib/academics";
import { durationDaysForChapters, isValidChaptersPerCourse } from "@/lib/subscription-plans";

const ALL_SUBJECTS_VALUE = "ALL_SUBJECTS";

export type PlanRow = {
  id: string;
  title: string;
  price: number;
  chaptersPerCourse: number;
  targetSubject: string;
  isActive: boolean;
};

type PurchaseCheck = {
  status: string;
  chaptersLimit: number | null;
  expiresAt: Date | null;
} | null;

function subscriptionImprovesAccess(
  planChapters: number,
  durationDays: number,
  existing: PurchaseCheck,
  now: Date
): boolean {
  const durationMs = durationDays * 24 * 60 * 60 * 1000;

  if (!existing || existing.status !== "ACTIVE") {
    return true;
  }

  if (existing.chaptersLimit === null) {
    if (!existing.expiresAt || existing.expiresAt > now) {
      return false;
    }
    return true;
  }

  if (existing.expiresAt && existing.expiresAt <= now) {
    return true;
  }

  const nextLimit = Math.max(existing.chaptersLimit ?? 0, planChapters);
  if (nextLimit > (existing.chaptersLimit ?? 0)) {
    return true;
  }

  const base =
    existing.expiresAt && existing.expiresAt > now ? existing.expiresAt : now;
  const nextExpiry = new Date(base.getTime() + durationMs);
  return nextExpiry.getTime() > (existing.expiresAt?.getTime() ?? 0);
}

async function loadPlan(planId: string, tx: DbTransactionClient | typeof db = db) {
  const [plan] = await tx.$queryRaw<PlanRow[]>(Prisma.sql`
    SELECT
      id,
      title,
      price,
      "chaptersPerCourse" AS "chaptersPerCourse",
      "targetSubject" AS "targetSubject",
      "isActive" AS "isActive"
    FROM "SubscriptionPlan"
    WHERE id = ${planId}
    LIMIT 1
  `);
  return plan ?? null;
}

export async function prepareSubscriptionPurchase(userId: string, planId: string) {
  const plan = await loadPlan(planId);
  if (!plan || !plan.isActive) {
    return { ok: false as const, error: "PLAN_NOT_FOUND" };
  }
  if (!isValidChaptersPerCourse(plan.chaptersPerCourse)) {
    return { ok: false as const, error: "PLAN_MISCONFIGURED" };
  }

  const currentUser = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      balance: true,
      grade: true,
      division: true,
      curriculum: true,
      secondLanguage: true,
    },
  });

  if (!currentUser) {
    return { ok: false as const, error: "USER_NOT_FOUND" };
  }

  const allowedSubjects = getAllowedSubjectsForStudent({
    grade: currentUser.grade ?? undefined,
    division: currentUser.division ?? undefined,
    curriculum: currentUser.curriculum ?? undefined,
    secondLanguage: currentUser.secondLanguage ?? undefined,
  });
  const selectedSubjects =
    plan.targetSubject === ALL_SUBJECTS_VALUE ? allowedSubjects : [plan.targetSubject];

  if (
    plan.targetSubject !== ALL_SUBJECTS_VALUE &&
    !allowedSubjects.includes(plan.targetSubject)
  ) {
    return { ok: false as const, error: "PROFILE_MISMATCH" };
  }

  const divisionTargets = getAllowedCourseDivisionTargets(
    currentUser.grade ?? undefined,
    currentUser.division ?? undefined
  );

  const courseFilters: Prisma.CourseWhereInput = {
    isPublished: true,
    subject: { in: selectedSubjects },
    ...(currentUser.grade ? { grade: currentUser.grade } : {}),
    ...(currentUser.curriculum ? { curriculum: currentUser.curriculum } : {}),
  };

  if (divisionTargets.length > 0) {
    courseFilters.OR = [
      { divisions: { hasSome: divisionTargets } },
      { divisions: { has: "BOTH" } },
      { divisions: { isEmpty: true } },
    ];
  }

  const courses = await db.course.findMany({
    where: courseFilters,
    select: { id: true, title: true },
  });

  if (courses.length === 0) {
    return { ok: false as const, error: "NO_ELIGIBLE_COURSES" };
  }

  const now = new Date();
  const planChapters = plan.chaptersPerCourse;
  const durationDays = durationDaysForChapters(planChapters);
  const durationMs = durationDays * 24 * 60 * 60 * 1000;

  let anyBenefit = false;
  for (const course of courses) {
    const existing = await db.purchase.findUnique({
      where: {
        userId_courseId: { userId: currentUser.id, courseId: course.id },
      },
      select: { status: true, chaptersLimit: true, expiresAt: true },
    });
    if (subscriptionImprovesAccess(planChapters, durationDays, existing, now)) {
      anyBenefit = true;
      break;
    }
  }

  if (!anyBenefit) {
    return { ok: false as const, error: "NO_BENEFIT" };
  }

  return {
    ok: true as const,
    plan,
    userId: currentUser.id,
    courses,
    now,
    planChapters,
    durationDays,
    durationMs,
    userBalance: currentUser.balance,
  };
}

async function applySubscriptionGrants(
  tx: DbTransactionClient,
  params: {
    userId: string;
    plan: PlanRow;
    courses: { id: string; title: string }[];
    now: Date;
    planChapters: number;
    durationMs: number;
  }
) {
  const { userId, plan, courses, now, planChapters, durationMs } = params;
  const durationDays = durationDaysForChapters(planChapters);

  for (const course of courses) {
    const existingPurchase = await tx.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: course.id,
        },
      },
    });

    if (!subscriptionImprovesAccess(planChapters, durationDays, existingPurchase, now)) {
      continue;
    }

    const nextLimit = Math.max(existingPurchase?.chaptersLimit ?? 0, planChapters);
    const base =
      existingPurchase?.expiresAt && existingPurchase.expiresAt > now
        ? existingPurchase.expiresAt
        : now;
    const nextExpiry = new Date(base.getTime() + durationMs);

    if (existingPurchase) {
      await tx.purchase.update({
        where: { id: existingPurchase.id },
        data: {
          status: "ACTIVE",
          expiresAt: nextExpiry,
          chaptersLimit: nextLimit,
        },
      });
    } else {
      await tx.purchase.create({
        data: {
          userId,
          courseId: course.id,
          status: "ACTIVE",
          expiresAt: nextExpiry,
          chaptersLimit: planChapters,
        },
      });
    }
  }
}

export async function purchaseSubscriptionWithBalance(userId: string, planId: string) {
  const prep = await prepareSubscriptionPurchase(userId, planId);
  if (!prep.ok) {
    return { ok: false as const, error: prep.error };
  }
  const { plan, courses, now, planChapters, durationMs, userBalance } = prep;
  if (userBalance < plan.price) {
    return { ok: false as const, error: "INSUFFICIENT_BALANCE" };
  }

  const durationDays = durationDaysForChapters(planChapters);

  try {
    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: plan.price } },
      });

      await tx.balanceTransaction.create({
        data: {
          userId,
          amount: -plan.price,
          type: "PURCHASE",
          description: `اشتراك خطة: ${plan.title} — ${planChapters} دروس/كورس، ${durationDays} يوماً`,
        },
      });

      await applySubscriptionGrants(tx, {
        userId,
        plan,
        courses,
        now,
        planChapters,
        durationMs,
      });
    });

    const latestExpiry = await db.purchase.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        chaptersLimit: { not: null },
        expiresAt: { not: null },
      },
      orderBy: { expiresAt: "desc" },
      select: { expiresAt: true },
    });

    return {
      ok: true as const,
      chaptersPerCourse: planChapters,
      durationDays,
      grantedCoursesCount: courses.length,
      expiresAt: latestExpiry?.expiresAt?.toISOString() ?? null,
    };
  } catch (e) {
    console.error("[purchaseSubscriptionWithBalance]", e);
    return { ok: false as const, error: "TRANSACTION_FAILED" };
  }
}

/**
 * Apply subscription grants after Fawaterak payment (validated price, no balance movement).
 */
export async function fulfillSubscriptionPurchaseFromGatewayPayment(
  tx: DbTransactionClient,
  userId: string,
  planId: string,
  expectedPrice: number
) {
  const prep = await prepareSubscriptionPurchase(userId, planId);
  if (!prep.ok) {
    throw new Error(prep.error);
  }
  const { plan, courses, now, planChapters, durationMs } = prep;
  const roundedExpected = Math.round(expectedPrice * 100) / 100;
  const roundedPrice = Math.round(plan.price * 100) / 100;
  if (roundedExpected !== roundedPrice) {
    throw new Error("PRICE_MISMATCH");
  }

  await applySubscriptionGrants(tx, {
    userId,
    plan,
    courses,
    now,
    planChapters,
    durationMs,
  });
}
