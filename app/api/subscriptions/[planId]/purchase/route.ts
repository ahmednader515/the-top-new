import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { purchaseSubscriptionWithBalance } from "@/lib/purchases/subscription-purchase-service";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.userId || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (
      session.user.role === "ADMIN" ||
      session.user.role === "TEACHER" ||
      session.user.role === "ADMIN_ASSISTANT"
    ) {
      return new NextResponse("Only students can buy subscriptions", { status: 403 });
    }

    const { planId } = await params;

    const result = await purchaseSubscriptionWithBalance(session.userId, planId);

    if (!result.ok) {
      const map: Record<string, { status: number; body: string }> = {
        PLAN_NOT_FOUND: { status: 404, body: "Subscription plan is not available" },
        PLAN_MISCONFIGURED: { status: 500, body: "Subscription plan is misconfigured" },
        USER_NOT_FOUND: { status: 404, body: "User not found" },
        INSUFFICIENT_BALANCE: { status: 400, body: "Insufficient balance" },
        PROFILE_MISMATCH: { status: 400, body: "This plan is not available for your profile" },
        NO_ELIGIBLE_COURSES: { status: 400, body: "No eligible courses found for this subscription" },
        NO_BENEFIT: {
          status: 400,
          body:
            "لا يمكن تنفيذ الاشتراك — لديك بالفعل صلاحية مماثلة أو أعلى لجميع الكورسات المشمولة",
        },
        TRANSACTION_FAILED: { status: 500, body: "Internal Error" },
      };
      const m = map[result.error] ?? { status: 500, body: "Internal Error" };
      return new NextResponse(m.body, { status: m.status });
    }

    return NextResponse.json({
      success: true,
      chaptersPerCourse: result.chaptersPerCourse,
      durationDays: result.durationDays,
      grantedCoursesCount: result.grantedCoursesCount,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error("[SUBSCRIPTION_PURCHASE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
