import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/api";

/** GET /api/account/export — export RGPD de toutes les données de l'utilisateur (JSON). */
export async function GET() {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const [reminders, documents, accounts, logs] = await Promise.all([
    db.reminder.findMany({ where: { userId: user.id }, include: { rules: true } }),
    db.document.findMany({ where: { userId: user.id }, select: { id: true, title: true, category: true, expirationDate: true, mimeType: true, size: true, createdAt: true } }),
    db.connectedAccount.findMany({ where: { userId: user.id }, select: { provider: true, status: true, scopes: true, lastSyncedAt: true } }),
    db.notificationLog.findMany({ where: { userId: user.id }, take: 500, orderBy: { sentAt: "desc" } }),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    profile: { id: user.id, name: user.name, email: user.email, phone: user.phone, timezone: user.timezone },
    reminders, documents, connectedAccounts: accounts, notificationLogs: logs,
  };
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: { "Content-Type": "application/json", "Content-Disposition": 'attachment; filename="soonly-export.json"' },
  });
}
