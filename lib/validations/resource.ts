import { z } from "zod";

export const resourceTypes = [
  "YOUTUBE",
  "ARTICLE",
  "DOCUMENTATION",
  "COURSE",
] as const;

export const resourceFormSchema = z.object({
  title: z.string().trim().min(2, "Add a resource title.").max(120),
  url: z
    .string()
    .trim()
    .url("Enter a valid URL.")
    .refine(
      (value) => value.startsWith("https://") || value.startsWith("http://"),
      "Use an http or https URL.",
    ),
  type: z.enum(resourceTypes),
  topicId: z.string().regex(/^\d+$/, "Choose a topic."),
});

export const resourceCompletionSchema = z.object({
  resourceId: z.number().int().positive(),
  completed: z.boolean(),
});

export type ResourceFormInput = z.infer<typeof resourceFormSchema>;
