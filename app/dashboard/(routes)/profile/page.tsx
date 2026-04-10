import Image from "next/image";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDashboardUrlByRole } from "@/lib/utils";
import {
  CURRICULUM_LABEL_BY_VALUE,
  DIVISION_LABEL_BY_VALUE,
  GRADE_LABEL_BY_VALUE,
} from "@/lib/academics";

import { ProfileActions } from "./_components/profile-actions";

function formatAcademicLabel(grade?: string | null, division?: string | null, curriculum?: string | null) {
  const gradeLabel = grade ? GRADE_LABEL_BY_VALUE[grade] ?? "" : "";
  const divisionLabel = division ? DIVISION_LABEL_BY_VALUE[division] ?? "" : "";
  const curriculumLabel = curriculum
    ? curriculum === "ARABIC_CURRICULUM"
      ? "عربي"
      : curriculum === "LANGUAGES_CURRICULUM"
        ? "لغات"
        : CURRICULUM_LABEL_BY_VALUE[curriculum] ?? ""
    : "";

  return [gradeLabel, divisionLabel, curriculumLabel].filter(Boolean).join(" ");
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return redirect("/");
  }

  if (session.user.role === "ADMIN" || session.user.role === "ADMIN_ASSISTANT") {
    return redirect(getDashboardUrlByRole(session.user.role));
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      fullName: true,
      image: true,
      grade: true,
      division: true,
      curriculum: true,
    },
  });

  if (!user) {
    return redirect("/");
  }

  const classLabel = formatAcademicLabel(user.grade, user.division, user.curriculum) || "غير محدد";

  return (
    <div className="min-h-screen bg-slate-100" dir="rtl">
      <div className="relative h-40 overflow-hidden rounded-b-[36px] bg-[#8ec9f7]">
        <div className="absolute right-16 top-10 h-8 w-8 rounded-md bg-white/20" />
        <div className="absolute left-20 top-12 h-10 w-10 rounded-md bg-white/15" />
      </div>

      <div className="-mt-16 px-4 pb-6">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-5 text-center">
            <div className="mx-auto relative h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-white shadow">
              <Image
                src={user.image || "/male.png"}
                alt="الصورة الشخصية"
                fill
                className="object-cover"
              />
            </div>
            <h1 className="mt-2 text-xl font-bold text-slate-800">{user.fullName}</h1>
            <p className="text-xs text-slate-500">{classLabel}</p>
          </div>

          <ProfileActions />
        </div>
      </div>
    </div>
  );
}
