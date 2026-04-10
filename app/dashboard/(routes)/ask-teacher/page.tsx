import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Prisma } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDashboardUrlByRole } from "@/lib/utils";
import {
  getAllowedCourseDivisionTargets,
  getAllowedSubjectsForStudent,
  normalizeSubjectForDisplay,
  SUBJECT_LABEL_BY_VALUE,
} from "@/lib/academics";

function toWhatsAppUrl(rawPhone: string) {
  const digits = rawPhone.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}`;
}

export default async function AskTeacherPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return redirect("/");
  }

  if (session.user.role === "ADMIN" || session.user.role === "ADMIN_ASSISTANT") {
    return redirect(getDashboardUrlByRole(session.user.role));
  }

  const student = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      grade: true,
      division: true,
      curriculum: true,
      secondLanguage: true,
    },
  });

  const courseFilters: Prisma.CourseWhereInput = {
    isPublished: true,
  };

  if (student?.grade) {
    courseFilters.grade = student.grade;
  }
  if (student?.curriculum) {
    courseFilters.curriculum = student.curriculum;
  }

  const divisionTargets = getAllowedCourseDivisionTargets(student?.grade, student?.division);
  if (divisionTargets.length > 0) {
    courseFilters.OR = [
      { divisions: { hasSome: divisionTargets } },
      { divisions: { has: "BOTH" } },
      { divisions: { isEmpty: true } },
    ];
  }

  const allowedSubjects = getAllowedSubjectsForStudent({
    grade: student?.grade,
    division: student?.division,
    curriculum: student?.curriculum,
    secondLanguage: student?.secondLanguage,
  });

  const courses = await db.course.findMany({
    where: {
      ...courseFilters,
      teacherWhatsappNumber: { not: null },
      subject: { not: null },
    },
    include: {
      user: {
        select: {
          fullName: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const contactItems = courses
    .map((course) => {
      const normalizedSubject = normalizeSubjectForDisplay(course.subject);
      if (!normalizedSubject || !allowedSubjects.includes(normalizedSubject)) return null;
      if (!course.teacherWhatsappNumber) return null;
      return {
        id: course.id,
        subject: normalizedSubject,
        subjectLabel: SUBJECT_LABEL_BY_VALUE[normalizedSubject] || normalizedSubject,
        teacherName: course.user.fullName,
        whatsappUrl: toWhatsAppUrl(course.teacherWhatsappNumber),
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const deduped = Array.from(
    new Map(contactItems.map((item) => [`${item.subject}:${item.teacherName}`, item])).values()
  );

  return (
    <div className="p-6" dir="rtl">
      <div className="mx-auto max-w-xl space-y-3">
        {deduped.map((item) => (
          <a
            key={`${item.id}-${item.subject}`}
            href={item.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg bg-green-500 px-4 py-3 text-white shadow-sm transition hover:bg-green-600"
          >
            <span className="text-sm font-semibold">
              {item.subjectLabel} — {item.teacherName}
            </span>
            <MessageCircle className="h-5 w-5" />
          </a>
        ))}

        {deduped.length === 0 && (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            لا يوجد مدرسون متاحون للتواصل حالياً ضمن المواد المتاحة لك.
          </div>
        )}
      </div>
    </div>
  );
}
