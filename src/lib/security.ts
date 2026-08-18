import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function hashSecret(value: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(value, salt, 64).toString("hex")}`;
}

export function verifySecret(value: string, stored: string) {
  const [salt, expected] = stored.split(":");
  // Accept the original development seed format so existing local databases keep working.
  if (!expected) {
    const legacy = scryptSync(value, "reservas-demo", 64).toString("hex");
    return legacy.length === stored.length && timingSafeEqual(Buffer.from(legacy), Buffer.from(stored));
  }
  if (!salt) return false;
  const actual = scryptSync(value, salt, 64).toString("hex");
  return actual.length === expected.length && timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

export function tokenHash(token: string) { return createHash("sha256").update(token).digest("hex"); }
export function newToken() { return randomBytes(32).toString("base64url"); }
