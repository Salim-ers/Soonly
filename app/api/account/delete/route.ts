import { db } from "@/lib/db";
import { route, requireUser, ok } from "@/lib/api";
import { deleteObject } from "@/lib/storage";

/** POST /api/account/delete — suppression définitive du compte et des données. */
export async function POST() {
  return route(async () => {
    const user = await requireUser();
    // Supprime d'abord les fichiers du bucket (best-effort).
    const docs = await db.document.findMany({ where: { userId: user.id } });
    await Promise.all(docs.map((d) => deleteObject(d.fileKey).catch(() => {})));
    // La cascade Prisma supprime rappels, règles, comptes, logs, etc.
    await db.user.delete({ where: { id: user.id } });
    return ok({ deleted: true });
  });
}
