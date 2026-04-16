import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { getDashboardUrlByRole } from "@/lib/utils";

import { FawaterakPaymentClient } from "./_components/fawaterak-payment-client";

export default async function SubscriptionsPaymentPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/");
  }
  if (
    session.user.role === "ADMIN" ||
    session.user.role === "TEACHER" ||
    session.user.role === "ADMIN_ASSISTANT"
  ) {
    redirect(getDashboardUrlByRole(session.user.role));
  }
  if (session.user.role !== "STUDENT" && session.user.role !== "USER") {
    redirect("/dashboard");
  }

  return <FawaterakPaymentClient />;
}
