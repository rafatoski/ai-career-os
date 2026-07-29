-- AlterTable
ALTER TABLE "Resource" ADD COLUMN "summary" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Resource" ADD COLUMN "estimatedMinutes" INTEGER NOT NULL DEFAULT 15;
ALTER TABLE "Resource" ADD COLUMN "sourceProvider" TEXT NOT NULL DEFAULT 'MANUAL';
ALTER TABLE "Resource" ADD COLUMN "notebookUrl" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX "Resource_sourceProvider_idx" ON "Resource"("sourceProvider");
