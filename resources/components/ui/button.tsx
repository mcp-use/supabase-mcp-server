import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all outline-none focus-visible:outline-4 focus-visible:outline-offset-1 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[hsl(var(--background-muted))] text-[hsl(var(--foreground))] border border-[hsl(var(--border-strong))] hover:bg-[hsl(var(--background-overlay))] hover:border-[hsl(var(--border-stronger))]",
        primary:
          "bg-[hsl(var(--brand-300))] text-gray-900 border border-[hsl(var(--brand-500))] hover:bg-[hsl(var(--brand-500))]",
        destructive:
          "bg-[hsl(var(--destructive))] text-white border border-[hsl(var(--destructive-600))] hover:bg-[hsl(var(--destructive-600))]",
        outline:
          "border border-[hsl(var(--border-strong))] bg-transparent hover:border-[hsl(var(--border-stronger))] text-[hsl(var(--foreground))]",
        ghost:
          "hover:bg-[hsl(var(--background-muted))] text-[hsl(var(--foreground))]",
        link: "text-[hsl(var(--brand))] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-7 rounded-md px-2 text-[12px]",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
