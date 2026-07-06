import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { route, requireUser, ok, ApiError } from "@/lib/api";
import { assertFeature } from "@/lib/permissions";
import { buildFileKey, putObject } from "@/lib/storage";
import { documentMetaSchema } from "@/lib/validations";
import { DEFAULT_RULES } from "@/lib/reminders";

export const runtime = "nodejs";

const MAX_SIZE = 15 * 1024 * 1024; // 15 Mo
const ALLOWED = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic"]);

/**
 * POST /api/documents/upload (multipart/form-data)
 *   - champ `file` : le fichier
 *   - champ `meta` : JSON validé par documentMetaSchema
 * Le fichier est stocké dans un bucket privé ; aucune URL publique n'est créée.
 * Réservé au plan Plus.
 */
export async function POST(req: NextRequest) {
  return route(async () => {
    const user = await requireUser();
    await assertFeature(user.id, "documents");

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new ApiError(400, "Fichier manquant.");
    if (file.size > MAX_SIZE) throw new ApiError(413, "Fichier trop volumineux (max 15 Mo).");
    if (!ALLOWED.has(file.type)) throw new ApiError(415, "Type de fichier non pris en charge.");

    const meta = documentMetaSchema.parse(JSON.parse(String(form.get("meta") ?? "{}")));

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileKey = buildFileKey(user.id, file.name);
    await putObject(fileKey, buffer, file.type);

    const doc = await db.document.create({
      data: {
        userId: user.id,
        title: meta.title,
        fileKey,
        mimeType: file.type,
        size: file.size,
        category: meta.category,
        expirationDate: meta.expirationDate,
        tags: meta.tags,
      },
    });

    // Échéance liée optionnelle (rappels avant expiration).
    if (meta.createLinkedReminder && meta.expirationDate) {
      const reminder = await db.reminder.create({
        data: {
          userId: user.id,
          title: `Renouveler « ${meta.title} »`,
          category: meta.category,
          dueAt: meta.expirationDate,
          source: "DOCUMENT",
          rules: { create: DEFAULT_RULES.slice(0, 2) },
        },
      });
      await db.document.update({ where: { id: doc.id }, data: { linkedReminderId: reminder.id } });
    }

    return ok({ document: doc });
  });
}
