import crypto from "node:crypto";
import { env } from "./env";

/** State OAuth signé : userId.timestamp.hmac — vérifiable et anti-CSRF. */
export function signState(userId: string): string {
  const payload = `${userId}.${Date.now()}`;
  const sig = crypto.createHmac("sha256", env.AUTH_SECRET).update(payload).digest("hex").slice(0, 24);
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function verifyState(state: string, maxAgeMs = 10 * 60_000): string | null {
  try {
    const decoded = Buffer.from(state, "base64url").toString("utf8");
    const [userId, ts, sig] = decoded.split(".");
    const expected = crypto.createHmac("sha256", env.AUTH_SECRET).update(`${userId}.${ts}`).digest("hex").slice(0, 24);
    if (sig !== expected) return null;
    if (Date.now() - Number(ts) > maxAgeMs) return null;
    return userId;
  } catch {
    return null;
  }
}
