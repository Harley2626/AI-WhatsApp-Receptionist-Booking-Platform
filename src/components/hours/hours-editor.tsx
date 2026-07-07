"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { WEEKDAYS } from "@/lib/utils";
import { saveBusinessHours } from "@/app/onboarding/actions";
import type { BusinessHour } from "@/types/database";

type Row = { day_of_week: number; is_open: boolean; open_time: string; close_time: string };

const DEFAULT_ROWS: Row[] = Array.from({ length: 7 }, (_, day_of_week) => ({
  day_of_week,
  is_open: day_of_week !== 0,
  open_time: day_of_week === 6 ? "09:00" : "09:00",
  close_time: day_of_week === 6 ? "13:00" : "17:00",
}));

function toRows(existing: BusinessHour[]): Row[] {
  if (existing.length === 0) return DEFAULT_ROWS;
  return DEFAULT_ROWS.map((fallback) => {
    const match = existing.find((h) => h.day_of_week === fallback.day_of_week);
    if (!match) return fallback;
    return {
      day_of_week: match.day_of_week,
      is_open: match.is_open,
      open_time: match.open_time.slice(0, 5),
      close_time: match.close_time.slice(0, 5),
    };
  });
}

export function HoursEditor({
  initialHours,
  redirectNext,
  onSaved,
}: {
  initialHours: BusinessHour[];
  redirectNext?: string;
  onSaved?: () => void;
}) {
  const [rows, setRows] = useState<Row[]>(() => toRows(initialHours));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const router = useRouter();

  function updateRow(day: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.day_of_week === day ? { ...r, ...patch } : r)));
  }

  async function handleSave() {
    setPending(true);
    setError(undefined);
    const result = await saveBusinessHours(rows);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (onSaved) onSaved();
    if (redirectNext) router.push(redirectNext);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="divide-y divide-border p-0">
          {rows.map((row) => (
            <div key={row.day_of_week} className="flex items-center gap-3 p-4">
              <Switch
                checked={row.is_open}
                onCheckedChange={(checked) => updateRow(row.day_of_week, { is_open: checked })}
                aria-label={`${WEEKDAYS[row.day_of_week]} open`}
              />
              <span className="w-24 shrink-0 text-sm font-medium text-foreground">
                {WEEKDAYS[row.day_of_week]}
              </span>
              {row.is_open ? (
                <div className="flex flex-1 items-center gap-2">
                  <Input
                    type="time"
                    value={row.open_time}
                    onChange={(e) => updateRow(row.day_of_week, { open_time: e.target.value })}
                    className="h-9"
                  />
                  <span className="text-muted-foreground">–</span>
                  <Input
                    type="time"
                    value={row.close_time}
                    onChange={(e) => updateRow(row.day_of_week, { close_time: e.target.value })}
                    className="h-9"
                  />
                </div>
              ) : (
                <span className="flex-1 text-sm text-muted-foreground">Closed</span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button onClick={handleSave} disabled={pending} className="w-full">
        {pending ? "Saving…" : "Save & continue"}
      </Button>
    </div>
  );
}
