"use client";

import { useState } from "react";
import { Plus, Trash2, Scissors } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { addService, deleteService, toggleServiceActive } from "@/app/onboarding/actions";
import type { Service } from "@/types/database";

export function ServicesManager({ services, editable = true }: { services: Service[]; editable?: boolean }) {
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const [showForm, setShowForm] = useState(services.length === 0);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {services.length === 0 ? (
        <EmptyState
          icon={Scissors}
          title="No services yet"
          description="Add your first service so customers can start booking."
        />
      ) : (
        <div className="space-y-2">
          {services.map((service) => (
            <Card key={service.id}>
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{service.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDuration(service.duration_minutes)} · {formatCurrency(service.price_cents)}
                    {service.payment_amount_cents
                      ? ` · ${formatCurrency(service.payment_amount_cents)} payment required to confirm`
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {editable && (
                    <Switch
                      checked={service.active}
                      onCheckedChange={(checked) => toggleServiceActive(service.id, checked)}
                      aria-label="Active"
                    />
                  )}
                  <button
                    type="button"
                    disabled={pendingDelete === service.id}
                    onClick={() => {
                      setPendingDelete(service.id);
                      deleteService(service.id);
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showForm ? (
        <Card>
          <CardContent className="pt-6">
            <form
              action={async (formData) => {
                setPending(true);
                setError(undefined);
                const result = await addService(null, formData);
                setPending(false);
                if (result.ok) {
                  setShowForm(false);
                  (document.getElementById("add-service-form") as HTMLFormElement | null)?.reset();
                } else {
                  setError(result.error);
                }
              }}
              id="add-service-form"
              className="space-y-4"
            >
              <div>
                <Label htmlFor="name">Service name</Label>
                <Input id="name" name="name" placeholder="Haircut" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="duration_minutes">Duration (min)</Label>
                  <Input id="duration_minutes" name="duration_minutes" type="number" min={5} step={5} defaultValue={30} required />
                </div>
                <div>
                  <Label htmlFor="price_rand">Price (R)</Label>
                  <Input id="price_rand" name="price_rand" type="number" min={0} step={1} defaultValue={0} required />
                </div>
              </div>
              <div>
                <Label htmlFor="payment_rand">Payment required to confirm (R) — optional</Label>
                <Input id="payment_rand" name="payment_rand" type="number" min={0} step={1} placeholder="0" />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Leave blank if no upfront payment is needed. Enter the full price to require payment in full, or a
                  smaller amount for a deposit — whatever suits this service.
                </p>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={pending}>
                  {pending ? "Adding…" : "Add service"}
                </Button>
                {services.length > 0 && (
                  <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button type="button" variant="outline" onClick={() => setShowForm(true)} className="w-full">
          <Plus className="h-4 w-4" /> Add another service
        </Button>
      )}
    </div>
  );
}
