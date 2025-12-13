import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 justify-center rounded-full font-normal whitespace-nowrap tracking-wider uppercase text-[9px] leading-none px-2 py-1",
  {
    variants: {
      variant: {
        default:
          "bg-[hsl(var(--background-muted))] text-[hsl(var(--foreground-light))] border border-[hsl(var(--border-strong))]",
        primary:
          "bg-[hsl(var(--brand))]/10 text-[hsl(var(--brand-600))] border border-[hsl(var(--brand-500))]",
        success:
          "bg-[hsl(var(--success))]/10 text-[hsl(var(--brand-600))] border border-[hsl(var(--brand-500))]",
        warning:
          "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning-500))] border border-[hsl(var(--warning-500))]",
        destructive:
          "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive-600))] border border-[hsl(var(--destructive-500))]",
        outline:
          "border border-[hsl(var(--border-strong))] text-[hsl(var(--foreground))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
