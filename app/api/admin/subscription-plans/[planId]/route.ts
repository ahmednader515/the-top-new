import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { defaultTitleForChapters, isValidChaptersPerCourse } from "@/lib/subscription-plans";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { planId } = await params;
    const body = await req.json();
    let title = String(body?.title ?? "").trim();
    const description = String(body?.description ?? "").trim();
    const targetSubject = String(body?.targetSubject ?? "ALL_SUBJECTS").trim() || "ALL_SUBJECTS";
    const isActive = Boolean(body?.isActive ?? true);
    const sortOrder = Number(body?.sortOrder ?? 0);
    const price = Number(body?.price ?? 0);
    const chaptersPerCourse = Number(body?.chaptersPerCourse ?? 0);
    const features = Array.isArray(body?.features)
      ? body.features
          .map((item: unknown) => String(item ?? "").trim())
          .filter(Boolean)
      : [];

    if (!isValidChaptersPerCourse(chaptersPerCourse)) {
      return new NextResponse("Invalid subscription plan payload", { status: 400 });
    }
    if (!title) {
      title = defaultTitleForChapters(chaptersPerCourse);
    }

    if (!Number.isFinite(price) || price <= 0 || features.length === 0) {
      return new NextResponse("Invalid subscription plan payload", { status: 400 });
    }

    const [updated] = await db.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
      UPDATE "SubscriptionPlan"
      SET
        title = ${title},
        description = ${description || null},
        price = ${price},
        "chaptersPerCourse" = ${chaptersPerCourse},
        "targetSubject" = ${targetSubject},
        features = ARRAY[${Prisma.join(features)}]::text[],
        "isActive" = ${isActive},
        "sortOrder" = ${Number.isFinite(sortOrder) ? Math.trunc(sortOrder) : 0},
        "updatedAt" = NOW()
      WHERE id = ${planId}
      RETURNING
        id,
        title,
        description,
        price,
        "chaptersPerCourse" AS "chaptersPerCourse",
        "targetSubject" AS "targetSubject",
        features,
        "isActive" AS "isActive",
        "sortOrder" AS "sortOrder",
        "createdAt" AS "createdAt",
        "updatedAt" AS "updatedAt"
    `);

    if (!updated) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[ADMIN_SUBSCRIPTION_PLANS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { planId } = await params;
    await db.$executeRaw(Prisma.sql`DELETE FROM "SubscriptionPlan" WHERE id = ${planId}`);

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.error("[ADMIN_SUBSCRIPTION_PLANS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
