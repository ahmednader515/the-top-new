import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Circle, Lock, ArrowRight } from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  getLockedByOutlineIndex,
  mergeChaptersAndQuizzesForOutline,
} from "@/lib/course-access";
import { cn } from "@/lib/utils";
import { normalizeSubjectForDisplay, SUBJECT_LABEL_BY_VALUE } from "@/lib/academics";

export default async function CourseContentPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const course = await db.course.findUnique({
    where: { id: courseId, isPublished: true },
    select: {
      id: true,
      title: true,
      subject: true,
      user: {
        select: {
          fullName: true,
        },
      },
      chapters: {
        where: { isPublished: true },
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          isFree: true,
          position: true,
          userProgress: {
            where: { userId },
            select: { isCompleted: true },
          },
        },
      },
    },
  });

  if (!course) redirect("/dashboard");

  const quizzes = await db.quiz.findMany({
    where: { courseId, isPublished: true },
    orderBy: { position: "asc" },
    select: {
      id: true,
      title: true,
      position: true,
      quizResults: {
        where: { studentId: userId },
        orderBy: { submittedAt: "desc" },
        take: 1,
        select: { id: true, percentage: true },
      },
    },
  });

  const chapters = course.chapters ?? [];
  const outline = mergeChaptersAndQuizzesForOutline(
    chapters.map((c) => ({ id: c.id, position: c.position, isFree: c.isFree })),
    quizzes.map((q) => ({ id: q.id, position: q.position }))
  );

  const lockedByIndex = await getLockedByOutlineIndex(userId, courseId, outline);

  const chapterById = new Map(chapters.map((c) => [c.id, c]));
  const quizById = new Map(quizzes.map((q) => [q.id, q]));

  const paidChapters = chapters.filter((c) => !c.isFree);
  const completedCount = paidChapters.filter((c) => c.userProgress?.[0]?.isCompleted).length;
  const totalCount = paidChapters.length;

  const normalizedSubject = normalizeSubjectForDisplay(course.subject);
  const subjectLabel = normalizedSubject
    ? SUBJECT_LABEL_BY_VALUE[normalizedSubject] ?? normalizedSubject
    : "المادة";
  const teacherName = course.user?.fullName ?? "المعلم";

  return (
    <div className="min-h-[calc(100vh-80px)] bg-muted/20" dir="rtl">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6 md:py-10 mt-24">
        <div className="flex items-center justify-start gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center gap-2 rounded-md border bg-background px-3 text-sm font-semibold text-slate-700 hover:bg-muted/40"
            >
              <ArrowRight className="h-4 w-4" />
              رجوع
            </Link>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900">{subjectLabel}</p>
              <p className="text-xs text-muted-foreground">{teacherName}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <h1 className="text-lg font-bold md:text-xl">{course.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalCount > 0 ? (
              <>
                {completedCount}/{totalCount} تم إنجازه{" "}
                <span className="text-muted-foreground/80">(الدروس المدفوعة فقط)</span>
              </>
            ) : (
              <>لا توجد دروس مدفوعة في هذا الكورس</>
            )}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {outline.map((item, index) => {
            const isLocked = lockedByIndex[index] ?? true;

            if (item.type === "chapter") {
              const chapter = chapterById.get(item.id);
              if (!chapter) return null;
              const isCompleted = Boolean(chapter.userProgress?.[0]?.isCompleted);
              const rowLocked = isLocked && !chapter.isFree;

              const inner = (
                <>
                  <div className="flex items-center gap-3">
                    <div className="shrink-0">
                      {rowLocked ? (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      ) : isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-300" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold">
                          {chapter.title || `الحصة (${chapter.position})`}
                        </p>
                        <div className="flex items-center gap-2">
                          {chapter.isFree && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                              مجانية
                            </span>
                          )}
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                            فيديو
                          </span>
                        </div>
                      </div>
                      {chapter.description && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {chapter.description.replace(/<[^>]*>/g, "")}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              );

              if (rowLocked) {
                return (
                  <div
                    key={`chapter-${chapter.id}`}
                    className="block rounded-xl border bg-background px-4 py-3 shadow-sm opacity-75"
                  >
                    {inner}
                  </div>
                );
              }

              return (
                <Link
                  key={`chapter-${chapter.id}`}
                  href={`/courses/${course.id}/chapters/${chapter.id}`}
                  className={cn(
                    "group block rounded-xl border bg-background px-4 py-3 shadow-sm transition",
                    "hover:bg-muted/30"
                  )}
                >
                  {inner}
                </Link>
              );
            }

            const quiz = quizById.get(item.id);
            if (!quiz) return null;
            const latest = quiz.quizResults[0];
            const quizDone = latest != null && latest.percentage >= 50;
            const rowLocked = isLocked;

            const quizInner = (
              <>
                <div className="flex items-center gap-3">
                  <div className="shrink-0">
                    {rowLocked ? (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    ) : quizDone ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-300" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">
                        {quiz.title || `اختبار (${quiz.position})`}
                      </p>
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-800">
                        اختبار
                      </span>
                    </div>
                  </div>
                </div>
              </>
            );

            if (rowLocked) {
              return (
                <div
                  key={`quiz-${quiz.id}`}
                  className="block rounded-xl border bg-background px-4 py-3 shadow-sm opacity-75"
                >
                  {quizInner}
                </div>
              );
            }

            return (
              <Link
                key={`quiz-${quiz.id}`}
                href={`/courses/${course.id}/quizzes/${quiz.id}`}
                className={cn(
                  "group block rounded-xl border bg-background px-4 py-3 shadow-sm transition",
                  "hover:bg-muted/30"
                )}
              >
                {quizInner}
              </Link>
            );
          })}

          {outline.length === 0 && (
            <div className="rounded-xl border border-dashed bg-background p-8 text-center text-sm text-muted-foreground">
              لا يوجد محتوى منشور لهذا الكورس حالياً.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
