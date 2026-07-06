import { NextResponse } from "next/server";
import { auth } from "./auth";
import { db } from "./db";
import { ZodError } from "zod";
import { PlanError } from "./permissions";

/** Récupère l'utilisateur authentifié ou lève une réponse 401. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new ApiError(401, "Vous devez être connecté.");
  }
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) throw new ApiError(401, "Session invalide.");
  return user;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Enveloppe un handler : gère l'auth, Zod, les erreurs de plan et les 500. */
export function route<T>(handler: () => Promise<T>) {
  return handler().catch((e: unknown) => {
    if (e instanceof ApiError) return NextResponse.json({ error: e.message }, { status: e.status });
    if (e instanceof PlanError) return NextResponse.json({ error: e.message, upgrade: true, feature: e.feature }, { status: 402 });
    if (e instanceof ZodError) return NextResponse.json({ error: "Données invalides", issues: e.flatten() }, { status: 422 });
    console.error("[api]", e);
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
  }) as Promise<T | NextResponse>;
}

export const ok = (data: unknown = { ok: true }) => NextResponse.json(data);
