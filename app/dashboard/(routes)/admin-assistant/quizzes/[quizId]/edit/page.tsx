"use client";

import { useParams } from "next/navigation";
import { EditQuizForm } from "@/app/dashboard/(routes)/admin/quizzes/[quizId]/_components/edit-quiz-form";

export default function AdminEditQuizPage() {
    const params = useParams();
    const quizId = params.quizId as string;

    return (
        <EditQuizForm
            quizId={quizId}
            variant="page"
            dashboardPath="/dashboard/teacher/assessments"
            apiBasePath="/api/admin-assistant"
        />
    );
}
