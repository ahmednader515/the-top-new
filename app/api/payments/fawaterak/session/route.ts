import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { FAWATERAK_DEPOSIT_KIND } from "@/lib/fawaterak/deposit-kind";
import { sanitizeInternalNextPath } from "@/lib/fawaterak/success-redirect";
import {
  getFawaterakEnvType,
  getFawaterakIframeDomainForHashFallback,
  getFawaterakSecrets,
  getPublicAppOrigin,
  validateDepositAmount,
} from "@/lib/fawaterak/config";
import { formatDomainStringForIframeHmac, parseClientIframeDomain } from "@/lib/fawaterak/iframe-domain";
import { generateIframeHashKey } from "@/lib/fawaterak/hmac";
import { assertCoursePurchasable } from "@/lib/purchases/course-purchase-service";
import { prepareSubscriptionPurchase } from "@/lib/purchases/subscription-purchase-service";

function splitFullName(fullName: string): { first: string; last: string } {
  const t = fullName.trim();
  if (!t) return { first: "Student", last: "User" };
  const parts = t.split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: "-" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

function sanitizeEmailFromPhone(phone: string, userId: string): string {
  const digits = phone.replace(/\D/g, "");
  const local = digits.length >= 5 ? digits : userId.replace(/-/g, "").slice(0, 12);
  return `u${local}@example.com`;
}

type SessionBody = {
  amount?: unknown;
  iframeDomain?: unknown;
  courseId?: unknown;
  planId?: unknown;
  next?: unknown;
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const role = session.user.role;
    if (role !== "STUDENT" && role !== "USER") {
      return new NextResponse("Only learners can pay", { status: 403 });
    }

    const secrets = getFawaterakSecrets();
    if (!secrets) {
      console.error("[FAWATERAK_SESSION] Missing FAWATERAK_VENDOR_KEY or FAWATERAK_PROVIDER_KEY");
      return new NextResponse("Payment configuration error", { status: 503 });
    }

    const body = (await req.json()) as SessionBody;
    const courseIdRaw = typeof body.courseId === "string" ? body.courseId.trim() : "";
    const planIdRaw = typeof body.planId === "string" ? body.planId.trim() : "";
    const hasCourse = courseIdRaw.length > 0;
    const hasPlan = planIdRaw.length > 0;

    if (hasCourse && hasPlan) {
      return new NextResponse("Specify either courseId or planId, not both", { status: 400 });
    }

    const origin = getPublicAppOrigin();
    const defaultNext = "/dashboard/subscriptions";
    let amount: number;
    let kind: string;
    let courseId: string | null = null;
    let subscriptionPlanId: string | null = null;
    let cartName: string;
    let successNext: string;

    if (hasCourse) {
      const check = await assertCoursePurchasable(session.user.id, courseIdRaw);
      if (!check.ok) {
        if (check.error === "COURSE_NOT_FOUND") {
          return new NextResponse("Course is not available", { status: 404 });
        }
        if (check.error === "ALREADY_PURCHASED") {
          return new NextResponse("You already purchased this course", { status: 400 });
        }
        if (check.error === "INVALID_PRICE") {
          return new NextResponse("This course cannot be purchased for a fee", { status: 400 });
        }
        return new NextResponse("Cannot purchase this course", { status: 400 });
      }
      amount = check.price;
      kind = FAWATERAK_DEPOSIT_KIND.COURSE_PURCHASE;
      courseId = courseIdRaw;
      cartName = `شراء كورس: ${check.course.title}`;
      successNext = sanitizeInternalNextPath(body.next, "/dashboard");
    } else if (hasPlan) {
      const prep = await prepareSubscriptionPurchase(session.user.id, planIdRaw);
      if (!prep.ok) {
        const map: Record<string, string> = {
          PLAN_NOT_FOUND: "Subscription plan is not available",
          PLAN_MISCONFIGURED: "Subscription plan is misconfigured",
          USER_NOT_FOUND: "User not found",
          PROFILE_MISMATCH: "This plan is not available for your profile",
          NO_ELIGIBLE_COURSES: "No eligible courses found for this subscription",
          NO_BENEFIT:
            "لا يمكن تنفيذ الاشتراك — لديك بالفعل صلاحية مماثلة أو أعلى لجميع الكورسات المشمولة",
        };
        return new NextResponse(map[prep.error] ?? "Cannot subscribe", { status: 400 });
      }
      if (prep.plan.price <= 0) {
        return new NextResponse("Invalid plan price", { status: 400 });
      }
      amount = prep.plan.price;
      kind = FAWATERAK_DEPOSIT_KIND.SUBSCRIPTION_PURCHASE;
      subscriptionPlanId = planIdRaw;
      cartName = `اشتراك: ${prep.plan.title}`;
      successNext = sanitizeInternalNextPath(body.next, defaultNext);
    } else {
      const raw = body.amount;
      const parsed =
        typeof raw === "number"
          ? validateDepositAmount(raw)
          : typeof raw === "string"
            ? validateDepositAmount(parseFloat(raw))
            : null;
      if (parsed == null) {
        return new NextResponse("Invalid amount", { status: 400 });
      }
      amount = parsed;
      kind = FAWATERAK_DEPOSIT_KIND.BALANCE_TOPUP;
      cartName = "شحن رصيد — أكاديمية القمة";
      successNext = sanitizeInternalNextPath(body.next, defaultNext);
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        fullName: true,
        phoneNumber: true,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const deposit = await db.fawaterakDeposit.create({
      data: {
        userId: user.id,
        amount,
        currency: "EGP",
        status: "PENDING",
        kind,
        courseId,
        subscriptionPlanId,
      },
    });

    const clientDomain = parseClientIframeDomain(body.iframeDomain);
    const canonicalHttps = clientDomain ?? getFawaterakIframeDomainForHashFallback();
    const domainForHmac = formatDomainStringForIframeHmac(canonicalHttps);
    const hashKey = generateIframeHashKey(secrets.vendorKey, domainForHmac, secrets.providerKey);

    const { first, last } = splitFullName(user.fullName);
    const cartTotal = amount.toFixed(2);
    const itemPrice = cartTotal;

    const successUrl = `${origin}/dashboard/subscriptions/payment/success?next=${encodeURIComponent(successNext)}`;

    const requestBody = {
      cartTotal,
      currency: "EGP",
      customer: {
        first_name: first,
        last_name: last,
        email: sanitizeEmailFromPhone(user.phoneNumber, user.id),
        phone: user.phoneNumber.replace(/\D/g, "").slice(-11) || "01000000000",
        address: "Egypt",
      },
      redirectionUrls: {
        successUrl,
        failUrl: `${origin}/dashboard/subscriptions/payment/fail`,
        pendingUrl: `${origin}/dashboard/subscriptions/payment/pending`,
        webhookUrl: `${origin}/api/webhooks/fawaterak_json`,
      },
      cartItems: [
        {
          name: cartName,
          price: itemPrice,
          quantity: "1",
        },
      ],
      payLoad: {
        depositId: deposit.id,
        userId: user.id,
        kind,
      },
    };

    const envType = getFawaterakEnvType();

    return NextResponse.json({
      token: secrets.vendorKey,
      envType,
      hashKey,
      style: { listing: "horizontal" as const },
      version: "0",
      redirectOutIframe: true,
      requestBody,
    });
  } catch (error) {
    console.error("[FAWATERAK_SESSION]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
