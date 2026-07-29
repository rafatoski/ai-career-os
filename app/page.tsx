import { HomeContinue } from "@/components/home-continue";
import { LearningShell } from "@/components/learning-shell";
import { RecentNotes } from "@/components/recent-notes";
import { getLearningState } from "@/lib/learning-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const learningState = await getLearningState();

  return (
    <LearningShell
      modules={learningState.modules}
      activeModuleSlug={learningState.current?.module.slug}
      rightPanel={<RecentNotes notes={learningState.recentNotes} />}
    >
      <HomeContinue current={learningState.current} />
    </LearningShell>
  );
}
