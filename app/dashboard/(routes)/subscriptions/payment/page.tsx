import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDashboardUrlByRole } from "@/lib/utils";

import { FawaterakPaymentClient, type CheckoutPreset } from "./_components/fawaterak-payment-client";

type PageProps = {
  searchParams: Promise<{ courseId?: string; planId?: string; next?: string }>;
};

export default async function SubscriptionsPaymentPage({ searchParams }: PageProps) {
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

  const sp = await searchParams;
  const nextOverride = typeof sp.next === "string" ? sp.next : null;
  let preset: CheckoutPreset = null;

  if (sp.courseId) {
    const c = await db.course.findFirst({
      where: { id: sp.courseId, isPublished: true },
    });
    const price = c?.price ?? 0;
    if (c && price > 0) {
      preset = { mode: "course", courseId: c.id, title: c.title, amount: price };
    }
  } else if (sp.planId) {
    const p = await db.subscriptionPlan.findFirst({
      where: { id: sp.planId, isActive: true },
    });
    if (p && p.price > 0) {
      preset = { mode: "plan", planId: p.id, title: p.title, amount: p.price };
    }
  }

  return <FawaterakPaymentClient preset={preset} nextOverride={nextOverride} />;
}
