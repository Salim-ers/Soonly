import { env, featureConfigured } from "./env";
import crypto from "node:crypto";

/**
 * Abstraction de stockage S3-compatible (Supabase Storage, Cloudflare R2, S3…).
 * Les documents sont TOUJOURS privés : on ne renvoie jamais d'URL publique,
 * seulement des URL signées à durée de vie courte.
 *
 * L'implémentation utilise la signature AWS SigV4 via fetch afin d'éviter
 * une dépendance lourde. Si le stockage n'est pas configuré, chaque appel
 * lève une erreur explicite (aucun contournement silencieux).
 */

function assertConfigured() {
  if (!featureConfigured.storage()) {
    throw new Error(
      "Stockage non configuré. Renseignez STORAGE_ENDPOINT / STORAGE_ACCESS_KEY_ID / STORAGE_SECRET_ACCESS_KEY."
    );
  }
}

export function buildFileKey(userId: string, filename: string): string {
  const safe = filename.replace(/[^\w.\-]+/g, "_").slice(-80);
  return `${userId}/${crypto.randomUUID()}-${safe}`;
}

/** Upload direct côté serveur (petits fichiers ; pour de gros fichiers, préférer une URL présignée PUT). */
export async function putObject(key: string, body: Buffer, contentType: string): Promise<void> {
  assertConfigured();
  const url = `${env.STORAGE_ENDPOINT}/${env.STORAGE_BUCKET}/${key}`;
  const res = await signedFetch("PUT", url, body, contentType);
  if (!res.ok) throw new Error(`Échec upload stockage (${res.status})`);
}

export async function deleteObject(key: string): Promise<void> {
  assertConfigured();
  const url = `${env.STORAGE_ENDPOINT}/${env.STORAGE_BUCKET}/${key}`;
  const res = await signedFetch("DELETE", url);
  if (!res.ok && res.status !== 404) throw new Error(`Échec suppression stockage (${res.status})`);
}

/** URL signée en lecture (SigV4 query-string), valable `expiresIn` secondes. */
export async function getSignedUrl(key: string, expiresIn = 300): Promise<string> {
  assertConfigured();
  return presignGet(`${env.STORAGE_ENDPOINT}/${env.STORAGE_BUCKET}/${key}`, expiresIn);
}

// --- Signature AWS SigV4 (implémentation minimale, région/endpoint génériques) ---

function hmac(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac("sha256", key).update(data, "utf8").digest();
}
function sha256Hex(data: Buffer | string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}
function signingKey(date: string, region: string, service: string): Buffer {
  const kDate = hmac("AWS4" + env.STORAGE_SECRET_ACCESS_KEY, date);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, "aws4_request");
}

async function signedFetch(method: string, urlStr: string, body?: Buffer, contentType?: string) {
  const url = new URL(urlStr);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const region = env.STORAGE_REGION;
  const service = "s3";
  const payloadHash = sha256Hex(body ?? Buffer.alloc(0));
  const host = url.host;

  const canonicalHeaders =
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [
    method,
    url.pathname,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const scope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256Hex(canonicalRequest)].join("\n");
  const signature = hmac(signingKey(dateStamp, region, service), stringToSign).toString("hex");

  const authorization = `AWS4-HMAC-SHA256 Credential=${env.STORAGE_ACCESS_KEY_ID}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return fetch(urlStr, {
    method,
    headers: {
      Authorization: authorization,
      "x-amz-date": amzDate,
      "x-amz-content-sha256": payloadHash,
      ...(contentType ? { "content-type": contentType } : {}),
    },
    body: body as unknown as BodyInit,
  });
}

function presignGet(urlStr: string, expiresIn: number): string {
  const url = new URL(urlStr);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const region = env.STORAGE_REGION;
  const service = "s3";
  const scope = `${dateStamp}/${region}/${service}/aws4_request`;

  const params = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${env.STORAGE_ACCESS_KEY_ID}/${scope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expiresIn),
    "X-Amz-SignedHeaders": "host",
  });

  const canonicalQuery = params.toString();
  const canonicalRequest = [
    "GET",
    url.pathname,
    canonicalQuery,
    `host:${url.host}\n`,
    "host",
    "UNSIGNED-PAYLOAD",
  ].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256Hex(canonicalRequest)].join("\n");
  const signature = hmac(signingKey(dateStamp, region, service), stringToSign).toString("hex");

  return `${urlStr}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}
