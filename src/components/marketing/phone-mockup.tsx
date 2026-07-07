import { Check } from "lucide-react";
import { LogoMark } from "@/components/logo";

export function PhoneMockup({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="relative mx-auto w-[300px] rounded-[48px] border-[10px] border-foreground bg-foreground shadow-2xl sm:w-[320px]">
        {/* Dynamic island */}
        <div className="absolute left-1/2 top-0 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-foreground" />

        <div className="relative flex h-[600px] flex-col overflow-hidden rounded-[38px] bg-white sm:h-[640px]">
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pb-1 pt-3 text-xs font-semibold text-foreground">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-foreground" />
              <span className="h-2.5 w-2.5 rounded-full bg-foreground" />
              <span className="h-2.5 w-2.5 rounded-full bg-foreground" />
            </span>
          </div>

          {/* WhatsApp header */}
          <div className="flex items-center gap-3 border-b border-border bg-[#075E54] px-4 py-3">
            <LogoMark size={36} className="rounded-full bg-white" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">Wazzy · Zoe&apos;s Hair Studio</p>
              <p className="text-[11px] text-white/75">online</p>
            </div>
          </div>

          {/* Chat body */}
          <div className="flex-1 space-y-2.5 overflow-hidden bg-[#ECE5DD] px-3 py-4">
            <Bubble from="them">Hi! Do you have anything open for a haircut tomorrow afternoon?</Bubble>
            <Bubble from="me">Hi James 👋 Yes! I have 14:00 or 15:30 tomorrow with Zoe. Which works for you?</Bubble>
            <Bubble from="them">15:30 please</Bubble>
            <Bubble from="me">
              Great choice! A R150 payment secures your spot.
              <span className="mt-2 flex items-center justify-between rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold">
                Payment request · R150
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-brand-green">Pay now</span>
              </span>
            </Bubble>
            <SystemPill>💳 Payment received — R150.00</SystemPill>
            <Bubble from="me">
              <span className="flex items-center gap-1.5 font-semibold">
                <Check className="h-3.5 w-3.5" /> Booked!
              </span>
              Haircut with Zoe, tomorrow at 15:30. See you then 🎉
            </Bubble>
          </div>

          {/* Input bar */}
          <div className="flex items-center gap-2 border-t border-border bg-white px-3 py-3">
            <div className="flex-1 rounded-full bg-muted px-4 py-2 text-xs text-subtle-foreground">Message</div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-green text-white">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M3 20l18-8L3 4v6l12 2-12 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bubble({ from, children }: { from: "me" | "them"; children: React.ReactNode }) {
  return (
    <div
      className={
        from === "me"
          ? "ml-auto max-w-[82%] rounded-2xl rounded-tr-sm bg-brand-green px-3.5 py-2 text-[13px] leading-snug text-white shadow-sm"
          : "max-w-[82%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2 text-[13px] leading-snug text-foreground shadow-sm"
      }
    >
      {children}
    </div>
  );
}

function SystemPill({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-fit rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-muted-foreground shadow-sm">
      {children}
    </div>
  );
}
