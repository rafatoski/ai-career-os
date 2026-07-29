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
  estimatedMinutes: z
    .number()
    .int()
    .min(5, "Use at least 5 minutes.")
    .max(180, "Keep a resource under 3 hours."),
  summary: z
    .string()
    .trim()
    .max(1200, "Keep the study summary under 1,200 characters."),
  notebookUrl: z
    .string()
    .trim()
    .max(500)
    .refine((value) => {
      if (!value) return true;

      try {
        const url = new URL(value);
        return (
          (url.protocol === "https:" || url.protocol === "http:") &&
          (url.hostname === "notebooklm.google.com" ||
            url.hostname.endsWith(".notebooklm.google.com"))
        );
      } catch {
        return false;
      }
    }, "Enter a valid NotebookLM URL or leave it empty."),
});

export const resourceCompletionSchema = z.object({
  resourceId: z.number().int().positive(),
  completed: z.boolean(),
});

export type ResourceFormInput = z.infer<typeof resourceFormSchema>;
