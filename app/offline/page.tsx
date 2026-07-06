export const metadata = { title: "Hors ligne" };
export default function Offline() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
      <h1 className="disp text-[26px] font-[560] text-teal">Vous êtes hors ligne</h1>
      <p className="mt-2 max-w-[40ch] text-[14.5px] text-ink-2">Reconnectez-vous à Internet pour retrouver vos échéances Soonly. Vos données sont en sécurité.</p>
    </div>
  );
}
