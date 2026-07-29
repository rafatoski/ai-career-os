import "server-only";

import { prisma } from "@/lib/prisma";
import {
  getRoadmapLesson,
  getRoadmaps,
  lessonKey,
  type Roadmap,
  type RoadmapLesson,
} from "@/lib/roadmaps";

export type LessonState = {
  id: string;
  type: "reading" | "video";
  title: string;
  duration: number;
  completed: boolean;
  unlocked: boolean;
  playbackSeconds: number;
  watchedPercent: number;
  videoCompleted: boolean;
  notesRead: boolean;
  quizPassed: boolean;
  quizScore: number;
};

export type ModuleState = {
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  category: {
    title: string;
    order: number;
  };
  alwaysAvailable: boolean;
  configured: boolean;
  completed: boolean;
  unlocked: boolean;
  progress: number;
  currentLessonId: string | null;
  lessons: LessonState[];
};

export type RecentNote = {
  lessonKey: string;
  moduleTitle: string;
  lessonTitle: string;
  content: string;
  updatedAt: string;
  href: string;
};

export type LearningState = {
  modules: ModuleState[];
  current: {
    module: ModuleState;
    lesson: LessonState;
    href: string;
  } | null;
  recentNotes: RecentNote[];
};

type ProgressRecord = {
  lessonKey: string;
  playbackSeconds: number;
  watchedPercent: number;
  videoCompleted: boolean;
  notesRead: boolean;
  quizPassed: boolean;
  quizScore: number;
  completed: boolean;
};

function buildModuleStates(
  roadmaps: Roadmap[],
  progressRecords: ProgressRecord[],
) {
  const progressByKey = new Map(
    progressRecords.map((progress) => [progress.lessonKey, progress]),
  );
  const moduleCompletion = new Map<string, boolean>();
  const moduleVideoCompletion = new Map<string, boolean>();

  for (const roadmap of roadmaps) {
    const configured = roadmap.lessons.length > 0;
    moduleCompletion.set(
      roadmap.slug,
      configured &&
        roadmap.lessons.every(
          (lesson) =>
            progressByKey.get(lessonKey(roadmap.slug, lesson.id))?.completed,
        ),
    );
    moduleVideoCompletion.set(
      roadmap.slug,
      roadmap.lessons.some(
        (lesson) =>
          lesson.type === "video" &&
          progressByKey.get(lessonKey(roadmap.slug, lesson.id))?.videoCompleted,
      ),
    );
  }

  const sequencedRoadmaps = roadmaps.filter(
    (roadmap) => roadmap.lessons.length > 0 && !roadmap.alwaysAvailable,
  );

  return roadmaps.map<ModuleState>((roadmap) => {
    const configured = roadmap.lessons.length > 0;
    const sequenceIndex = sequencedRoadmaps.findIndex(
      (candidate) => candidate.slug === roadmap.slug,
    );
    const previousModule =
      sequenceIndex > 0 ? sequencedRoadmaps[sequenceIndex - 1] : null;
    const previousModuleVideoComplete =
      !previousModule ||
      Boolean(moduleVideoCompletion.get(previousModule.slug));
    const moduleUnlocked = configured;
    const lessons = roadmap.lessons.map<LessonState>((lesson, index) => {
      const progress = progressByKey.get(lessonKey(roadmap.slug, lesson.id));
      const previousLesson = roadmap.lessons[index - 1];
      const previousComplete =
        !previousLesson ||
        Boolean(
          progressByKey.get(lessonKey(roadmap.slug, previousLesson.id))
            ?.completed,
        );

      return {
        id: lesson.id,
        type: lesson.type,
        title: lesson.title,
        duration: lesson.duration,
        completed: progress?.completed ?? false,
        unlocked:
          index === 0
            ? lesson.type === "reading"
            : previousComplete &&
              (lesson.type === "reading" ||
                roadmap.alwaysAvailable ||
                previousModuleVideoComplete),
        playbackSeconds: progress?.playbackSeconds ?? 0,
        watchedPercent: progress?.watchedPercent ?? 0,
        videoCompleted: progress?.videoCompleted ?? false,
        notesRead: progress?.notesRead ?? false,
        quizPassed: progress?.quizPassed ?? false,
        quizScore: progress?.quizScore ?? 0,
      };
    });
    const completedCount = lessons.filter((lesson) => lesson.completed).length;
    const currentLesson =
      lessons.find((lesson) => lesson.unlocked && !lesson.completed) ??
      lessons.findLast((lesson) => lesson.unlocked) ??
      null;

    return {
      slug: roadmap.slug,
      title: roadmap.title,
      description: roadmap.description,
      thumbnail: roadmap.thumbnail,
      category: roadmap.category,
      alwaysAvailable: roadmap.alwaysAvailable,
      configured,
      completed: moduleCompletion.get(roadmap.slug) ?? false,
      unlocked: moduleUnlocked,
      progress: configured
        ? Math.round((completedCount / lessons.length) * 100)
        : 0,
      currentLessonId: currentLesson?.id ?? null,
      lessons,
    };
  });
}

export async function getLearningState(): Promise<LearningState> {
  const [roadmaps, progressRecords, notes] = await Promise.all([
    getRoadmaps(),
    prisma.lessonProgress.findMany(),
    prisma.lessonNote.findMany({
      where: { content: { not: "" } },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  const modules = buildModuleStates(roadmaps, progressRecords);
  const currentModule =
    modules.find(
      (module) =>
        module.configured &&
        !module.alwaysAvailable &&
        module.unlocked &&
        !module.completed,
    ) ??
    modules.find(
      (module) =>
        module.configured && !module.alwaysAvailable && module.unlocked,
    ) ??
    null;
  const currentLesson = currentModule
    ? (currentModule.lessons.find(
        (lesson) =>
          lesson.id === currentModule.currentLessonId && lesson.unlocked,
      ) ?? null)
    : null;
  const roadmapsBySlug = new Map(
    roadmaps.map((roadmap) => [roadmap.slug, roadmap]),
  );
  const recentNotes = notes.flatMap<RecentNote>((note) => {
    const roadmap = roadmapsBySlug.get(note.moduleSlug);
    const lesson = roadmap?.lessons.find(
      (candidate) => candidate.id === note.lessonId,
    );

    if (!roadmap || !lesson) return [];

    return [
      {
        lessonKey: note.lessonKey,
        moduleTitle: roadmap.title,
        lessonTitle: lesson.title,
        content: note.content,
        updatedAt: note.updatedAt.toISOString(),
        href: `/learn/${roadmap.slug}/${lesson.id}`,
      },
    ];
  });

  return {
    modules,
    current:
      currentModule && currentLesson
        ? {
            module: currentModule,
            lesson: currentLesson,
            href: `/learn/${currentModule.slug}/${currentLesson.id}`,
          }
        : null,
    recentNotes,
  };
}

export async function getLessonPageData(
  moduleSlug: string,
  lessonId: string,
) {
  const [content, learningState] = await Promise.all([
    getRoadmapLesson(moduleSlug, lessonId),
    getLearningState(),
  ]);

  if (!content) return null;

  const moduleState = learningState.modules.find(
    (module) => module.slug === moduleSlug,
  );
  const lessonState = moduleState?.lessons.find(
    (lesson) => lesson.id === lessonId,
  );

  if (!moduleState || !lessonState || !lessonState.unlocked) return null;

  const lessonIndex = content.roadmap.lessons.findIndex(
    (lesson) => lesson.id === lessonId,
  );
  const previous = content.roadmap.lessons[lessonIndex - 1] ?? null;
  const next = content.roadmap.lessons[lessonIndex + 1] ?? null;
  const [note, projectProgress] = await Promise.all([
    prisma.lessonNote.findUnique({
      where: { lessonKey: lessonKey(moduleSlug, lessonId) },
    }),
    content.lesson.project
      ? prisma.projectProgress.findUnique({ where: { moduleSlug } })
      : Promise.resolve(null),
  ]);

  return {
    modules: learningState.modules,
    roadmap: content.roadmap,
    lesson: content.lesson,
    lessonState,
    note: note?.content ?? "",
    previous: previous
      ? {
          id: previous.id,
          title: previous.title,
          href: `/learn/${moduleSlug}/${previous.id}`,
        }
      : null,
    next:
      next &&
      moduleState.lessons.find((candidate) => candidate.id === next.id)
        ?.unlocked
        ? {
            id: next.id,
            title: next.title,
            href: `/learn/${moduleSlug}/${next.id}`,
          }
        : null,
    projectProgress: projectProgress
      ? {
          githubUrl: projectProgress.githubUrl,
          status: projectProgress.status,
          completed: projectProgress.completed,
        }
      : null,
  };
}

export function getLessonById(roadmap: Roadmap, lessonId: string) {
  return roadmap.lessons.find((lesson) => lesson.id === lessonId) ?? null;
}

export type LessonPageData = NonNullable<
  Awaited<ReturnType<typeof getLessonPageData>>
>;
export type LessonContent = RoadmapLesson;
