import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { createReminderSchema } from "@/lib/validations";
import { route, requireUser, ok, ApiError } from "@/lib/api";
import { assertFeature } from "@/lib/permissions";
import { rollForward } from "@/lib/dates";

/** POST /api/reminders/create */
export async function POST(req: NextRequest) {
  return route(async () => {
    const user = await requireUser();
    const data = createReminderSchema.parse(await req.json());

    // Les règles SMS/WhatsApp exigent le plan Plus.
    for (const r of data.rules) {
      if (r.channel === "SMS") await assertFeature(user.id, "sms");
      if (r.channel === "WHATSAPP") await assertFeature(user.id, "whatsapp");
    }

    const dueAt = rollForward(data.dueAt, data.recurrence);

    const reminder = await db.reminder.create({
      data: {
        userId: user.id,
        title: data.title,
        description: data.description,
        category: data.category,
        dueAt,
        allDay: data.allDay,
        timezone: data.timezone,
        recurrence: data.recurrence,
        priority: data.priority,
        source: data.source,
        externalSourceId: data.externalSourceId,
        rules: { create: data.rules },
      },
      include: { rules: true },
    });

    if (data.linkedDocumentId) {
      const doc = await db.document.findFirst({ where: { id: data.linkedDocumentId, userId: user.id } });
      if (!doc) throw new ApiError(404, "Document introuvable.");
      await db.document.update({ where: { id: doc.id }, data: { linkedReminderId: reminder.id } });
    }

    return ok({ reminder });
  });
}
