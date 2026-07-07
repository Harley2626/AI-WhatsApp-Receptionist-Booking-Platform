"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRIMARY_NAV, SECONDARY_NAV } from "./nav-items";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";

const MOBILE_ITEMS = [...PRIMARY_NAV, { href: "/dashboard/settings", label: "More", icon: MoreHorizontal }];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-border bg-card/95 backdrop-blur md:hidden">
      {MOBILE_ITEMS.map((item) => {
        const isMore = item.label === "More";
        const active = isMore
          ? SECONDARY_NAV.some((s) => pathname.startsWith(s.href))
          : item.href === "/dashboard"
            ? pathname === item.href
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
