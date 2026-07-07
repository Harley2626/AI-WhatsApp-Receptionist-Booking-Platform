"use client";

import { usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "business", label: "Business" },
  { key: "services", label: "Services" },
  { key: "hours", label: "Hours" },
  { key: "calendar", label: "Calendar" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "payments", label: "Payments" },
  { key: "complete", label: "Go live" },
] as const;

export function OnboardingStepNav() {
  const pathname = usePathname();
  const currentKey = pathname.split("/").filter(Boolean)[1] ?? "business";
  const currentIndex = STEPS.findIndex((s) => s.key === currentKey);

  return (
    <ol className="flex w-full items-center justify-between gap-1 overflow-x-auto px-1 pb-1">
      {STEPS.map((step, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <li key={step.key} className="flex flex-1 items-center gap-1.5">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  isDone && "bg-primary text-primary-foreground",
                  isCurrent && "bg-primary/15 text-primary ring-2 ring-primary",
                  !isDone && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-[11px] font-medium sm:block",
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span className={cn("h-px flex-1", isDone ? "bg-primary" : "bg-border")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
