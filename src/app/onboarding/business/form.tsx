"use client";

import { useActionState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BUSINESS_CATEGORIES } from "@/lib/validation/schemas";
import { saveBusinessDetails, type ActionResult } from "../actions";
import type { Business } from "@/types/database";

export function BusinessDetailsForm({ defaultValues }: { defaultValues: Business | null }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    saveBusinessDetails,
    null
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="name">Business name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={defaultValues?.name ?? ""}
              placeholder="Radiant Hair Studio"
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select id="category" name="category" defaultValue={defaultValues?.category ?? ""} required>
              <option value="" disabled>
                Choose a category
              </option>
              {BUSINESS_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="phone">Business contact number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={defaultValues?.phone ?? ""}
              placeholder="082 123 4567"
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">
              For your records — not necessarily your WhatsApp number.
            </p>
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving…" : "Continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
