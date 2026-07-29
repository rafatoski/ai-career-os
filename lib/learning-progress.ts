import "server-only";

import { prisma } from "@/lib/prisma";
import { getRoadmapLesson, lessonKey } from "@/lib/roadmaps";

type PlaybackInput = {
  moduleSlug: string;
  lessonId: string;
  position: number;
  duration: number;
  ended?: boolean;
};

export async function savePlaybackProgress(input: PlaybackInput) {
  const content = await getRoadmapLesson(input.moduleSlug, input.lessonId);
  if (!content) throw new Error("Lesson not found.");

  const duration = Math.max(
    1,
    Math.round(input.duration || content.lesson.duration),
  );
  const position = Math.min(duration, Math.max(0, input.position));
  const watchedPercent = Math.min(
    100,
    Math.round((position / duration) * 100),
  );
  const key = lessonKey(input.moduleSlug, input.lessonId);
  const existing = await prisma.lessonProgress.findUnique({
    where: { lessonKey: key },
  });
  const bestPercent = Math.max(existing?.watchedPercent ?? 0, watchedPercent);
  const videoCompleted =
    existing?.videoCompleted || input.ended || bestPercent >= 90;

  return prisma.lessonProgress.upsert({
    where: { lessonKey: key },
    create: {
      lessonKey: key,
      moduleSlug: input.moduleSlug,
      lessonId: input.lessonId,
      playbackSeconds: position,
      videoDurationSeconds: duration,
      watchedPercent: bestPercent,
      videoCompleted,
    },
    update: {
      playbackSeconds: position,
      videoDurationSeconds: duration,
      watchedPercent: bestPercent,
      videoCompleted,
    },
  });
}
