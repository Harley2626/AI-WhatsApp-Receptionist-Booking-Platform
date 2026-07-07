"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/logo";
import { ALL_NAV } from "./nav-items";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";

export function Sidebar({ businessName }: { businessName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="p-5">
        <Logo />
        <p className="mt-3 truncate text-sm font-medium text-muted-foreground">{businessName}</p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {ALL_NAV.map((item) => {
          const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <form action={signOut} className="p-3">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4.5 w-4.5" /> Sign out
        </button>
      </form>
    </aside>
  );
}
