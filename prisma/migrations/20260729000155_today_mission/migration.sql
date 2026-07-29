-- CreateTable
CREATE TABLE "DailyMission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "availableMinutes" INTEGER NOT NULL DEFAULT 90,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MissionTask" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "missionId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estimatedMinutes" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "xp" INTEGER NOT NULL,
    "isPersonal" BOOLEAN NOT NULL DEFAULT false,
    "lessonId" INTEGER,
    "resourceId" INTEGER,
    "projectId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MissionTask_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "DailyMission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MissionTask_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MissionTask_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MissionTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Topic" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estimatedHours" INTEGER NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 50,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Topic" ("createdAt", "description", "estimatedHours", "id", "slug", "sortOrder", "title", "updatedAt") SELECT "createdAt", "description", "estimatedHours", "id", "slug", "sortOrder", "title", "updatedAt" FROM "Topic";
DROP TABLE "Topic";
ALTER TABLE "new_Topic" RENAME TO "Topic";
CREATE UNIQUE INDEX "Topic_slug_key" ON "Topic"("slug");
CREATE INDEX "Topic_sortOrder_idx" ON "Topic"("sortOrder");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "DailyMission_date_key" ON "DailyMission"("date");

-- CreateIndex
CREATE INDEX "DailyMission_date_idx" ON "DailyMission"("date");

-- CreateIndex
CREATE INDEX "MissionTask_missionId_order_idx" ON "MissionTask"("missionId", "order");

-- CreateIndex
CREATE INDEX "MissionTask_completed_idx" ON "MissionTask"("completed");

-- CreateIndex
CREATE INDEX "MissionTask_lessonId_idx" ON "MissionTask"("lessonId");

-- CreateIndex
CREATE INDEX "MissionTask_resourceId_idx" ON "MissionTask"("resourceId");

-- CreateIndex
CREATE INDEX "MissionTask_projectId_idx" ON "MissionTask"("projectId");

-- Seed the initial learning priorities used by the mission planner.
UPDATE "Topic" SET "priority" = 100 WHERE "slug" = 'typescript';
UPDATE "Topic" SET "priority" = 95 WHERE "slug" IN ('react', 'ai-product-engineering');
UPDATE "Topic" SET "priority" = 90 WHERE "slug" = 'nextjs';
UPDATE "Topic" SET "priority" = 85 WHERE "slug" IN ('nodejs', 'ai-fundamentals', 'prompt-engineering');
UPDATE "Topic" SET "priority" = 80 WHERE "slug" = 'english';
UPDATE "Topic" SET "priority" = 75 WHERE "slug" = 'github';
