"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { savePlaybackProgress } from "@/lib/learning-progress";
import { getRoadmapLesson, lessonKey } from "@/lib/roadmaps";
import { z } from "zod";

const lessonIdentitySchema = z.object({
  moduleSlug: z.string().min(1),
  lessonId: z.string().min(1),
});

const playbackSchema = lessonIdentitySchema.extend({
  position: z.number().nonnegative(),
  duration: z.number().positive(),
  ended: z.boolean().optional(),
});

function refreshLearningPaths(moduleSlug: string, lessonId: string) {
  revalidatePath("/");
  revalidatePath(`/learn/${moduleSlug}/${lessonId}`);
}

async function requireLesson(moduleSlug: string, lessonId: string) {
  const content = await getRoadmapLesson(moduleSlug, lessonId);
  if (!content) throw new Error("Lesson not found.");
  return content;
}

export async function savePlaybackProgressAction(input: unknown) {
  const parsed = playbackSchema.parse(input);
  const progress = await savePlaybackProgress(parsed);

  if (progress.videoCompleted) {
    refreshLearningPaths(parsed.moduleSlug, parsed.lessonId);
  }

  return {
    playbackSeconds: progress.playbackSeconds,
    watchedPercent: progress.watchedPercent,
    videoCompleted: progress.videoCompleted,
  };
}

export async function markLessonNotesReadAction(input: unknown) {
  const parsed = lessonIdentitySchema.parse(input);
  await requireLesson(parsed.moduleSlug, parsed.lessonId);
  const key = lessonKey(parsed.moduleSlug, parsed.lessonId);

  await prisma.lessonProgress.upsert({
    where: { lessonKey: key },
    create: {
      lessonKey: key,
      moduleSlug: parsed.moduleSlug,
      lessonId: parsed.lessonId,
      notesRead: true,
    },
    update: { notesRead: true },
  });

  refreshLearningPaths(parsed.moduleSlug, parsed.lessonId);
  return { success: true };
}

const quizSubmissionSchema = lessonIdentitySchema.extend({
  answers: z.record(z.string(), z.number().int().nonnegative()),
});

export async function submitQuizAction(input: unknown) {
  const parsed = quizSubmissionSchema.parse(input);
  const { lesson } = await requireLesson(parsed.moduleSlug, parsed.lessonId);
  const correct = lesson.quiz.reduce(
    (total, question) =>
      total + (parsed.answers[question.id] === question.answerIndex ? 1 : 0),
    0,
  );
  const score = Math.round((correct / lesson.quiz.length) * 100);
  const passed = score >= 80;
  const key = lessonKey(parsed.moduleSlug, parsed.lessonId);

  await prisma.lessonProgress.upsert({
    where: { lessonKey: key },
    create: {
      lessonKey: key,
      moduleSlug: parsed.moduleSlug,
      lessonId: parsed.lessonId,
      quizScore: score,
      quizPassed: passed,
      quizAnswers: JSON.stringify(parsed.answers),
    },
    update: {
      quizScore: score,
      quizPassed: passed,
      quizAnswers: JSON.stringify(parsed.answers),
    },
  });

  refreshLearningPaths(parsed.moduleSlug, parsed.lessonId);
  return {
    passed,
    score,
    correct,
    total: lesson.quiz.length,
    results: lesson.quiz.map((question) => ({
      id: question.id,
      correct: parsed.answers[question.id] === question.answerIndex,
      answerIndex: question.answerIndex,
      explanation: question.explanation,
    })),
  };
}

export async function completeLessonAction(input: unknown) {
  const parsed = lessonIdentitySchema.parse(input);
  await requireLesson(parsed.moduleSlug, parsed.lessonId);
  const key = lessonKey(parsed.moduleSlug, parsed.lessonId);
  const progress = await prisma.lessonProgress.findUnique({
    where: { lessonKey: key },
  });

  if (
    !progress?.videoCompleted ||
    !progress.notesRead ||
    !progress.quizPassed
  ) {
    return {
      success: false,
      message: "Finish the video, lesson notes and quiz first.",
    };
  }

  await prisma.lessonProgress.update({
    where: { lessonKey: key },
    data: {
      completed: true,
      completedAt: progress.completedAt ?? new Date(),
    },
  });

  refreshLearningPaths(parsed.moduleSlug, parsed.lessonId);
  return { success: true, message: "Lesson complete." };
}

const noteSchema = lessonIdentitySchema.extend({
  content: z.string().max(50_000),
});

export async function saveLessonNoteAction(input: unknown) {
  const parsed = noteSchema.parse(input);
  await requireLesson(parsed.moduleSlug, parsed.lessonId);
  const key = lessonKey(parsed.moduleSlug, parsed.lessonId);

  await prisma.lessonNote.upsert({
    where: { lessonKey: key },
    create: {
      lessonKey: key,
      moduleSlug: parsed.moduleSlug,
      lessonId: parsed.lessonId,
      content: parsed.content,
    },
    update: { content: parsed.content },
  });

  revalidatePath("/");
  return { success: true };
}

const projectSchema = lessonIdentitySchema.extend({
  githubUrl: z
    .union([z.literal(""), z.string().url()])
    .refine(
      (value) =>
        !value ||
        (() => {
          try {
            return new URL(value).hostname === "github.com";
          } catch {
            return false;
          }
        })(),
      "Use a valid GitHub URL.",
    ),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]),
  completed: z.boolean(),
});

export async function saveProjectProgressAction(input: unknown) {
  const parsed = projectSchema.parse(input);
  const { lesson } = await requireLesson(
    parsed.moduleSlug,
    parsed.lessonId,
  );
  if (!lesson.project) throw new Error("This lesson has no project.");

  await prisma.projectProgress.upsert({
    where: { moduleSlug: parsed.moduleSlug },
    create: {
      moduleSlug: parsed.moduleSlug,
      lessonKey: lessonKey(parsed.moduleSlug, parsed.lessonId),
      githubUrl: parsed.githubUrl,
      status: parsed.completed ? "COMPLETED" : parsed.status,
      completed: parsed.completed,
    },
    update: {
      lessonKey: lessonKey(parsed.moduleSlug, parsed.lessonId),
      githubUrl: parsed.githubUrl,
      status: parsed.completed ? "COMPLETED" : parsed.status,
      completed: parsed.completed,
    },
  });

  refreshLearningPaths(parsed.moduleSlug, parsed.lessonId);
  return { success: true };
}
