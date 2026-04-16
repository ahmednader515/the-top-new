-- AlterTable
ALTER TABLE "FawaterakDeposit" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'BALANCE_TOPUP';
ALTER TABLE "FawaterakDeposit" ADD COLUMN "courseId" TEXT;
ALTER TABLE "FawaterakDeposit" ADD COLUMN "subscriptionPlanId" TEXT;

-- CreateIndex
CREATE INDEX "FawaterakDeposit_kind_idx" ON "FawaterakDeposit"("kind");
