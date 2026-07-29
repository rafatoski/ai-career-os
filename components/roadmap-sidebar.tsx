import Link from "next/link";
import {
  BookOpen,
  Check,
  ChevronRight,
  Circle,
  Infinity as InfinityIcon,
  LockKeyhole,
} from "lucide-react";

import { Progress } from "@/components/ui/progress";
import type { ModuleState } from "@/lib/learning-data";
import { cn, formatDuration } from "@/lib/utils";

type RoadmapSidebarProps = {
  modules: ModuleState[];
  activeModuleSlug?: string;
  activeLessonId?: string;
};

export function RoadmapSidebar({
  modules,
  activeModuleSlug,
  activeLessonId,
}: RoadmapSidebarProps) {
  return (
    <aside className="roadmap-sidebar border-r border-white/[0.065] bg-[#0d0f13]">
      <div className="sticky top-0 z-10 border-b border-white/[0.065] bg-[#0d0f13]/95 px-5 py-5 backdrop-blur">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-xl border border-[#9cf0d0]/15 bg-[#9cf0d0]/8 text-[#aaf3d8]">
            <BookOpen className="size-4" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-[-0.02em] text-[#f2f4f5]">
              Learning Companion
            </span>
            <span className="mt-0.5 block text-[10px] uppercase tracking-[0.16em] text-[#5f6570]">
              Your roadmap
            </span>
          </span>
        </Link>
      </div>

      <nav aria-label="Learning roadmap" className="space-y-1 p-3">
        {modules.map((module) => {
          const isActive = module.slug === activeModuleSlug;
          const moduleHref =
            module.unlocked && module.currentLessonId
              ? `/learn/${module.slug}/${module.currentLessonId}`
              : null;

          return (
            <div
              key={module.slug}
              className={cn(
                "rounded-xl border transition-colors",
                isActive
                  ? "border-white/[0.09] bg-white/[0.04]"
                  : "border-transparent",
              )}
            >
              {moduleHref ? (
                <Link
                  href={moduleHref}
                  className="flex min-h-12 items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/[0.035]"
                >
                  <ModuleIcon module={module} />
                  <ModuleLabel module={module} />
                  <ChevronRight
                    className="size-3.5 shrink-0 text-[#4f5560]"
                    aria-hidden="true"
                  />
                </Link>
              ) : (
                <div className="flex min-h-12 items-center gap-3 px-3 py-2.5">
                  <ModuleIcon module={module} />
                  <ModuleLabel module={module} />
                </div>
              )}

              {isActive && module.lessons.length > 0 ? (
                <ol className="space-y-0.5 px-2 pb-2">
                  {module.lessons.map((lesson, index) => {
                    const lessonActive = lesson.id === activeLessonId;
                    const content = (
                      <>
                        <span
                          className={cn(
                            "grid size-5 shrink-0 place-items-center rounded-full border text-[9px]",
                            lesson.completed
                              ? "border-[#9cf0d0]/20 bg-[#9cf0d0]/10 text-[#9cf0d0]"
                              : lessonActive
                                ? "border-white/15 bg-white/8 text-white"
                                : "border-white/[0.07] text-[#656b76]",
                          )}
                        >
                          {lesson.completed ? (
                            <Check className="size-2.5" />
                          ) : lesson.unlocked ? (
                            index + 1
                          ) : (
                            <LockKeyhole className="size-2.5" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[11px]">
                            {lesson.title}
                          </span>
                          <span className="mt-0.5 block text-[9px] text-[#555b65]">
                            {formatDuration(lesson.duration)}
                          </span>
                        </span>
                      </>
                    );

                    return (
                      <li key={lesson.id}>
                        {lesson.unlocked ? (
                          <Link
                            href={`/learn/${module.slug}/${lesson.id}`}
                            className={cn(
                              "flex items-center gap-2.5 rounded-lg px-2 py-2 text-[#858b96] transition-colors hover:bg-white/[0.035] hover:text-white",
                              lessonActive && "bg-white/[0.045] text-white",
                            )}
                          >
                            {content}
                          </Link>
                        ) : (
                          <div className="flex items-center gap-2.5 px-2 py-2 text-[#474c55]">
                            {content}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

function ModuleIcon({ module }: { module: ModuleState }) {
  if (!module.configured) {
    return (
      <Circle className="size-3.5 shrink-0 text-[#3d424b]" aria-hidden="true" />
    );
  }

  if (module.alwaysAvailable) {
    return (
      <InfinityIcon
        className="size-3.5 shrink-0 text-[#b9a8ff]"
        aria-hidden="true"
      />
    );
  }

  if (module.completed) {
    return (
      <Check className="size-3.5 shrink-0 text-[#9cf0d0]" aria-hidden="true" />
    );
  }

  if (!module.unlocked) {
    return (
      <LockKeyhole
        className="size-3.5 shrink-0 text-[#454a53]"
        aria-hidden="true"
      />
    );
  }

  return (
    <Circle
      className="size-3.5 shrink-0 fill-[#d8e3df] text-[#d8e3df]"
      aria-hidden="true"
    />
  );
}

function ModuleLabel({ module }: { module: ModuleState }) {
  return (
    <span className="min-w-0 flex-1">
      <span
        className={cn(
          "block truncate text-xs font-medium",
          module.unlocked && module.configured
            ? "text-[#d3d6da]"
            : "text-[#555a64]",
        )}
      >
        {module.title}
      </span>
      <span className="mt-1 flex items-center gap-2">
        {module.configured ? (
          <>
            <Progress
              value={module.progress}
              className="h-1 max-w-20"
              label={`${module.title} progress`}
            />
            <span className="text-[9px] tabular-nums text-[#5e646f]">
              {module.progress}%
            </span>
          </>
        ) : (
          <span className="text-[9px] text-[#474c55]">Not configured</span>
        )}
      </span>
    </span>
  );
}
