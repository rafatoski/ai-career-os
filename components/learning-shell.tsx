import type { ReactNode } from "react";

import type { ModuleState } from "@/lib/learning-data";
import { RoadmapSidebar } from "@/components/roadmap-sidebar";

type LearningShellProps = {
  modules: ModuleState[];
  activeModuleSlug?: string;
  activeLessonId?: string;
  children: ReactNode;
  rightPanel: ReactNode;
};

export function LearningShell({
  modules,
  activeModuleSlug,
  activeLessonId,
  children,
  rightPanel,
}: LearningShellProps) {
  return (
    <main className="learning-shell">
      <RoadmapSidebar
        modules={modules}
        activeModuleSlug={activeModuleSlug}
        activeLessonId={activeLessonId}
      />
      <section className="min-w-0 bg-[#0b0c0f]">{children}</section>
      <aside className="min-w-0 border-l border-white/[0.065] bg-[#0d0f13]">
        {rightPanel}
      </aside>
    </main>
  );
}
