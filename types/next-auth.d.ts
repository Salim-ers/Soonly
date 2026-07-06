import type { DefaultSession } from "next-auth";

/** Ajoute l'identifiant utilisateur à la session Auth.js. */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
  }
}
