import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AssistantPanel } from "@/components/assistant-panel";
import { LearningShell } from "@/components/learning-shell";
import { LessonWorkspace } from "@/components/lesson-workspace";
import { getLessonPageData } from "@/lib/learning-data";

export const dynamic = "force-dynamic";

type LessonPageProps = {
  params: Promise<{
    moduleSlug: string;
    lessonId: string;
  }>;
};

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { moduleSlug, lessonId } = await params;
  const data = await getLessonPageData(moduleSlug, lessonId);

  return data
    ? { title: `${data.lesson.title} · ${data.roadmap.title}` }
    : { title: "Lesson unavailable" };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { moduleSlug, lessonId } = await params;
  const data = await getLessonPageData(moduleSlug, lessonId);

  if (!data) notFound();

  return (
    <LearningShell
      modules={data.modules}
      activeModuleSlug={moduleSlug}
      activeLessonId={lessonId}
      rightPanel={
        <AssistantPanel
          moduleSlug={moduleSlug}
          lesson={data.lesson}
          lessonState={data.lessonState}
          initialNote={data.note}
          projectProgress={data.projectProgress}
        />
      }
    >
      <LessonWorkspace data={data} />
    </LearningShell>
  );
}
