import { LogoMark } from "@/components/logo";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-background">
      <LogoMark size={56} className="animate-float" />
    </div>
  );
}
