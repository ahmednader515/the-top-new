import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  getFawaterakEnvType,
  getFawaterakIframeDomainForHashFallback,
  getFawaterakSecrets,
  getPublicAppOrigin,
  validateDepositAmount,
} from "@/lib/fawaterak/config";
import { formatDomainStringForIframeHmac, parseClientIframeDomain } from "@/lib/fawaterak/iframe-domain";
import { generateIframeHashKey } from "@/lib/fawaterak/hmac";

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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const role = session.user.role;
    if (role !== "STUDENT" && role !== "USER") {
      return new NextResponse("Only learners can top up balance", { status: 403 });
    }

    const secrets = getFawaterakSecrets();
    if (!secrets) {
      console.error("[FAWATERAK_SESSION] Missing FAWATERAK_VENDOR_KEY or FAWATERAK_PROVIDER_KEY");
      return new NextResponse("Payment configuration error", { status: 503 });
    }

    const body = (await req.json()) as { amount?: unknown; iframeDomain?: unknown };
    const raw = body.amount;
    const amount =
      typeof raw === "number"
        ? validateDepositAmount(raw)
        : typeof raw === "string"
          ? validateDepositAmount(parseFloat(raw))
          : null;
    if (amount == null) {
      return new NextResponse("Invalid amount", { status: 400 });
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
      },
    });

    const origin = getPublicAppOrigin();

    const clientDomain = parseClientIframeDomain(body.iframeDomain);
    const canonicalHttps =
      clientDomain ?? getFawaterakIframeDomainForHashFallback();
    const domainForHmac = formatDomainStringForIframeHmac(canonicalHttps);
    const hashKey = generateIframeHashKey(secrets.vendorKey, domainForHmac, secrets.providerKey);

    if (process.env.NODE_ENV === "development") {
      console.log("[FAWATERAK_SESSION] iframe HMAC Domain=", domainForHmac);
    }

    const { first, last } = splitFullName(user.fullName);
    const cartTotal = amount.toFixed(2);
    const itemPrice = cartTotal;

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
        successUrl: `${origin}/dashboard/subscriptions/payment/success`,
        failUrl: `${origin}/dashboard/subscriptions/payment/fail`,
        pendingUrl: `${origin}/dashboard/subscriptions/payment/pending`,
        webhookUrl: `${origin}/api/webhooks/fawaterak_json`,
      },
      cartItems: [
        {
          name: "شحن رصيد — أكاديمية القمة",
          price: itemPrice,
          quantity: "1",
        },
      ],
      payLoad: {
        depositId: deposit.id,
        userId: user.id,
      },
    };

    const envType = getFawaterakEnvType();

    return NextResponse.json({
      // fawaterkPlugin.min.js sends `Authorization: Bearer ${pluginConfig.token}` (API key).
      token: secrets.vendorKey,
      envType,
      hashKey,
      style: { listing: "horizontal" as const },
      version: "0",
      requestBody,
      ...(process.env.NODE_ENV === "development"
        ? {
            _debug: {
              hmacDomain: domainForHmac,
              canonicalIframeHttps: canonicalHttps,
              envType,
            },
          }
        : {}),
    });
  } catch (error) {
    console.error("[FAWATERAK_SESSION]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
