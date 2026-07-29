"use client";

import { BookOpenText, Check, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { markLessonNotesReadAction } from "@/app/actions/learning";
import { MarkdownContent } from "@/components/markdown-content";
import { Button } from "@/components/ui/button";

type ReadingLessonContentProps = {
  moduleSlug: string;
  lessonId: string;
  content: string;
  completed: boolean;
};

export function ReadingLessonContent({
  moduleSlug,
  lessonId,
  content,
  completed,
}: ReadingLessonContentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function markRead() {
    startTransition(async () => {
      await markLessonNotesReadAction({ moduleSlug, lessonId });
      router.refresh();
    });
  }

  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
      <div className="mb-8 flex items-center gap-3 border-b border-white/[0.065] pb-5">
        <span className="grid size-10 place-items-center rounded-xl border border-[#9cf0d0]/15 bg-[#9cf0d0]/[0.055] text-[#a9e8d1]">
          <BookOpenText className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-medium text-[#dfe4e2]">Text lesson</p>
          <p className="mt-1 text-[11px] text-[#666d76]">
            Read at your own pace. Your progress is saved locally.
          </p>
        </div>
      </div>

      <MarkdownContent content={content} />

      <div className="mt-10 border-t border-white/[0.065] pt-6">
        <Button
          type="button"
          disabled={completed || isPending}
          onClick={markRead}
        >
          {isPending ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Check />
          )}
          {completed ? "Reading complete" : "I finished this reading"}
        </Button>
      </div>
    </article>
  );
}
