import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { AppIcon } from "@/components/brand/logo";

export function EmptyState({
  title, description, cta, icon,
}: { title: string; description: string; cta?: { label: string; href: string }; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-surface-2 px-6 py-16 text-center">
      <div className="mb-5 opacity-95">{icon ?? <AppIcon size={58} />}</div>
      <h3 className="disp text-[21px] font-[560] text-teal">{title}</h3>
      <p className="mt-2 max-w-[46ch] text-[14.5px] leading-relaxed text-ink-2">{description}</p>
      {cta && <Link href={cta.href} className="btn btn-lg mt-6"><ShieldCheck className="h-[18px] w-[18px]" /> {cta.label}</Link>}
    </div>
  );
}
