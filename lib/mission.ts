import "server-only";

import { MissionTaskType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { clampPercentage } from "@/lib/utils";
import type { PersonalTaskInput } from "@/lib/validations/mission";

const DEFAULT_AVAILABLE_MINUTES = 90;
const DAILY_MISSION_BONUS_XP = 100;

type GeneratedTask = {
  title: string;
  description: string;
  estimatedMinutes: number;
  category: MissionTaskType;
  completed?: boolean;
  lessonId?: number;
  resourceId?: number;
  projectId?: number;
};

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfToday() {
  const date = startOfToday();
  date.setDate(date.getDate() + 1);
  return date;
}

function shiftDays(date: Date, amount: number) {
  const shifted = new Date(date);
  shifted.setDate(shifted.getDate() + amount);
  return shifted;
}

function dateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function xpForDuration(minutes: number) {
  if (minutes <= 15) return 10;
  if (minutes <= 30) return 25;
  return 50;
}

function progressOf(lessons: { completed: boolean }[]) {
  if (!lessons.length) return 0;
  return clampPercentage(
    (lessons.filter((lesson) => lesson.completed).length / lessons.length) *
      100,
  );
}

function calculateStreak(sessionDates: Date[]) {
  const studiedDays = new Set(sessionDates.map(dateKey));
  let cursor = startOfToday();

  if (!studiedDays.has(dateKey(cursor))) {
    cursor = shiftDays(cursor, -1);
  }

  let streak = 0;
  while (studiedDays.has(dateKey(cursor))) {
    streak += 1;
    cursor = shiftDays(cursor, -1);
  }

  return streak;
}

function lessonBlockDuration(availableMinutes: number, lessonCount: number) {
  const reservedMinutes = 40;
  const lessonBudget = Math.max(20, availableMinutes - reservedMinutes);
  return Math.max(
    20,
    Math.min(30, Math.floor(lessonBudget / lessonCount / 5) * 5),
  );
}

async function buildGeneratedTasks(availableMinutes: number) {
  const [topics, practicedEnglishToday] = await Promise.all([
    prisma.topic.findMany({
      include: {
        lessons: { orderBy: { sortOrder: "asc" } },
        resources: {
          where: { completed: false },
          orderBy: { createdAt: "asc" },
        },
        projects: {
          where: { completed: false },
          orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
        },
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.englishPractice.findFirst({
      where: {
        date: {
          gte: startOfToday(),
          lt: endOfToday(),
        },
      },
    }),
  ]);

  const rankedTopics = topics
    .map((topic) => {
      const progress = progressOf(topic.lessons);
      const isActive = progress > 0 && progress < 100;
      return {
        ...topic,
        progress,
        score:
          topic.priority * 3 +
          (100 - progress) +
          (isActive ? 60 : 0),
      };
    })
    .sort((left, right) => right.score - left.score);

  const learningTopics = rankedTopics.filter(
    (topic) =>
      topic.slug !== "english" &&
      topic.lessons.some((lesson) => !lesson.completed),
  );
  const lessonCount = availableMinutes >= 75 ? 2 : 1;
  const lessonMinutes = lessonBlockDuration(availableMinutes, lessonCount);
  const generated: GeneratedTask[] = [];

  for (const topic of learningTopics.slice(0, lessonCount)) {
    const lesson = topic.lessons.find((item) => !item.completed);
    if (!lesson) continue;

    generated.push({
      title: `${topic.progress > 0 ? "Continue" : "Start"} ${topic.title} — ${lesson.title}`,
      description: lesson.description,
      estimatedMinutes: lessonMinutes,
      category: MissionTaskType.LESSON,
      lessonId: lesson.id,
    });
  }

  const englishTopic = rankedTopics.find((topic) => topic.slug === "english");
  const englishLesson = englishTopic?.lessons.find(
    (lesson) => !lesson.completed,
  );

  if (englishTopic && englishLesson) {
    const isInterview = englishLesson.title.toLowerCase().includes("interview");
    generated.push({
      title: `English — ${englishLesson.title}`,
      description: englishLesson.description,
      estimatedMinutes: 15,
      category: isInterview
        ? MissionTaskType.INTERVIEW_PRACTICE
        : MissionTaskType.ENGLISH_PRACTICE,
      completed: Boolean(practicedEnglishToday),
      lessonId: englishLesson.id,
    });
  }

  const projectTopic = rankedTopics.find((topic) => topic.projects.length > 0);
  const project = projectTopic?.projects[0];

  if (project && projectTopic) {
    generated.push({
      title: `Build today’s slice of ${project.title}`,
      description: `${project.description} Keep the scope to one visible, testable improvement.`,
      estimatedMinutes: 20,
      category: MissionTaskType.MINI_PROJECT,
      projectId: project.id,
    });
    generated.push({
      title: `Push one focused commit for ${project.title}`,
      description:
        "Capture today’s progress in a small commit with a clear message.",
      estimatedMinutes: 5,
      category: MissionTaskType.GITHUB_COMMIT,
      projectId: project.id,
    });
  }

  const resourceTopic = rankedTopics.find((topic) => topic.resources.length > 0);
  const resource = resourceTopic?.resources[0];

  if (resource && resourceTopic) {
    generated.push({
      title: `Study ${resource.title}`,
      description: `Use this ${resource.type.toLowerCase()} to reinforce ${resourceTopic.title}. Capture one useful note.`,
      estimatedMinutes: 15,
      category: MissionTaskType.WATCH_RESOURCE,
      resourceId: resource.id,
    });
  }

  const selected: GeneratedTask[] = [];
  let usedMinutes = 0;

  for (const task of generated) {
    if (usedMinutes + task.estimatedMinutes > availableMinutes) continue;
    selected.push(task);
    usedMinutes += task.estimatedMinutes;
  }

  return selected.map((task, index) => ({
    ...task,
    order: index,
    xp: xpForDuration(task.estimatedMinutes),
    completed: task.completed ?? false,
  }));
}

async function ensureTodayMission() {
  const date = startOfToday();
  let mission = await prisma.dailyMission.findUnique({
    where: { date },
    select: { id: true, availableMinutes: true },
  });

  if (!mission) {
    mission = await prisma.dailyMission.create({
      data: {
        date,
        availableMinutes: DEFAULT_AVAILABLE_MINUTES,
      },
      select: { id: true, availableMinutes: true },
    });
  }

  const taskCount = await prisma.missionTask.count({
    where: { missionId: mission.id },
  });

  if (taskCount === 0) {
    const tasks = await buildGeneratedTasks(mission.availableMinutes);
    await prisma.missionTask.createMany({
      data: tasks.map((task) => ({
        missionId: mission.id,
        ...task,
      })),
    });
  }

  return mission.id;
}

export async function getTodayMission() {
  const missionId = await ensureTodayMission();
  const [mission, sessions, topics] = await Promise.all([
    prisma.dailyMission.findUniqueOrThrow({
      where: { id: missionId },
      include: {
        tasks: {
          orderBy: { order: "asc" },
          include: {
            lesson: {
              include: {
                topic: {
                  include: {
                    lessons: { orderBy: { sortOrder: "asc" } },
                  },
                },
              },
            },
            resource: {
              select: {
                url: true,
                type: true,
              },
            },
          },
        },
      },
    }),
    prisma.studySession.findMany({
      select: { date: true, minutesStudied: true },
      orderBy: { date: "desc" },
    }),
    prisma.topic.findMany({
      include: { lessons: { orderBy: { sortOrder: "asc" } } },
      orderBy: [{ priority: "desc" }, { sortOrder: "asc" }],
    }),
  ]);

  const actionableTasks = mission.tasks.filter((task) => !task.skipped);
  const completedTasks = actionableTasks.filter((task) => task.completed);
  const missionComplete =
    actionableTasks.length > 0 &&
    completedTasks.length === actionableTasks.length;
  const earnedTaskXp = completedTasks.reduce((sum, task) => sum + task.xp, 0);
  const possibleTaskXp = actionableTasks.reduce(
    (sum, task) => sum + task.xp,
    0,
  );
  const focusTopic = mission.tasks.find((task) => task.lesson)?.lesson?.topic;
  const nextRecommendation =
    focusTopic?.lessons.find((lesson) => !lesson.completed)?.title ??
    topics
      .flatMap((topic) => topic.lessons)
      .find((lesson) => !lesson.completed)?.title ??
    "Review today’s notes";
  const today = startOfToday();
  const tomorrow = endOfToday();
  const todayStudiedMinutes = sessions
    .filter((session) => session.date >= today && session.date < tomorrow)
    .reduce((sum, session) => sum + session.minutesStudied, 0);
  const streak = calculateStreak(sessions.map((session) => session.date));

  return {
    id: mission.id,
    availableMinutes: mission.availableMinutes,
    generatedAt: mission.generatedAt.toISOString(),
    tasks: mission.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      estimatedMinutes: task.estimatedMinutes,
      category: task.category,
      completed: task.completed,
      skipped: task.skipped,
      order: task.order,
      xp: task.xp,
      isPersonal: task.isPersonal,
      resource: task.resource,
    })),
    summary: {
      estimatedMinutes: actionableTasks.reduce(
        (sum, task) => sum + task.estimatedMinutes,
        0,
      ),
      completedTasks: completedTasks.length,
      totalTasks: actionableTasks.length,
      progress: actionableTasks.length
        ? clampPercentage(
            (completedTasks.length / actionableTasks.length) * 100,
          )
        : 0,
      earnedXp:
        earnedTaskXp + (missionComplete ? DAILY_MISSION_BONUS_XP : 0),
      possibleXp: possibleTaskXp + DAILY_MISSION_BONUS_XP,
      missionComplete,
      missionBonusXp: DAILY_MISSION_BONUS_XP,
      streak,
      todayStudiedMinutes,
      completedTopics: topics.filter(
        (topic) => progressOf(topic.lessons) === 100,
      ).length,
      focusTopic: focusTopic
        ? {
            title: focusTopic.title,
            progress: progressOf(focusTopic.lessons),
          }
        : null,
      nextRecommendation,
      streakBadge:
        streak >= 100
          ? "100-day"
          : streak >= 30
            ? "30-day"
            : streak >= 7
              ? "7-day"
              : null,
    },
  };
}

export type TodayMissionView = Awaited<ReturnType<typeof getTodayMission>>;

export async function setMissionTaskCompleted(
  taskId: number,
  completed: boolean,
) {
  const task = await prisma.missionTask.findUniqueOrThrow({
    where: { id: taskId },
  });

  await prisma.$transaction(async (transaction) => {
    await transaction.missionTask.update({
      where: { id: taskId },
      data: {
        completed,
        skipped: completed ? false : undefined,
      },
    });

    if (task.lessonId) {
      await transaction.lesson.update({
        where: { id: task.lessonId },
        data: { completed },
      });
    }

    if (task.resourceId) {
      await transaction.resource.update({
        where: { id: task.resourceId },
        data: { completed },
      });
    }
  });
}

export async function setMissionTaskSkipped(taskId: number, skipped: boolean) {
  await prisma.missionTask.update({
    where: { id: taskId },
    data: {
      skipped,
      completed: skipped ? false : undefined,
    },
  });
}

export async function reorderMissionTask(
  taskId: number,
  direction: "up" | "down",
) {
  const task = await prisma.missionTask.findUniqueOrThrow({
    where: { id: taskId },
  });
  const tasks = await prisma.missionTask.findMany({
    where: { missionId: task.missionId },
    orderBy: { order: "asc" },
  });
  const index = tasks.findIndex((item) => item.id === taskId);
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  const target = tasks[targetIndex];

  if (index < 0 || !target) return;

  await prisma.$transaction([
    prisma.missionTask.update({
      where: { id: task.id },
      data: { order: target.order },
    }),
    prisma.missionTask.update({
      where: { id: target.id },
      data: { order: task.order },
    }),
  ]);
}

export async function addPersonalMissionTask(input: PersonalTaskInput) {
  const missionId = await ensureTodayMission();
  const lastTask = await prisma.missionTask.findFirst({
    where: { missionId },
    orderBy: { order: "desc" },
  });

  await prisma.missionTask.create({
    data: {
      missionId,
      title: input.title,
      description: input.description,
      estimatedMinutes: input.estimatedMinutes,
      category: input.category,
      order: (lastTask?.order ?? -1) + 1,
      xp: xpForDuration(input.estimatedMinutes),
      isPersonal: true,
    },
  });
}

export async function regenerateTodayMission(availableMinutes: number) {
  const missionId = await ensureTodayMission();
  const generatedTasks = await buildGeneratedTasks(availableMinutes);
  const personalTasks = await prisma.missionTask.findMany({
    where: { missionId, isPersonal: true },
    orderBy: { order: "asc" },
  });

  await prisma.$transaction([
    prisma.missionTask.deleteMany({
      where: { missionId, isPersonal: false },
    }),
    prisma.dailyMission.update({
      where: { id: missionId },
      data: {
        availableMinutes,
        generatedAt: new Date(),
      },
    }),
    ...generatedTasks.map((task) =>
      prisma.missionTask.create({
        data: {
          missionId,
          ...task,
        },
      }),
    ),
    ...personalTasks.map((task, index) =>
      prisma.missionTask.update({
        where: { id: task.id },
        data: { order: generatedTasks.length + index },
      }),
    ),
  ]);
}
