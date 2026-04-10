import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdminSubscriptionsPage() {
  const { user } = await auth();

  if (user?.role !== "ADMIN") {
    return redirect("/dashboard");
  }

  return redirect("/dashboard/admin/courses?tab=subscriptions");
}
