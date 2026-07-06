import { getSessionUser } from "@/lib/queries";
import { Sidebar, BottomNav } from "@/components/app/nav";
import { PushRegister } from "@/components/app/push-register";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, plan, trialDaysLeft } = await getSessionUser();
  const name = user.name ?? user.email?.split("@")[0] ?? "Vous";
  return (
    <div className="grid min-h-screen bg-bg md:grid-cols-[262px_minmax(0,1fr)]">
      <Sidebar plan={plan} trialDaysLeft={trialDaysLeft} userName={name} />
      <div className="flex min-w-0 flex-col">
        <div className="px-5 pb-28 pt-6 sm:px-8 md:pb-16">{children}</div>
      </div>
      <BottomNav />
      <PushRegister enabled={user.consentPush} />
    </div>
  );
}
