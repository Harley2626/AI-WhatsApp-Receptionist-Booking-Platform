"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { initials, formatDate } from "@/lib/utils";
import type { Customer } from "@/types/database";

type CustomerRow = Customer & { bookingCount: number };

export function CustomerList({ customers }: { customers: CustomerRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = customers.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return c.name?.toLowerCase().includes(q) || c.whatsapp_phone.includes(q);
  });

  if (customers.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No customers yet"
        description="Once someone messages your WhatsApp number, they'll show up here."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or number"
          className="pl-10"
        />
      </div>
      <Card>
        <CardContent className="divide-y divide-border p-0">
          {filtered.map((customer) => (
            <Link
              key={customer.id}
              href={`/dashboard/customers/${customer.id}`}
              className="flex items-center gap-3 p-4 hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                {initials(customer.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{customer.name || customer.whatsapp_phone}</p>
                <p className="truncate text-sm text-muted-foreground">
                  +{customer.whatsapp_phone} · Joined {formatDate(customer.created_at)}
                </p>
              </div>
              <span className="shrink-0 text-sm text-muted-foreground">
                {customer.bookingCount} booking{customer.bookingCount === 1 ? "" : "s"}
              </span>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
