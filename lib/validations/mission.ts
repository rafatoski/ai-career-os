import { z } from "zod";

export const missionTaskTypes = [
  "LESSON",
  "WATCH_RESOURCE",
  "MINI_PROJECT",
  "QUIZ",
  "GITHUB_COMMIT",
  "ENGLISH_PRACTICE",
  "REVIEW_NOTES",
  "INTERVIEW_PRACTICE",
] as const;

export const personalTaskSchema = z.object({
  title: z.string().trim().min(2, "Add a short task title.").max(100),
  description: z.string().trim().max(240),
  estimatedMinutes: z
    .number()
    .int()
    .min(5, "Use at least 5 minutes.")
    .max(120, "Keep a mission task under 2 hours."),
  category: z.enum(missionTaskTypes),
});

export const taskCompletionSchema = z.object({
  taskId: z.number().int().positive(),
  completed: z.boolean(),
});

export const taskSkipSchema = z.object({
  taskId: z.number().int().positive(),
  skipped: z.boolean(),
});

export const taskReorderSchema = z.object({
  taskId: z.number().int().positive(),
  direction: z.enum(["up", "down"]),
});

export const regenerateMissionSchema = z.object({
  availableMinutes: z.number().int().min(45).max(240),
});

export type PersonalTaskInput = z.infer<typeof personalTaskSchema>;
