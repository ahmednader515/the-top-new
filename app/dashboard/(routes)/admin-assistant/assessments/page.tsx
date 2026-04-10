"use client";

import { AdminQuizzesPanel } from "../_components/admin-quizzes-panel";

export default function AdminAssessmentsPage() {
  return (
    <div className="space-y-4 p-4 text-right md:space-y-6 md:p-6" dir="rtl">
      <h1 className="text-2xl font-bold md:text-3xl">الاختبارات</h1>
      <AdminQuizzesPanel embedded />
    </div>
  );
}
