"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, ArrowRight, Loader2 } from "lucide-react";

/**
 * Authentification :
 *  - Email : lien magique (Resend) via signIn("resend").
 *  - Téléphone : OTP — POST /api/auth/phone puis signIn("phone").
 *  - Google : signIn("google").
 */
export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [tab, setTab] = useState<"password" | "email" | "phone">("password");
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [phone, setPhone] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signInPassword() {
    setError(null);
    if (!/.+@.+\..+/.test(email)) return setError("Saisissez une adresse email valide.");
    if (!password) return setError("Saisissez votre mot de passe.");
    setLoading("password");
    const res = await signIn("password", { email, password, redirect: false });
    setLoading(null);
    if (res?.error) return setError("Email ou mot de passe incorrect.");
    router.push("/dashboard");
    router.refresh();
  }

  async function sendMagic() {
    setError(null);
    if (!/.+@.+\..+/.test(email)) return setError("Saisissez une adresse email valide.");
    setLoading("email");
    const res = await signIn("resend", { email, redirect: false, callbackUrl: "/dashboard" });
    setLoading(null);
    if (res?.error) setError("L'envoi par email n'est pas disponible. Essayez Google ou le téléphone.");
    else setEmailSent(true);
  }

  async function sendOtp() {
    setError(null);
    if (phone.replace(/\D/g, "").length < 8) return setError("Numéro de téléphone invalide.");
    setLoading("otp");
    const res = await fetch("/api/auth/phone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) return setError(data.error ?? "Envoi impossible.");
    if (data.devCode) setDevCode(data.devCode);
    setOtpStep(true);
  }

  async function verifyOtp() {
    setError(null);
    if (code.length !== 6) return setError("Le code comporte 6 chiffres.");
    setLoading("verify");
    const res = await signIn("phone", { phone, code, redirect: false });
    setLoading(null);
    if (res?.error) return setError("Code invalide ou expiré.");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-[420px]">
      <h2 className="disp text-[29px] font-[560] text-teal">{mode === "signup" ? "Bienvenue sur Soonly" : "Ravi de vous revoir"}</h2>
      <p className="mb-6 mt-2 text-[14.5px] text-ink-2">
        {mode === "signup" ? "Créez votre espace en moins d'une minute." : "Connectez-vous pour retrouver votre espace."}
      </p>

      <div className="mb-5 grid grid-cols-3 gap-1 rounded-[12px] bg-bg-deep p-1">
        {(["password", "email", "phone"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(null); }}
            className={`h-[38px] rounded-[9px] text-[13.5px] font-semibold transition-colors ${tab === t ? "bg-surface text-teal shadow-s" : "text-ink-2"}`}
          >
            {t === "password" ? "Mot de passe" : t === "email" ? "Email" : "Téléphone"}
          </button>
        ))}
      </div>

      {tab === "password" ? (
        <>
          <label className="field-label" htmlFor="pw-email">Adresse email</label>
          <input id="pw-email" type="email" autoComplete="email" className="inp" placeholder="vous@exemple.fr" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label className="field-label mt-3" htmlFor="pw-pass">Mot de passe</label>
          <input id="pw-pass" type="password" autoComplete="current-password" className="inp" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") signInPassword(); }} />
          <button className="btn btn-lg mt-4 w-full" onClick={signInPassword} disabled={loading === "password"}>
            {loading === "password" ? <Loader2 className="h-5 w-5 animate-spin" /> : "Se connecter"}
          </button>
        </>
      ) : tab === "email" ? (
        emailSent ? (
          <div className="flex items-start gap-3 rounded-[14px] border border-teal-tint bg-teal-wash p-4">
            <Mail className="mt-0.5 h-5 w-5 text-teal-soft" />
            <div>
              <b className="text-[14px]">Lien magique envoyé</b>
              <p className="mt-1 text-[13px] text-ink-2">Ouvrez le lien reçu à {email} pour vous connecter.</p>
            </div>
          </div>
        ) : (
          <>
            <label className="field-label" htmlFor="email">Adresse email</label>
            <input id="email" type="email" autoComplete="email" className="inp" placeholder="vous@exemple.fr" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="btn btn-lg mt-4 w-full" onClick={sendMagic} disabled={loading === "email"}>
              {loading === "email" ? <Loader2 className="h-5 w-5 animate-spin" /> : mode === "signup" ? "Créer mon compte" : "Recevoir mon lien magique"}
            </button>
          </>
        )
      ) : otpStep ? (
        <>
          <label className="field-label">Code reçu par SMS</label>
          <input inputMode="numeric" maxLength={6} className="inp tracking-[0.5em] text-center text-[20px] font-bold" placeholder="000000" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
          {devCode && <p className="mt-2 text-[12.5px] text-ink-3">Code (dev) : <b>{devCode}</b></p>}
          <button className="btn btn-lg mt-4 w-full" onClick={verifyOtp} disabled={loading === "verify"}>
            {loading === "verify" ? <Loader2 className="h-5 w-5 animate-spin" /> : "Vérifier et continuer"}
          </button>
        </>
      ) : (
        <>
          <label className="field-label" htmlFor="phone">Numéro de téléphone</label>
          <input id="phone" type="tel" autoComplete="tel" className="inp" placeholder="+33 6 12 34 56 78" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <button className="btn btn-lg mt-4 w-full" onClick={sendOtp} disabled={loading === "otp"}>
            {loading === "otp" ? <Loader2 className="h-5 w-5 animate-spin" /> : "Recevoir un code par SMS"}
          </button>
        </>
      )}

      {error && <p className="mt-3 text-[13px] font-medium text-danger">{error}</p>}

      <div className="my-5 flex items-center gap-3.5 text-[12px] font-semibold tracking-[0.06em] text-ink-3 before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">OU</div>

      <button className="btn btn-ghost h-[46px] w-full" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
        <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4z" /><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1a5.9 5.9 0 0 1-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" /><path fill="#FBBC05" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9z" /><path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5L18.7 5A10 10 0 0 0 3.1 7.5l3.3 2.6A5.9 5.9 0 0 1 12 6z" /></svg>
        Continuer avec Google
      </button>

      <p className="mt-5 text-[12.5px] leading-relaxed text-ink-3">
        {mode === "signup" ? (
          <>En continuant, vous acceptez nos conditions et notre politique de confidentialité. Les rappels WhatsApp ne sont activés qu'après votre consentement explicite.</>
        ) : (
          <>Nouveau sur Soonly ? <a href="/signup" className="font-semibold text-teal">Créer un compte</a>.</>
        )}
      </p>
    </div>
  );
}
