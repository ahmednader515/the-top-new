-- CreateTable
CREATE TABLE "FawaterakDeposit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "status" TEXT NOT NULL,
    "invoiceId" INTEGER,
    "invoiceKey" TEXT,
    "referenceNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FawaterakDeposit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FawaterakDeposit_invoiceId_key" ON "FawaterakDeposit"("invoiceId");

-- CreateIndex
CREATE INDEX "FawaterakDeposit_userId_idx" ON "FawaterakDeposit"("userId");

-- CreateIndex
CREATE INDEX "FawaterakDeposit_status_idx" ON "FawaterakDeposit"("status");

-- AddForeignKey
ALTER TABLE "FawaterakDeposit" ADD CONSTRAINT "FawaterakDeposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
