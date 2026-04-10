import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const plans = await db.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
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
      ORDER BY "sortOrder" ASC, "createdAt" DESC
    `);

    return NextResponse.json(plans);
  } catch (error) {
    console.error("[ADMIN_SUBSCRIPTION_PLANS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const title = String(body?.title ?? "").trim();
    const description = String(body?.description ?? "").trim();
    const targetSubject = String(body?.targetSubject ?? "ALL_SUBJECTS").trim() || "ALL_SUBJECTS";
    const isActive = Boolean(body?.isActive ?? true);
    const sortOrder = Number(body?.sortOrder ?? 0);
    const price = Number(body?.price ?? 0);
    const durationDays = Number(body?.durationDays ?? 30);
    const features = Array.isArray(body?.features)
      ? body.features
          .map((item: unknown) => String(item ?? "").trim())
          .filter(Boolean)
      : [];

    if (
      !title ||
      !Number.isFinite(price) ||
      price <= 0 ||
      !Number.isInteger(durationDays) ||
      durationDays <= 0 ||
      features.length === 0
    ) {
      return new NextResponse("Invalid subscription plan payload", { status: 400 });
    }

    const planId = randomUUID();

    const [plan] = await db.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
      INSERT INTO "SubscriptionPlan" (
        id,
        title,
        description,
        price,
        "durationDays",
        "targetSubject",
        features,
        "isActive",
        "sortOrder",
        "createdById",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${planId},
        ${title},
        ${description || null},
        ${price},
        ${durationDays},
        ${targetSubject},
        ARRAY[${Prisma.join(features)}]::text[],
        ${isActive},
        ${Number.isFinite(sortOrder) ? Math.trunc(sortOrder) : 0},
        ${session.user.id},
        NOW(),
        NOW()
      )
      RETURNING
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
    `);

    return NextResponse.json(plan);
  } catch (error) {
    console.error("[ADMIN_SUBSCRIPTION_PLANS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
