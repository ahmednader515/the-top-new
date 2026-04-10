import { redirect } from "next/navigation";

export default function TeacherCoursesCreateLegacyRedirect() {
  redirect("/dashboard/teacher/courses/create");
}

