/// <reference path="../.sst/platform/config.d.ts" />

import { Env, Config } from '@webiai/sdk.core';
import { Stack } from '@webiai/sdk.infra/util/stack';
import { resources } from '@webiai/sdk.infra/util/resources';
import { aws as awsInfra } from '@webiai/sdk.infra';
import { cloudAtlasEnvVisitor, type CloudAtlasEnv } from './env.js';

/**
 * CloudAtlas — Bundle Connector del portal interno ST&T Atlas.
 *
 * Declara la infraestructura bajo demanda de la POC: persistencia operativa y de
 * auditoría, almacenamiento del contenido documental Markdown, cola de agregación
 * de métricas con manejo de fallos, y los tres límites de cómputo definidos en
 * ADR-PLAT-002 (API del portal, pasarela MCP y procesamiento asíncrono), más el
 * frontend estático.
 *
 * Restricciones de diseño vigentes:
 * - ADR-PLAT-007: cómputo bajo demanda; sin clúster de contenedores ni NAT Gateway.
 * - ADR-PLAT-008: presupuesto mensual de 50 USD con alertas de desviación.
 * - ADR-PLAT-009: el frontend se sirve como sitio estático, sin cómputo permanente.
 * - La etapa es una POC en cuenta de pruebas: no recibe datos corporativos reales.
 *
 * Archivos relacionados:
 * - `./env.ts` — esquema tipado de variables del stack.
 * - `../modules/api` — API del portal.
 * - `../modules/mcp` — pasarela MCP autenticada.
 * - `../modules/metrics` — consumidor de la cola de métricas.
 * - `../modules/spa` — interfaz web.
 */
export class CloudAtlas extends Stack<CloudAtlasEnv> {
  /** Persistencia operativa: entidades del portafolio, auditoría y agregados. */
  readonly tables = resources<{
    Portfolio: awsInfra.dynamodb.DynamoTable;
    Audit: awsInfra.dynamodb.DynamoTable;
    Metrics: awsInfra.dynamodb.DynamoTable;
  }>();

  /** Almacenamiento del contenido documental Markdown versionado. */
  readonly buckets = resources<{
    Documents: sst.aws.Bucket;
  }>();

  /** Cola de agregación de métricas con su cola de fallos. */
  readonly queues = resources<{
    MetricsEvents: sst.aws.Queue;
    MetricsDeadLetter: sst.aws.Queue;
  }>();

  /** Límites de cómputo por dominio (ADR-PLAT-002). */
  readonly functions = resources<{
    Api: sst.aws.Function;
    Mcp: sst.aws.Function;
    Metrics: sst.aws.Function;
  }>();

  /** Superficie HTTP pública del portal y de la pasarela MCP. */
  readonly gateway = resources<{
    Http: awsInfra.services.ApiGateway;
  }>();

  /** Interfaz web servida como sitio estático. */
  readonly sites = resources<{
    Portal: sst.aws.StaticSite;
  }>();

  constructor() {
    super(() => ({
      app: Env.var('SST_APP').string()!,
      stack: Env.var('SST_STACK').optional.string(),
      retain: Env.var('SST_RETAIN').optional.bool(),
      home: 'aws',
    }), cloudAtlasEnvVisitor);
  }

  async run(): Promise<void> {
    await super.run();

    // 1. Persistencia y almacenamiento: base de estado antes de cualquier cómputo.
    this.initStorage();

    // 2. Mensajería asíncrona para la agregación de métricas.
    this.initMessaging();

    // 3. Límites de cómputo por dominio, con acceso mínimo a los recursos.
    this.initFunctions();

    // 4. Superficie HTTP y rutas hacia cada dominio.
    this.initGateway();

    // 5. Frontend estático apuntando a la API publicada.
    this.initSite();

    // 6. Control de costo: presupuesto con alertas de desviación.
    this.initBudget();
  }

  /**
   * Declara la persistencia operativa y el almacenamiento documental.
   *
   * Las tres tablas usan facturación bajo demanda para evitar capacidad
   * aprovisionada en reposo. `Audit` y `Metrics` habilitan TTL porque su
   * retención está acotada a 24 meses (ADR-MCP-007 y ADR-MET-005).
   */
  private initStorage(): void {
    // Portafolio: proyectos, slices y asignaciones. La clave de orden permite
    // agrupar las entidades de un mismo proyecto sin consultas cruzadas.
    this.tables.Portfolio = new awsInfra.dynamodb.DynamoTable('Portfolio', {
      fields: { pk: 'string', sk: 'string' },
      primaryIndex: { hashKey: 'pk', rangeKey: 'sk' },
    });

    // Auditoría: registro inmutable de cada operación, con expiración por TTL.
    this.tables.Audit = new awsInfra.dynamodb.DynamoTable('Audit', {
      fields: { pk: 'string', sk: 'string' },
      primaryIndex: { hashKey: 'pk', rangeKey: 'sk' },
      ttl: 'expiresAt',
    });

    // Métricas: agregados diarios por persona, slice y proyecto.
    this.tables.Metrics = new awsInfra.dynamodb.DynamoTable('Metrics', {
      fields: { pk: 'string', sk: 'string' },
      primaryIndex: { hashKey: 'pk', rangeKey: 'sk' },
      ttl: 'expiresAt',
    });

    // Contenido Markdown inmutable: el portal solo lo lee, nunca lo edita.
    // Se mantiene privado; el acceso ocurre siempre a través de la API.
    this.buckets.Documents = new sst.aws.Bucket('Documents', {
      versioning: true,
    });
  }

  /**
   * Declara la cola de eventos de métricas y su cola de fallos.
   *
   * Los eventos que no puedan procesarse se retienen para inspección en lugar
   * de descartarse en silencio, según el criterio de continuidad del slice.
   */
  private initMessaging(): void {
    // Cola de fallos: conserva los eventos que agotaron sus reintentos.
    this.queues.MetricsDeadLetter = new sst.aws.Queue('MetricsDeadLetter');

    // Cola principal: alimenta la agregación asíncrona de métricas.
    this.queues.MetricsEvents = new sst.aws.Queue('MetricsEvents', {
      dlq: {
        queue: this.queues.MetricsDeadLetter.arn,
        retry: 3,
      },
    });
  }

  /**
   * Declara los tres límites de cómputo, cada uno con acceso mínimo.
   *
   * La API del portal no recibe permisos sobre la cola; la pasarela MCP sí,
   * porque publica eventos de actividad. El procesador de métricas es el único
   * que consume la cola y el único que escribe agregados.
   */
  private initFunctions(): void {
    // API del portal: lee y escribe portafolio, audita y sirve documentación.
    this.functions.Api = new sst.aws.Function('Api', {
      handler: 'modules/api/src/handler.handler',
      runtime: 'nodejs22.x',
      memory: '512 MB',
      timeout: '30 seconds',
      link: [
        this.tables.Portfolio.nodes.table,
        this.tables.Audit.nodes.table,
        this.tables.Metrics.nodes.table,
        this.buckets.Documents,
      ],
      environment: { ATLAS_ENVIRONMENT: 'noprod' },
    });

    // Pasarela MCP: valida el token, aplica autorización y registra auditoría.
    this.functions.Mcp = new sst.aws.Function('Mcp', {
      handler: 'modules/mcp/src/handler.handler',
      runtime: 'nodejs22.x',
      memory: '512 MB',
      timeout: '30 seconds',
      link: [
        this.tables.Portfolio.nodes.table,
        this.tables.Audit.nodes.table,
        this.buckets.Documents,
        this.queues.MetricsEvents,
      ],
      environment: { ATLAS_ENVIRONMENT: 'noprod' },
    });

    // Procesamiento asíncrono: construye los agregados a partir de la auditoría.
    this.functions.Metrics = new sst.aws.Function('MetricsProcessor', {
      handler: 'modules/metrics/src/handler.handler',
      runtime: 'nodejs22.x',
      memory: '512 MB',
      timeout: '60 seconds',
      link: [this.tables.Audit.nodes.table, this.tables.Metrics.nodes.table],
      environment: { ATLAS_ENVIRONMENT: 'noprod' },
    });

    // La cola invoca al procesador; ningún otro dominio la consume.
    this.queues.MetricsEvents.subscribe(this.functions.Metrics.arn);
  }

  /**
   * Publica la superficie HTTP con rutas separadas por dominio.
   *
   * El portal y la pasarela MCP comparten el mismo gateway pero rutas distintas,
   * de modo que sus permisos y su autorización permanecen separados.
   */
  private initGateway(): void {
    this.gateway.Http = new awsInfra.services.ApiGateway('Http', {
      cors: true,
    });

    // Rutas del portal: consumidas por la SPA autenticada con Google.
    this.gateway.Http.route('ANY /api/{proxy+}', {
      lambda: this.functions.Api.arn,
    });

    // Rutas de la pasarela MCP: consumidas por clientes MCP autenticados.
    // La autorización se resuelve en el servidor, no en el cliente (ADR-MCP-014).
    this.gateway.Http.route('ANY /mcp/{proxy+}', {
      lambda: this.functions.Mcp.arn,
    });
  }

  /**
   * Publica el frontend como sitio estático.
   *
   * En desarrollo, SST sirve la SPA con Vite; en despliegue, publica el build.
   * La URL de la API se inyecta en tiempo de build con el prefijo de Vite.
   */
  private initSite(): void {
    this.sites.Portal = new sst.aws.StaticSite('Portal', {
      path: 'modules/spa',
      build: {
        command: 'npm run build',
        output: 'dist',
      },
      dev: { command: 'npm run dev' },
      environment: {
        VITE_ATLAS_API_URL: this.gateway.Http.url,
        VITE_ATLAS_ENVIRONMENT: 'noprod',
      },
    });
  }

  /**
   * Declara el presupuesto mensual con alertas de desviación (ADR-PLAT-008).
   *
   * El umbral previsto avisa antes de agotar el límite, y el umbral real avisa
   * cuando el gasto proyectado lo supera. Sin esto, el control de costo del
   * slice sería una intención y no una condición verificable.
   */
  private initBudget(): void {
    new aws.budgets.Budget('MonthlyCostBudget', {
      budgetType: 'COST',
      timeUnit: 'MONTHLY',
      limitAmount: '50',
      limitUnit: 'USD',
      notifications: [
        {
          comparisonOperator: 'GREATER_THAN',
          threshold: 80,
          thresholdType: 'PERCENTAGE',
          notificationType: 'ACTUAL',
          subscriberEmailAddresses: [],
        },
        {
          comparisonOperator: 'GREATER_THAN',
          threshold: 100,
          thresholdType: 'PERCENTAGE',
          notificationType: 'FORECASTED',
          subscriberEmailAddresses: [],
        },
      ],
    });
  }
}

/**
 * Factory function — entry point for sst.config.ts
 */
export default () => {
  Config.set('settings.logger.timestamp', false);
  Config.set('settings.logger.colorize', true);
  Config.set('settings.logger.data.style', 'compact');

  return new CloudAtlas();
};
