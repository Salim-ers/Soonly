import { Suspense } from "react";
import { getSessionUser } from "@/lib/queries";
import { BottomNav } from "@/components/app/nav";
import { TopNav } from "@/components/app/top-nav";
import { PushRegister } from "@/components/app/push-register";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getSessionUser();
  const name = user.name ?? user.email?.split("@")[0] ?? "Vous";
  return (
    <div className="min-h-screen">
      <Suspense><TopNav userName={name} /></Suspense>
      <div className="mx-auto max-w-content px-5 pb-28 pt-6 sm:px-8 md:pb-16 md:pt-[108px]">{children}</div>
      <BottomNav />
      <PushRegister enabled={user.consentPush} />
    </div>
  );
}
