import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export function buildActivePurchaseWhere(
  userId: string,
  courseId?: string
): Prisma.PurchaseWhereInput {
  const now = new Date();
  return {
    userId,
    ...(courseId ? { courseId } : {}),
    status: "ACTIVE",
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
  };
}

/** Merged course outline: quizzes are ordered with chapters by `position` but do not count toward subscription limits. */
export type CourseOutlineItem = {
  id: string;
  position: number;
  type: "chapter" | "quiz";
  /** Only on chapters; free lessons never count toward the paid-chapter subscription cap. */
  isFree?: boolean;
};

export function mergeChaptersAndQuizzesForOutline(
  chapters: Array<{ id: string; position: number; isFree: boolean }>,
  quizzes: Array<{ id: string; position: number }>
): CourseOutlineItem[] {
  return [
    ...chapters.map((c) => ({
      id: c.id,
      position: c.position,
      type: "chapter" as const,
      isFree: c.isFree,
    })),
    ...quizzes.map((q) => ({
      id: q.id,
      position: q.position,
      type: "quiz" as const,
    })),
  ].sort((a, b) => a.position - b.position);
}

async function fetchCourseOutline(courseId: string): Promise<CourseOutlineItem[]> {
  const [chapters, quizzes] = await db.$transaction([
    db.chapter.findMany({
      where: { courseId, isPublished: true },
      select: { id: true, position: true, isFree: true },
    }),
    db.quiz.findMany({
      where: { courseId, isPublished: true },
      select: { id: true, position: true },
    }),
  ]);
  return mergeChaptersAndQuizzesForOutline(chapters, quizzes);
}

/**
 * Last inclusive index in merged outline after including the first `paidChapterLimit`
 * **paid** (non-free) video chapters in order. Quizzes and free chapters do not increment the count.
 */
export function subscriptionPaidChapterCutoffIndex(
  sorted: CourseOutlineItem[],
  paidChapterLimit: number
): number {
  if (sorted.length === 0) return -1;
  let paidCount = 0;
  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    if (item.type === "chapter" && !item.isFree) {
      paidCount++;
      if (paidCount === paidChapterLimit) return i;
    }
  }
  return sorted.length - 1;
}

export async function getLockedByOutlineIndex(
  userId: string,
  courseId: string,
  outline: CourseOutlineItem[]
): Promise<boolean[]> {
  const purchase = await db.purchase.findFirst({
    where: buildActivePurchaseWhere(userId, courseId),
    select: { chaptersLimit: true },
  });

  const cutoff =
    purchase?.chaptersLimit != null
      ? subscriptionPaidChapterCutoffIndex(outline, purchase.chaptersLimit)
      : -1;

  return outline.map((item, index) => {
    if (item.type === "chapter" && item.isFree) return false;
    if (!purchase) return true;
    if (purchase.chaptersLimit === null) return false;
    return !(cutoff >= 0 && index <= cutoff);
  });
}

export async function canAccessCourseContentItem(
  userId: string,
  courseId: string,
  item: { id: string; type: "chapter" | "quiz" }
): Promise<boolean> {
  const purchase = await db.purchase.findFirst({
    where: buildActivePurchaseWhere(userId, courseId),
    select: { chaptersLimit: true },
  });
  if (!purchase) return false;
  if (purchase.chaptersLimit === null) return true;

  const sorted = await fetchCourseOutline(courseId);
  const cutoff = subscriptionPaidChapterCutoffIndex(sorted, purchase.chaptersLimit);
  const idx = sorted.findIndex((c) => c.id === item.id && c.type === item.type);
  if (idx === -1) return false;
  return cutoff >= 0 && idx <= cutoff;
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
