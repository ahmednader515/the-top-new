"use client";

import { AdminProgressPanel } from "../_components/admin-progress-panel";

export default function TeacherProgressPage() {
  return (
    <div className="space-y-4 p-4 text-right md:space-y-6 md:p-6" dir="rtl">
      <h1 className="text-2xl font-bold md:text-3xl">تقدم الطلاب</h1>
      <AdminProgressPanel embedded />
    </div>
  );
}
