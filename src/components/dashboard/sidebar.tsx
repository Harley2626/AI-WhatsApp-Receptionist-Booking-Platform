"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/logo";
import { ALL_NAV, NAV_COLOR_CLASSES } from "./nav-items";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";

export function Sidebar({ businessName }: { businessName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="p-6">
        <Logo />
        <p className="mt-4 truncate text-sm font-medium text-muted-foreground">{businessName}</p>
      </div>
      <nav className="flex-1 space-y-1 px-4">
        {ALL_NAV.map((item) => {
          const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
          const colors = NAV_COLOR_CLASSES[item.color];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200",
                active ? cn(colors.bg, colors.text) : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", !active && colors.text)} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <form action={signOut} className="p-4">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-5 w-5" /> Sign out
        </button>
      </form>
    </aside>
  );
}
