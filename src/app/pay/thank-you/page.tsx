import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/logo";

export default function PaymentThankYouPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <Logo />
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CheckCircle2 className="h-7 w-7" />
      </div>
      <h1 className="text-xl font-semibold text-foreground">Payment received</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Thanks! Your deposit is confirmed. You can close this tab and head back to WhatsApp — we&rsquo;ll send you a
        confirmation there too.
      </p>
    </div>
  );
}
