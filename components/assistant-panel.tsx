"use client";

import {
  BookOpenText,
  Brain,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Layers3,
  Link2,
  LoaderCircle,
  MessageCircleQuestion,
  RotateCcw,
  Save,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  markLessonNotesReadAction,
  saveLessonNoteAction,
  saveProjectProgressAction,
  submitQuizAction,
} from "@/app/actions/learning";
import { MarkdownContent } from "@/components/markdown-content";
import { Button } from "@/components/ui/button";
import type { LessonContent, LessonState } from "@/lib/learning-data";
import { cn } from "@/lib/utils";

type TabId = "notes" | "tutor" | "quiz" | "flashcards" | "resources";

type QuizResult = Awaited<ReturnType<typeof submitQuizAction>>;

type AssistantPanelProps = {
  moduleSlug: string;
  lesson: LessonContent;
  lessonState: LessonState;
  initialNote: string;
  projectProgress: {
    githubUrl: string;
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
    completed: boolean;
  } | null;
};

const tabs: Array<{ id: TabId; label: string; icon: typeof FileText }> = [
  { id: "notes", label: "Notes", icon: FileText },
  { id: "tutor", label: "AI Tutor", icon: MessageCircleQuestion },
  { id: "quiz", label: "Quiz", icon: Brain },
  { id: "flashcards", label: "Cards", icon: Layers3 },
  { id: "resources", label: "Resources", icon: Link2 },
];

export function AssistantPanel({
  moduleSlug,
  lesson,
  lessonState,
  initialNote,
  projectProgress,
}: AssistantPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>(
    lesson.type === "reading" ? "quiz" : "notes",
  );

  return (
    <div className="flex h-screen min-h-[680px] flex-col lg:sticky lg:top-0">
      <div className="border-b border-white/[0.065] px-3 pt-4">
        <p className="px-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[#565c66]">
          Lesson assistant
        </p>
        <div
          className="mt-3 flex overflow-x-auto"
          role="tablist"
          aria-label="Lesson tools"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex min-w-fit flex-1 items-center justify-center gap-1.5 border-b px-2 pb-3 text-[10px] font-medium transition-colors",
                  activeTab === tab.id
                    ? "border-[#9cf0d0] text-[#d9fbed]"
                    : "border-transparent text-[#626873] hover:text-[#aeb3bb]",
                )}
              >
                <Icon className="size-3.5" aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {activeTab === "notes" ? (
          <NotesTab
            moduleSlug={moduleSlug}
            lesson={lesson}
            initialNote={initialNote}
            notesRead={lessonState.notesRead}
          />
        ) : null}
        {activeTab === "tutor" ? <TutorTab lesson={lesson} /> : null}
        {activeTab === "quiz" ? (
          <QuizTab
            moduleSlug={moduleSlug}
            lesson={lesson}
            quizPassed={lessonState.quizPassed}
            quizScore={lessonState.quizScore}
          />
        ) : null}
        {activeTab === "flashcards" ? (
          <FlashcardsTab lesson={lesson} />
        ) : null}
        {activeTab === "resources" ? (
          <ResourcesTab
            moduleSlug={moduleSlug}
            lesson={lesson}
            projectProgress={projectProgress}
          />
        ) : null}
      </div>
    </div>
  );
}

function NotesTab({
  moduleSlug,
  lesson,
  initialNote,
  notesRead,
}: {
  moduleSlug: string;
  lesson: LessonContent;
  initialNote: string;
  notesRead: boolean;
}) {
  const router = useRouter();
  const [personalNote, setPersonalNote] = useState(initialNote);
  const [savedNote, setSavedNote] = useState(initialNote);
  const [isPending, startTransition] = useTransition();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    if (personalNote === savedNote) return;

    const timer = setTimeout(() => {
      startTransition(async () => {
        await saveLessonNoteAction({
          moduleSlug,
          lessonId: lesson.id,
          content: personalNote,
        });
        setSavedNote(personalNote);
      });
    }, 700);

    return () => clearTimeout(timer);
  }, [lesson.id, moduleSlug, personalNote, savedNote]);

  function markRead() {
    startTransition(async () => {
      await markLessonNotesReadAction({
        moduleSlug,
        lessonId: lesson.id,
      });
      router.refresh();
    });
  }

  return (
    <div className="space-y-8 p-5">
      <section>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xs font-semibold text-[#e2e4e7]">
            Lesson reading
          </h2>
          {notesRead ? (
            <span className="flex items-center gap-1 text-[10px] text-[#9cf0d0]">
              <Check className="size-3" />
              Read
            </span>
          ) : null}
        </div>
        <MarkdownContent content={lesson.notes} className="mt-5" />
        <Button
          type="button"
          variant={notesRead ? "ghost" : "outline"}
          size="sm"
          className="mt-5"
          disabled={notesRead || isPending}
          onClick={markRead}
        >
          {isPending ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <BookOpenText />
          )}
          {notesRead ? "Reading complete" : "I finished the reading"}
        </Button>
      </section>

      <section className="border-t border-white/[0.065] pt-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xs font-semibold text-[#e2e4e7]">
            Personal notes
          </h2>
          <span className="flex items-center gap-1 text-[10px] text-[#5d636e]">
            {isPending ? (
              <LoaderCircle className="size-3 animate-spin" />
            ) : (
              <Save className="size-3" />
            )}
            {personalNote === savedNote && !isPending ? "Saved" : "Saving"}
          </span>
        </div>
        <textarea
          value={personalNote}
          onChange={(event) => setPersonalNote(event.target.value)}
          placeholder="Write in Markdown…"
          className="mt-4 min-h-52 w-full resize-y rounded-xl border border-white/[0.075] bg-[#090b0e] p-3.5 font-mono text-xs leading-6 text-[#c7cbd0] outline-none transition focus:border-[#9cf0d0]/30 focus:ring-2 focus:ring-[#9cf0d0]/5"
        />
        <p className="mt-2 text-[10px] text-[#535963]">
          Autosaved locally for this lesson.
        </p>
      </section>
    </div>
  );
}

function TutorTab({ lesson }: { lesson: LessonContent }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<
    Array<{ role: "you" | "tutor"; content: string }>
  >([]);

  function askQuestion(event: React.FormEvent) {
    event.preventDefault();
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;

    const answer = answerFromLesson(cleanQuestion, lesson);
    setMessages((current) => [
      ...current,
      { role: "you", content: cleanQuestion },
      { role: "tutor", content: answer },
    ]);
    setQuestion("");
  }

  return (
    <div className="flex min-h-full flex-col p-5">
      <div className="rounded-xl border border-[#9cf0d0]/10 bg-[#9cf0d0]/[0.035] p-4">
        <p className="text-xs font-medium text-[#d8eee6]">
          Grounded in this lesson
        </p>
        <p className="mt-2 text-[11px] leading-5 text-[#738079]">
          This local tutor only uses the lesson description, reading and
          flashcards. It does not send your questions to a cloud service.
        </p>
      </div>

      <div className="mt-5 flex-1 space-y-4">
        {messages.length ? (
          messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={cn(
                "rounded-xl p-3.5 text-xs leading-5",
                message.role === "you"
                  ? "ml-7 bg-white/[0.055] text-[#d4d7db]"
                  : "mr-3 border border-white/[0.065] bg-[#0a0c0f] text-[#9ea4ad]",
              )}
            >
              <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.13em] text-[#5b626d]">
                {message.role === "you" ? "You" : "Lesson tutor"}
              </p>
              {message.content}
            </div>
          ))
        ) : (
          <p className="py-10 text-center text-xs leading-6 text-[#5f6570]">
            Ask for an explanation, example or recap of a concept in this
            lesson.
          </p>
        )}
      </div>

      <form onSubmit={askQuestion} className="sticky bottom-0 mt-5 bg-[#0d0f13]">
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about this lesson…"
          rows={3}
          className="w-full resize-none rounded-xl border border-white/[0.075] bg-[#090b0e] p-3 text-xs leading-5 text-[#d0d3d7] outline-none focus:border-[#9cf0d0]/30"
        />
        <Button type="submit" size="sm" className="mt-2 w-full">
          Ask lesson tutor
        </Button>
      </form>
    </div>
  );
}

function answerFromLesson(question: string, lesson: LessonContent) {
  const terms = new Set(
    question
      .toLowerCase()
      .split(/[^a-záéíóúñ0-9]+/i)
      .filter((term) => term.length > 3),
  );
  const candidates = [
    lesson.description,
    ...lesson.notes
      .split(/\n+/)
      .map((line) => line.replace(/^#+\s*|^-\s*/g, "").trim())
      .filter((line) => line.length > 25),
    ...lesson.flashcards.map((card) => `${card.front}: ${card.back}`),
  ];
  const ranked = candidates
    .map((candidate) => ({
      candidate,
      score: [...terms].filter((term) =>
        candidate.toLowerCase().includes(term),
      ).length,
    }))
    .sort((a, b) => b.score - a.score);
  const best = ranked[0];

  if (!best || (terms.size > 0 && best.score === 0)) {
    return `I can only answer from “${lesson.title}”. I couldn't find that topic in this lesson. Try asking about one of its key ideas or flashcards.`;
  }

  return `${best.candidate} Review the lesson reading and video context before applying this idea in the exercise.`;
}

function QuizTab({
  moduleSlug,
  lesson,
  quizPassed,
  quizScore,
}: {
  moduleSlug: string;
  lesson: LessonContent;
  quizPassed: boolean;
  quizScore: number;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const allAnswered = lesson.quiz.every(
    (question) => answers[question.id] !== undefined,
  );

  function submit() {
    if (!allAnswered) return;
    startTransition(async () => {
      const nextResult = await submitQuizAction({
        moduleSlug,
        lessonId: lesson.id,
        answers,
      });
      setResult(nextResult);
      router.refresh();
    });
  }

  function reset() {
    setAnswers({});
    setResult(null);
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-[#e5e7e9]">Lesson quiz</h2>
          <p className="mt-1 text-[11px] text-[#666c76]">
            Score 80% or more to pass.
          </p>
        </div>
        {quizPassed ? (
          <span className="flex items-center gap-1 text-[10px] text-[#9cf0d0]">
            <Check className="size-3.5" />
            Passed · {quizScore}%
          </span>
        ) : null}
      </div>

      <div className="mt-6 space-y-7">
        {lesson.quiz.map((question, questionIndex) => {
          const questionResult = result?.results.find(
            (candidate) => candidate.id === question.id,
          );

          return (
            <fieldset key={question.id}>
              <legend className="text-xs font-medium leading-5 text-[#d7dade]">
                <span className="mr-2 text-[#5d636d]">
                  {questionIndex + 1}.
                </span>
                {question.question}
              </legend>
              <div className="mt-3 space-y-2">
                {question.options.map((option, optionIndex) => (
                  <label
                    key={option}
                    className={cn(
                      "flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 text-[11px] leading-5 transition-colors",
                      answers[question.id] === optionIndex
                        ? "border-[#9cf0d0]/25 bg-[#9cf0d0]/[0.055] text-[#dce9e4]"
                        : "border-white/[0.06] bg-white/[0.015] text-[#888e98] hover:bg-white/[0.03]",
                    )}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      checked={answers[question.id] === optionIndex}
                      disabled={Boolean(result)}
                      onChange={() =>
                        setAnswers((current) => ({
                          ...current,
                          [question.id]: optionIndex,
                        }))
                      }
                      className="mt-1 accent-[#9cf0d0]"
                    />
                    {option}
                  </label>
                ))}
              </div>
              {questionResult ? (
                <p
                  className={cn(
                    "mt-3 rounded-lg border p-3 text-[11px] leading-5",
                    questionResult.correct
                      ? "border-[#9cf0d0]/12 bg-[#9cf0d0]/[0.035] text-[#99b9ad]"
                      : "border-[#f2ad78]/12 bg-[#f2ad78]/[0.035] text-[#b9a08d]",
                  )}
                >
                  {questionResult.explanation}
                </p>
              ) : null}
            </fieldset>
          );
        })}
      </div>

      {result ? (
        <div className="mt-7 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 text-center">
          <p className="text-2xl font-semibold tracking-[-0.04em] text-white">
            {result.score}%
          </p>
          <p className="mt-1 text-xs text-[#777d87]">
            {result.passed
              ? "Quiz complete. You can finish the lesson."
              : "Review the explanations and try again."}
          </p>
          {!result.passed ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={reset}
            >
              <RotateCcw />
              Try again
            </Button>
          ) : null}
        </div>
      ) : (
        <Button
          type="button"
          className="mt-7 w-full"
          disabled={!allAnswered || isPending}
          onClick={submit}
        >
          {isPending ? <LoaderCircle className="animate-spin" /> : <Brain />}
          Check answers
        </Button>
      )}
    </div>
  );
}

function FlashcardsTab({ lesson }: { lesson: LessonContent }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const cards = lesson.flashcards;

  if (!cards.length) {
    return (
      <EmptyPanel message="No flashcards have been added to this lesson." />
    );
  }

  const card = cards[index];
  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#e5e7e9]">Key concepts</h2>
        <span className="text-[10px] tabular-nums text-[#5f6570]">
          {index + 1} / {cards.length}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setFlipped((current) => !current)}
        className="flashcard-perspective mt-6 block aspect-[4/3] w-full text-left"
        aria-label="Flip flashcard"
      >
        <span
          className={cn(
            "flashcard-inner relative block h-full w-full",
            flipped && "is-flipped",
          )}
        >
          <span className="flashcard-face absolute inset-0 flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#12151a] p-6">
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#5d646e]">
              Concept
            </span>
            <span className="text-center text-lg font-semibold tracking-[-0.03em] text-[#edf0f2]">
              {card.front}
            </span>
            <span className="text-center text-[10px] text-[#626873]">
              Click to reveal
            </span>
          </span>
          <span className="flashcard-face flashcard-back absolute inset-0 flex flex-col justify-between rounded-2xl border border-[#9cf0d0]/12 bg-[#101814] p-6">
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#668378]">
              Meaning
            </span>
            <span className="text-center text-sm leading-6 text-[#c7d9d2]">
              {card.back}
            </span>
            <span className="text-center text-[10px] text-[#60756d]">
              Click to flip back
            </span>
          </span>
        </span>
      </button>

      <div className="mt-5 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={index === 0}
          onClick={() => {
            setIndex((current) => Math.max(0, current - 1));
            setFlipped(false);
          }}
          aria-label="Previous flashcard"
        >
          <ChevronLeft />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={index === cards.length - 1}
          onClick={() => {
            setIndex((current) => Math.min(cards.length - 1, current + 1));
            setFlipped(false);
          }}
          aria-label="Next flashcard"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

function ResourcesTab({
  moduleSlug,
  lesson,
  projectProgress,
}: {
  moduleSlug: string;
  lesson: LessonContent;
  projectProgress: AssistantPanelProps["projectProgress"];
}) {
  const [githubUrl, setGithubUrl] = useState(
    projectProgress?.githubUrl ?? "",
  );
  const [status, setStatus] = useState<
    "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"
  >(projectProgress?.status ?? "NOT_STARTED");
  const [completed, setCompleted] = useState(
    projectProgress?.completed ?? false,
  );
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  const resources = useMemo(
    () => [
      ...(lesson.youtubeUrl
        ? [{ title: "Open video on YouTube", url: lesson.youtubeUrl }]
        : []),
      ...lesson.resources,
    ],
    [lesson.resources, lesson.youtubeUrl],
  );

  function saveProject(event: React.FormEvent) {
    event.preventDefault();
    setFeedback("");
    startTransition(async () => {
      try {
        await saveProjectProgressAction({
          moduleSlug,
          lessonId: lesson.id,
          githubUrl,
          status,
          completed,
        });
        setFeedback("Project saved locally.");
      } catch (error) {
        setFeedback(
          error instanceof Error ? error.message : "Could not save project.",
        );
      }
    });
  }

  return (
    <div className="space-y-7 p-5">
      <section>
        <h2 className="text-xs font-semibold text-[#e2e4e7]">Links</h2>
        <div className="mt-3 space-y-2">
          {resources.map((resource) => (
            <a
              key={`${resource.title}-${resource.url}`}
              href={resource.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.065] bg-white/[0.02] p-3 text-xs text-[#aeb3ba] transition-colors hover:bg-white/[0.04] hover:text-white"
            >
              <span>{resource.title}</span>
              <ExternalLink className="size-3.5 shrink-0 text-[#616772]" />
            </a>
          ))}
        </div>
      </section>

      {lesson.exercise ? (
        <section className="border-t border-white/[0.065] pt-6">
          <h2 className="text-xs font-semibold text-[#e2e4e7]">Exercise</h2>
          <p className="mt-3 text-xs leading-6 text-[#8b919a]">
            {lesson.exercise}
          </p>
        </section>
      ) : null}

      {lesson.project ? (
        <section className="border-t border-white/[0.065] pt-6">
          <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#5c626c]">
            Module project
          </p>
          <h2 className="mt-2 text-sm font-semibold text-[#e6e8ea]">
            {lesson.project.title}
          </h2>
          <p className="mt-2 text-xs leading-5 text-[#7f858f]">
            {lesson.project.description}
          </p>
          <ul className="mt-4 space-y-2">
            {lesson.project.requirements.map((requirement) => (
              <li
                key={requirement}
                className="flex gap-2 text-[11px] leading-5 text-[#777d87]"
              >
                <Check className="mt-1 size-3 shrink-0 text-[#66706c]" />
                {requirement}
              </li>
            ))}
          </ul>

          <form onSubmit={saveProject} className="mt-5 space-y-3">
            <label className="block text-[10px] text-[#676d77]">
              GitHub URL
              <input
                type="url"
                value={githubUrl}
                onChange={(event) => setGithubUrl(event.target.value)}
                placeholder="https://github.com/…"
                className="mt-1.5 h-9 w-full rounded-lg border border-white/[0.075] bg-[#090b0e] px-3 text-xs text-[#cbd0d4] outline-none focus:border-[#9cf0d0]/30"
              />
            </label>
            <label className="block text-[10px] text-[#676d77]">
              Status
              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as
                      | "NOT_STARTED"
                      | "IN_PROGRESS"
                      | "COMPLETED",
                  )
                }
                className="mt-1.5 h-9 w-full rounded-lg border border-white/[0.075] bg-[#090b0e] px-3 text-xs text-[#cbd0d4] outline-none"
              >
                <option value="NOT_STARTED">Not started</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-[11px] text-[#8a9099]">
              <input
                type="checkbox"
                checked={completed}
                onChange={(event) => {
                  setCompleted(event.target.checked);
                  if (event.target.checked) setStatus("COMPLETED");
                }}
                className="accent-[#9cf0d0]"
              />
              Project complete
            </label>
            <Button type="submit" variant="outline" size="sm" disabled={isPending}>
              {isPending ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <Save />
              )}
              Save project
            </Button>
            {feedback ? (
              <p className="text-[10px] text-[#737a83]">{feedback}</p>
            ) : null}
          </form>
        </section>
      ) : null}
    </div>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="m-5 rounded-xl border border-dashed border-white/[0.07] px-4 py-10 text-center text-xs leading-5 text-[#626873]">
      {message}
    </div>
  );
}
