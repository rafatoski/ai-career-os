import type { Metadata } from "next";
import { BookOpen, CheckCircle2, GraduationCap, Video } from "lucide-react";

import { ResourceLibrary } from "@/components/resource-library";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getResourceLibraryData } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resources",
  description: "Videos, readings, documentation, and courses for your roadmap.",
};

export default async function ResourcesPage() {
  const data = await getResourceLibraryData();
  const progress = data.summary.total
    ? Math.round((data.summary.completed / data.summary.total) * 100)
    : 0;

  const metrics = [
    { label: "Videos", value: data.summary.videos, icon: Video },
    { label: "Readings", value: data.summary.readings, icon: BookOpen },
    {
      label: "Courses",
      value: data.resources.filter((resource) => resource.type === "COURSE")
        .length,
      icon: GraduationCap,
    },
    {
      label: "Completed",
      value: data.summary.completed,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="animate-enter">
      <header className="mb-7 max-w-3xl sm:mb-8">
        <p className="text-xs font-medium text-[#747a87]">Knowledge base</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#f7f8f8] sm:text-[30px]">
          Resources
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#777d89]">
          Watch, read, and keep your learning material connected to roadmap
          progress.
        </p>
      </header>

      <section
        className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_minmax(240px,1.5fr)]"
        aria-label="Resource statistics"
      >
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="flex items-center gap-3 p-4">
              <span className="grid size-8 place-items-center rounded-lg border border-white/[0.06] bg-white/[0.025] text-[#9cf0d0]">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[11px] text-[#656c78]">{metric.label}</p>
                <p className="mt-0.5 text-lg font-semibold text-[#eceef0]">
                  {metric.value}
                </p>
              </div>
            </Card>
          );
        })}
        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] text-[#656c78]">Library progress</p>
            <span className="text-xs font-semibold text-[#baf4df]">
              {progress}%
            </span>
          </div>
          <Progress
            value={progress}
            label="Resource completion progress"
            className="mt-3"
          />
        </Card>
      </section>

      <ResourceLibrary data={data} />
    </div>
  );
}
