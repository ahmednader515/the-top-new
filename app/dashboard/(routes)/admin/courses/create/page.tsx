import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const CreatePage = async () => {
    const { userId, user } = await auth();

    if (!userId) {
        return redirect("/");
    }

    const course = await db.course.create({
        data: {
            userId,
            title: "كورس غير معرفة",
        }
    });

    const coursesBasePath =
        user?.role === "ADMIN" ? "/dashboard/admin/courses" : "/dashboard/teacher/courses";

    return redirect(`${coursesBasePath}/${course.id}`);
};

export default CreatePage; 