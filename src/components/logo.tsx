import Image from "next/image";
import { cn } from "@/lib/utils";

export function LogoMark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/logo-icon.png"
      alt="Wazzy"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      priority
    />
  );
}

export function Logo({ className, iconOnly, size = 32 }: { className?: string; iconOnly?: boolean; size?: number }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoMark size={size} />
      {!iconOnly && (
        <Image
          src="/logo-wordmark.png"
          alt="Wazzy"
          width={size * 2.7}
          height={size}
          className="shrink-0"
          style={{ width: "auto", height: size * 0.75 }}
          priority
        />
      )}
    </div>
  );
}
