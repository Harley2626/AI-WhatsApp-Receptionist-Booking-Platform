import {
  CalendarCheck,
  Wallet,
  UserPlus,
  Clock3,
  MessageCircle,
  Scissors,
} from "lucide-react";
import { CountUp } from "./count-up";

const stats = [
  { icon: CalendarCheck, label: "Today's bookings", value: 12, tone: "green" as const },
  { icon: Wallet, label: "Revenue today", value: 4850, prefix: "R", tone: "blue" as const },
  { icon: UserPlus, label: "New leads", value: 8, tone: "purple" as const },
  { icon: Clock3, label: "Pending payments", value: 5, tone: "yellow" as const },
];

const toneClasses = {
  green: "bg-brand-green/10 text-brand-green",
  blue: "bg-brand-blue/10 text-brand-blue",
  purple: "bg-brand-purple/10 text-brand-purple",
  yellow: "bg-brand-yellow/15 text-warning-text",
};

const schedule = [
  { time: "09:00", name: "John Smith", service: "Haircut", tone: "green" as const },
  { time: "10:30", name: "Lisa Brown", service: "Full Colour", tone: "blue" as const },
  { time: "12:30", name: "Sarah Williams", service: "Haircut", tone: "pink" as const },
  { time: "14:00", name: "Mike Johnson", service: "Beard Trim", tone: "orange" as const },
];

const scheduleTone = {
  green: "bg-brand-green",
  blue: "bg-brand-blue",
  pink: "bg-brand-pink",
  orange: "bg-brand-orange",
};

const conversations = [
  { name: "John Smith", message: "Can I reschedule my appointment?", time: "10:15" },
  { name: "Lisa Brown", message: "Do you have any specials?", time: "09:42" },
  { name: "Peter Jones", message: "What are your opening hours?", time: "09:21" },
];

const services = [
  { name: "Haircut", value: 100, amount: "R12,450", tone: "green" as const },
  { name: "Full Colour", value: 70, amount: "R8,750", tone: "blue" as const },
  { name: "Highlights", value: 50, amount: "R6,200", tone: "purple" as const },
  { name: "Beard Trim", value: 25, amount: "R3,150", tone: "yellow" as const },
];

const serviceBar = {
  green: "bg-brand-green",
  blue: "bg-brand-blue",
  purple: "bg-brand-purple",
  yellow: "bg-brand-yellow",
};

const revenueBars = [40, 55, 48, 70, 65, 85, 60];

export function DashboardShowcase() {
  return (
    <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-[28px] border border-border bg-white shadow-2xl">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-5 py-3.5">
        <span className="h-3 w-3 rounded-full bg-brand-coral" />
        <span className="h-3 w-3 rounded-full bg-brand-yellow" />
        <span className="h-3 w-3 rounded-full bg-brand-green" />
        <span className="ml-4 hidden rounded-full border border-border bg-white px-4 py-1 text-xs font-medium text-muted-foreground sm:inline-block">
          wazzy.app/dashboard
        </span>
      </div>

      {/* Dashboard content */}
      <div className="bg-background p-5 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-foreground sm:text-xl">Good morning, Sarah 👋</p>
            <p className="text-sm text-muted-foreground">Here&rsquo;s what&rsquo;s happening today.</p>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full bg-brand-green/10 px-3 py-1.5 text-xs font-bold text-brand-green sm:flex">
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp connected
          </span>
        </div>

        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${toneClasses[s.tone]}`}>
                <s.icon className="h-4.5 w-4.5" />
              </div>
              <p className="text-lg font-bold text-foreground sm:text-xl">
                <CountUp value={s.value} prefix={s.prefix} />
              </p>
              <p className="truncate text-[11px] font-medium text-muted-foreground sm:text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Schedule */}
          <div className="rounded-2xl border border-border bg-white p-4 sm:p-5 lg:col-span-1">
            <p className="mb-3 text-sm font-bold text-foreground">Today&rsquo;s Schedule</p>
            <div className="space-y-3">
              {schedule.map((item) => (
                <div key={item.name} className="flex items-center gap-2.5">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${scheduleTone[item.tone]}`} />
                  <span className="w-10 shrink-0 text-[11px] font-semibold text-muted-foreground">{item.time}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-foreground">{item.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue chart */}
          <div className="rounded-2xl border border-border bg-white p-4 sm:p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-bold text-foreground">Revenue Overview</p>
              <span className="text-xs font-medium text-muted-foreground">This week</span>
            </div>
            <div className="flex h-28 items-end gap-2 sm:gap-3">
              {revenueBars.map((h, i) => (
                <div key={i} className="flex-1 rounded-t-md bg-brand-green/15" style={{ height: "100%" }}>
                  <div
                    className="w-full rounded-t-md bg-brand-green transition-all duration-700"
                    style={{ height: `${h}%`, marginTop: `${100 - h}%` }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Conversations */}
          <div className="rounded-2xl border border-border bg-white p-4 sm:p-5 lg:col-span-2">
            <p className="mb-3 text-sm font-bold text-foreground">Recent Conversations</p>
            <div className="space-y-3">
              {conversations.map((c) => (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-[11px] font-bold text-brand-blue">
                    {c.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-foreground">{c.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{c.message}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-subtle-foreground">{c.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top services */}
          <div className="rounded-2xl border border-border bg-white p-4 sm:p-5 lg:col-span-1">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-foreground">
              <Scissors className="h-3.5 w-3.5" /> Top Services
            </p>
            <div className="space-y-3">
              {services.map((s) => (
                <div key={s.name}>
                  <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-foreground">
                    <span>{s.name}</span>
                    <span className="text-muted-foreground">{s.amount}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full ${serviceBar[s.tone]}`} style={{ width: `${s.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
