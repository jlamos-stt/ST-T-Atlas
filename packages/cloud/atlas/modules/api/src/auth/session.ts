import { createHmac, timingSafeEqual } from 'node:crypto';
import type { CorporateIdentity } from './oidc.js';

/**
 * AtlasSession — Signs a short-lived, HttpOnly session after Google verification.
 *
 * The cookie contains no Google token. Its signing key comes from deployment
 * configuration and the later profile slices can revoke it by checking profile state.
 */

const SESSION_TTL_SECONDS = 60 * 60;

/** Claims carried by an Atlas session cookie, excluding the original Google token. */
export interface AtlasSessionClaims {
  subject: string;
  email: string;
  name?: string;
  picture?: string;
  issuedAt: number;
  expiresAt: number;
}

/** Encodes a verified identity as a signed, browser-only Atlas session cookie. */
export function createAtlasSessionCookie(
  identity: CorporateIdentity,
  sessionSecret: string,
  nowSeconds = Math.floor(Date.now() / 1000)
): string {
  const claims: AtlasSessionClaims = {
    subject: identity.subject,
    email: identity.email,
    name: identity.name,
    picture: identity.picture,
    issuedAt: nowSeconds,
    expiresAt: nowSeconds + SESSION_TTL_SECONDS,
  };
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  const signature = signPayload(payload, sessionSecret);
  return `${payload}.${signature}`;
}

/** Verifies a session cookie without contacting Google again. */
export function verifyAtlasSessionCookie(
  cookieValue: string,
  sessionSecret: string,
  nowSeconds = Math.floor(Date.now() / 1000)
): AtlasSessionClaims | undefined {
  const [payload, signature] = cookieValue.split('.');
  if (!payload || !signature) return undefined;
  const expectedSignature = signPayload(payload, sessionSecret);
  const suppliedBytes = Buffer.from(signature, 'base64url');
  const expectedBytes = Buffer.from(expectedSignature, 'base64url');
  if (suppliedBytes.length !== expectedBytes.length
    || !timingSafeEqual(suppliedBytes, expectedBytes)) return undefined;

  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AtlasSessionClaims;
    if (!claims.subject || !claims.email || claims.expiresAt <= nowSeconds) return undefined;
    return claims;
  } catch {
    return undefined;
  }
}

/** Produces the HMAC signature used by both session creation and verification. */
function signPayload(payload: string, sessionSecret: string): string {
  return createHmac('sha256', sessionSecret).update(payload).digest('base64url');
}
