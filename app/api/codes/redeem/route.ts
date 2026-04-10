import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// POST - Redeem a code
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return new NextResponse("Code is required", { status: 400 });
    }

    // Find the code
    const purchaseCode = await db.purchaseCode.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        course: true,
      },
    });

    if (!purchaseCode) {
      return new NextResponse("Invalid code", { status: 404 });
    }

    if (purchaseCode.isUsed) {
      return new NextResponse("Code has already been used", { status: 400 });
    }

    // Check if user already purchased this course
    const existingPurchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: purchaseCode.courseId,
        },
      },
    });

    const now = new Date();
    const hasNonExpiredAccess =
      existingPurchase &&
      existingPurchase.status === "ACTIVE" &&
      (!existingPurchase.expiresAt || existingPurchase.expiresAt > now);

    if (hasNonExpiredAccess) {
      return new NextResponse("You have already purchased this course", { status: 400 });
    }

    // Use transaction to ensure atomicity
    const result = await db.$transaction(async (tx) => {
      // Mark code as used
      await tx.purchaseCode.update({
        where: { id: purchaseCode.id },
        data: {
          isUsed: true,
          usedBy: userId,
          usedAt: new Date(),
        },
      });

      let purchase;
      if (existingPurchase) {
        purchase = await tx.purchase.update({
          where: { id: existingPurchase.id },
          data: {
            status: "ACTIVE",
            purchaseCodeId: purchaseCode.id,
            // Code-based enrollment should remain lifetime unless explicitly changed.
            expiresAt: null,
          },
        });
      } else {
        purchase = await tx.purchase.create({
          data: {
            userId,
            courseId: purchaseCode.courseId,
            status: "ACTIVE",
            purchaseCodeId: purchaseCode.id,
            expiresAt: null,
          },
        });
      }

      return { purchase };
    });

    return NextResponse.json({
      success: true,
      purchaseId: result.purchase.id,
      course: {
        id: purchaseCode.course.id,
        title: purchaseCode.course.title,
      },
    });
  } catch (error) {
    console.error("[REDEEM_CODE]", error);
    if (error instanceof Error) {
      return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}

