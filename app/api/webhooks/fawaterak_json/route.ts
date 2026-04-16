import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { getFawaterakSecrets } from "@/lib/fawaterak/config";
import { generatePaidWebhookHashKey, timingSafeEqualHex } from "@/lib/fawaterak/hmac";

export const runtime = "nodejs";

type PaidWebhookBody = {
  hashKey?: string;
  invoice_key?: string;
  invoice_id?: number;
  payment_method?: string;
  invoice_status?: string;
  pay_load?: unknown;
  referenceNumber?: string;
};

function parsePayLoad(raw: unknown): Record<string, unknown> | null {
  if (raw == null) return null;
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return null;
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const secrets = getFawaterakSecrets();
    if (!secrets) {
      console.error("[FAWATERAK_WEBHOOK] Missing FAWATERAK_VENDOR_KEY or FAWATERAK_PROVIDER_KEY");
      return new NextResponse("Service unavailable", { status: 503 });
    }

    let body: PaidWebhookBody;
    try {
      body = (await req.json()) as PaidWebhookBody;
    } catch {
      return new NextResponse("Invalid JSON", { status: 400 });
    }

    if (body.invoice_status !== "paid") {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const invoiceId = body.invoice_id;
    const invoiceKey = body.invoice_key;
    const paymentMethod = body.payment_method;
    const receivedHash = body.hashKey;

    if (
      typeof invoiceId !== "number" ||
      typeof invoiceKey !== "string" ||
      typeof paymentMethod !== "string" ||
      typeof receivedHash !== "string"
    ) {
      return new NextResponse("Invalid payload", { status: 400 });
    }

    const expectedHash = generatePaidWebhookHashKey(
      secrets.vendorKey,
      invoiceId,
      invoiceKey,
      paymentMethod
    );

    if (!timingSafeEqualHex(expectedHash, receivedHash)) {
      console.warn("[FAWATERAK_WEBHOOK] Invalid hashKey");
      return new NextResponse("Invalid signature", { status: 401 });
    }

    const payLoad = parsePayLoad(body.pay_load);
    const depositId = payLoad?.depositId;
    const userId = payLoad?.userId;

    if (typeof depositId !== "string" || typeof userId !== "string") {
      return new NextResponse("Missing pay_load", { status: 400 });
    }

    const ref =
      typeof body.referenceNumber === "string" ? body.referenceNumber : undefined;

    try {
      await db.$transaction(async (tx) => {
        const deposit = await tx.fawaterakDeposit.findUnique({
          where: { id: depositId },
        });

        if (!deposit || deposit.userId !== userId) {
          throw new Error("DEPOSIT_MISMATCH");
        }

        if (deposit.status === "COMPLETED") {
          return;
        }

        if (deposit.status === "FAILED") {
          throw new Error("DEPOSIT_FAILED");
        }

        const existingByInvoice = await tx.fawaterakDeposit.findFirst({
          where: {
            invoiceId,
            NOT: { id: depositId },
          },
        });
        if (existingByInvoice) {
          throw new Error("INVOICE_CONFLICT");
        }

        await tx.user.update({
          where: { id: userId },
          data: {
            balance: { increment: deposit.amount },
          },
        });

        await tx.balanceTransaction.create({
          data: {
            userId,
            amount: deposit.amount,
            type: "DEPOSIT",
            description: `شحن رصيد عبر Fawaterak — مرجع ${ref ?? invoiceKey}`,
          },
        });

        await tx.fawaterakDeposit.update({
          where: { id: depositId },
          data: {
            status: "COMPLETED",
            invoiceId,
            invoiceKey,
            referenceNumber: ref ?? null,
          },
        });
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return new NextResponse("Conflict", { status: 409 });
      }
      throw e;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "DEPOSIT_MISMATCH" || msg === "DEPOSIT_FAILED") {
      return new NextResponse("Invalid deposit", { status: 400 });
    }
    if (msg === "INVOICE_CONFLICT") {
      return new NextResponse("Conflict", { status: 409 });
    }
    console.error("[FAWATERAK_WEBHOOK]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
