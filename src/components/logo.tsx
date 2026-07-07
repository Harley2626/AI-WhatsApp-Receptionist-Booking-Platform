import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, iconOnly }: { className?: string; iconOnly?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 font-semibold text-foreground", className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <MessageCircle className="h-4.5 w-4.5" fill="currentColor" strokeWidth={0} />
      </span>
      {!iconOnly && <span className="text-lg tracking-tight">Yebo</span>}
    </div>
  );
}
