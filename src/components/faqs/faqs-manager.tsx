"use client";

import { useActionState, useState } from "react";
import { HelpCircle, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { addFaq, deleteFaq, type ActionResult } from "@/app/onboarding/actions";
import type { Faq } from "@/types/database";

export function FaqsManager({ faqs }: { faqs: Faq[] }) {
  const [showForm, setShowForm] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(addFaq, null);

  // Adjust state during render (React's recommended alternative to a
  // setState-in-effect) — collapse the form once a new FAQ shows up in props.
  const [knownCount, setKnownCount] = useState(faqs.length);
  if (faqs.length !== knownCount) {
    setKnownCount(faqs.length);
    if (faqs.length > knownCount) setShowForm(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary" /> Frequently asked questions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Yebo will answer using these — and only these — so it never makes something up.
        </p>
        {faqs.length === 0 ? (
          <EmptyState title="No FAQs yet" description="Add common questions like parking, cancellation policy, or payment options." />
        ) : (
          <div className="divide-y divide-border">
            {faqs.map((faq) => (
              <div key={faq.id} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{faq.question}</p>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteFaq(faq.id)}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {showForm ? (
          <form key={faqs.length} action={formAction} className="space-y-3 rounded-lg border border-border p-4">
            <div>
              <Label htmlFor="question">Question</Label>
              <Input id="question" name="question" placeholder="Do you offer parking?" required />
            </div>
            <div>
              <Label htmlFor="answer">Answer</Label>
              <Textarea id="answer" name="answer" placeholder="Yes, free parking is available outside." required />
            </div>
            {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={pending}>
                {pending ? "Adding…" : "Add FAQ"}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> Add FAQ
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
