import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Legacy chapter editor URL — editing now happens in the course hub (content tab + sheet).
 */
export default async function TeacherChapterLegacyRedirect({
    params,
}: {
    params: Promise<{ courseId: string; chapterId: string }>;
}) {
    const { courseId, chapterId } = await params;
    const { user } = await auth();
    const coursesBasePath =
        user?.role === "ADMIN" ? "/dashboard/admin/courses" : "/dashboard/teacher/courses";
    redirect(
        `${coursesBasePath}/${courseId}?openChapter=${encodeURIComponent(chapterId)}`
    );
}
