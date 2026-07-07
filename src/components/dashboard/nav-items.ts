import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Scissors,
  Clock,
  Wallet,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/payments", label: "Payments", icon: Wallet },
];

export const SECONDARY_NAV: NavItem[] = [
  { href: "/dashboard/services", label: "Services", icon: Scissors },
  { href: "/dashboard/availability", label: "Availability", icon: Clock },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export const ALL_NAV = [...PRIMARY_NAV, ...SECONDARY_NAV];
