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

export type NavColor = "green" | "blue" | "purple" | "pink" | "yellow" | "orange";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  color: NavColor;
}

export const NAV_COLOR_CLASSES: Record<NavColor, { text: string; bg: string }> = {
  green: { text: "text-brand-green", bg: "bg-brand-green/10" },
  blue: { text: "text-brand-blue", bg: "bg-brand-blue/10" },
  purple: { text: "text-brand-purple", bg: "bg-brand-purple/10" },
  pink: { text: "text-brand-pink", bg: "bg-brand-pink/10" },
  yellow: { text: "text-warning-text", bg: "bg-brand-yellow/15" },
  orange: { text: "text-brand-orange", bg: "bg-brand-orange/10" },
};

export const PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard, color: "green" },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays, color: "pink" },
  { href: "/dashboard/customers", label: "Customers", icon: Users, color: "blue" },
  { href: "/dashboard/payments", label: "Payments", icon: Wallet, color: "yellow" },
];

export const SECONDARY_NAV: NavItem[] = [
  { href: "/dashboard/services", label: "Services", icon: Scissors, color: "orange" },
  { href: "/dashboard/availability", label: "Availability", icon: Clock, color: "purple" },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3, color: "blue" },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, color: "green" },
];

export const ALL_NAV = [...PRIMARY_NAV, ...SECONDARY_NAV];
