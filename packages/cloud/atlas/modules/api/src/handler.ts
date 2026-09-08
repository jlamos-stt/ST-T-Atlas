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
  requestContext?: {
    http?: { method?: string; path?: string };
  };
}

/** Construye una respuesta JSON con los encabezados esperados por el gateway. */
function json(statusCode: number, payload: unknown): HttpResponse {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  };
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
