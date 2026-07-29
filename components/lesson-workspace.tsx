import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  LockKeyhole,
} from "lucide-react";

import { LessonCompletion } from "@/components/lesson-completion";
import { Button } from "@/components/ui/button";
import { YouTubePlayer } from "@/components/youtube-player";
import type { LessonPageData } from "@/lib/learning-data";
import { formatDuration } from "@/lib/utils";
import { getYouTubeVideoId } from "@/lib/youtube";

export function LessonWorkspace({ data }: { data: LessonPageData }) {
  const videoId = getYouTubeVideoId(data.lesson.youtubeUrl);

  if (!videoId) {
    throw new Error(`Invalid YouTube URL for lesson "${data.lesson.id}".`);
  }

  const requirements = [
    { label: "Watch video", complete: data.lessonState.videoCompleted },
    { label: "Read notes", complete: data.lessonState.notesRead },
    { label: "Pass quiz", complete: data.lessonState.quizPassed },
  ];

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl px-5 py-6 sm:px-8 sm:py-8 xl:px-10">
      <header className="mb-6 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-[#707681] transition-colors hover:text-white"
        >
          <ArrowLeft className="size-3.5" />
          Continue learning
        </Link>
        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#555b65]">
          {data.roadmap.title}
        </span>
      </header>

      <YouTubePlayer
        moduleSlug={data.roadmap.slug}
        lessonId={data.lesson.id}
        videoId={videoId}
        initialPosition={data.lessonState.playbackSeconds}
        initialPercent={data.lessonState.watchedPercent}
      />

      <div className="mt-8">
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#666c76]">
          <span>Lesson {data.roadmap.lessons.findIndex((lesson) => lesson.id === data.lesson.id) + 1}</span>
          <span aria-hidden="true">·</span>
          <span>{formatDuration(data.lesson.duration)}</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#f3f4f5] sm:text-3xl">
          {data.lesson.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#818792]">
          {data.lesson.description}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {requirements.map((requirement) => (
            <span
              key={requirement.label}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] ${
                requirement.complete
                  ? "border-[#9cf0d0]/14 bg-[#9cf0d0]/[0.04] text-[#a8d6c5]"
                  : "border-white/[0.07] bg-white/[0.025] text-[#686e78]"
              }`}
            >
              {requirement.complete ? (
                <Check className="size-3" />
              ) : (
                <Circle className="size-3" />
              )}
              {requirement.label}
            </span>
          ))}
        </div>

        <div className="mt-7 border-t border-white/[0.065] pt-6">
          <LessonCompletion
            moduleSlug={data.roadmap.slug}
            lessonId={data.lesson.id}
            videoCompleted={data.lessonState.videoCompleted}
            notesRead={data.lessonState.notesRead}
            quizPassed={data.lessonState.quizPassed}
            completed={data.lessonState.completed}
          />
        </div>
      </div>

      <nav
        aria-label="Lesson navigation"
        className="mt-10 grid gap-3 border-t border-white/[0.065] pt-6 sm:grid-cols-2"
      >
        {data.previous ? (
          <Button asChild variant="outline" className="h-auto justify-start py-3">
            <Link href={data.previous.href}>
              <ChevronLeft className="shrink-0" />
              <span className="min-w-0 text-left">
                <span className="block text-[9px] uppercase tracking-[0.13em] text-[#656b75]">
                  Previous
                </span>
                <span className="mt-0.5 block truncate">
                  {data.previous.title}
                </span>
              </span>
            </Link>
          </Button>
        ) : (
          <div />
        )}
        {data.next ? (
          <Button asChild variant="outline" className="h-auto justify-end py-3">
            <Link href={data.next.href}>
              <span className="min-w-0 text-right">
                <span className="block text-[9px] uppercase tracking-[0.13em] text-[#656b75]">
                  Next
                </span>
                <span className="mt-0.5 block truncate">{data.next.title}</span>
              </span>
              <ChevronRight className="shrink-0" />
            </Link>
          </Button>
        ) : (
          <div className="flex items-center justify-end gap-2 rounded-lg border border-dashed border-white/[0.06] px-4 py-3 text-[11px] text-[#505660]">
            <LockKeyhole className="size-3.5" />
            Complete this lesson to unlock the next one
          </div>
        )}
      </nav>

      <section className="mt-10 border-t border-white/[0.065] pt-7">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-[#e4e6e8]">
            Lessons in this module
          </h2>
          <span className="text-[10px] text-[#606671]">
            {data.roadmap.lessons.length} lessons
          </span>
        </div>
        <ol className="mt-4 divide-y divide-white/[0.055] rounded-xl border border-white/[0.065] bg-white/[0.015]">
          {data.roadmap.lessons.map((lesson, index) => {
            const state = data.modules
              .find((module) => module.slug === data.roadmap.slug)
              ?.lessons.find((candidate) => candidate.id === lesson.id);
            const current = lesson.id === data.lesson.id;
            const row = (
              <>
                <span className="grid size-7 shrink-0 place-items-center rounded-full border border-white/[0.07] text-[10px] text-[#686e78]">
                  {state?.completed ? (
                    <Check className="size-3.5 text-[#9cf0d0]" />
                  ) : state?.unlocked ? (
                    index + 1
                  ) : (
                    <LockKeyhole className="size-3" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium">
                    {lesson.title}
                  </span>
                  <span className="mt-1 block text-[10px] text-[#5c626c]">
                    {formatDuration(lesson.duration)}
                  </span>
                </span>
                {current ? (
                  <span className="text-[9px] font-medium uppercase tracking-[0.13em] text-[#9ab7ac]">
                    Playing
                  </span>
                ) : null}
              </>
            );

            return (
              <li key={lesson.id}>
                {state?.unlocked ? (
                  <Link
                    href={`/learn/${data.roadmap.slug}/${lesson.id}`}
                    className={`flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.025] ${
                      current ? "text-white" : "text-[#a1a6ae]"
                    }`}
                  >
                    {row}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3.5 text-[#484d56]">
                    {row}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
