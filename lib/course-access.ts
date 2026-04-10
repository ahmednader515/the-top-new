import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export function buildActivePurchaseWhere(
  userId: string,
  courseId?: string
): Prisma.PurchaseWhereInput {
  return {
    userId,
    ...(courseId ? { courseId } : {}),
    status: "ACTIVE",
    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
  };
}

export async function hasActiveCourseAccess(
  userId: string,
  courseId: string
): Promise<boolean> {
  const purchase = await db.purchase.findFirst({
    where: buildActivePurchaseWhere(userId, courseId),
    select: { id: true },
  });

  return Boolean(purchase);
}
