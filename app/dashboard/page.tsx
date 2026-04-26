import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDashboardUrlByRole } from "@/lib/utils";
import { SubjectFilterCarousel } from "./_components/subject-filter-carousel";
import {
  DIVISION_LABEL_BY_VALUE,
  GRADE_LABEL_BY_VALUE,
  SUBJECT_OPTIONS,
  getAllowedCourseDivisionTargets,
  getAllowedSubjectsForStudent,
  normalizeSubjectForDisplay,
  type SubjectValue,
} from "@/lib/academics";

type DashboardSearchParams = {
  subject?: string;
};

const DEFAULT_AVATAR = "/male.png";

function buildSubjectMap() {
  return Object.fromEntries(
    SUBJECT_OPTIONS.map((subject) => [subject.value, [] as Array<{
      id: string;
      title: string;
      imageUrl: string | null;
      teacherId: string;
      teacherName: string;
      teacherImage: string | null;
      subject: string | null;
    }>])
  ) as Record<SubjectValue, Array<{
    id: string;
    title: string;
    imageUrl: string | null;
    teacherId: string;
    teacherName: string;
    teacherImage: string | null;
    subject: string | null;
  }>>;
}

const StudyContentPage = async ({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return redirect("/");
  }

  if (
    session.user.role === "ADMIN" ||
    session.user.role === "ADMIN_ASSISTANT" ||
    session.user.role === "TEACHER"
  ) {
    return redirect(getDashboardUrlByRole(session.user.role));
  }

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      fullName: true,
      grade: true,
      division: true,
      curriculum: true,
      secondLanguage: true,
    },
  });

  const courseFilters: Prisma.CourseWhereInput = {
    isPublished: true,
  };

  if (currentUser?.grade) {
    courseFilters.grade = currentUser.grade;
  }

  if (currentUser?.curriculum) {
    courseFilters.curriculum = currentUser.curriculum;
  }

  const divisionTargets = getAllowedCourseDivisionTargets(
    currentUser?.grade ?? undefined,
    currentUser?.division ?? undefined
  );
  if (divisionTargets.length > 0) {
    courseFilters.OR = [
      { divisions: { hasSome: divisionTargets } },
      { divisions: { has: "BOTH" } },
      { divisions: { isEmpty: true } },
    ];
  }

  const courses = await db.course.findMany({
    where: courseFilters,
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          image: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const coursesBySubject = buildSubjectMap();
  for (const course of courses) {
    const normalizedSubject = normalizeSubjectForDisplay(course.subject);
    if (!normalizedSubject || !Object.prototype.hasOwnProperty.call(coursesBySubject, normalizedSubject)) {
      continue;
    }
    const teacherImageOverride = (course as { teacherImageUrl?: string | null }).teacherImageUrl;
    coursesBySubject[normalizedSubject as SubjectValue].push({
      id: course.id,
      title: course.title,
      imageUrl: course.imageUrl,
      teacherId: course.user.id,
      teacherName: course.user.fullName,
      teacherImage: teacherImageOverride || course.user.image,
      subject: normalizedSubject,
    });
  }

  const params = await searchParams;
  const allowedSubjects = getAllowedSubjectsForStudent({
    grade: currentUser?.grade ?? undefined,
    division: currentUser?.division ?? undefined,
    curriculum: currentUser?.curriculum ?? undefined,
    secondLanguage: currentUser?.secondLanguage ?? undefined,
  });
  const allowedSubjectOptions = SUBJECT_OPTIONS.filter((subject) => allowedSubjects.includes(subject.value));
  const availableSubjects = allowedSubjectOptions;
  const fallbackSubject = "ALL";
  const selectedSubjectParam = typeof params.subject === "string" ? params.subject : "ALL";
  const selectedSubject =
    selectedSubjectParam === "ALL" ||
    availableSubjects.some((subject) => subject.value === selectedSubjectParam)
      ? selectedSubjectParam
      : fallbackSubject;

  const currentSubjectConfig =
    selectedSubject !== "ALL"
      ? SUBJECT_OPTIONS.find((subject) => subject.value === selectedSubject)
      : null;
  const currentSubjectCourses =
    selectedSubject !== "ALL" && currentSubjectConfig
      ? coursesBySubject[currentSubjectConfig.value]
      : [];

  const gradeLabel = currentUser?.grade
    ? GRADE_LABEL_BY_VALUE[currentUser.grade] ?? "غير محدد"
    : "غير محدد";
  const compactGradeLabel = gradeLabel.replace("الصف ", "");
  const divisionLabel = currentUser?.division
    ? DIVISION_LABEL_BY_VALUE[currentUser.division] ?? ""
    : "";
  const curriculumShortLabel =
    currentUser?.curriculum === "ARABIC_CURRICULUM"
      ? "عربي"
      : currentUser?.curriculum === "LANGUAGES_CURRICULUM"
        ? "لغات"
        : "";
  const studentClassificationLabel = [compactGradeLabel, divisionLabel, curriculumShortLabel]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="p-4 md:p-6 space-y-5" dir="rtl">
      {(!currentUser?.grade || !currentUser?.division || !currentUser?.curriculum || !currentUser?.secondLanguage) && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          لم يتم تحديد الصف أو الشعبة أو المنهج أو اللغة الثانية في الحساب. تم عرض جميع الكورسات المنشورة المتاحة حالياً.
        </div>
      )}

      <div className="mx-auto mt-24 w-[80%]">
        <div className="mb-2 flex items-center justify-end">
          <p className="text-sm text-muted-foreground">
            {studentClassificationLabel || "غير محدد"}
          </p>
        </div>
        <SubjectFilterCarousel
          selectedSubject={selectedSubject}
          subjects={availableSubjects.map((subject) => ({
            value: subject.value,
            label: subject.label,
            icon: subject.icon,
            count: coursesBySubject[subject.value].length,
          }))}
        />
      </div>

      {selectedSubject === "ALL" ? (
        <div className="space-y-4">
          {availableSubjects.map((subject) => {
            const subjectCourses = coursesBySubject[subject.value];
            if (subjectCourses.length === 0) return null;
            return (
              <div key={subject.value} className="rounded-2xl border bg-white p-3 md:p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-base font-semibold md:text-lg">
                    {subject.icon} {subject.label}
                  </h2>
                  <span className="text-sm text-muted-foreground">{subjectCourses.length} مدرس</span>
                </div>
                <div className="space-y-3">
                  {subjectCourses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className="block rounded-xl border border-sky-200 bg-sky-50/20 p-3 transition hover:bg-sky-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border bg-slate-100">
                          <Image
                            src={course.teacherImage || DEFAULT_AVATAR}
                            alt={course.teacherName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="truncate text-sm font-semibold md:text-base">{course.title}</p>
                          <p className="truncate text-xs text-muted-foreground md:text-sm">{course.teacherName}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-500" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
          {availableSubjects.length === 0 && (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              لا يوجد كورسات مطابقة لتصنيفك الحالي.
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border bg-white p-3 md:p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold md:text-lg">
              {currentSubjectConfig?.icon} {currentSubjectConfig?.label}
            </h2>
            <span className="text-sm text-muted-foreground">{currentSubjectCourses.length} كورس</span>
          </div>

          <div className="space-y-3">
            {currentSubjectCourses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="block rounded-xl border border-sky-200 bg-sky-50/20 p-3 transition hover:bg-sky-50"
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border bg-slate-100">
                    <Image
                      src={course.teacherImage || DEFAULT_AVATAR}
                      alt={course.teacherName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate text-sm font-semibold md:text-base">{course.title}</p>
                    <p className="truncate text-xs text-muted-foreground md:text-sm">{course.teacherName}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </div>
              </Link>
            ))}
          </div>

          {currentSubjectCourses.length === 0 && (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              لا يوجد كورسات لهذه المادة في تصنيفك الحالي.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudyContentPage;