import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { purchaseCourseWithBalance } from "@/lib/purchases/course-purchase-service";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { userId } = await auth();
    const resolvedParams = await params;

    if (!userId) {
      console.log("[PURCHASE_ERROR] No user ID found in auth");
      return new NextResponse("Unauthorized - Please sign in to make a purchase", { status: 401 });
    }

    console.log(`[PURCHASE_ATTEMPT] User ${userId} attempting to purchase course ${resolvedParams.courseId}`);

    const result = await purchaseCourseWithBalance(userId, resolvedParams.courseId);

    if (!result.ok) {
      const map: Record<string, { status: number; body: string }> = {
        COURSE_NOT_FOUND: { status: 404, body: "Course not found or not available for purchase" },
        ALREADY_PURCHASED: { status: 400, body: "You have already purchased this course" },
        USER_NOT_FOUND: { status: 404, body: "User not found" },
        INSUFFICIENT_BALANCE: { status: 400, body: "Insufficient balance" },
        INVALID_PRICE: { status: 400, body: "This course cannot be purchased for a fee" },
        TRANSACTION_FAILED: { status: 500, body: "Internal Error" },
      };
      const m = map[result.error] ?? { status: 500, body: "Internal Error" };
      return new NextResponse(m.body, { status: m.status });
    }

    console.log(`[PURCHASE_SUCCESS] User ${userId} successfully purchased course ${resolvedParams.courseId}`);

    return NextResponse.json({
      success: true,
      purchaseId: result.purchaseId,
      newBalance: result.newBalance,
    });
  } catch (error) {
    console.error("[PURCHASE_ERROR] Unexpected error:", error);
    if (error instanceof Error) {
      return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
