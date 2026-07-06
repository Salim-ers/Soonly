import Link from "next/link";
import { getSessionUser } from "@/lib/queries";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/app/ui";
import { CategoryTile } from "@/components/app/category-icon";
import { UploadButton } from "@/components/documents/upload-dialog";
import { EmptyState } from "@/components/app/empty-state";
import { FolderLock, Plus, FileText, Image as ImageIcon, ShieldCheck, Sparkles, AlertTriangle } from "lucide-react";
import { format, differenceInCalendarDays } from "date-fns";
import { fr } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const { user, plan } = await getSessionUser();

  if (plan !== "PLUS") {
    return (
      <>
        <PageHeader title="Coffre documents" subtitle="Rangez vos papiers importants, reliés à leurs échéances." />
        <div className="overflow-hidden rounded-xl border border-teal bg-surface shadow-m">
          <div className="bg-teal px-7 py-8 text-[#DCE9E8]">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-sand/15 text-sand"><FolderLock className="h-5 w-5" /></span>
            <h2 className="disp mt-4 text-[24px] font-[560] text-white">Le coffre est inclus dans Soonly Plus</h2>
            <p className="mt-2 max-w-[52ch] text-[14.5px] text-[#A9C2C1]">Conservez passeport, carte grise, attestations et garanties au même endroit — chiffrés, privés, et reliés à des rappels avant expiration.</p>
          </div>
          <div className="grid gap-3 p-7 sm:grid-cols-2">
            {["Stockage chiffré et privé", "Documents reliés aux échéances", "Alertes avant expiration", "PDF, photos et images"].map((f) => (
              <span key={f} className="flex items-center gap-2 text-[14px] text-ink-2"><ShieldCheck className="h-[17px] w-[17px] text-teal-soft" /> {f}</span>
            ))}
          </div>
          <div className="px-7 pb-7"><Link href="/billing" className="btn btn-lg"><Sparkles className="h-[18px] w-[18px]" /> Passer à Plus</Link></div>
        </div>
      </>
    );
  }

  const docs = await db.document.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });

  return (
    <>
      <PageHeader
        title="Coffre documents"
        subtitle={docs.length ? `${docs.length} document${docs.length > 1 ? "s" : ""} · chiffrés et privés.` : undefined}
        action={<UploadButton className="btn btn-lg"><Plus className="h-[18px] w-[18px]" /> Ajouter</UploadButton>}
      />
      {docs.length === 0 ? (
        <EmptyState
          icon={<FolderLock className="h-14 w-14 text-teal" strokeWidth={1.4} />}
          title="Votre coffre est vide"
          description="Ajoutez un premier document (PDF ou photo). Donnez-lui une date d'expiration et Soonly créera les rappels pour le renouveler à temps."
        />
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((d) => {
            const exp = d.expirationDate ? differenceInCalendarDays(d.expirationDate, new Date()) : null;
            const expired = exp != null && exp < 0;
            const soon = exp != null && exp >= 0 && exp <= 30;
            return (
              <div key={d.id} className="flex flex-col rounded-xl border border-line bg-surface p-4 shadow-s">
                <div className="flex items-center gap-3">
                  <CategoryTile category={d.category} />
                  <div className="min-w-0 flex-1">
                    <b className="block truncate text-[14.5px] tracking-[-0.005em]">{d.title}</b>
                    <span className="flex items-center gap-1.5 text-[12px] text-ink-3">
                      {d.mimeType.includes("pdf") ? <FileText className="h-[13px] w-[13px]" /> : <ImageIcon className="h-[13px] w-[13px]" />}
                      {(d.size / 1024 / 1024).toFixed(1)} Mo
                    </span>
                  </div>
                </div>
                {d.expirationDate && (
                  <div className={`mt-3 flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-[12px] font-semibold ${expired ? "bg-danger-tint text-danger" : soon ? "bg-sand-tint text-sand-ink" : "bg-surface-2 text-ink-2"}`}>
                    {(expired || soon) && <AlertTriangle className="h-[13px] w-[13px]" />}
                    {expired ? "Expiré" : "Expire"} le {format(d.expirationDate, "d MMM yyyy", { locale: fr })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
