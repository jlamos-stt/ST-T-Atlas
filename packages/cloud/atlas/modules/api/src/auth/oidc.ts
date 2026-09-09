import { createPublicKey, createVerify, type KeyObject } from 'node:crypto';
import type { GoogleAuthConfig } from './config.js';

/**
 * GoogleOidc — Verifies Google ID tokens before Atlas grants corporate access.
 *
 * The verifier checks the JWT signature, issuer, audience, temporal claims,
 * stable subject, verified email and hosted corporate domain. It never logs or
 * returns the original token.
 */

interface JsonWebKeyLike {
  kid?: string;
  kty?: string;
  n?: string;
  e?: string;
  alg?: string;
  use?: string;
}

interface JsonWebKeySet {
  keys?: JsonWebKeyLike[];
}

interface GoogleIdTokenClaims {
  iss?: unknown;
  aud?: unknown;
  azp?: unknown;
  sub?: unknown;
  email?: unknown;
  email_verified?: unknown;
  hd?: unknown;
  name?: unknown;
  picture?: unknown;
  exp?: unknown;
  iat?: unknown;
}

/** Public identity extracted only after the token has passed all checks. */
export interface CorporateIdentity {
  subject: string;
  email: string;
  name?: string;
  picture?: string;
  domain: string;
}

/** Signals that a supplied identity token must be rejected. */
export class InvalidIdentityTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidIdentityTokenError';
  }
}

interface CachedKeys {
  expiresAt: number;
  keys: Map<string, KeyObject>;
}

const JWKS_CACHE_TTL_MS = 10 * 60 * 1000;
const CLOCK_SKEW_SECONDS = 300;
let cachedKeys: CachedKeys | undefined;

/** Decodes one base64url JWT segment as UTF-8 JSON. */
function decodeJsonSegment<T>(segment: string): T {
  try {
    return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8')) as T;
  } catch {
    throw new InvalidIdentityTokenError('Malformed identity token');
  }
}

/** Converts a base64url signature to bytes for RSA verification. */
function decodeSignature(segment: string): Buffer {
  try {
    return Buffer.from(segment, 'base64url');
  } catch {
    throw new InvalidIdentityTokenError('Malformed identity token');
  }
}

/** Fetches and converts Google's current public signing keys. */
async function fetchSigningKeys(config: GoogleAuthConfig): Promise<CachedKeys> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(config.jwksUri, {
      headers: { accept: 'application/json' },
      signal: controller.signal,
    });

    // Guard: a key endpoint failure must reject the login rather than bypass signature verification.
    if (!response.ok) {
      throw new InvalidIdentityTokenError('Identity provider keys unavailable');
    }

    const body = (await response.json()) as JsonWebKeySet;
    const keys = new Map<string, KeyObject>();

    for (const jwk of body.keys ?? []) {
      if (!jwk.kid || jwk.kty !== 'RSA' || !jwk.n || !jwk.e) continue;
      keys.set(jwk.kid, createPublicKey({ key: jwk as JsonWebKey, format: 'jwk' }));
    }

    // Guard: an empty key set cannot verify any token and indicates bad provider configuration.
    if (keys.size === 0) {
      throw new InvalidIdentityTokenError('Identity provider keys unavailable');
    }

    cachedKeys = { keys, expiresAt: Date.now() + JWKS_CACHE_TTL_MS };
    return cachedKeys;
  } catch (error) {
    if (error instanceof InvalidIdentityTokenError) throw error;
    throw new InvalidIdentityTokenError('Identity provider keys unavailable');
  } finally {
    clearTimeout(timeout);
  }
}

/** Resolves a signing key and refreshes once when Google rotates keys. */
async function getSigningKey(kid: string, config: GoogleAuthConfig): Promise<KeyObject> {
  const current = cachedKeys && cachedKeys.expiresAt > Date.now()
    ? cachedKeys
    : await fetchSigningKeys(config);
  const key = current.keys.get(kid);
  if (key) return key;

  const refreshed = await fetchSigningKeys(config);
  const refreshedKey = refreshed.keys.get(kid);
  if (!refreshedKey) throw new InvalidIdentityTokenError('Unknown identity token key');
  return refreshedKey;
}

/** Checks whether an audience claim contains the configured OAuth client. */
function audienceMatches(audience: unknown, clientId: string): boolean {
  return typeof audience === 'string'
    ? audience === clientId
    : Array.isArray(audience) && audience.every((value) => typeof value === 'string')
      && audience.includes(clientId);
}

/** Compares an email and optional hosted-domain claim to the corporate domain. */
function hasCorporateDomain(email: string, hostedDomain: unknown, domain: string): boolean {
  const emailDomain = email.split('@').at(-1)?.toLowerCase();
  if (emailDomain !== domain) return false;
  return hostedDomain === undefined || hostedDomain === domain;
}

/**
 * Validates a Google ID token and returns its safe corporate identity claims.
 *
 * @param idToken - Untrusted JWT received from the browser; never persisted or logged.
 * @param config - Deployment configuration containing the expected client and issuer.
 * @returns Verified identity claims suitable for Atlas session creation and audit attribution.
 * @throws InvalidIdentityTokenError when any cryptographic or policy check fails.
 */
export async function validateGoogleIdToken(
  idToken: string,
  config: GoogleAuthConfig
): Promise<CorporateIdentity> {
  // 1. Parse the compact JWT and require the algorithm used by Google's keys.
  const segments = idToken.split('.');
  if (segments.length !== 3) throw new InvalidIdentityTokenError('Malformed identity token');
  const header = decodeJsonSegment<{ alg?: unknown; kid?: unknown }>(segments[0]);
  if (header.alg !== 'RS256' || typeof header.kid !== 'string') {
    throw new InvalidIdentityTokenError('Unsupported identity token');
  }

  // 2. Verify the signature against Google's rotating public key set.
  const signingKey = await getSigningKey(header.kid, config);
  const verifier = createVerify('RSA-SHA256');
  verifier.update(`${segments[0]}.${segments[1]}`);
  verifier.end();
  if (!verifier.verify(signingKey, decodeSignature(segments[2]))) {
    throw new InvalidIdentityTokenError('Invalid identity token signature');
  }

  // 3. Validate issuer, audience and temporal claims before using identity data.
  const claims = decodeJsonSegment<GoogleIdTokenClaims>(segments[1]);
  const expectedIssuer = config.issuer.replace(/\/$/, '');
  const receivedIssuer = typeof claims.iss === 'string' ? claims.iss.replace(/\/$/, '') : '';
  const now = Math.floor(Date.now() / 1000);
  if (receivedIssuer !== expectedIssuer || !audienceMatches(claims.aud, config.clientId)) {
    throw new InvalidIdentityTokenError('Identity token policy mismatch');
  }
  if (typeof claims.exp !== 'number' || claims.exp <= now - CLOCK_SKEW_SECONDS) {
    throw new InvalidIdentityTokenError('Expired identity token');
  }
  if (typeof claims.iat !== 'number' || claims.iat > now + CLOCK_SKEW_SECONDS) {
    throw new InvalidIdentityTokenError('Invalid identity token time');
  }
  if (Array.isArray(claims.aud) && claims.azp !== config.clientId) {
    throw new InvalidIdentityTokenError('Identity token policy mismatch');
  }

  // 4. Apply corporate identity policy and return only safe, verified claims.
  const subject = typeof claims.sub === 'string' ? claims.sub.trim() : '';
  const email = typeof claims.email === 'string' ? claims.email.trim() : '';
  if (!subject || !email || claims.email_verified !== true
    || !hasCorporateDomain(email, claims.hd, config.corporateDomain)) {
    throw new InvalidIdentityTokenError('Corporate identity not allowed');
  }

  return {
    subject,
    email,
    name: typeof claims.name === 'string' ? claims.name : undefined,
    picture: typeof claims.picture === 'string' ? claims.picture : undefined,
    domain: config.corporateDomain,
  };
}
