"use client";

import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  GraduationCap,
  Library,
  NotebookText,
  Plus,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";

import {
  createResourceAction,
  toggleResourceAction,
} from "@/app/actions/resources";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ResourceLibraryData } from "@/lib/data";
import { cn } from "@/lib/utils";
import {
  resourceFormSchema,
  resourceTypes,
  type ResourceFormInput,
} from "@/lib/validations/resource";

type LibraryFilter = "ALL" | "YOUTUBE" | "READING" | "COURSE";
type ResourceItem = ResourceLibraryData["resources"][number];

const typePresentation: Record<
  ResourceItem["type"],
  { label: string; icon: LucideIcon; color: string }
> = {
  YOUTUBE: { label: "YouTube", icon: Video, color: "text-[#f2a6a6]" },
  ARTICLE: { label: "Article", icon: FileText, color: "text-[#a8b6ff]" },
  DOCUMENTATION: {
    label: "Documentation",
    icon: BookOpen,
    color: "text-[#9cf0d0]",
  },
  COURSE: { label: "Course", icon: GraduationCap, color: "text-[#f8c278]" },
};

const filters: { value: LibraryFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "YOUTUBE", label: "Videos" },
  { value: "READING", label: "Readings" },
  { value: "COURSE", label: "Courses" },
];

function matchesFilter(resource: ResourceItem, filter: LibraryFilter) {
  if (filter === "ALL") return true;
  if (filter === "READING") {
    return resource.type === "ARTICLE" || resource.type === "DOCUMENTATION";
  }
  return resource.type === filter;
}

export function ResourceLibrary({
  data,
}: {
  data: ResourceLibraryData;
}) {
  const [activeFilter, setActiveFilter] = useState<LibraryFilter>("ALL");
  const [showAddResource, setShowAddResource] = useState(false);
  const [completed, setCompleted] = useState<Record<number, boolean>>(() =>
    Object.fromEntries(
      data.resources.map((resource) => [resource.id, resource.completed]),
    ),
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const visibleResources = useMemo(
    () =>
      data.resources.filter((resource) =>
        matchesFilter(resource, activeFilter),
      ),
    [activeFilter, data.resources],
  );

  const completedCount = Object.values(completed).filter(Boolean).length;

  function toggleCompleted(resource: ResourceItem) {
    const nextCompleted = !completed[resource.id];
    setActionError(null);
    setCompleted((current) => ({
      ...current,
      [resource.id]: nextCompleted,
    }));

    startTransition(async () => {
      try {
        await toggleResourceAction({
          resourceId: resource.id,
          completed: nextCompleted,
        });
      } catch {
        setCompleted((current) => ({
          ...current,
          [resource.id]: !nextCompleted,
        }));
        setActionError("Your progress did not save. Please try again.");
      }
    });
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl border border-[#9cf0d0]/15 bg-[#9cf0d0]/10 text-[#b7f5de]">
              <Library className="size-[17px]" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#ecedef]">
                Learning library
              </p>
              <p className="mt-1 text-xs text-[#6d7480]">
                {completedCount} of {data.summary.total} resources complete
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            variant={showAddResource ? "ghost" : "outline"}
            onClick={() => {
              setShowAddResource((current) => !current);
              setActionError(null);
              setSuccessMessage(null);
            }}
            aria-expanded={showAddResource}
          >
            {showAddResource ? (
              <X aria-hidden="true" />
            ) : (
              <Plus aria-hidden="true" />
            )}
            {showAddResource ? "Close" : "Add resource"}
          </Button>
        </div>

        {showAddResource ? (
          <AddResourceForm
            topics={data.topics}
            pending={pending}
            onPending={(callback) => startTransition(callback)}
            onError={setActionError}
            onSuccess={(message) => {
              setSuccessMessage(message);
              setShowAddResource(false);
            }}
          />
        ) : null}

        <div className="flex gap-1 overflow-x-auto border-b border-white/[0.07] px-4 py-3 sm:px-6">
          {filters.map((filter) => {
            const active = activeFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                aria-pressed={active}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-2 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#9cf0d0]/50",
                  active
                    ? "bg-white/[0.09] text-white"
                    : "text-[#747b87] hover:bg-white/[0.04] hover:text-[#c7cad0]",
                )}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {visibleResources.length ? (
          <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-2">
            {visibleResources.map((resource) =>
              resource.type === "YOUTUBE" ? (
                <VideoResourceCard
                  key={resource.id}
                  resource={resource}
                  completed={Boolean(completed[resource.id])}
                  pending={pending}
                  onToggle={() => toggleCompleted(resource)}
                />
              ) : (
                <ReadingResourceCard
                  key={resource.id}
                  resource={resource}
                  completed={Boolean(completed[resource.id])}
                  pending={pending}
                  onToggle={() => toggleCompleted(resource)}
                />
              ),
            )}
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <span className="mx-auto grid size-10 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-[#69707c]">
              <Library className="size-[18px]" aria-hidden="true" />
            </span>
            <p className="mt-4 text-sm font-medium text-[#d4d7db]">
              Nothing in this view yet
            </p>
            <p className="mt-1 text-xs text-[#666d79]">
              Add a resource or choose another filter.
            </p>
          </div>
        )}

        {actionError || successMessage ? (
          <p
            role={actionError ? "alert" : "status"}
            className={cn(
              "border-t px-6 py-3 text-xs",
              actionError
                ? "border-[#f19494]/10 bg-[#f19494]/5 text-[#f1a6a6]"
                : "border-[#9cf0d0]/10 bg-[#9cf0d0]/5 text-[#aeeed6]",
            )}
          >
            {actionError ?? successMessage}
          </p>
        ) : null}
      </Card>
    </>
  );
}

function VideoResourceCard({
  resource,
  completed,
  pending,
  onToggle,
}: {
  resource: ResourceItem;
  completed: boolean;
  pending: boolean;
  onToggle: () => void;
}) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border bg-[#0c0f14] transition-colors",
        completed
          ? "border-[#9cf0d0]/15"
          : "border-white/[0.07] hover:border-white/[0.12]",
      )}
    >
      <div className="aspect-video bg-black">
        {resource.youtubeVideoId ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${resource.youtubeVideoId}`}
            title={resource.title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="size-full border-0"
          />
        ) : (
          <div className="grid size-full place-items-center text-[#5e6571]">
            <Video className="size-8" aria-hidden="true" />
          </div>
        )}
      </div>
      <ResourceDetails
        resource={resource}
        completed={completed}
        pending={pending}
        onToggle={onToggle}
        actionLabel="Open in YouTube"
      />
    </article>
  );
}

function ReadingResourceCard({
  resource,
  completed,
  pending,
  onToggle,
}: {
  resource: ResourceItem;
  completed: boolean;
  pending: boolean;
  onToggle: () => void;
}) {
  const presentation = typePresentation[resource.type];
  const Icon = presentation.icon;

  return (
    <article
      className={cn(
        "flex min-h-52 flex-col rounded-2xl border bg-[#0c0f14] transition-colors",
        completed
          ? "border-[#9cf0d0]/15"
          : "border-white/[0.07] hover:border-white/[0.12]",
      )}
    >
      <div className="flex flex-1 items-start justify-between gap-4 px-5 pt-5">
        <span
          className={cn(
            "grid size-10 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.035]",
            presentation.color,
          )}
        >
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
        {completed ? (
          <Badge>
            <Check className="mr-1 size-3" aria-hidden="true" />
            Complete
          </Badge>
        ) : null}
      </div>
      <ResourceDetails
        resource={resource}
        completed={completed}
        pending={pending}
        onToggle={onToggle}
        actionLabel="Open resource"
      />
    </article>
  );
}

function ResourceDetails({
  resource,
  completed,
  pending,
  onToggle,
  actionLabel,
}: {
  resource: ResourceItem;
  completed: boolean;
  pending: boolean;
  onToggle: () => void;
  actionLabel: string;
}) {
  const presentation = typePresentation[resource.type];
  const TypeIcon = presentation.icon;

  return (
    <div className="p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
            presentation.color,
          )}
        >
          <TypeIcon className="size-3" aria-hidden="true" />
          {presentation.label}
        </span>
        {resource.topic ? (
          <Badge variant="secondary">{resource.topic.title}</Badge>
        ) : null}
        <Badge variant="secondary">
          <Clock3 className="mr-1 size-3" aria-hidden="true" />
          {resource.estimatedMinutes} min
        </Badge>
        {resource.sourceProvider === "NOTEBOOKLM" ? (
          <Badge variant="secondary">
            <NotebookText className="mr-1 size-3" aria-hidden="true" />
            NotebookLM
          </Badge>
        ) : null}
      </div>
      <h2 className="mt-3 text-[15px] font-semibold leading-6 tracking-[-0.02em] text-[#eceef0]">
        {resource.title}
      </h2>
      {resource.summary ? (
        <p className="mt-2 text-xs leading-5 text-[#747b87]">
          {resource.summary}
        </p>
      ) : null}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <a
            href={resource.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/[0.09] bg-white/[0.035] px-3 text-xs font-medium text-[#dfe1e5] outline-none transition-colors hover:border-white/[0.16] hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-[#9cf0d0]/50"
          >
            {actionLabel}
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
          {resource.notebookUrl ? (
            <a
              href={resource.notebookUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#a8b6ff]/15 bg-[#a8b6ff]/[0.06] px-3 text-xs font-medium text-[#bec7ff] outline-none transition-colors hover:bg-[#a8b6ff]/10 focus-visible:ring-2 focus-visible:ring-[#a8b6ff]/50"
            >
              Open notebook
              <NotebookText className="size-3.5" aria-hidden="true" />
            </a>
          ) : null}
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={onToggle}
          aria-pressed={completed}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#9cf0d0]/50 disabled:opacity-50",
            completed
              ? "bg-[#9cf0d0]/10 text-[#baf4df] hover:bg-[#9cf0d0]/15"
              : "bg-white/[0.035] text-[#858c98] hover:bg-white/[0.06] hover:text-[#d9dce0]",
          )}
        >
          <CheckCircle2 className="size-3.5" aria-hidden="true" />
          {completed ? "Completed" : "Mark complete"}
        </button>
      </div>
    </div>
  );
}

function AddResourceForm({
  topics,
  pending,
  onPending,
  onError,
  onSuccess,
}: {
  topics: ResourceLibraryData["topics"];
  pending: boolean;
  onPending: (callback: () => Promise<void>) => void;
  onError: (message: string | null) => void;
  onSuccess: (message: string) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResourceFormInput>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      title: "",
      url: "",
      type: "YOUTUBE",
      topicId: topics[0] ? String(topics[0].id) : "",
      estimatedMinutes: 15,
      summary: "",
      notebookUrl: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    onError(null);
    onPending(async () => {
      const result = await createResourceAction(values);
      if (!result.ok) {
        onError(result.error);
        return;
      }

      reset();
      onSuccess("Resource saved to your library.");
    });
  });

  return (
    <form
      onSubmit={onSubmit}
      className="border-b border-white/[0.07] bg-black/10 p-5 sm:p-6"
    >
      <div className="mb-4">
        <p className="text-sm font-medium text-[#e6e8ea]">Add a resource</p>
        <p className="mt-1 text-xs text-[#686f7b]">
          Save the original source URL. YouTube plays here; a NotebookLM link
          keeps its transcript, summary, and study guide one click away.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <ResourceField label="Title" error={errors.title?.message}>
          <input
            {...register("title")}
            className="mission-input"
            placeholder="React Server Components explained"
          />
        </ResourceField>
        <ResourceField label="URL" error={errors.url?.message}>
          <input
            {...register("url")}
            type="url"
            className="mission-input"
            placeholder="https://..."
          />
        </ResourceField>
        <ResourceField label="Type" error={errors.type?.message}>
          <select {...register("type")} className="mission-input">
            {resourceTypes.map((type) => (
              <option key={type} value={type}>
                {typePresentation[type].label}
              </option>
            ))}
          </select>
        </ResourceField>
        <ResourceField label="Topic" error={errors.topicId?.message}>
          <select {...register("topicId")} className="mission-input">
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title}
              </option>
            ))}
          </select>
        </ResourceField>
        <ResourceField
          label="Estimated minutes"
          error={errors.estimatedMinutes?.message}
        >
          <input
            {...register("estimatedMinutes", { valueAsNumber: true })}
            type="number"
            min={5}
            max={180}
            step={5}
            className="mission-input"
          />
        </ResourceField>
        <ResourceField
          label="NotebookLM URL (optional)"
          error={errors.notebookUrl?.message}
        >
          <input
            {...register("notebookUrl")}
            type="url"
            className="mission-input"
            placeholder="https://notebooklm.google.com/notebook/..."
          />
        </ResourceField>
        <ResourceField
          label="Study summary (optional)"
          error={errors.summary?.message}
          className="sm:col-span-2"
        >
          <textarea
            {...register("summary")}
            rows={3}
            className="mission-input h-auto resize-y py-2.5"
            placeholder="Paste the key takeaway or study guide you created in NotebookLM."
          />
        </ResourceField>
      </div>
      <div className="mt-4 flex justify-end">
        <Button type="submit" size="sm" disabled={pending || !topics.length}>
          <Plus aria-hidden="true" />
          Save resource
        </Button>
      </div>
    </form>
  );
}

function ResourceField({
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
      <span className="mb-1.5 block text-[11px] font-medium text-[#8c929d]">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-[11px] text-[#f1a6a6]">
          {error}
        </span>
      ) : null}
    </label>
  );
}
