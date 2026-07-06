import { PrismaClient } from "@prisma/client";

/**
 * Seed de DÉVELOPPEMENT uniquement.
 * Crée un utilisateur de démonstration avec quelques échéances pour visualiser
 * le tableau de bord peuplé en local. En production, chaque compte démarre vide
 * (états vides soignés) : ce fichier n'est jamais exécuté automatiquement.
 *
 *   npm run db:seed
 */
const db = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.log("Seed ignoré en production.");
    return;
  }

  const email = "demo@soonly.app";
  const user = await db.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Camille Démo",
      timezone: "Europe/Paris",
      consentEmail: true,
      consentPush: true,
      subscription: {
        create: {
          plan: "PLUS",
          status: "TRIALING",
          currentPeriodEnd: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        },
      },
    },
  });

  // Repart d'une base propre pour la démo.
  await db.reminder.deleteMany({ where: { userId: user.id } });

  const inDays = (d: number) => new Date(Date.now() + d * 24 * 3600 * 1000);
  const seedData: Array<{ title: string; category: any; days: number; rules: number[]; recurrence?: any }> = [
    { title: "Fin d'essai — application de sport", category: "ABONNEMENT", days: 0, rules: [3, 1, 0] },
    { title: "Rendez-vous dentiste", category: "SANTE", days: 1, rules: [7, 1] },
    { title: "Contrôle technique de la voiture", category: "VEHICULE", days: 6, rules: [30, 7, 1] },
    { title: "Assurance habitation à renouveler", category: "ASSURANCE", days: 24, rules: [30, 14], recurrence: "YEARLY" },
    { title: "Passeport à renouveler", category: "ADMIN", days: 52, rules: [90, 30, 7] },
    { title: "Déclaration d'impôts", category: "IMPOTS", days: 88, rules: [30, 14, 3], recurrence: "YEARLY" },
    { title: "Garantie du lave-linge", category: "GARANTIE", days: 210, rules: [60, 14] },
  ];

  for (const s of seedData) {
    await db.reminder.create({
      data: {
        userId: user.id,
        title: s.title,
        category: s.category,
        dueAt: inDays(s.days),
        recurrence: s.recurrence ?? "NONE",
        source: "MANUAL",
        rules: { create: s.rules.map((d) => ({ offsetValue: d, offsetUnit: "DAY", channel: d <= 1 ? "PUSH" : "EMAIL" })) },
      },
    });
  }

  console.log(`Seed terminé : utilisateur ${email} avec ${seedData.length} échéances.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
