import { redirect } from "next/navigation";

export default function TeacherDashboardRootPage() {
  redirect("/dashboard/teacher/courses");
}
