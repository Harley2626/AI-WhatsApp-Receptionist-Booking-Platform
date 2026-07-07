"use client";

import { useActionState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BUSINESS_CATEGORIES } from "@/lib/validation/schemas";
import { updateBusinessDetails } from "@/app/dashboard/settings/actions";
import type { ActionResult } from "@/app/onboarding/actions";
import type { Business } from "@/types/database";

export function BusinessDetailsForm({ business }: { business: Business }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(updateBusinessDetails, null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business details</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="name">Business name</Label>
            <Input id="name" name="name" defaultValue={business.name} required />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select id="category" name="category" defaultValue={business.category ?? ""} required>
              {BUSINESS_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="phone">Business contact number</Label>
            <Input id="phone" name="phone" type="tel" defaultValue={business.phone ?? ""} required />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          {state?.ok && <p className="text-sm text-primary">Saved ✓</p>}
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
