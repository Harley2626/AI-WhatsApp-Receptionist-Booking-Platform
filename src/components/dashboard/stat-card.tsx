import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone?: "default" | "primary" | "warning";
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3.5 p-4">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            tone === "primary" && "bg-primary/10 text-primary",
            tone === "warning" && "bg-warning/10 text-warning",
            tone === "default" && "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
