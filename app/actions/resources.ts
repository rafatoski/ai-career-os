"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import {
  resourceCompletionSchema,
  resourceFormSchema,
} from "@/lib/validations/resource";

function revalidateResourceViews() {
  revalidatePath("/");
  revalidatePath("/roadmap");
  revalidatePath("/resources");
}

export async function createResourceAction(input: unknown) {
  const parsed = resourceFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Check the resource details.",
    };
  }

  const topicId = Number(parsed.data.topicId);
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    select: { id: true },
  });

  if (!topic) {
    return { ok: false as const, error: "That topic no longer exists." };
  }

  const existingResource = await prisma.resource.findFirst({
    where: { url: parsed.data.url },
    select: { id: true },
  });

  if (existingResource) {
    return { ok: false as const, error: "This resource is already saved." };
  }

  await prisma.resource.create({
    data: {
      title: parsed.data.title,
      url: parsed.data.url,
      type: parsed.data.type,
      topicId,
      estimatedMinutes: parsed.data.estimatedMinutes,
      summary: parsed.data.summary,
      notebookUrl: parsed.data.notebookUrl,
      sourceProvider: parsed.data.notebookUrl ? "NOTEBOOKLM" : "MANUAL",
    },
  });

  revalidateResourceViews();
  return { ok: true as const };
}

export async function toggleResourceAction(input: unknown) {
  const data = resourceCompletionSchema.parse(input);

  await prisma.resource.update({
    where: { id: data.resourceId },
    data: { completed: data.completed },
  });

  revalidateResourceViews();
}
