import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-[0.01em]",
  {
    variants: {
      variant: {
        default: "border-[#9cf0d0]/20 bg-[#9cf0d0]/10 text-[#b8f6df]",
        secondary: "border-white/[0.07] bg-white/[0.04] text-[#a6abb6]",
        warm: "border-[#f8c278]/20 bg-[#f8c278]/10 text-[#f8cf95]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
