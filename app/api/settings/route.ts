import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { route, requireUser, ok } from "@/lib/api";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().max(80).optional(),
  timezone: z.string().optional(),
  consentEmail: z.boolean().optional(),
  consentPush: z.boolean().optional(),
  consentSms: z.boolean().optional(),
  consentWhatsapp: z.boolean().optional(),
  hideSensitive: z.boolean().optional(),
});

/** POST /api/settings — met à jour les préférences et consentements de l'utilisateur. */
export async function POST(req: NextRequest) {
  return route(async () => {
    const user = await requireUser();
    const data = schema.parse(await req.json());
    const updated = await db.user.update({ where: { id: user.id }, data });
    return ok({ user: { id: updated.id, hideSensitive: updated.hideSensitive } });
  });
}
