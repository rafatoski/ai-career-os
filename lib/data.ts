import "server-only";

import { prisma } from "@/lib/prisma";
import { clampPercentage } from "@/lib/utils";
import { getYouTubeVideoId } from "@/lib/youtube";

const TIME_ZONE = "America/Bogota";
const WEEKLY_GOAL_MINUTES = 7.5 * 60;

const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const shortDayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  weekday: "short",
});

function dateKey(date: Date) {
  return dateKeyFormatter.format(date);
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function shiftDays(date: Date, amount: number) {
  const shifted = new Date(date);
  shifted.setDate(shifted.getDate() + amount);
  return shifted;
}

function startOfWeek(date: Date) {
  const day = date.getDay();
  const distanceFromMonday = day === 0 ? 6 : day - 1;
  return shiftDays(date, -distanceFromMonday);
}

function topicProgress(lessons: { completed: boolean }[]) {
  if (lessons.length === 0) return 0;
  const completed = lessons.filter((lesson) => lesson.completed).length;
  return clampPercentage((completed / lessons.length) * 100);
}

function calculateStreak(sessionDates: Date[]) {
  const studiedDays = new Set(sessionDates.map(dateKey));
  const today = startOfToday();
  let cursor = today;

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

export async function getDashboardData() {
  const [topics, sessions, projects] = await Promise.all([
    prisma.topic.findMany({
      include: {
        lessons: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.studySession.findMany({
      select: {
        date: true,
        minutesStudied: true,
      },
      orderBy: { date: "desc" },
    }),
    prisma.project.findMany({
      where: { completed: false },
      include: {
        topic: { select: { title: true, slug: true } },
      },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      take: 3,
    }),
  ]);

  const topicsWithProgress = topics.map((topic) => ({
    ...topic,
    progress: topicProgress(topic.lessons),
    completedLessons: topic.lessons.filter((lesson) => lesson.completed).length,
  }));

  const currentRoadmap =
    [...topicsWithProgress]
      .filter((topic) => topic.progress > 0 && topic.progress < 100)
      .sort((left, right) => right.priority - left.priority)[0] ??
    [...topicsWithProgress]
      .filter((topic) => topic.progress < 100)
      .sort((left, right) => right.priority - left.priority)[0] ??
    topicsWithProgress[0];

  const todayPlan = currentRoadmap
    ? currentRoadmap.lessons
        .filter((lesson) => !lesson.completed)
        .slice(0, 2)
        .map((lesson) => ({
          ...lesson,
          topicTitle: currentRoadmap.title,
          topicSlug: currentRoadmap.slug,
        }))
    : [];

  const today = startOfToday();
  const monday = startOfWeek(today);
  const weeklyMinutes = sessions
    .filter((session) => session.date >= monday)
    .reduce((sum, session) => sum + session.minutesStudied, 0);
  const totalMinutes = sessions.reduce(
    (sum, session) => sum + session.minutesStudied,
    0,
  );

  const minutesByDay = new Map<string, number>();
  for (const session of sessions) {
    const key = dateKey(session.date);
    minutesByDay.set(
      key,
      (minutesByDay.get(key) ?? 0) + session.minutesStudied,
    );
  }

  const activity = Array.from({ length: 7 }, (_, index) => {
    const date = shiftDays(today, index - 6);
    return {
      label: shortDayFormatter.format(date).slice(0, 1),
      minutes: minutesByDay.get(dateKey(date)) ?? 0,
      isToday: index === 6,
    };
  });

  const maxActivityMinutes = Math.max(
    90,
    ...activity.map((day) => day.minutes),
  );

  return {
    currentRoadmap,
    todayPlan,
    projects,
    activity: activity.map((day) => ({
      ...day,
      height: clampPercentage((day.minutes / maxActivityMinutes) * 100),
    })),
    stats: {
      currentStreak: calculateStreak(sessions.map((session) => session.date)),
      totalMinutes,
      weeklyMinutes,
      weeklyGoalMinutes: WEEKLY_GOAL_MINUTES,
      weeklyProgress: clampPercentage(
        (weeklyMinutes / WEEKLY_GOAL_MINUTES) * 100,
      ),
      completedLessons: topics.reduce(
        (sum, topic) =>
          sum + topic.lessons.filter((lesson) => lesson.completed).length,
        0,
      ),
      totalLessons: topics.reduce(
        (sum, topic) => sum + topic.lessons.length,
        0,
      ),
    },
  };
}

export async function getRoadmapData() {
  const topics = await prisma.topic.findMany({
    include: {
      lessons: { orderBy: { sortOrder: "asc" } },
      _count: {
        select: { projects: true, resources: true },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  const enrichedTopics = topics.map((topic) => ({
    ...topic,
    progress: topicProgress(topic.lessons),
    completedLessons: topic.lessons.filter((lesson) => lesson.completed).length,
  }));

  const totalLessons = enrichedTopics.reduce(
    (sum, topic) => sum + topic.lessons.length,
    0,
  );
  const completedLessons = enrichedTopics.reduce(
    (sum, topic) => sum + topic.completedLessons,
    0,
  );

  return {
    topics: enrichedTopics,
    summary: {
      totalTopics: topics.length,
      totalEstimatedHours: topics.reduce(
        (sum, topic) => sum + topic.estimatedHours,
        0,
      ),
      totalLessons,
      completedLessons,
      overallProgress: totalLessons
        ? clampPercentage((completedLessons / totalLessons) * 100)
        : 0,
    },
  };
}

export async function getResourceLibraryData() {
  const [resources, topics] = await Promise.all([
    prisma.resource.findMany({
      include: {
        topic: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: [
        { completed: "asc" },
        { type: "asc" },
        { createdAt: "desc" },
      ],
    }),
    prisma.topic.findMany({
      select: {
        id: true,
        title: true,
      },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return {
    resources: resources.map((resource) => ({
      id: resource.id,
      title: resource.title,
      url: resource.url,
      type: resource.type,
      completed: resource.completed,
      topic: resource.topic,
      youtubeVideoId:
        resource.type === "YOUTUBE"
          ? getYouTubeVideoId(resource.url)
          : null,
    })),
    topics,
    summary: {
      total: resources.length,
      videos: resources.filter((resource) => resource.type === "YOUTUBE")
        .length,
      readings: resources.filter((resource) =>
        ["ARTICLE", "DOCUMENTATION"].includes(resource.type),
      ).length,
      completed: resources.filter((resource) => resource.completed).length,
    },
  };
}

export type ResourceLibraryData = Awaited<
  ReturnType<typeof getResourceLibraryData>
>;
