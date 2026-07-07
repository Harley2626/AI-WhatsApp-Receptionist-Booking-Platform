import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        success: "bg-primary/10 text-primary",
        warning: "bg-payment/15 text-warning-text",
        destructive: "bg-destructive/10 text-destructive",
        info: "bg-info/10 text-info",
        ai: "bg-ai/10 text-ai",
        accent: "bg-accent/10 text-accent-hover",
        highlight: "bg-highlight/10 text-highlight-hover",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
