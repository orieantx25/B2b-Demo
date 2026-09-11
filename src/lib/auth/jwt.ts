import type { SessionPayload } from "@/lib/auth/roles";

export const SESSION_COOKIE = "ugsot_session";

function secretBytes() {
  const secret = process.env.AUTH_SECRET || "ugsot-dev-secret-change-in-production-32chars";
  return new TextEncoder().encode(secret);
}

function b64url(data: ArrayBuffer | Uint8Array) {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  let str = "";
  bytes.forEach((b) => {
    str += String.fromCharCode(b);
  });
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlJson(obj: unknown) {
  return b64url(new TextEncoder().encode(JSON.stringify(obj)));
}

async function hmacSign(data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes(),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return b64url(sig);
}

async function hmacVerify(data: string, signature: string) {
  const expected = await hmacSign(data);
  return expected === signature;
}

export async function signSession(payload: SessionPayload, expiresInSeconds = 60 * 60 * 24 * 7) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };
  const unsigned = `${b64urlJson(header)}.${b64urlJson(body)}`;
  const sig = await hmacSign(unsigned);
  return `${unsigned}.${sig}`;
}

function decodePart(part: string) {
  const padded = part.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const json = atob(padded + pad);
  return JSON.parse(json);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const [h, p, s] = token.split(".");
    if (!h || !p || !s) return null;
    const ok = await hmacVerify(`${h}.${p}`, s);
    if (!ok) return null;
    const payload = decodePart(p) as SessionPayload & { exp?: number };
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    if (!payload.userId || !payload.email || !payload.role) return null;
    return {
      userId: String(payload.userId),
      email: String(payload.email),
      name: String(payload.name || ""),
      role: payload.role,
      region: String(payload.region || "NCR"),
    };
  } catch {
    return null;
  }
}
