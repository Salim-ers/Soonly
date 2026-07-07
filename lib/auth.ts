import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import { db } from "./db";
import { env, featureConfigured } from "./env";
import { hashCode, verifyPassword } from "./encryption";

/**
 * Configuration Auth.js (NextAuth v5).
 *  - Google : connexion sociale (si clés présentes).
 *  - Resend : lien magique par email (si RESEND_API_KEY présent).
 *  - Phone (Credentials) : vérification par code OTP (voir /api/auth/phone).
 *
 * Un utilisateur qui se connecte par téléphone reçoit une session ; la
 * vérification effective du code est faite ici contre la table PhoneOtp.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const providers: any[] = [];

if (env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET) {
  providers.push(Google({ clientId: env.AUTH_GOOGLE_ID, clientSecret: env.AUTH_GOOGLE_SECRET }));
}

if (featureConfigured.email()) {
  providers.push(Resend({ apiKey: env.RESEND_API_KEY!, from: env.EMAIL_FROM }));
}

providers.push(
  Credentials({
    id: "password",
    name: "Mot de passe",
    credentials: { email: {}, password: {} },
    authorize: async (creds) => {
      const email = String(creds?.email ?? "").trim().toLowerCase();
      const password = String(creds?.password ?? "");
      if (!email || !password) return null;
      const user = await db.user.findUnique({ where: { email } });
      if (!user || !verifyPassword(password, user.passwordHash)) return null;
      return { id: user.id, name: user.name, email: user.email };
    },
  })
);

providers.push(
  Credentials({
    id: "phone",
    name: "Téléphone",
    credentials: { phone: {}, code: {} },
    authorize: async (creds) => {
      const phone = String(creds?.phone ?? "").trim();
      const code = String(creds?.code ?? "").trim();
      if (!phone || code.length !== 6) return null;

      const otp = await db.phoneOtp.findFirst({
        where: { phone, consumedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
      });
      if (!otp) return null;
      if (otp.attempts >= 5) return null;
      if (otp.codeHash !== hashCode(code)) {
        await db.phoneOtp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
        return null;
      }
      await db.phoneOtp.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

      // Rattache ou crée l'utilisateur correspondant à ce numéro.
      const user = await db.user.upsert({
        where: { phone },
        update: { phoneVerifiedAt: new Date(), consentSms: true },
        create: { phone, phoneVerifiedAt: new Date(), consentSms: true },
      });
      return { id: user.id, name: user.name, email: user.email };
    },
  })
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers,
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.sub = (user as { id: string }).id;
      return token;
    },
  },
});
