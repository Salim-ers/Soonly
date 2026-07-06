import { IdCard, Car, ShieldCheck, Bell } from "lucide-react";

/** Aperçu fidèle du tableau de bord, avec des exemples réalistes (réservé à la landing). */
export function ProductPreview() {
  const gaugeR = 34;
  const c = 2 * Math.PI * gaugeR;
  const val = 92;
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-l">
      <div className="flex h-11 items-center gap-2 border-b border-line bg-surface-2 px-[18px]">
        <i className="h-2.5 w-2.5 rounded-full border border-line bg-bg-deep" />
        <i className="h-2.5 w-2.5 rounded-full border border-line bg-bg-deep" />
        <i className="h-2.5 w-2.5 rounded-full border border-line bg-bg-deep" />
        <span className="ml-2.5 rounded-[7px] border border-line bg-bg px-3 py-0.5 text-[12px] font-semibold text-ink-3">app.soonly.app</span>
      </div>
      <div className="bg-bg p-6">
        <div className="mb-3.5 flex flex-wrap gap-3.5">
          <div className="flex flex-1 items-center gap-3.5 rounded-lg border border-line bg-surface p-4">
            <span className="relative h-[72px] w-[72px] flex-none">
              <svg width="72" height="72" className="-rotate-90">
                <circle cx="36" cy="36" r={gaugeR} fill="none" stroke="#EAEEEF" strokeWidth="7" />
                <circle cx="36" cy="36" r={gaugeR} fill="none" stroke="#2BA39A" strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - val / 100)} />
              </svg>
              <b className="disp absolute inset-0 flex items-center justify-center text-[20px] text-teal">{val}</b>
            </span>
            <div>
              <b className="block text-[13.5px] tracking-[-0.005em]">Tout est sous contrôle</b>
              <span className="text-[12px] text-ink-3">10 échéances protégées</span>
            </div>
          </div>
          <div className="min-w-[220px] flex-[1.4] rounded-lg border border-line bg-surface p-4">
            <span className="kicker text-[10px]">Fil du temps</span>
            <div className="relative mt-3.5 h-[34px]">
              <div className="absolute left-0 right-0 top-[15px] h-0.5 rounded bg-gradient-to-r from-teal via-teal-soft to-sand" />
              {[
                [6, "#A8590E"], [18, "#B98F4A"], [34, "#2BA39A"], [52, "#2BA39A"], [74, "#0D3B46"], [90, "#0D3B46"],
              ].map(([x, col], i) => (
                <span key={i} className="absolute top-[9px] h-3 w-3 -translate-x-1/2 rounded-full border-[2.5px] border-surface" style={{ left: `${x}%`, background: col as string }} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {[
            [IdCard, "Passeport à renouveler", "Administration", "J-42", "bg-bg-deep text-ink-2", "#0D3B46"],
            [Car, "Contrôle technique", "Véhicule", "J-12", "bg-teal-tint text-teal", "#56788A"],
            [ShieldCheck, "Assurance habitation", "Assurances", "J-31", "bg-bg-deep text-ink-2", "#2BA39A"],
          ].map(([Icon, title, cat, badge, badgeCls, col], i) => {
            const IconC = Icon as React.ElementType;
            return (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3.5 py-3">
                <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[11px] text-white [&_svg]:h-[18px] [&_svg]:w-[18px]" style={{ background: col as string }}>
                  <IconC />
                </span>
                <div className="min-w-0 flex-1">
                  <b className="block truncate text-[14px] tracking-[-0.005em]">{title as string}</b>
                  <span className="text-[12px] text-ink-3">{cat as string}</span>
                </div>
                <span className={`badge ${badgeCls as string}`}>{badge as string}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-3 rounded-lg bg-teal px-4 py-3 text-[#DFEBEA]">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[11px] bg-sand/15 text-sand [&_svg]:h-[18px] [&_svg]:w-[18px]"><Bell /></span>
          <div className="min-w-0 flex-1">
            <b className="block text-[13px] text-white">Prochain rappel dans 4 jours</b>
            <span className="text-[12px] text-[#A9C2C1]">Fin d'essai salle de sport — par email</span>
          </div>
        </div>
      </div>
    </div>
  );
}
