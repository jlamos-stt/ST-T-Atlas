/**
 * McpHandler — Adaptador Lambda de la pasarela MCP de ST&T Atlas.
 *
 * Expone la pasarela MCP como función bajo demanda detrás de API Gateway
 * (ruta `ANY /mcp/{proxy+}`). Es un límite de cómputo separado de la API del
 * portal porque tiene otra superficie de exposición, otros permisos y otro
 * patrón de carga (ADR-PLAT-002).
 *
 * Alcance actual del slice 01: únicamente el chequeo de disponibilidad. La
 * autenticación OAuth como recurso protegido, el catálogo de herramientas y la
 * auditoría idempotente pertenecen a la solución Sincronización MCP y auditoría
 * gobernada y todavía no están implementados aquí.
 *
 * Restricción vigente: esta pasarela nunca aceptará secretos, código fuente,
 * datos personales ni historial Git.
 *
 * Archivos relacionados:
 * - `../../../infra/app.ts` — declara esta función, su cola y su enrutamiento.
 * - `../../../../../.kiro/initiatives/stt-atlas/solutions/sincronizacion-mcp-auditoria` — contrato pendiente.
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
 * Punto de entrada de la pasarela MCP.
 *
 * Responde el estado de disponibilidad y declara explícitamente que la
 * autenticación todavía no está habilitada, para que nadie interprete este
 * endpoint como una superficie MCP operativa.
 *
 * @param event - Evento de API Gateway HTTP API con la ruta solicitada
 * @returns Respuesta JSON con el estado del servicio, o 501 si la ruta requiere
 *   capacidades MCP aún no implementadas
 */
export async function handler(event: HttpEvent): Promise<HttpResponse> {
  const path = event.requestContext?.http?.path ?? event.rawPath ?? '/';

  // Guard: solo el chequeo de disponibilidad está implementado. Se responde 501
  // en lugar de 404 porque la ruta MCP existirá, pero su contrato aún no se ha
  // definido ni verificado con el cliente objetivo.
  if (!path.endsWith('/health')) {
    return json(501, {
      error: 'MCP protocol not implemented yet',
      code: 'MCP_NOT_IMPLEMENTED',
    });
  }

  return json(200, {
    service: 'atlas.mcp',
    status: 'ok',
    authentication: 'not-configured',
    environment: process.env.ATLAS_ENVIRONMENT ?? 'unknown',
    timestamp: new Date().toISOString(),
  });
}
