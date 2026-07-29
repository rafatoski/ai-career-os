"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDown,
  ArrowUp,
  Award,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronDown,
  Clock3,
  ExternalLink,
  Flame,
  FolderGit2,
  GitCommit,
  Languages,
  MessageSquare,
  NotebookText,
  PartyPopper,
  Plus,
  RefreshCw,
  RotateCcw,
  SkipForward,
  Sparkles,
  Trophy,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";

import {
  addPersonalMissionTaskAction,
  regenerateTodayMissionAction,
  reorderMissionTaskAction,
  skipMissionTaskAction,
  toggleMissionTaskAction,
} from "@/app/actions/mission";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { TodayMissionView } from "@/lib/mission";
import { cn, formatMinutes } from "@/lib/utils";
import {
  missionTaskTypes,
  personalTaskSchema,
  type PersonalTaskInput,
} from "@/lib/validations/mission";

const taskPresentation: Record<
  TodayMissionView["tasks"][number]["category"],
  { label: string; icon: LucideIcon; color: string }
> = {
  LESSON: { label: "Lesson", icon: BookOpen, color: "text-[#a8b6ff]" },
  WATCH_RESOURCE: {
    label: "Watch resource",
    icon: Video,
    color: "text-[#e7aaf2]",
  },
  MINI_PROJECT: {
    label: "Mini project",
    icon: FolderGit2,
    color: "text-[#9cf0d0]",
  },
  QUIZ: { label: "Quiz", icon: BrainCircuit, color: "text-[#f8c278]" },
  GITHUB_COMMIT: {
    label: "GitHub commit",
    icon: GitCommit,
    color: "text-[#aab0b9]",
  },
  ENGLISH_PRACTICE: {
    label: "English practice",
    icon: Languages,
    color: "text-[#79d5f6]",
  },
  REVIEW_NOTES: {
    label: "Review notes",
    icon: NotebookText,
    color: "text-[#d6bd8c]",
  },
  INTERVIEW_PRACTICE: {
    label: "Interview practice",
    icon: MessageSquare,
    color: "text-[#79d5f6]",
  },
};

const availableTimeOptions = [60, 90, 120, 180] as const;

export function TodaysMission({ mission }: { mission: TodayMissionView }) {
  const [showAddTask, setShowAddTask] = useState(false);
  const [expandedResourceTaskId, setExpandedResourceTaskId] = useState<
    number | null
  >(null);
  const [availableMinutes, setAvailableMinutes] = useState(
    mission.availableMinutes,
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PersonalTaskInput>({
    resolver: zodResolver(personalTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      estimatedMinutes: 15,
      category: "REVIEW_NOTES",
    },
  });

  function runAction(action: () => Promise<void>) {
    setActionError(null);
    startTransition(async () => {
      try {
        await action();
      } catch {
        setActionError("That update did not save. Please try again.");
      }
    });
  }

  const onAddTask = handleSubmit((values) => {
    runAction(async () => {
      await addPersonalMissionTaskAction(values);
      reset();
      setShowAddTask(false);
    });
  });

  return (
    <Card className="relative overflow-hidden border-[#9cf0d0]/10 bg-[radial-gradient(circle_at_92%_-12%,rgba(156,240,208,0.12),transparent_34%),linear-gradient(180deg,#12161c_0%,#0e1116_100%)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#9cf0d0]/45 to-transparent" />

      <header className="flex flex-col gap-5 border-b border-white/[0.07] px-5 py-5 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-[#9cf0d0]/15 bg-[#9cf0d0]/10 text-[#b7f5de] shadow-[0_0_30px_rgba(156,240,208,0.08)]">
            <Sparkles className="size-[17px]" aria-hidden="true" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold tracking-[-0.025em] text-white">
                Today&apos;s Mission
              </h2>
              <Badge>Auto-planned</Badge>
            </div>
            <p className="mt-1.5 max-w-xl text-xs leading-5 text-[#747b87]">
              Your highest-leverage path through learning, practice, and
              shipping—built from current progress.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex h-9 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 text-xs text-[#858b97]">
            <Clock3 className="size-3.5" aria-hidden="true" />
            <span className="sr-only">Available study time</span>
            <select
              value={availableMinutes}
              onChange={(event) =>
                setAvailableMinutes(Number(event.target.value))
              }
              disabled={pending}
              className="cursor-pointer bg-transparent font-medium text-[#d7d9dd] outline-none"
            >
              {availableTimeOptions.map((minutes) => (
                <option key={minutes} value={minutes} className="bg-[#11141a]">
                  {formatMinutes(minutes)}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() =>
              runAction(() =>
                regenerateTodayMissionAction({ availableMinutes }),
              )
            }
          >
            <RefreshCw
              className={cn(pending && "animate-spin")}
              aria-hidden="true"
            />
            Regenerate
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setShowAddTask((current) => !current)}
            aria-expanded={showAddTask}
          >
            {showAddTask ? (
              <X aria-hidden="true" />
            ) : (
              <Plus aria-hidden="true" />
            )}
            {showAddTask ? "Close" : "Add task"}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-2 border-b border-white/[0.07] sm:grid-cols-4">
        <MissionMetric
          label="Available time"
          value={formatMinutes(mission.availableMinutes)}
          icon={Clock3}
        />
        <MissionMetric
          label="Estimated total"
          value={formatMinutes(mission.summary.estimatedMinutes)}
          icon={BookOpen}
        />
        <MissionMetric
          label="XP earned"
          value={`${mission.summary.earnedXp} XP`}
          icon={Award}
          accent
        />
        <MissionMetric
          label="Current streak"
          value={`${mission.summary.streak} days`}
          icon={Flame}
          warm
        />
      </div>

      <div className="px-5 py-5 sm:px-6">
        <div className="mb-2.5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#d8dade]">
              Mission progress
            </p>
            <p className="mt-1 text-[11px] text-[#646a76]">
              {mission.summary.completedTasks} / {mission.summary.totalTasks}{" "}
              tasks · {mission.summary.earnedXp} of{" "}
              {mission.summary.possibleXp} XP
            </p>
          </div>
          <span className="text-sm font-semibold text-[#c9f8e6]">
            {mission.summary.progress}%
          </span>
        </div>
        <Progress
          value={mission.summary.progress}
          className="h-2"
          label="Today's mission progress"
        />
      </div>

      {mission.summary.missionComplete ? (
        <MissionComplete mission={mission} />
      ) : null}

      {showAddTask ? (
        <form
          onSubmit={onAddTask}
          className="mx-5 mb-5 rounded-xl border border-[#9cf0d0]/10 bg-[#0b0e12] p-4 sm:mx-6 sm:p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#e6e8ea]">
                Add a personal task
              </p>
              <p className="mt-1 text-[11px] text-[#5f6672]">
                It joins today&apos;s mission and follows the same XP rules.
              </p>
            </div>
            <Plus className="size-4 text-[#9cf0d0]" aria-hidden="true" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Task title" error={errors.title?.message}>
              <input
                {...register("title")}
                placeholder="Review the component API"
                className="mission-input"
              />
            </Field>
            <Field label="Category" error={errors.category?.message}>
              <select {...register("category")} className="mission-input">
                {missionTaskTypes.map((type) => (
                  <option key={type} value={type}>
                    {taskPresentation[type].label}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Description"
              error={errors.description?.message}
              className="sm:col-span-2"
            >
              <input
                {...register("description")}
                placeholder="What does done look like?"
                className="mission-input"
              />
            </Field>
            <Field
              label="Estimated minutes"
              error={errors.estimatedMinutes?.message}
            >
              <input
                {...register("estimatedMinutes", { valueAsNumber: true })}
                type="number"
                min={5}
                max={120}
                step={5}
                className="mission-input"
              />
            </Field>
            <div className="flex items-end">
              <Button type="submit" size="sm" disabled={pending}>
                Add to mission
                <Plus aria-hidden="true" />
              </Button>
            </div>
          </div>
        </form>
      ) : null}

      <div className="grid border-t border-white/[0.07] xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="divide-y divide-white/[0.055]">
          {mission.tasks.map((task, index) => {
            const presentation = taskPresentation[task.category];
            const isVideo = task.resource?.type === "YOUTUBE";
            const TaskIcon = task.resource
              ? isVideo
                ? Video
                : BookOpen
              : presentation.icon;
            const taskLabel = task.resource
              ? isVideo
                ? "Watch"
                : "Read"
              : presentation.label;

            return (
              <div
                key={task.id}
                className={cn(
                  "group flex gap-3 px-4 py-4 transition-colors sm:px-6",
                  task.completed && "bg-[#9cf0d0]/[0.025]",
                  task.skipped && "opacity-45",
                  !task.skipped && "hover:bg-white/[0.018]",
                )}
              >
                <button
                  type="button"
                  disabled={pending || task.skipped}
                  onClick={() =>
                    runAction(() =>
                      toggleMissionTaskAction({
                        taskId: task.id,
                        completed: !task.completed,
                      }),
                    )
                  }
                  aria-label={
                    task.completed
                      ? `Mark ${task.title} incomplete`
                      : `Complete ${task.title}`
                  }
                  aria-pressed={task.completed}
                  className={cn(
                    "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#9cf0d0]/50",
                    task.completed
                      ? "border-[#9cf0d0] bg-[#9cf0d0] text-[#07100c]"
                      : "border-white/[0.14] bg-white/[0.025] text-transparent hover:border-[#9cf0d0]/60",
                  )}
                >
                  <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.08em]",
                        presentation.color,
                      )}
                    >
                      <TaskIcon className="size-3" aria-hidden="true" />
                      Step {index + 1} · {taskLabel}
                    </span>
                    {task.isPersonal ? (
                      <Badge variant="secondary">Personal</Badge>
                    ) : null}
                    {task.skipped ? (
                      <Badge variant="secondary">Skipped</Badge>
                    ) : null}
                  </div>
                  <p
                    className={cn(
                      "mt-1.5 text-sm font-medium tracking-[-0.01em] text-[#e7e9eb]",
                      (task.completed || task.skipped) &&
                        "text-[#747b86] line-through decoration-white/15",
                    )}
                  >
                    {task.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#626975]">
                    {task.description}
                  </p>
                  {task.resource ? (
                    <MissionResource
                      resource={task.resource}
                      expanded={expandedResourceTaskId === task.id}
                      onToggle={() =>
                        setExpandedResourceTaskId((current) =>
                          current === task.id ? null : task.id,
                        )
                      }
                    />
                  ) : null}
                </div>

                <div className="flex shrink-0 flex-col items-end justify-between gap-3">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="flex items-center gap-1.5 text-[#6e7581]">
                      <Clock3 className="size-3" aria-hidden="true" />
                      {formatMinutes(task.estimatedMinutes)}
                    </span>
                    <span className="font-medium text-[#b9f4dc]">
                      +{task.xp} XP
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                    <TaskControl
                      label={`Move ${task.title} up`}
                      disabled={pending || index === 0}
                      onClick={() =>
                        runAction(() =>
                          reorderMissionTaskAction({
                            taskId: task.id,
                            direction: "up",
                          }),
                        )
                      }
                      icon={ArrowUp}
                    />
                    <TaskControl
                      label={`Move ${task.title} down`}
                      disabled={pending || index === mission.tasks.length - 1}
                      onClick={() =>
                        runAction(() =>
                          reorderMissionTaskAction({
                            taskId: task.id,
                            direction: "down",
                          }),
                        )
                      }
                      icon={ArrowDown}
                    />
                    <TaskControl
                      label={
                        task.skipped
                          ? `Restore ${task.title}`
                          : `Skip ${task.title}`
                      }
                      disabled={pending}
                      onClick={() =>
                        runAction(() =>
                          skipMissionTaskAction({
                            taskId: task.id,
                            skipped: !task.skipped,
                          }),
                        )
                      }
                      icon={task.skipped ? RotateCcw : SkipForward}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="border-t border-white/[0.07] bg-black/10 p-5 xl:border-l xl:border-t-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#555c68]">
            Mission intelligence
          </p>
          <div className="mt-4 space-y-4">
            <Insight
              icon={Trophy}
              label={
                mission.summary.streakBadge
                  ? `${mission.summary.streakBadge} streak badge`
                  : "Next streak badge"
              }
              value={
                mission.summary.streakBadge
                  ? "Unlocked"
                  : `${Math.max(0, 7 - mission.summary.streak)} days to go`
              }
              active={Boolean(mission.summary.streakBadge)}
            />
            <Insight
              icon={Award}
              label="Daily mission bonus"
              value={`+${mission.summary.missionBonusXp} XP`}
              active={mission.summary.missionComplete}
            />
            <Insight
              icon={BrainCircuit}
              label="Planning signal"
              value="Progress + priority"
            />
          </div>
          <div className="mt-5 rounded-lg border border-white/[0.06] bg-white/[0.025] p-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#555c68]">
              Next recommendation
            </p>
            <p className="mt-2 text-xs leading-5 text-[#a7acb5]">
              {mission.summary.nextRecommendation}
            </p>
          </div>
        </aside>
      </div>

      {actionError ? (
        <p
          role="alert"
          className="border-t border-[#f19494]/10 bg-[#f19494]/5 px-6 py-3 text-xs text-[#f1a6a6]"
        >
          {actionError}
        </p>
      ) : null}
    </Card>
  );
}

type MissionResourceData = NonNullable<
  TodayMissionView["tasks"][number]["resource"]
>;

function MissionResource({
  resource,
  expanded,
  onToggle,
}: {
  resource: MissionResourceData;
  expanded: boolean;
  onToggle: () => void;
}) {
  const isVideo = resource.type === "YOUTUBE";

  return (
    <div className="mt-3 max-w-2xl">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#9cf0d0]/12 bg-[#9cf0d0]/[0.06] px-2.5 text-[11px] font-medium text-[#aceed5] outline-none transition-colors hover:bg-[#9cf0d0]/10 focus-visible:ring-2 focus-visible:ring-[#9cf0d0]/50"
        >
          {isVideo ? "Watch here" : "View reading brief"}
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform",
              expanded && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>
        <a
          href={resource.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-medium text-[#7f8793] outline-none transition-colors hover:bg-white/[0.04] hover:text-[#d4d7db] focus-visible:ring-2 focus-visible:ring-[#9cf0d0]/50"
        >
          {isVideo ? "YouTube" : "Original source"}
          <ExternalLink className="size-3" aria-hidden="true" />
        </a>
        {resource.notebookUrl ? (
          <a
            href={resource.notebookUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-medium text-[#aeb8f6] outline-none transition-colors hover:bg-[#a8b6ff]/[0.06] hover:text-[#d2d8ff] focus-visible:ring-2 focus-visible:ring-[#a8b6ff]/50"
          >
            NotebookLM
            <NotebookText className="size-3" aria-hidden="true" />
          </a>
        ) : null}
      </div>

      {expanded ? (
        <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.07] bg-[#080a0e]">
          {isVideo && resource.youtubeVideoId ? (
            <div className="aspect-video bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${resource.youtubeVideoId}`}
                title={resource.title}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="size-full border-0"
              />
            </div>
          ) : (
            <div className="p-4">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#7c85ba]">
                <BookOpen className="size-3.5" aria-hidden="true" />
                Reading brief
              </div>
              <p className="mt-2 text-xs leading-5 text-[#9097a3]">
                {resource.summary ||
                  "Open the original source, then return here to complete the task and save your progress."}
              </p>
              <a
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#b9f4dc] outline-none hover:text-[#d3faeb] focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[#9cf0d0]/50"
              >
                Start reading
                <ExternalLink className="size-3" aria-hidden="true" />
              </a>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function MissionMetric({
  label,
  value,
  icon: Icon,
  accent,
  warm,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: boolean;
  warm?: boolean;
}) {
  return (
    <div className="border-r border-white/[0.06] px-4 py-4 last:border-r-0 sm:px-5">
      <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.08em] text-[#5f6672]">
        <Icon
          className={cn(
            "size-3.5",
            accent && "text-[#9cf0d0]",
            warm && "text-[#f8c278]",
          )}
          aria-hidden="true"
        />
        {label}
      </div>
      <p
        className={cn(
          "mt-2 text-sm font-semibold text-[#e9eaec]",
          accent && "text-[#c9f8e6]",
          warm && "text-[#f8d39d]",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function TaskControl({
  label,
  disabled,
  onClick,
  icon: Icon,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  icon: LucideIcon;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-7 place-items-center rounded-md text-[#656c78] outline-none transition-colors hover:bg-white/[0.06] hover:text-[#d6d8dc] focus-visible:ring-2 focus-visible:ring-[#9cf0d0]/50 disabled:pointer-events-none disabled:opacity-25"
    >
      <Icon className="size-3.5" aria-hidden="true" />
    </button>
  );
}

function Insight({
  icon: Icon,
  label,
  value,
  active,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "grid size-7 place-items-center rounded-lg border border-white/[0.06] bg-white/[0.025] text-[#747b87]",
          active &&
            "border-[#9cf0d0]/15 bg-[#9cf0d0]/10 text-[#9cf0d0]",
        )}
      >
        <Icon className="size-3.5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11px] text-[#717884]">{label}</p>
        <p className="mt-0.5 text-xs font-medium text-[#c9ccd1]">{value}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[11px] font-medium text-[#7b828e]">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-[11px] text-[#efa0a0]">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function MissionComplete({ mission }: { mission: TodayMissionView }) {
  return (
    <section className="mission-complete relative mx-5 mb-5 overflow-hidden rounded-2xl border border-[#9cf0d0]/20 bg-[radial-gradient(circle_at_50%_0%,rgba(156,240,208,0.16),transparent_48%),#0c1512] px-5 py-6 text-center sm:mx-6 sm:px-7">
      <span className="mission-spark mission-spark-one" />
      <span className="mission-spark mission-spark-two" />
      <span className="mission-spark mission-spark-three" />
      <span className="mx-auto grid size-11 place-items-center rounded-full border border-[#9cf0d0]/25 bg-[#9cf0d0]/12 text-[#baf5df] shadow-[0_0_40px_rgba(156,240,208,0.12)]">
        <PartyPopper className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-3 text-lg font-semibold tracking-[-0.035em] text-white">
        Mission Complete!
      </p>
      <p className="mt-1 text-sm font-semibold text-[#9cf0d0]">
        +{mission.summary.earnedXp} XP
      </p>
      <div className="mx-auto mt-5 grid max-w-3xl gap-3 sm:grid-cols-4">
        <CompletionStat
          label="Current streak"
          value={`${mission.summary.streak} days`}
          icon={Flame}
        />
        <CompletionStat
          label="Studied today"
          value={formatMinutes(mission.summary.todayStudiedMinutes)}
          icon={Clock3}
        />
        <CompletionStat
          label="Topics mastered"
          value={String(mission.summary.completedTopics)}
          icon={Trophy}
        />
        <CompletionStat
          label={
            mission.summary.focusTopic?.title
              ? `${mission.summary.focusTopic.title} progress`
              : "Roadmap progress"
          }
          value={`${mission.summary.focusTopic?.progress ?? 0}%`}
          icon={BookOpen}
        />
      </div>
      <div className="mx-auto mt-4 max-w-xl rounded-lg border border-white/[0.06] bg-black/15 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#677069]">
          Next recommendation
        </p>
        <p className="mt-1.5 text-xs text-[#c2cbc6]">
          {mission.summary.nextRecommendation}
        </p>
      </div>
    </section>
  );
}

function CompletionStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-3 text-left">
      <Icon className="size-3.5 text-[#9cf0d0]" aria-hidden="true" />
      <p className="mt-2 text-[10px] text-[#69716c]">{label}</p>
      <p className="mt-0.5 text-xs font-semibold text-[#e3e8e5]">{value}</p>
    </div>
  );
}
