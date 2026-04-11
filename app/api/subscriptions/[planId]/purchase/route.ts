import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAllowedCourseDivisionTargets, getAllowedSubjectsForStudent } from "@/lib/academics";
import { durationDaysForChapters, isValidChaptersPerCourse } from "@/lib/subscription-plans";

const ALL_SUBJECTS_VALUE = "ALL_SUBJECTS";

type PlanRow = {
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

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.userId || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (
      session.user.role === "ADMIN" ||
      session.user.role === "TEACHER" ||
      session.user.role === "ADMIN_ASSISTANT"
    ) {
      return new NextResponse("Only students can buy subscriptions", { status: 403 });
    }

    const { planId } = await params;
    const [plan] = await db.$queryRaw<PlanRow[]>(Prisma.sql`
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

    if (!plan || !plan.isActive) {
      return new NextResponse("Subscription plan is not available", { status: 404 });
    }

    if (!isValidChaptersPerCourse(plan.chaptersPerCourse)) {
      return new NextResponse("Subscription plan is misconfigured", { status: 500 });
    }

    const currentUser = await db.user.findUnique({
      where: { id: session.userId },
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
      return new NextResponse("User not found", { status: 404 });
    }

    if (currentUser.balance < plan.price) {
      return new NextResponse("Insufficient balance", { status: 400 });
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
      return new NextResponse("This plan is not available for your profile", { status: 400 });
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
      return new NextResponse("No eligible courses found for this subscription", { status: 400 });
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
      return new NextResponse(
        "لا يمكن تنفيذ الاشتراك — لديك بالفعل صلاحية مماثلة أو أعلى لجميع الكورسات المشمولة",
        { status: 400 }
      );
    }

    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: currentUser.id },
        data: {
          balance: {
            decrement: plan.price,
          },
        },
      });

      await tx.balanceTransaction.create({
        data: {
          userId: currentUser.id,
          amount: -plan.price,
          type: "PURCHASE",
          description: `اشتراك خطة: ${plan.title} — ${planChapters} دروس/كورس، ${durationDays} يوماً`,
        },
      });

      for (const course of courses) {
        const existingPurchase = await tx.purchase.findUnique({
          where: {
            userId_courseId: {
              userId: currentUser.id,
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
              userId: currentUser.id,
              courseId: course.id,
              status: "ACTIVE",
              expiresAt: nextExpiry,
              chaptersLimit: planChapters,
            },
          });
        }
      }
    });

    const latestExpiry = await db.purchase.findFirst({
      where: {
        userId: currentUser.id,
        status: "ACTIVE",
        chaptersLimit: { not: null },
        expiresAt: { not: null },
      },
      orderBy: { expiresAt: "desc" },
      select: { expiresAt: true },
    });

    return NextResponse.json({
      success: true,
      chaptersPerCourse: planChapters,
      durationDays,
      grantedCoursesCount: courses.length,
      expiresAt: latestExpiry?.expiresAt?.toISOString() ?? null,
    });
  } catch (error) {
    console.error("[SUBSCRIPTION_PURCHASE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
