import Link from "next/link";
import { ArrowRight, Clock3, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { LearningState } from "@/lib/learning-data";
import { formatDuration, formatTimestamp } from "@/lib/utils";

export function HomeContinue({ current }: Pick<LearningState, "current">) {
  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-14 sm:px-10">
      <div className="w-full max-w-2xl animate-enter">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#636a75]">
          Continue learning
        </p>

        {current ? (
          <>
            <div className="mt-7 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111318] shadow-[0_30px_90px_rgba(0,0,0,0.28)]">
              {current.module.thumbnail ? (
                <div
                  className="relative aspect-[16/7] bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(10,11,14,.08), rgba(10,11,14,.9)), url(${current.module.thumbnail})`,
                  }}
                >
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                    <p className="text-xs font-medium text-[#b9bfc7]">
                      {current.module.title}
                    </p>
                    <h1 className="mt-2 max-w-xl text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
                      {current.lesson.title}
                    </h1>
                  </div>
                </div>
              ) : (
                <div className="p-6 pb-0 sm:p-8 sm:pb-0">
                  <p className="text-xs font-medium text-[#818792]">
                    {current.module.title}
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
                    {current.lesson.title}
                  </h1>
                </div>
              )}

              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4 text-[11px] text-[#737985]">
                  <span className="flex items-center gap-1.5">
                    <Clock3 className="size-3.5" aria-hidden="true" />
                    {formatDuration(current.lesson.duration)}
                  </span>
                  <span className="tabular-nums">
                    {current.lesson.watchedPercent}% watched
                  </span>
                </div>
                <Progress
                  value={current.lesson.watchedPercent}
                  className="mt-3"
                  label="Video watched"
                />
                {current.lesson.playbackSeconds > 0 ? (
                  <p className="mt-3 text-[11px] text-[#666c76]">
                    Resume at{" "}
                    {formatTimestamp(current.lesson.playbackSeconds)}
                  </p>
                ) : null}
                <Button asChild className="mt-7 w-full sm:w-auto">
                  <Link href={current.href}>
                    <Play className="fill-current" aria-hidden="true" />
                    {current.lesson.playbackSeconds > 0
                      ? "Resume lesson"
                      : "Start lesson"}
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-xs">
              <span className="text-[#656b76]">Current module</span>
              <Link
                href={current.href}
                className="flex items-center gap-1.5 text-[#acb2ba] transition-colors hover:text-white"
              >
                {current.module.progress}% complete
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </>
        ) : (
          <div className="mt-7 rounded-2xl border border-dashed border-white/[0.09] bg-white/[0.02] p-8">
            <h1 className="text-xl font-semibold tracking-[-0.03em] text-white">
              Your roadmap is ready for content
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[#787e89]">
              Add lessons to a file inside{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[#b8c0c8]">
                roadmaps/
              </code>{" "}
              and they will appear here automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
