import Link from "next/link";
import { FileText, MoveUpRight } from "lucide-react";

import type { RecentNote } from "@/lib/learning-data";

export function RecentNotes({ notes }: { notes: RecentNote[] }) {
  return (
    <div className="h-full px-5 py-6">
      <div className="flex items-center gap-2 text-sm font-semibold text-[#e7e9eb]">
        <FileText className="size-4 text-[#838995]" aria-hidden="true" />
        Recent notes
      </div>
      <p className="mt-2 text-xs leading-5 text-[#666c77]">
        Continue a thought from your latest lessons.
      </p>

      {notes.length ? (
        <div className="mt-6 space-y-2">
          {notes.map((note) => (
            <Link
              key={note.lessonKey}
              href={note.href}
              className="group block rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 transition-colors hover:border-white/[0.1] hover:bg-white/[0.035]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-[#d9dcdf]">
                    {note.lessonTitle}
                  </p>
                  <p className="mt-1 text-[10px] text-[#606671]">
                    {note.moduleTitle}
                  </p>
                </div>
                <MoveUpRight className="size-3.5 shrink-0 text-[#4c525c] transition-colors group-hover:text-[#aeb4bc]" />
              </div>
              <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-[11px] leading-5 text-[#737985]">
                {note.content.replaceAll("#", "").trim()}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-white/[0.07] px-4 py-8 text-center">
          <p className="text-xs text-[#666c76]">
            Your lesson notes will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
