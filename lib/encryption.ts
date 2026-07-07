import crypto from "node:crypto";
import { env } from "./env";

/**
 * Chiffrement AES-256-GCM pour les tokens OAuth stockés en base.
 * Les tokens ne transitent jamais vers le client : ils sont déchiffrés
 * uniquement côté serveur, au moment d'appeler l'API du provider.
 *
 * Format persistant : base64( iv[12] | authTag[16] | ciphertext ).
 */
function getKey(): Buffer {
  if (!env.ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY manquant : impossible de chiffrer/déchiffrer les tokens.");
  }
  const key = Buffer.from(env.ENCRYPTION_KEY, "base64");
  if (key.length !== 32) {
    throw new Error("ENCRYPTION_KEY doit décoder en 32 octets (openssl rand -base64 32).");
  }
  return key;
}

export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decrypt(payload: string): string {
  const raw = Buffer.from(payload, "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const enc = raw.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

/** Hachage à sens unique (codes OTP). */
export function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code + (env.AUTH_SECRET ?? "")).digest("hex");
}

export function randomOtp(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

/**
 * Hachage de mot de passe via scrypt (natif Node, aucune dépendance).
 * Format persistant : `scrypt:<saltHex>:<derivedHex>`.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, 64);
  return `scrypt:${salt.toString("hex")}:${derived.toString("hex")}`;
}

/** Vérifie un mot de passe contre un hash `scrypt:<salt>:<derived>` (comparaison à temps constant). */
export function verifyPassword(password: string, stored: string | null | undefined): boolean {
  if (!stored) return false;
  const [scheme, saltHex, hashHex] = stored.split(":");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const derived = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  return expected.length === derived.length && crypto.timingSafeEqual(derived, expected);
}
