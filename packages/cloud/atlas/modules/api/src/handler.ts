import { AuthConfigurationError, getGoogleAuthConfig } from './auth/config.js';
import { recordAuthenticationEvent } from './auth/audit.js';
import { createAtlasSessionCookie } from './auth/session.js';
import { InvalidIdentityTokenError, validateGoogleIdToken } from './auth/oidc.js';
import type { GoogleAuthConfig } from './auth/config.js';

/**
 * ApiHandler — Adaptador Lambda de la API del portal ST&T Atlas.
 *
 * Expone la API del portal como función bajo demanda detrás de API Gateway
 * (ruta `ANY /api/{proxy+}`), en lugar de un servidor de larga duración. Esta
 * elección responde a ADR-PLAT-007: la POC usa cómputo por uso para no incurrir
 * en el costo fijo de un clúster de contenedores.
 *
 * Alcance actual del slice 01 (base desplegable reproducible): únicamente el
 * chequeo de disponibilidad. Los flujos de portafolio, documentación y métricas
 * se implementan en sus propias soluciones.
 *
 * Archivos relacionados:
 * - `../../../infra/app.ts` — declara esta función y su enrutamiento.
 * - `./controllers/Health.ts` — controlador equivalente del andamiaje Express.
 */

/** Respuesta HTTP mínima devuelta a API Gateway en formato payload v2. */
interface HttpResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

/** Evento de API Gateway HTTP API (payload v2) reducido a lo que se consume. */
interface HttpEvent {
  rawPath?: string;
  body?: string | null;
  isBase64Encoded?: boolean;
  headers?: Record<string, string | undefined>;
  requestContext?: {
    http?: { method?: string; path?: string };
  };
}

interface GoogleLoginRequest {
  credential?: unknown;
  idToken?: unknown;
}

/** Construye una respuesta JSON con los encabezados esperados por el gateway. */
function json(statusCode: number, payload: unknown): HttpResponse {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  };
}

/** Reads a header without depending on API Gateway's casing normalization. */
function getHeader(event: HttpEvent, name: string): string | undefined {
  const expectedName = name.toLowerCase();
  const entry = Object.entries(event.headers ?? {})
    .find(([key]) => key.toLowerCase() === expectedName);
  return entry?.[1];
}

/** Extracts the Google ID token from the GIS body or an explicit bearer header. */
function extractGoogleIdToken(event: HttpEvent): string | undefined {
  const authorization = getHeader(event, 'authorization');
  if (authorization?.startsWith('Bearer ')) return authorization.slice('Bearer '.length).trim();
  if (!event.body) return undefined;

  try {
    const bodyText = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf8')
      : event.body;
    const request = JSON.parse(bodyText) as GoogleLoginRequest;
    const credential = typeof request.credential === 'string' ? request.credential : request.idToken;
    return typeof credential === 'string' ? credential.trim() : undefined;
  } catch {
    return undefined;
  }
}

/** Records a rejection while keeping token contents and provider details out of the audit. */
async function rejectAuthentication(reason: string): Promise<HttpResponse> {
  try {
    await recordAuthenticationEvent({
      action: 'login_rejected',
      result: 'rejected',
      reason,
    });
  } catch (error) {
    // Audit failure is an internal condition; do not expose the storage error to the client.
    console.error('Authentication audit unavailable', {
      error: error instanceof Error ? error.message : String(error),
    });
    return json(503, {
      error: 'Authentication service unavailable',
      code: 'AUTH_AUDIT_UNAVAILABLE',
    });
  }

  return json(401, {
    error: 'Authentication failed',
    code: 'AUTHENTICATION_REJECTED',
  });
}

/** Handles the corporate Google login flow and creates an Atlas session. */
async function handleGoogleLogin(event: HttpEvent): Promise<HttpResponse> {
  let config: GoogleAuthConfig;

  try {
    // 1. Fail as a deployment configuration error before treating anyone as unauthorized.
    config = getGoogleAuthConfig();
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      console.error('Authentication configuration unavailable', { code: 'AUTH_CONFIGURATION_ERROR' });
      return json(503, {
        error: 'Authentication is not configured',
        code: 'AUTH_CONFIGURATION_ERROR',
      });
    }
    throw error;
  }

  // 2. Extract the untrusted browser credential without logging or persisting it.
  const idToken = extractGoogleIdToken(event);
  if (!idToken) return rejectAuthentication('MISSING_ID_TOKEN');

  try {
    // 3. Verify signature, issuer, audience, expiry and corporate domain.
    const identity = await validateGoogleIdToken(idToken, config);

    // 4. Audit the accepted identity and issue a session that contains no Google token.
    await recordAuthenticationEvent({
      action: 'login',
      result: 'accepted',
      subject: identity.subject,
    });
    return {
      ...json(200, {
        authenticated: true,
        identity: {
          subject: identity.subject,
          email: identity.email,
          name: identity.name,
          picture: identity.picture,
        },
      }),
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
        'set-cookie': [
          `atlas_session=${createAtlasSessionCookie(identity, config.sessionSecret)}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=3600`,
        ].join(''),
      },
    };
  } catch (error) {
    if (error instanceof InvalidIdentityTokenError) {
      return rejectAuthentication('INVALID_ID_TOKEN');
    }
    console.error('Authentication flow unavailable', {
      error: error instanceof Error ? error.message : String(error),
    });
    return json(503, {
      error: 'Authentication service unavailable',
      code: 'AUTH_SERVICE_UNAVAILABLE',
    });
  }
}

/**
 * Punto de entrada de la API del portal.
 *
 * Responde el estado de disponibilidad del servicio y declara el entorno,
 * de modo que la verificación del despliegue no dependa de leer logs.
 *
 * @param event - Evento de API Gateway HTTP API con la ruta solicitada
 * @returns Respuesta JSON con el estado del servicio, o 404 si la ruta no existe
 */
export async function handler(event: HttpEvent): Promise<HttpResponse> {
  const path = event.requestContext?.http?.path ?? event.rawPath ?? '/';

  // Route: the SPA posts the Google Identity Services credential to this endpoint.
  if (path.endsWith('/auth/google')) return handleGoogleLogin(event);

  // Guard: el slice 01 solo publica el chequeo de disponibilidad. Cualquier otra
  // ruta debe fallar de forma explícita en lugar de devolver un cuerpo vacío.
  if (!path.endsWith('/health')) {
    return json(404, {
      error: 'Not found',
      code: 'ROUTE_NOT_IMPLEMENTED',
    });
  }

  return json(200, {
    service: 'atlas.api',
    status: 'ok',
    environment: process.env.ATLAS_ENVIRONMENT ?? 'unknown',
    timestamp: new Date().toISOString(),
  });
}
