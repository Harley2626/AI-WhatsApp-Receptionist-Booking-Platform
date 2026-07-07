import Link from "next/link";
import { Scissors, Clock, BarChart3, ChevronRight } from "lucide-react";
import { requireLiveBusiness } from "@/lib/services/business";
import { createClient } from "@/lib/supabase/server";
import { BusinessDetailsForm } from "@/components/settings/business-details-form";
import { IntegrationsPanel } from "@/components/settings/integrations-panel";
import { FaqsManager } from "@/components/faqs/faqs-manager";
import { Card, CardContent } from "@/components/ui/card";

const MANAGE_LINKS = [
  { href: "/dashboard/services", label: "Services", icon: Scissors },
  { href: "/dashboard/availability", label: "Availability", icon: Clock },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
];

export default async function SettingsPage() {
  const business = await requireLiveBusiness();
  const supabase = await createClient();

  const [{ data: integrations }, { data: faqs }] = await Promise.all([
    supabase.from("integrations").select("type, status").eq("business_id", business.id),
    supabase.from("faqs").select("*").eq("business_id", business.id).order("sort_order"),
  ]);

  const isConnected = (type: string) => (integrations ?? []).some((i) => i.type === type && i.status === "connected");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your business, integrations, and FAQs.</p>
      </div>

      <Card className="md:hidden">
        <CardContent className="divide-y divide-border p-0">
          {MANAGE_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="flex items-center gap-3 p-4">
              <link.icon className="h-4.5 w-4.5 text-muted-foreground" />
              <span className="flex-1 font-medium text-foreground">{link.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </CardContent>
      </Card>

      <BusinessDetailsForm business={business} />

      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">Integrations</h2>
        <IntegrationsPanel
          whatsappConnected={isConnected("whatsapp")}
          googleConnected={isConnected("google_calendar")}
          payfastConnected={isConnected("payfast")}
        />
      </div>

      <FaqsManager faqs={faqs ?? []} />
    </div>
  );
}
