PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

DROP TABLE IF EXISTS "MissionTask";
DROP TABLE IF EXISTS "DailyMission";
DROP TABLE IF EXISTS "StudySession";
DROP TABLE IF EXISTS "EnglishPractice";
DROP TABLE IF EXISTS "Project";
DROP TABLE IF EXISTS "Resource";
DROP TABLE IF EXISTS "Lesson";
DROP TABLE IF EXISTS "Topic";

CREATE TABLE "LessonProgress" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lessonKey" TEXT NOT NULL,
    "moduleSlug" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "playbackSeconds" REAL NOT NULL DEFAULT 0,
    "videoDurationSeconds" INTEGER NOT NULL DEFAULT 0,
    "watchedPercent" INTEGER NOT NULL DEFAULT 0,
    "videoCompleted" BOOLEAN NOT NULL DEFAULT false,
    "notesRead" BOOLEAN NOT NULL DEFAULT false,
    "quizPassed" BOOLEAN NOT NULL DEFAULT false,
    "quizScore" INTEGER NOT NULL DEFAULT 0,
    "quizAnswers" TEXT NOT NULL DEFAULT '{}',
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "LessonNote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lessonKey" TEXT NOT NULL,
    "moduleSlug" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "ProjectProgress" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "moduleSlug" TEXT NOT NULL,
    "lessonKey" TEXT NOT NULL,
    "githubUrl" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "LessonProgress_lessonKey_key" ON "LessonProgress"("lessonKey");
CREATE INDEX "LessonProgress_moduleSlug_lessonId_idx" ON "LessonProgress"("moduleSlug", "lessonId");
CREATE INDEX "LessonProgress_completed_idx" ON "LessonProgress"("completed");
CREATE UNIQUE INDEX "LessonNote_lessonKey_key" ON "LessonNote"("lessonKey");
CREATE INDEX "LessonNote_updatedAt_idx" ON "LessonNote"("updatedAt");
CREATE UNIQUE INDEX "ProjectProgress_moduleSlug_key" ON "ProjectProgress"("moduleSlug");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
