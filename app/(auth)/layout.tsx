import { Wordmark } from "@/components/brand/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-teal p-14 text-[#DCE9E8] md:flex">
        <div className="pointer-events-none absolute -bottom-40 -left-28 h-[420px] w-[420px] rounded-full border border-sand/30" />
        <span className="pointer-events-none absolute bottom-52 left-64 h-3 w-3 rounded-full bg-sand" />
        <Wordmark size={36} withTagline color="text-white" />
        <div className="relative">
          <p className="disp max-w-[17ch] text-[clamp(24px,2.4vw,32px)] font-[500] leading-[1.28] text-white">
            Un cerveau externe, <span className="text-sand">fiable</span>, pour tout ce qui compte.
          </p>
          <p className="mt-4 max-w-[40ch] text-[14.5px] leading-relaxed text-[#A9C2C1]">
            Rendez-vous, papiers, abonnements, garanties : ajoutez la date, choisissez quand être prévenu, et n'y pensez plus.
          </p>
        </div>
        <p className="relative text-[12.5px] text-[#7FA0A0]">Données chiffrées · Hébergement européen · RGPD</p>
      </aside>
      <main className="flex items-center justify-center bg-bg px-6 py-12">{children}</main>
    </div>
  );
}
