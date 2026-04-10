import { redirect } from "next/navigation";

export default function Page({ params }: { params: { quizId: string } }) {
  redirect(`/dashboard/teacher/quizzes/${params.quizId}/edit`);
}

