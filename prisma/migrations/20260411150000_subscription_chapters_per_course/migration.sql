-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN IF NOT EXISTS "chaptersLimit" INTEGER;

-- RenameColumn: duration-based plans replaced with chapter counts per course (idempotent)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'SubscriptionPlan'
      AND column_name = 'durationDays'
  ) THEN
    ALTER TABLE "SubscriptionPlan" RENAME COLUMN "durationDays" TO "chaptersPerCourse";
  END IF;
END $$;

-- Normalize legacy day counts to a valid chapter allowance (monthly default)
UPDATE "SubscriptionPlan" SET "chaptersPerCourse" = 4 WHERE "chaptersPerCourse" IS NOT NULL AND "chaptersPerCourse" NOT IN (4, 12);
