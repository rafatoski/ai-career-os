import { cn } from "@/lib/utils";

type ProgressProps = {
  value: number;
  className?: string;
  indicatorClassName?: string;
  label?: string;
};

export function Progress({
  value,
  className,
  indicatorClassName,
  label = "Progress",
}: ProgressProps) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full bg-[#9cf0d0] transition-[width] duration-700 ease-out",
          indicatorClassName,
        )}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
