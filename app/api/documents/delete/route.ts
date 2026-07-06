import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { route, requireUser, ok, ApiError } from "@/lib/api";
import { deleteObject } from "@/lib/storage";
import { z } from "zod";

/** POST /api/documents/delete — supprime le fichier du bucket ET l'enregistrement. */
export async function POST(req: NextRequest) {
  return route(async () => {
    const user = await requireUser();
    const { id } = z.object({ id: z.string().min(1) }).parse(await req.json());
    const doc = await db.document.findFirst({ where: { id, userId: user.id } });
    if (!doc) throw new ApiError(404, "Document introuvable.");
    await deleteObject(doc.fileKey).catch(() => {}); // best-effort : on supprime l'enregistrement quoi qu'il arrive
    await db.document.delete({ where: { id } });
    return ok();
  });
}
