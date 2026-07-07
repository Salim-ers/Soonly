/**
 * Crée (ou met à jour) un compte avec mot de passe.
 * Usage : SEED_EMAIL=... SEED_PASSWORD=... DATABASE_URL=... npx tsx scripts/create-user.ts
 * Aucun secret n'est codé en dur : tout vient de l'environnement.
 */
import { PrismaClient } from "@prisma/client";
import crypto from "node:crypto";

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, 64);
  return `scrypt:${salt.toString("hex")}:${derived.toString("hex")}`;
}

async function main() {
  const email = (process.env.SEED_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.SEED_PASSWORD ?? "";
  const name = process.env.SEED_NAME ?? "Salim";
  if (!email || !password) {
    console.error("SEED_EMAIL et SEED_PASSWORD sont requis.");
    process.exit(1);
  }
  const db = new PrismaClient();
  const user = await db.user.upsert({
    where: { email },
    update: { passwordHash: hashPassword(password), name },
    create: { email, name, passwordHash: hashPassword(password), emailVerified: new Date(), consentEmail: true },
  });
  console.log(`Compte prêt : ${user.email} (id ${user.id})`);
  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
