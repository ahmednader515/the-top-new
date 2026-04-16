export const FAWATERAK_DEPOSIT_KIND = {
  BALANCE_TOPUP: "BALANCE_TOPUP",
  COURSE_PURCHASE: "COURSE_PURCHASE",
  SUBSCRIPTION_PURCHASE: "SUBSCRIPTION_PURCHASE",
} as const;

export type FawaterakDepositKind =
  (typeof FAWATERAK_DEPOSIT_KIND)[keyof typeof FAWATERAK_DEPOSIT_KIND];

/**
 * Decide how to fulfill a paid invoice. Prefer structural fields (`subscriptionPlanId` /
 * `courseId`) so a mis-stored `kind` value never turns a plan/course checkout into a balance top-up.
 */
export function resolveFawaterakFulfillmentKind(deposit: {
  kind: string | null | undefined;
  courseId: string | null | undefined;
  subscriptionPlanId: string | null | undefined;
}): FawaterakDepositKind {
  const planId = deposit.subscriptionPlanId?.trim();
  const courseId = deposit.courseId?.trim();

  if (planId) {
    return FAWATERAK_DEPOSIT_KIND.SUBSCRIPTION_PURCHASE;
  }
  if (courseId) {
    return FAWATERAK_DEPOSIT_KIND.COURSE_PURCHASE;
  }

  const k = deposit.kind?.trim() ?? "";
  if (k === FAWATERAK_DEPOSIT_KIND.SUBSCRIPTION_PURCHASE) {
    throw new Error("MISSING_PLAN_ID");
  }
  if (k === FAWATERAK_DEPOSIT_KIND.COURSE_PURCHASE) {
    throw new Error("MISSING_COURSE_ID");
  }
  return FAWATERAK_DEPOSIT_KIND.BALANCE_TOPUP;
}
