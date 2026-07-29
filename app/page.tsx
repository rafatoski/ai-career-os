import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Clock3,
  Flame,
  FolderGit2,
  TrendingUp,
} from "lucide-react";

import { TodaysMission } from "@/components/todays-mission";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDashboardData } from "@/lib/data";
import { getTodayMission } from "@/lib/mission";
import { formatHours, formatMinutes } from "@/lib/utils";

export const dynamic = "force-dynamic";

function getGreeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Bogota",
      hour: "numeric",
      hour12: false,
    }).format(new Date()),
  );

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatToday() {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota",
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

function statusLabel(status: string) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/, (character) => character.toUpperCase());
}

export default async function DashboardPage() {
  const [
    { activity, currentRoadmap, projects, stats },
    mission,
  ] = await Promise.all([getDashboardData(), getTodayMission()]);

  const statCards = [
    {
      label: "Current streak",
      value: `${stats.currentStreak} days`,
      detail: "Keep the rhythm",
      icon: Flame,
      accent: "text-[#f8c278]",
    },
    {
      label: "Total study time",
      value: formatHours(stats.totalMinutes),
      detail: "Across all sessions",
      icon: Clock3,
      accent: "text-[#9cf0d0]",
    },
    {
      label: "Lessons complete",
      value: `${stats.completedLessons}/${stats.totalLessons}`,
      detail: "Roadmap progress",
      icon: BookOpenCheck,
      accent: "text-[#a8b6ff]",
    },
  ];

  return (
    <div className="animate-enter">
      <header className="mb-7 flex flex-col justify-between gap-5 sm:mb-8 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-[#747a87]">{formatToday()}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#f7f8f8] sm:text-[30px]">
            {getGreeting()}.
          </h1>
          <p className="mt-2 text-sm text-[#777d89]">
            Your mission is ready. Follow the sequence and protect the focus.
          </p>
        </div>
        {currentRoadmap ? (
          <Button asChild className="self-start sm:self-auto">
            <Link href={`/roadmap#${currentRoadmap.slug}`}>
              Open roadmap
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        ) : null}
      </header>

      <section aria-label="Today's mission">
        <TodaysMission mission={mission} />
      </section>

      <section
        className="mt-4 grid gap-4 sm:grid-cols-3"
        aria-label="Learning statistics"
      >
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-5 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-[#747a86]">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#f2f3f4]">
                    {stat.value}
                  </p>
                  <p className="mt-1.5 text-[11px] text-[#555b67]">
                    {stat.detail}
                  </p>
                </div>
                <span className="grid size-9 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.025]">
                  <Icon
                    className={`size-[17px] ${stat.accent}`}
                    aria-hidden="true"
                  />
                </span>
              </div>
            </Card>
          );
        })}
      </section>

      <section className="mt-4 grid items-start gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>Weekly progress</CardTitle>
              <CardDescription className="mt-1">
                {formatHours(stats.weeklyMinutes)} of{" "}
                {formatHours(stats.weeklyGoalMinutes)}
              </CardDescription>
            </div>
            <span className="text-2xl font-semibold tracking-[-0.04em] text-white">
              {stats.weeklyProgress}%
            </span>
          </CardHeader>
          <CardContent>
            <Progress
              value={stats.weeklyProgress}
              label="Weekly study goal"
            />
            <div className="mt-6 flex h-[110px] items-end justify-between gap-2 border-b border-white/[0.06] pb-2">
              {activity.map((day, index) => (
                <div
                  key={`${day.label}-${index}`}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <div
                    title={`${day.minutes} minutes`}
                    className={`w-full max-w-7 rounded-t-[5px] transition-[height] duration-700 ${
                      day.isToday
                        ? "bg-[#9cf0d0]"
                        : day.minutes
                          ? "bg-[#454c55]"
                          : "bg-white/[0.04]"
                    }`}
                    style={{
                      height: `${Math.max(day.height, day.minutes ? 10 : 4)}%`,
                    }}
                  />
                  <span
                    className={`text-[10px] ${
                      day.isToday ? "text-[#c5f8e5]" : "text-[#555b67]"
                    }`}
                  >
                    {day.label}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-[#6f7581]">
              <TrendingUp
                className="size-3.5 text-[#9cf0d0]"
                aria-hidden="true"
              />
              {stats.weeklyProgress >= 100
                ? "Weekly goal complete."
                : `${formatMinutes(stats.weeklyGoalMinutes - stats.weeklyMinutes)} left this week`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Current roadmap</CardTitle>
              <CardDescription className="mt-1">
                The next capability in your learning sequence.
              </CardDescription>
            </div>
            {currentRoadmap ? (
              <Badge
                variant={currentRoadmap.progress > 0 ? "warm" : "secondary"}
              >
                {currentRoadmap.progress > 0 ? "In progress" : "Up next"}
              </Badge>
            ) : null}
          </CardHeader>
          {currentRoadmap ? (
            <CardContent>
              <div className="rounded-xl border border-white/[0.06] bg-[#0d1015] p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold tracking-[-0.025em] text-white">
                      {currentRoadmap.title}
                    </p>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#707683]">
                      {currentRoadmap.description}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-[#c9f8e6]">
                    {currentRoadmap.progress}%
                  </span>
                </div>
                <Progress
                  value={currentRoadmap.progress}
                  className="mt-5"
                  label={`${currentRoadmap.title} progress`}
                />
                <div className="mt-4 flex items-center justify-between text-xs text-[#626875]">
                  <span>
                    {currentRoadmap.completedLessons} of{" "}
                    {currentRoadmap.lessons.length} lessons
                  </span>
                  <span>{currentRoadmap.estimatedHours}h estimated</span>
                </div>
              </div>
              <Button
                asChild
                variant="ghost"
                className="mt-3 w-full justify-between"
              >
                <Link href={`/roadmap#${currentRoadmap.slug}`}>
                  View roadmap
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </CardContent>
          ) : null}
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Active projects</CardTitle>
              <CardDescription className="mt-1">
                Turn learning into portfolio evidence.
              </CardDescription>
            </div>
            <span className="grid size-8 place-items-center rounded-lg border border-white/[0.06] bg-white/[0.025] text-[#858b98]">
              <FolderGit2 className="size-4" aria-hidden="true" />
            </span>
          </CardHeader>
          <CardContent>
            {projects.length ? (
              <div className="divide-y divide-white/[0.06]">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center gap-3 py-3.5"
                  >
                    <span
                      className={`size-1.5 shrink-0 rounded-full ${
                        project.status === "IN_PROGRESS"
                          ? "bg-[#9cf0d0]"
                          : "bg-[#626875]"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#e8e9eb]">
                        {project.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-[#656b77]">
                        {project.topic.title}
                      </p>
                    </div>
                    <Badge
                      variant={
                        project.status === "IN_PROGRESS"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {statusLabel(project.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] px-4 py-7 text-center">
                <FolderGit2
                  className="mx-auto size-5 text-[#5f6672]"
                  aria-hidden="true"
                />
                <p className="mt-3 text-sm font-medium text-[#cfd2d7]">
                  No real projects yet
                </p>
                <p className="mx-auto mt-1 max-w-56 text-xs leading-5 text-[#676e7a]">
                  This space is clean and ready for the first project you
                  choose to track.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
