import {
  BookOpen,
  Check,
  Circle,
  Clock3,
  FolderGit2,
  Library,
  Map as MapIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getRoadmapData } from "@/lib/data";
import { formatMinutes } from "@/lib/utils";

export const dynamic = "force-dynamic";

const phases = [
  {
    title: "Core foundations",
    description: "The engineering vocabulary everything else builds on.",
    slugs: [
      "programming-fundamentals",
      "html",
      "modern-css",
      "javascript",
      "git",
      "github",
      "typescript",
    ],
  },
  {
    title: "Product interfaces",
    description: "Build polished, scalable experiences from system to screen.",
    slugs: [
      "react",
      "nextjs",
      "astro",
      "tailwindcss",
      "shadcn-ui",
      "design-systems",
      "figma",
    ],
  },
  {
    title: "AI engineering",
    description: "Turn models and context into dependable product capabilities.",
    slugs: [
      "nodejs",
      "ai-fundamentals",
      "prompt-engineering",
      "ai-product-engineering",
    ],
  },
  {
    title: "Career communication",
    description: "Communicate ideas and impact with international confidence.",
    slugs: ["english"],
  },
] as const;

export default async function RoadmapPage() {
  const { summary, topics } = await getRoadmapData();
  const topicBySlug = new Map(topics.map((topic) => [topic.slug, topic]));

  return (
    <div className="animate-enter">
      <header className="mb-8">
        <div className="flex items-center gap-2 text-xs font-medium text-[#9cf0d0]">
          <MapIcon className="size-3.5" aria-hidden="true" />
          Learning roadmap
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#f7f8f8] sm:text-[30px]">
          The path to AI Product Engineering
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#777d89]">
          A deliberate sequence from software foundations to AI-native product
          systems. Progress is calculated directly from completed lessons.
        </p>
      </header>

      <section
        className="mb-9 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Roadmap summary"
      >
        <Card className="p-5">
          <p className="text-xs text-[#747a86]">Overall progress</p>
          <div className="mt-2 flex items-baseline justify-between gap-3">
            <span className="text-2xl font-semibold tracking-[-0.04em]">
              {summary.overallProgress}%
            </span>
            <span className="text-[11px] text-[#5d6370]">
              {summary.completedLessons}/{summary.totalLessons} lessons
            </span>
          </div>
          <Progress
            value={summary.overallProgress}
            className="mt-4"
            label="Overall roadmap progress"
          />
        </Card>
        <SummaryCard
          label="Learning topics"
          value={String(summary.totalTopics)}
          detail="Focused capabilities"
          icon={BookOpen}
        />
        <SummaryCard
          label="Estimated time"
          value={`${summary.totalEstimatedHours}h`}
          detail="Complete roadmap"
          icon={Clock3}
        />
        <SummaryCard
          label="Current pace"
          value="1–2h"
          detail="Daily target"
          icon={Library}
        />
      </section>

      <div className="space-y-10">
        {phases.map((phase, phaseIndex) => {
          const phaseTopics = phase.slugs
            .map((slug) => topicBySlug.get(slug))
            .filter((topic): topic is NonNullable<typeof topic> =>
              Boolean(topic),
            );

          return (
            <section key={phase.title} aria-labelledby={`phase-${phaseIndex}`}>
              <div className="mb-4 flex items-start gap-4">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-white/[0.08] bg-[#11141a] text-[11px] font-semibold text-[#9298a3]">
                  {phaseIndex + 1}
                </span>
                <div>
                  <h2
                    id={`phase-${phaseIndex}`}
                    className="text-base font-semibold tracking-[-0.025em] text-[#eceef0]"
                  >
                    {phase.title}
                  </h2>
                  <p className="mt-1 text-xs text-[#646a76]">
                    {phase.description}
                  </p>
                </div>
              </div>

              <div className="grid items-start gap-4 xl:grid-cols-2">
                {phaseTopics.map((topic) => (
                  <Card
                    key={topic.id}
                    id={topic.slug}
                    className="scroll-mt-6 transition-colors duration-300 hover:border-white/[0.11]"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2.5">
                            <CardTitle className="text-[15px]">
                              {topic.title}
                            </CardTitle>
                            {topic.progress === 100 ? (
                              <Badge>Complete</Badge>
                            ) : topic.progress > 0 ? (
                              <Badge variant="warm">In progress</Badge>
                            ) : (
                              <Badge variant="secondary">Not started</Badge>
                            )}
                          </div>
                          <CardDescription className="mt-2 line-clamp-2">
                            {topic.description}
                          </CardDescription>
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-[#c7f7e5]">
                          {topic.progress}%
                        </span>
                      </div>
                      <Progress
                        value={topic.progress}
                        className="mt-4"
                        label={`${topic.title} progress`}
                      />
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-[#5f6571]">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="size-3" aria-hidden="true" />
                          {topic.completedLessons}/{topic.lessons.length} lessons
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock3 className="size-3" aria-hidden="true" />
                          {topic.estimatedHours}h estimated
                        </span>
                        {topic._count.projects > 0 ? (
                          <span className="flex items-center gap-1.5">
                            <FolderGit2 className="size-3" aria-hidden="true" />
                            {topic._count.projects}{" "}
                            {topic._count.projects === 1 ? "project" : "projects"}
                          </span>
                        ) : null}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0d1015]">
                        {topic.lessons.map((lesson, index) => (
                          <div
                            key={lesson.id}
                            className={`flex items-start gap-3 px-3.5 py-3 ${
                              index !== topic.lessons.length - 1
                                ? "border-b border-white/[0.05]"
                                : ""
                            }`}
                          >
                            <span
                              className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full ${
                                lesson.completed
                                  ? "bg-[#9cf0d0] text-[#0c1612]"
                                  : "text-[#4e5460]"
                              }`}
                            >
                              {lesson.completed ? (
                                <Check
                                  className="size-2.5"
                                  strokeWidth={3}
                                  aria-hidden="true"
                                />
                              ) : (
                                <Circle
                                  className="size-4"
                                  strokeWidth={1.4}
                                  aria-hidden="true"
                                />
                              )}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p
                                className={`text-xs font-medium ${
                                  lesson.completed
                                    ? "text-[#7c838e]"
                                    : "text-[#d8dade]"
                                }`}
                              >
                                {lesson.title}
                              </p>
                              <p className="mt-1 line-clamp-1 text-[11px] text-[#555b67]">
                                {lesson.description}
                              </p>
                            </div>
                            <span className="shrink-0 text-[10px] text-[#555b67]">
                              {formatMinutes(lesson.duration)}
                            </span>
                          </div>
                        ))}
                      </div>
                      {topic._count.resources > 0 ? (
                        <p className="mt-3 text-[11px] text-[#555b67]">
                          {topic._count.resources} saved{" "}
                          {topic._count.resources === 1
                            ? "resource"
                            : "resources"}
                        </p>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof BookOpen;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[#747a86]">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
            {value}
          </p>
          <p className="mt-1.5 text-[11px] text-[#555b67]">{detail}</p>
        </div>
        <span className="grid size-8 place-items-center rounded-lg border border-white/[0.06] bg-white/[0.025] text-[#8e95a0]">
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
    </Card>
  );
}
