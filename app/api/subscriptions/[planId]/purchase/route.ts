import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAllowedCourseDivisionTargets, getAllowedSubjectsForStudent } from "@/lib/academics";

const ALL_SUBJECTS_VALUE = "ALL_SUBJECTS";

type PlanRow = {
  id: string;
  title: string;
  price: number;
  durationDays: number;
  targetSubject: string;
  isActive: boolean;
};

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
        "durationDays" AS "durationDays",
        "targetSubject" AS "targetSubject",
        "isActive" AS "isActive"
      FROM "SubscriptionPlan"
      WHERE id = ${planId}
      LIMIT 1
    `);

    if (!plan || !plan.isActive) {
      return new NextResponse("Subscription plan is not available", { status: 404 });
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
    const durationMs = plan.durationDays * 24 * 60 * 60 * 1000;
    const defaultExpiry = new Date(now.getTime() + durationMs);

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
          description: `اشتراك خطة: ${plan.title} لمدة ${plan.durationDays} يوم`,
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

        if (existingPurchase?.status === "ACTIVE" && existingPurchase.expiresAt === null) {
          continue;
        }

        const nextExpiryBase =
          existingPurchase?.status === "ACTIVE" &&
          existingPurchase.expiresAt &&
          existingPurchase.expiresAt > now
            ? existingPurchase.expiresAt
            : now;
        const nextExpiry = new Date(nextExpiryBase.getTime() + durationMs);

        if (existingPurchase) {
          await tx.purchase.update({
            where: { id: existingPurchase.id },
            data: {
              status: "ACTIVE",
              expiresAt: nextExpiry,
            },
          });
        } else {
          await tx.purchase.create({
            data: {
              userId: currentUser.id,
              courseId: course.id,
              status: "ACTIVE",
              expiresAt: defaultExpiry,
            },
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      expiresAt: defaultExpiry.toISOString(),
      grantedCoursesCount: courses.length,
    });
  } catch (error) {
    console.error("[SUBSCRIPTION_PURCHASE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
