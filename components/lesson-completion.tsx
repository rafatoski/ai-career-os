"use client";

import { Check, LoaderCircle, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { completeLessonAction } from "@/app/actions/learning";
import { Button } from "@/components/ui/button";

type LessonCompletionProps = {
  moduleSlug: string;
  lessonId: string;
  videoCompleted: boolean;
  notesRead: boolean;
  quizPassed: boolean;
  completed: boolean;
  requiresVideo: boolean;
};

export function LessonCompletion({
  moduleSlug,
  lessonId,
  videoCompleted,
  notesRead,
  quizPassed,
  completed,
  requiresVideo,
}: LessonCompletionProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const ready = (!requiresVideo || videoCompleted) && notesRead && quizPassed;

  function complete() {
    startTransition(async () => {
      const result = await completeLessonAction({ moduleSlug, lessonId });
      setMessage(result.message);
      router.refresh();
    });
  }

  if (completed) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-[#9cf0d0]/12 bg-[#9cf0d0]/[0.035] px-4 py-3 text-xs text-[#b6dfd0]">
        <Check className="size-4" />
        Lesson complete
      </div>
    );
  }

  return (
    <div>
      <Button
        type="button"
        className="w-full sm:w-auto"
        disabled={!ready || isPending}
        onClick={complete}
      >
        {isPending ? (
          <LoaderCircle className="animate-spin" />
        ) : ready ? (
          <Check />
        ) : (
          <LockKeyhole />
        )}
        Mark lesson complete
      </Button>
      {!ready ? (
        <p className="mt-2 text-[11px] text-[#656b76]">
          Complete the {requiresVideo ? "video, reading and quiz" : "reading and quiz"} to
          unlock this action.
        </p>
      ) : null}
      {message ? (
        <p className="mt-2 text-[11px] text-[#7e858f]">{message}</p>
      ) : null}
    </div>
  );
}
