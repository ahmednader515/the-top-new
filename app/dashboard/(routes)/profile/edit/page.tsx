import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDashboardUrlByRole } from "@/lib/utils";

import { EditProfileForm } from "./_components/edit-profile-form";

export default async function EditProfilePage() {
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
      fullName: true,
      phoneNumber: true,
      parentPhoneNumber: true,
      grade: true,
      division: true,
      curriculum: true,
      secondLanguage: true,
    },
  });

  if (!user) {
    return redirect("/dashboard/profile");
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6" dir="rtl">
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-xl font-bold text-slate-800 md:text-2xl">تعديل البيانات</h1>
        <EditProfileForm
          initialData={{
            fullName: user.fullName ?? "",
            phoneNumber: user.phoneNumber ?? "",
            parentPhoneNumber: user.parentPhoneNumber ?? "",
            grade: user.grade ?? "",
            division: user.division ?? "",
            curriculum: user.curriculum ?? "",
            secondLanguage: user.secondLanguage ?? "",
          }}
        />
      </div>
    </div>
  );
}
