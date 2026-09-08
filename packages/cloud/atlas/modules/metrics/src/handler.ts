/**
 * MetricsHandler — Consumidor asíncrono de eventos de métricas de ST&T Atlas.
 *
 * Consume la cola `MetricsEvents` para construir los agregados diarios por
 * persona, slice y proyecto. Es el tercer límite de cómputo (ADR-PLAT-002) y el
 * único dominio autorizado a escribir agregados.
 *
 * Alcance actual del slice 01: recibe los mensajes y los registra, sin calcular
 * agregados todavía. La ingesta idempotente y la reconciliación pertenecen a la
 * solución Métricas y retroalimentación operativa.
 *
 * Los mensajes que agoten sus reintentos se retienen en `MetricsDeadLetter` para
 * inspección, en lugar de descartarse en silencio.
 *
 * Archivos relacionados:
 * - `../../../infra/app.ts` — declara esta función, la cola y su cola de fallos.
 * - `../../mcp/src/handler.ts` — origen de los eventos publicados en la cola.
 */

/** Registro individual entregado por SQS. */
interface QueueRecord {
  messageId: string;
  body: string;
}

/** Evento de SQS con el lote de mensajes a procesar. */
interface QueueEvent {
  Records?: QueueRecord[];
}

/** Resultado del lote: identifica los mensajes que deben reintentarse. */
interface BatchResponse {
  batchItemFailures: Array<{ itemIdentifier: string }>;
}

/**
 * Procesa un lote de eventos de métricas.
 *
 * Devuelve los identificadores de los mensajes que fallaron, de modo que SQS
 * reintente únicamente esos y no todo el lote. Esto evita reprocesar eventos ya
 * aplicados cuando solo uno falla.
 *
 * @param event - Lote de mensajes entregado por la cola de métricas
 * @returns Los mensajes fallidos para reintento parcial del lote
 */
export async function handler(event: QueueEvent): Promise<BatchResponse> {
  const records = event.Records ?? [];
  const failures: Array<{ itemIdentifier: string }> = [];

  // 1. Recorrer el lote de forma individual para aislar los fallos.
  for (const record of records) {
    try {
      // 2. Interpretar el evento auditado que originó la métrica.
      const payload = JSON.parse(record.body);

      // 3. Alcance del slice 01: registrar la recepción. El cálculo de agregados
      //    llega con la solución de métricas, que definirá fórmula y retención.
      console.info('Metrics event received', {
        messageId: record.messageId,
        eventType: payload?.type ?? 'unknown',
      });
    } catch (error) {
      // 4. Un mensaje ilegible no debe bloquear el lote: se marca para reintento
      //    y, si persiste, termina en la cola de fallos para inspección.
      console.error('Metrics event could not be processed', {
        messageId: record.messageId,
        error: error instanceof Error ? error.message : String(error),
      });
      failures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures: failures };
}
