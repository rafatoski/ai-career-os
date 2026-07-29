import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

import { z } from "zod";

const quizQuestionSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
  answerIndex: z.number().int().nonnegative(),
  explanation: z.string().min(1),
});

const lessonSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  youtubeUrl: z.string().url(),
  duration: z.number().int().positive(),
  description: z.string().min(1),
  notes: z.string().min(1),
  quiz: z.array(quizQuestionSchema).min(1),
  flashcards: z
    .array(
      z.object({
        front: z.string().min(1),
        back: z.string().min(1),
      }),
    )
    .default([]),
  exercise: z.string().default(""),
  project: z
    .object({
      title: z.string().min(1),
      description: z.string().min(1),
      requirements: z.array(z.string().min(1)).default([]),
    })
    .optional(),
  resources: z
    .array(
      z.object({
        title: z.string().min(1),
        url: z.string().url(),
      }),
    )
    .default([]),
});

const roadmapSchema = z.object({
  slug: z.string().min(1),
  order: z.number().int().nonnegative(),
  category: z.object({
    title: z.string().min(1),
    order: z.number().int().nonnegative(),
  }),
  alwaysAvailable: z.boolean().default(false),
  title: z.string().min(1),
  description: z.string().min(1),
  thumbnail: z.string(),
  lessons: z.array(lessonSchema),
});

export type Roadmap = z.infer<typeof roadmapSchema>;
export type RoadmapLesson = z.infer<typeof lessonSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;

const ROADMAPS_DIRECTORY = path.join(process.cwd(), "roadmaps");

export function lessonKey(moduleSlug: string, lessonId: string) {
  return `${moduleSlug}:${lessonId}`;
}

export async function getRoadmaps(): Promise<Roadmap[]> {
  const entries = await fs.readdir(ROADMAPS_DIRECTORY, {
    withFileTypes: true,
  });

  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name);

  const roadmaps = await Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(path.join(ROADMAPS_DIRECTORY, file), "utf8");

      try {
        return roadmapSchema.parse(JSON.parse(raw));
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(
            `Invalid roadmap file "${file}": ${error.issues
              .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
              .join("; ")}`,
          );
        }

        throw error;
      }
    }),
  );

  return roadmaps.sort((a, b) => a.order - b.order);
}

export async function getRoadmap(slug: string) {
  const roadmaps = await getRoadmaps();
  return roadmaps.find((roadmap) => roadmap.slug === slug) ?? null;
}

export async function getRoadmapLesson(moduleSlug: string, lessonId: string) {
  const roadmap = await getRoadmap(moduleSlug);
  const lesson =
    roadmap?.lessons.find((candidate) => candidate.id === lessonId) ?? null;

  return roadmap && lesson ? { roadmap, lesson } : null;
}
