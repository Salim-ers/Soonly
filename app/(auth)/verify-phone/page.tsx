import type { Metadata } from "next";
import { AuthForm } from "@/components/forms/auth-form";
export const metadata: Metadata = { title: "Vérifier mon numéro" };

/** Page dédiée à la connexion/vérification par téléphone. */
export default function VerifyPhonePage() {
  return <AuthForm mode="login" />;
}
