"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  Library,
  Map,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/resources", label: "Resources", icon: Library },
];

function isActiveRoute(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-white/[0.06] bg-[#090b0f] px-4 py-5 md:flex">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-2 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-[#9cf0d0]/50"
        >
          <span className="grid size-8 place-items-center rounded-lg border border-[#9cf0d0]/20 bg-[#9cf0d0]/10 text-[#b9f5df]">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.025em] text-[#f4f5f6]">
            AI Career OS
          </span>
        </Link>

        <nav className="mt-9 space-y-1" aria-label="Primary navigation">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#545966]">
            Workspace
          </p>
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActiveRoute(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#9cf0d0]/50",
                  active
                    ? "bg-white/[0.07] text-white"
                    : "text-[#7f8490] hover:bg-white/[0.035] hover:text-[#d9dbe0]",
                )}
              >
                <Icon
                  className={cn(
                    "size-[17px]",
                    active
                      ? "text-[#aef2d8]"
                      : "text-[#616672] group-hover:text-[#a1a6b0]",
                  )}
                  aria-hidden="true"
                />
                {item.label}
                {active ? (
                  <span className="ml-auto size-1 rounded-full bg-[#9cf0d0]" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-xl border border-white/[0.06] bg-white/[0.025] p-3.5">
          <div className="flex items-center gap-2 text-xs font-medium text-[#b9bdc5]">
            <BookOpen className="size-3.5 text-[#9cf0d0]" aria-hidden="true" />
            Daily practice
          </div>
          <p className="mt-2 text-xs leading-5 text-[#626875]">
            Small, focused sessions compound into exceptional work.
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2 px-1 text-[11px] text-[#4f5460]">
          <span className="size-1.5 rounded-full bg-[#68d7aa] shadow-[0_0_10px_rgba(104,215,170,0.5)]" />
          Local database connected
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#090b0f]/90 px-4 backdrop-blur-xl md:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg border border-[#9cf0d0]/20 bg-[#9cf0d0]/10 text-[#b9f5df]">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold text-white">AI Career OS</span>
        </Link>
        <nav className="flex items-center gap-1" aria-label="Mobile navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActiveRoute(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "grid size-9 place-items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#9cf0d0]/50",
                  active
                    ? "bg-white/[0.08] text-[#b9f5df]"
                    : "text-[#737986]",
                )}
              >
                <Icon className="size-[17px]" aria-hidden="true" />
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}
