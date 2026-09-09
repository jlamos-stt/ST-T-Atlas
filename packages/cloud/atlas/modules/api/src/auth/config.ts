/**
 * GoogleAuthConfig — Runtime configuration for corporate OIDC authentication.
 *
 * Values are resolved from the deployment environment so client credentials and
 * session signing material never need to be committed to the repository.
 */

const DEFAULT_GOOGLE_ISSUER = 'https://accounts.google.com';
const DEFAULT_GOOGLE_JWKS_URI = 'https://www.googleapis.com/oauth2/v3/certs';
const DEFAULT_CORPORATE_DOMAIN = 'stt.com.co';

/** Signals that authentication cannot safely start because deployment config is missing. */
export class AuthConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthConfigurationError';
  }
}

/** Runtime values required to validate Google ID tokens and issue Atlas sessions. */
export interface GoogleAuthConfig {
  provider: 'google' | 'mock';
  clientId: string;
  issuer: string;
  jwksUri: string;
  corporateDomain: string;
  sessionSecret: string;
  mockSecret?: string;
}

/**
 * Loads and validates authentication settings without revealing secret values.
 *
 * @returns The validated configuration used by the authentication flow.
 * @throws AuthConfigurationError when a required deployment value is absent or weak.
 */
export function getGoogleAuthConfig(): GoogleAuthConfig {
  const configuredProvider = process.env.ATLAS_AUTH_PROVIDER?.trim().toLowerCase();
  const environment = process.env.ATLAS_ENVIRONMENT?.trim().toLowerCase();
  const provider = configuredProvider === 'mock' ? 'mock' : 'google';
  const clientId = process.env.ATLAS_GOOGLE_CLIENT_ID?.trim();
  const sessionSecret = process.env.ATLAS_SESSION_SECRET?.trim();
  const mockSecret = process.env.ATLAS_MOCK_GOOGLE_SECRET?.trim();

  // Guard: the stand-in issuer is a NOPROD test dependency, never a production fallback.
  if (provider === 'mock' && environment !== 'local' && environment !== 'noprod') {
    throw new AuthConfigurationError('Mock authentication is only available in local or noprod environments');
  }

  // Guard: accepting an unconfigured client or signing key would make the auth boundary ambiguous.
  if (!sessionSecret || sessionSecret.length < 32
    || (provider === 'google' && !clientId)
    || (provider === 'mock' && (!mockSecret || mockSecret.length < 32))) {
    throw new AuthConfigurationError('Google authentication configuration is incomplete');
  }

  return {
    provider,
    clientId: clientId || 'atlas-local-mock-client',
    issuer: process.env.ATLAS_GOOGLE_ISSUER?.trim()
      || (provider === 'mock' ? 'https://accounts.google.local' : DEFAULT_GOOGLE_ISSUER),
    jwksUri: process.env.ATLAS_GOOGLE_JWKS_URI?.trim() || DEFAULT_GOOGLE_JWKS_URI,
    corporateDomain: (
      process.env.ATLAS_GOOGLE_DOMAIN?.trim() || DEFAULT_CORPORATE_DOMAIN
    ).toLowerCase(),
    sessionSecret,
    mockSecret,
  };
}
