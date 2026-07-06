import { getSessionUser } from "@/lib/queries";
import { PageHeader } from "@/components/app/ui";
import { SettingsForm } from "@/components/app/settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { user, plan } = await getSessionUser();
  return (
    <>
      <PageHeader title="Réglages" subtitle="Vos préférences, vos canaux, vos données." />
      <div className="max-w-[720px]">
        <SettingsForm
          initial={{
            name: user.name ?? "",
            consentEmail: user.consentEmail,
            consentPush: user.consentPush,
            consentSms: user.consentSms,
            consentWhatsapp: user.consentWhatsapp,
            hideSensitive: user.hideSensitive,
            phoneVerified: !!user.phoneVerifiedAt,
            plan,
          }}
        />
      </div>
    </>
  );
}
