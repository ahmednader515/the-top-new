-- Term plan: 12 chapters / 90 days → 16 chapters / 120 days (app constants)
UPDATE "SubscriptionPlan" SET "chaptersPerCourse" = 16 WHERE "chaptersPerCourse" = 12;

UPDATE "Purchase" SET "chaptersLimit" = 16 WHERE "chaptersLimit" = 12;
