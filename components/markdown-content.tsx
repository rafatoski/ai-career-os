import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function MarkdownContent({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const lines = content.split("\n");
  const blocks: ReactNode[] = [];
  let list: string[] = [];

  const flushList = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={`list-${blocks.length}`} className="my-3 space-y-1.5 pl-5">
        {list.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="list-disc marker:text-[#65706d]"
          >
            {renderInline(item)}
          </li>
        ))}
      </ul>,
    );
    list = [];
  };

  for (const line of lines) {
    if (line.startsWith("- ")) {
      list.push(line.slice(2));
      continue;
    }

    flushList();
    if (!line.trim()) continue;

    if (line.startsWith("### ")) {
      blocks.push(
        <h4 key={`h3-${blocks.length}`} className="mb-2 mt-5 font-semibold">
          {renderInline(line.slice(4))}
        </h4>,
      );
    } else if (line.startsWith("## ")) {
      blocks.push(
        <h3
          key={`h2-${blocks.length}`}
          className="mb-2 mt-6 text-sm font-semibold text-[#e8eaec]"
        >
          {renderInline(line.slice(3))}
        </h3>,
      );
    } else if (line.startsWith("# ")) {
      blocks.push(
        <h2
          key={`h1-${blocks.length}`}
          className="mb-3 text-base font-semibold tracking-[-0.02em] text-white"
        >
          {renderInline(line.slice(2))}
        </h2>,
      );
    } else {
      blocks.push(
        <p key={`p-${blocks.length}`} className="my-2 leading-6">
          {renderInline(line)}
        </p>,
      );
    }
  }

  flushList();

  return (
    <div
      className={cn(
        "text-xs leading-6 text-[#a1a6af] [&_strong]:font-semibold [&_strong]:text-[#e0e3e6]",
        className,
      )}
    >
      {blocks}
    </div>
  );
}

function renderInline(value: string) {
  const parts = value.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={`${part}-${index}`}
          className="rounded bg-white/[0.06] px-1 py-0.5 font-mono text-[0.9em] text-[#c7f5e4]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    return part;
  });
}
