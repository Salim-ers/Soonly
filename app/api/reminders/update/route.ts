import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { updateReminderSchema } from "@/lib/validations";
import { route, requireUser, ok, ApiError } from "@/lib/api";
import { assertFeature } from "@/lib/permissions";

/** POST /api/reminders/update */
export async function POST(req: NextRequest) {
  return route(async () => {
    const user = await requireUser();
    const data = updateReminderSchema.parse(await req.json());

    const existing = await db.reminder.findFirst({ where: { id: data.id, userId: user.id } });
    if (!existing) throw new ApiError(404, "Échéance introuvable.");

    if (data.rules) {
      for (const r of data.rules) {
        if (r.channel === "SMS") await assertFeature(user.id, "sms");
        if (r.channel === "WHATSAPP") await assertFeature(user.id, "whatsapp");
      }
    }

    const reminder = await db.reminder.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        dueAt: data.dueAt,
        allDay: data.allDay,
        recurrence: data.recurrence,
        priority: data.priority,
        status: data.status,
        ...(data.rules
          ? { rules: { deleteMany: {}, create: data.rules } } // remplace le jeu de règles
          : {}),
      },
      include: { rules: true },
    });

    return ok({ reminder });
  });
}
