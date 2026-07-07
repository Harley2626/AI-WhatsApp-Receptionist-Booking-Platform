import { XCircle } from "lucide-react";
import { Logo } from "@/components/logo";

export default function PaymentCancelledPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <Logo />
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <XCircle className="h-7 w-7" />
      </div>
      <h1 className="text-xl font-semibold text-foreground">Payment cancelled</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        No worries — your booking is still held for a little while. Head back to WhatsApp if you&rsquo;d like to try
        paying again.
      </p>
    </div>
  );
}
