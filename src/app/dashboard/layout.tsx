import { requireLiveBusiness } from "@/lib/services/business";
import { Sidebar } from "@/components/dashboard/sidebar";
import { BottomNav } from "@/components/dashboard/bottom-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const business = await requireLiveBusiness();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar businessName={business.name} />
      <div className="flex flex-1 flex-col">
        <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 md:pb-6 lg:px-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
