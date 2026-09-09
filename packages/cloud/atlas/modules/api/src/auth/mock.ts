import { createHmac, timingSafeEqual } from 'node:crypto';
import type { GoogleAuthConfig } from './config.js';
import { InvalidIdentityTokenError, type CorporateIdentity } from './oidc.js';

/**
 * Local Google credential substitute.
 *
 * It deliberately keeps the same compact-token shape expected by the real
 * endpoint, but is accepted only when ATLAS_AUTH_PROVIDER=mock. The browser
 * receives no session material and still has to exchange this credential at
 * /api/auth/google.
 */
interface MockClaims {
  iss: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: true;
  hd: string;
  name: string;
  exp: number;
  iat: number;
}

const MOCK_HEADER = { alg: 'HS256', typ: 'JWT' };
const MOCK_IDENTITY = {
  sub: 'mock-google-subject',
  email: 'usuario.demo@stt.com.co',
  name: 'Usuario Demo',
};

/** Creates a deterministic local credential with short-lived claims. */
export function createMockGoogleIdToken(config: GoogleAuthConfig, nowSeconds = Math.floor(Date.now() / 1000)): string {
  if (config.provider !== 'mock' || !config.mockSecret) {
    throw new Error('Mock identity provider is not enabled');
  }

  const claims: MockClaims = {
    iss: config.issuer,
    aud: config.clientId,
    ...MOCK_IDENTITY,
    email_verified: true,
    hd: config.corporateDomain,
    exp: nowSeconds + 300,
    iat: nowSeconds,
  };
  const encodedHeader = encodeSegment(MOCK_HEADER);
  const encodedClaims = encodeSegment(claims);
  const signature = sign(`${encodedHeader}.${encodedClaims}`, config.mockSecret);
  return `${encodedHeader}.${encodedClaims}.${signature}`;
}

/** Validates the local credential using the same identity policy as Google. */
export function validateMockGoogleIdToken(
  idToken: string,
  config: GoogleAuthConfig,
  nowSeconds = Math.floor(Date.now() / 1000),
): CorporateIdentity {
  if (config.provider !== 'mock' || !config.mockSecret) {
    throw new InvalidIdentityTokenError('Mock identity provider is not enabled');
  }

  const segments = idToken.split('.');
  if (segments.length !== 3) throw new InvalidIdentityTokenError('Malformed identity token');

  const header = decodeSegment<{ alg?: unknown; typ?: unknown }>(segments[0]);
  if (header.alg !== 'HS256' || header.typ !== 'JWT') {
    throw new InvalidIdentityTokenError('Unsupported identity token');
  }

  const expectedSignature = sign(`${segments[0]}.${segments[1]}`, config.mockSecret);
  const suppliedBytes = Buffer.from(segments[2], 'base64url');
  const expectedBytes = Buffer.from(expectedSignature, 'base64url');
  if (suppliedBytes.length !== expectedBytes.length
    || !timingSafeEqual(suppliedBytes, expectedBytes)) {
    throw new InvalidIdentityTokenError('Invalid identity token signature');
  }

  const claims = decodeSegment<Partial<MockClaims>>(segments[1]);
  const expectedIssuer = config.issuer.replace(/\/$/, '');
  const receivedIssuer = typeof claims.iss === 'string' ? claims.iss.replace(/\/$/, '') : '';
  const email = typeof claims.email === 'string' ? claims.email.trim() : '';
  const subject = typeof claims.sub === 'string' ? claims.sub.trim() : '';
  const emailDomain = email.split('@').at(-1)?.toLowerCase();
  if (receivedIssuer !== expectedIssuer || claims.aud !== config.clientId
    || !subject || !email || claims.email_verified !== true
    || emailDomain !== config.corporateDomain || claims.hd !== config.corporateDomain
    || typeof claims.exp !== 'number' || claims.exp <= nowSeconds
    || typeof claims.iat !== 'number' || claims.iat > nowSeconds + 300) {
    throw new InvalidIdentityTokenError('Identity token policy mismatch');
  }

  return {
    subject,
    email,
    name: typeof claims.name === 'string' ? claims.name : undefined,
    domain: config.corporateDomain,
  };
}

/** Encodes a JWT segment without introducing padding into the local credential. */
function encodeSegment(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

/** Decodes a JWT segment and normalizes malformed input to an authentication rejection. */
function decodeSegment<T>(segment: string): T {
  try {
    return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8')) as T;
  } catch {
    throw new InvalidIdentityTokenError('Malformed identity token');
  }
}

/** Signs the mock JWT payload with the server-only HMAC secret. */
function sign(value: string, secret: string): string {
  return createHmac('sha256', secret).update(value).digest('base64url');
}
