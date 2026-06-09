-- AlterTable
ALTER TABLE "Invite" ADD COLUMN "eventAt" TIMESTAMP(3);

UPDATE "Invite" SET "eventAt" = "expiresAt";

ALTER TABLE "Invite" ALTER COLUMN "eventAt" SET NOT NULL;
