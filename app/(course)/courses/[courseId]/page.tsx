import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Circle, Lock, ArrowRight } from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasActiveCourseAccess } from "@/lib/course-access";
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

  const [course, hasAccess] = await Promise.all([
    db.course.findUnique({
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
    }),
    hasActiveCourseAccess(userId, courseId),
  ]);

  if (!course) redirect("/dashboard");

  const normalizedSubject = normalizeSubjectForDisplay(course.subject);
  const subjectLabel = normalizedSubject
    ? SUBJECT_LABEL_BY_VALUE[normalizedSubject] ?? normalizedSubject
    : "المادة";
  const teacherName = course.user?.fullName ?? "المعلم";

  const chapters = course.chapters ?? [];
  const completedCount = chapters.filter((c) => c.userProgress?.[0]?.isCompleted).length;
  const totalCount = chapters.length;

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

        {/* Filter pills */}
        {/* (Removed) in-course categories row */}

        <div className="mt-8 text-center">
          <h1 className="text-lg font-bold md:text-xl">{course.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {completedCount}/{totalCount} تم إنجازه
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {chapters.map((chapter) => {
            const isCompleted = Boolean(chapter.userProgress?.[0]?.isCompleted);
            const isLocked = !hasAccess && !chapter.isFree;

            return (
              <Link
                key={chapter.id}
                href={`/courses/${course.id}/chapters/${chapter.id}`}
                className={cn(
                  "group block rounded-xl border bg-background px-4 py-3 shadow-sm transition",
                  "hover:bg-muted/30",
                  isLocked && "opacity-75"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="shrink-0">
                    {isLocked ? (
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
              </Link>
            );
          })}

          {chapters.length === 0 && (
            <div className="rounded-xl border border-dashed bg-background p-8 text-center text-sm text-muted-foreground">
              لا يوجد محتوى منشور لهذا الكورس حالياً.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

