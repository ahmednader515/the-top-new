import { db, type DbTransactionClient } from "@/lib/db";

export async function getCourseForPurchase(courseId: string) {
  return db.course.findUnique({
    where: { id: courseId, isPublished: true },
  });
}

export async function assertCoursePurchasable(userId: string, courseId: string) {
  const course = await getCourseForPurchase(courseId);
  if (!course) {
    return { ok: false as const, error: "COURSE_NOT_FOUND" };
  }
  const price = course.price ?? 0;
  if (price <= 0) {
    return { ok: false as const, error: "INVALID_PRICE" };
  }

  const existingPurchase = await db.purchase.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
  });

  const now = new Date();
  const hasNonExpiredAccess =
    existingPurchase &&
    existingPurchase.status === "ACTIVE" &&
    (!existingPurchase.expiresAt || existingPurchase.expiresAt > now);

  if (hasNonExpiredAccess) {
    return { ok: false as const, error: "ALREADY_PURCHASED" };
  }

  return {
    ok: true as const,
    course,
    price,
    existingPurchase,
  };
}

export async function purchaseCourseWithBalance(userId: string, courseId: string) {
  const check = await assertCoursePurchasable(userId, courseId);
  if (!check.ok) {
    return { ok: false as const, error: check.error };
  }
  const { course, price, existingPurchase } = check;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { balance: true },
  });
  if (!user) {
    return { ok: false as const, error: "USER_NOT_FOUND" };
  }
  if (user.balance < price) {
    return { ok: false as const, error: "INSUFFICIENT_BALANCE" };
  }

  try {
    const result = await db.$transaction(async (tx) => {
      const purchase = await upsertLifetimeCoursePurchase(tx, userId, courseId, existingPurchase);

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: price } },
      });

      await tx.balanceTransaction.create({
        data: {
          userId,
          amount: -price,
          type: "PURCHASE",
          description: `تم شراء الكورس: ${course.title}`,
        },
      });

      return { purchase, newBalance: updatedUser.balance };
    });
    return {
      ok: true as const,
      purchaseId: result.purchase.id,
      newBalance: result.newBalance,
    };
  } catch (e) {
    console.error("[purchaseCourseWithBalance]", e);
    return { ok: false as const, error: "TRANSACTION_FAILED" };
  }
}

/**
 * Grant course access after Fawaterak payment (no balance movement).
 */
export async function fulfillCoursePurchaseFromGatewayPayment(
  tx: DbTransactionClient,
  userId: string,
  courseId: string,
  expectedPrice: number
) {
  const course = await tx.course.findFirst({
    where: { id: courseId, isPublished: true },
  });
  if (!course) {
    throw new Error("COURSE_NOT_FOUND");
  }
  const price = course.price ?? 0;
  if (price <= 0) {
    throw new Error("INVALID_PRICE");
  }
  const roundedExpected = Math.round(expectedPrice * 100) / 100;
  const roundedPrice = Math.round(price * 100) / 100;
  if (roundedExpected !== roundedPrice) {
    throw new Error("PRICE_MISMATCH");
  }

  const existingPurchase = await tx.purchase.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  const now = new Date();
  const hasNonExpiredAccess =
    existingPurchase &&
    existingPurchase.status === "ACTIVE" &&
    (!existingPurchase.expiresAt || existingPurchase.expiresAt > now);
  if (hasNonExpiredAccess) {
    throw new Error("ALREADY_PURCHASED");
  }

  await upsertLifetimeCoursePurchase(tx, userId, courseId, existingPurchase);
}

async function upsertLifetimeCoursePurchase(
  tx: DbTransactionClient,
  userId: string,
  courseId: string,
  existingPurchase: { id: string } | null
) {
  if (existingPurchase) {
    return tx.purchase.update({
      where: { id: existingPurchase.id },
      data: {
        status: "ACTIVE",
        expiresAt: null,
      },
    });
  }
  return tx.purchase.create({
    data: {
      userId,
      courseId,
      status: "ACTIVE",
      expiresAt: null,
    },
  });
}
