import { cn } from "@/lib/utils";

/**
 * Logo Soonly — symbole officiel :
 *  - un « S » fluide relié à un cercle de temps
 *  - un point de notification sable
 *  - une coche discrète (date validée / protégée)
 *  - une idée de mouvement vers « bientôt »
 */
export function SoonlyMark({ size = 34, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <circle cx="30" cy="40.5" r="15" stroke="currentColor" strokeWidth="5.5" />
      <path
        d="M30 25.5 C 21 25.5, 15.5 21, 16 14.5 C 16.5 8, 24 4.5, 32 6 C 37 7, 41.5 9.5, 44 12.5"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <circle cx="50" cy="10" r="4.5" fill="#E2C48B" />
      <path
        d="M23.5 40.5 L 28.5 45.5 L 37 35.5"
        stroke="#E2C48B"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M30 51.5v2.6 M41 40.5h2.6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" opacity=".55" />
    </svg>
  );
}

export function Wordmark({
  size = 34,
  withTagline = false,
  className,
  color = "text-teal",
}: {
  size?: number;
  withTagline?: boolean;
  className?: string;
  color?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", color, className)}>
      <SoonlyMark size={size} />
      <span className="leading-none">
        <span className="font-brand text-[22px] font-semibold tracking-[-0.01em]">Soonly</span>
        {withTagline && (
          <span className="mt-0.5 block font-brand text-[11px] font-semibold tracking-[0.01em] text-sand-deep">
            Never miss what matters.
          </span>
        )}
      </span>
    </span>
  );
}

/** Icône d'application (fond deep teal, symbole clair, accent sable). */
export function AppIcon({ size = 56, radius = 16 }: { size?: number; radius?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center bg-teal text-[#F3F5F6]"
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <SoonlyMark size={size * 0.62} />
    </span>
  );
}
