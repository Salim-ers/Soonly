import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { deleteReminderSchema } from "@/lib/validations";
import { route, requireUser, ok, ApiError } from "@/lib/api";

/** POST /api/reminders/delete */
export async function POST(req: NextRequest) {
  return route(async () => {
    const user = await requireUser();
    const { id } = deleteReminderSchema.parse(await req.json());
    const existing = await db.reminder.findFirst({ where: { id, userId: user.id } });
    if (!existing) throw new ApiError(404, "Échéance introuvable.");
    await db.reminder.delete({ where: { id } });
    return ok();
  });
}
