---
taxonomy: solution
key: fundacion-operacion-plataforma
solution: Fundación y operación de plataforma
initiative: ../../stt-atlas.md
author: Juan Felipe Lamos
created: 2026-09-08
updated: 2026-09-09
status: drafting
language: es
---

# Fundación y operación de plataforma

## 1. Visión general

Esta solución establece el entorno operativo en el que ST&T Atlas se despliega, se observa, se recupera ante fallos y se promueve desde `no-prod` hacia `prod`. Cubre la validación con datos ficticios, el piloto autorizado y las condiciones previas de operación corporativa en AWS.

La solución respeta el objetivo de controlar costo y complejidad: la arquitectura agrupará capacidades por dominios funcionales y solo separará recursos cuando seguridad, escala, dependencia o ciclo de despliegue lo justifiquen.

## 2. Narrativa de la solución

### 2.1 Base de despliegue reproducible

El punto de partida es un repositorio con infraestructura como código que describe el entorno completo de Atlas. El despliegue crea la distribución del frontend estático, la API HTTP del portal, la pasarela MCP, el procesamiento asíncrono de métricas y la persistencia administrada, con etiquetas de proyecto, entorno y dominio funcional en todos los recursos.

Un despliegue no requiere pasos manuales: se ejecuta desde la definición versionada, produce el mismo resultado ante ejecuciones repetidas y falla de forma visible si una dependencia o permiso no está disponible. Los parámetros que cambian entre entornos —dominio, nombres, límites, cuentas y credenciales gestionadas— se resuelven por configuración, nunca embebidos en el código.

### 2.2 Límites de cómputo por dominio

La arquitectura mantiene tres límites de cómputo, cada uno como una función bajo demanda. La API de Atlas atiende las operaciones del portal. La pasarela MCP atiende clientes autenticados de IDE, con su propia superficie de exposición y controles. El procesamiento asíncrono consume eventos auditados para construir agregados de métricas.

Cada límite agrupa las operaciones de su dominio en un mismo despliegue en lugar de crear una función por acción. Esta separación existe porque los tres tienen exposición, patrón de carga y privilegios distintos; cualquier separación adicional deberá justificarse con una diferencia equivalente.

El cómputo se factura por uso y no mantiene capacidad encendida en reposo. El frontend se publica como sitio estático distribuido, de modo que servir la interfaz no consume cómputo. Esta elección responde al límite de presupuesto de la POC: un clúster de contenedores con red privada introduce costo fijo mensual que agotaría el presupuesto antes de recibir tráfico real.

### 2.3 Observabilidad y control de costo

Sobre la base desplegada se habilitan registros estructurados, métricas técnicas y trazas de las operaciones críticas: autenticación, mutaciones del portal, operaciones MCP y procesamiento de métricas. Cada registro identifica entorno, dominio funcional y resultado, sin incluir contenido prohibido por la iniciativa.

Las alarmas cubren errores sostenidos, saturación, latencia por encima del objetivo de sincronización y desviación de costo respecto a un presupuesto declarado. El presupuesto y sus umbrales son un parámetro operativo: la plataforma los aplica, pero su valor corresponde a una decisión administrativa.

### 2.4 Continuidad y recuperación

La plataforma se diseña para tolerar reinicios y fallos transitorios sin pérdida de datos confirmados: las operaciones aceptadas quedan persistidas antes de responder y los procesos asíncronos se reintentan con manejo de fallos permanentes. No se persigue alta disponibilidad multi-región en esta versión.

La recuperación se ejercita: existen copias de respaldo de la persistencia operativa y del contenido documental, y una prueba documentada de restauración sobre un entorno desechable. Un respaldo cuya restauración no se ha verificado no se considera evidencia de continuidad.

### 2.5 Validación de la POC y evidencia para decidir

Con el entorno operativo disponible, `no-prod` recibe automáticamente los cambios integrados y se valida con datos ficticios: proyectos simulados, slices, documentación y eventos de prueba. Esa validación confirma despliegue, observabilidad, recuperación y objetivos de latencia dentro del alcance de la POC.

El resultado esperado de esta etapa no es un servicio productivo, sino evidencia suficiente para decidir si Atlas se convierte en producto operativo: qué funciona, qué cuesta, qué falla y qué haría falta para sostenerlo. La promoción a `prod` con datos corporativos reales se planificará después, cuando exista una cuenta AWS corporativa con propiedad operativa, presupuesto, respaldo y restauración verificada.

Mientras dure la POC, la plataforma evita comunicarse como servicio operativo: el entorno se identifica visiblemente como no productivo y solo se cargan datos ficticios o no sensibles.

## 3. Fuera de alcance

- Conectar datos reales o producir cargas permanentes en la cuenta AWS de pruebas.
- Implementar funciones de acceso, portafolio, MCP, documentación o métricas que pertenecen a soluciones hermanas.
- Alta disponibilidad multi-región, recuperación ante desastres entre regiones y escalado predictivo.
- Definir la cuenta corporativa, el presupuesto y las personas aprobadoras: son decisiones administrativas.

## 4. Contexto técnico

La cuenta actual solo admite pruebas. Antes de producción se requiere una cuenta AWS corporativa con responsables, presupuesto, controles de acceso, monitoreo, respaldos y recuperación comprobada. Desde pruebas deben existir etiquetado, alertas de costo, errores y saturación.

La topología se limita a servicios administrados: distribución de contenido estático para el portal, API HTTP, cómputo agrupado en los tres dominios descritos, persistencia administrada para entidades y auditoría, almacenamiento de objetos para contenido documental y una cola con manejo de fallos para el procesamiento asíncrono.

El acceso entre componentes usa roles de mínimo privilegio por dominio. Los secretos y parámetros se resuelven desde un gestor de configuración, no desde variables incrustadas en el repositorio. El objetivo de sincronización aplicable a la plataforma es el declarado en ADR-PLAT-005.

## 5. Criterios de aceptación

### Base de despliegue reproducible

- Un despliegue desde cero sobre un entorno vacío crea la plataforma completa sin pasos manuales.
- Repetir el despliegue sin cambios no produce modificaciones inesperadas en los recursos.
- Todos los recursos creados exponen etiquetas de proyecto, entorno y dominio funcional.
- Ningún secreto o credencial queda almacenado en el repositorio.

### Límites de cómputo por dominio

- Existen exactamente tres límites de cómputo: API del portal, pasarela MCP y procesamiento asíncrono de métricas.
- Cada límite opera con un rol propio de mínimo privilegio.
- La pasarela MCP no comparte permisos de escritura directa con el procesamiento de métricas.

### Observabilidad y control de costo

- Autenticación, mutaciones del portal, operaciones MCP y procesamiento asíncrono generan registros con entorno, dominio y resultado.
- Existen alarmas activas de errores sostenidos, saturación, latencia y desviación de presupuesto.
- Los registros no contienen secretos, código fuente ni contenido documental completo.

### Continuidad y recuperación

- Una interrupción del cómputo no provoca pérdida de operaciones ya confirmadas.
- Los mensajes asíncronos fallidos quedan retenidos para inspección y reproceso.
- Existe una restauración ejecutada y documentada de la persistencia operativa y del contenido documental sobre un entorno desechable.

### Validación de la POC y evidencia para decidir

- La integración a `no-prod` despliega automáticamente y registra el resultado.
- La validación en `no-prod` con datos ficticios cubre despliegue, observabilidad, recuperación y latencia objetivo.
- El entorno se identifica visiblemente como no productivo.
- La POC no habilita `prod` ni carga datos corporativos reales.
- Existe un informe de resultados con evidencia de funcionamiento, costo observado y limitaciones detectadas.

## 6. Riesgos y supuestos

### Supuestos

- El área administrativa proveerá la autorización para piloto y producción.
- La cuenta AWS actual del entorno de desarrollo puede utilizarse para pruebas técnicas.
- Existirá un dominio corporativo y certificado disponible cuando se habilite el acceso de usuarios.

### Riesgos

- **Promoción desde una cuenta de pruebas**: llevar datos reales a un entorno sin gobierno corporativo compromete continuidad y responsabilidad. Mitigado por el bloqueador de producción y la validación previa en `no-prod`.
- **Desviación de costo**: el consumo puede crecer por reintentos, volumen inesperado o recursos huérfanos. Mitigado por etiquetado, presupuesto declarado y alarmas de desviación.
- **Fragmentación progresiva**: nuevas necesidades pueden multiplicar funciones y permisos. Mitigado por la regla de separar solo ante diferencia de seguridad, escala, dependencia o ciclo de despliegue.
- **Respaldo no verificado**: un respaldo sin restauración probada da falsa confianza. Mitigado por la prueba de restauración como criterio de aceptación.
- **Promoción sin evidencia**: la ausencia de rama de integración puede debilitar los controles. Mitigado por verificaciones automatizadas, evidencia registrada y autorización explícita.

## 7. Registro de decisiones

### 7.1 Decisiones adoptadas

| ID | Decisión | Motivo |
|---|---|---|
| ADR-PLAT-001 | Usar una base serverless administrada: frontend estático distribuido, API HTTP, cómputo por dominios funcionales y persistencia administrada. | Reduce operación continua y costo fijo para un portal interno con carga inicialmente variable, sin crear una función por cada acción. |
| ADR-PLAT-002 | Mantener tres límites de cómputo iniciales: API de Atlas, pasarela MCP y procesamiento asíncrono de métricas. | Separa superficies de seguridad y ritmos de carga relevantes sin fragmentar cada CRUD en Lambdas independientes. |
| ADR-PLAT-003 | Usar infraestructura como código y desplegar automáticamente a `no-prod`; la promoción a `prod` queda fuera del alcance de la POC y requerirá cuenta corporativa, validación automatizada y autorización administrativa. | Hace reproducible el entorno y evita comprometer producción durante una etapa de validación. |
| ADR-PLAT-006 | Ejecutar esta etapa como POC en la cuenta AWS de pruebas, con datos ficticios o no sensibles y con el entorno identificado como no productivo. | Refleja el alcance real acordado y evita que la organización dependa de un entorno sin gobierno corporativo. |
| ADR-PLAT-004 | Definir disponibilidad inicial como servicio tolerante a reinicios, no alta disponibilidad multi-región. | Atiende el objetivo actual de continuidad sin introducir costo y operación desproporcionados para la primera versión. |
| ADR-PLAT-005 | Establecer el SLO inicial de sincronización: 95% de mutaciones MCP aceptadas visibles en su vista canónica en menos de 5 segundos y 99% en menos de 30 segundos. | Convierte “inmediato” en una meta medible y compatible con lecturas y proyecciones asíncronas. |
| ADR-PLAT-007 | Usar cómputo bajo demanda: API HTTP con una función por dominio, DynamoDB on-demand, S3 para contenido documental y SQS con cola de fallos. Se descarta ECS/Fargate para la POC. | Un clúster con subredes privadas exige NAT Gateway, cuyo costo fijo mensual consume por sí solo la mayor parte del presupuesto de 50 USD, sumado a tareas encendidas de forma permanente. El pago por uso mantiene disponibilidad sin costo por inactividad. |
| ADR-PLAT-008 | Fijar un presupuesto mensual de 50 USD con alertas de desviación sobre el gasto etiquetado del proyecto. | Límite operativo definido para la POC; convierte el control de costo en una condición verificable. |
| ADR-PLAT-009 | Publicar el frontend como sitio estático distribuido y no como servicio en contenedor. | Evita cómputo permanente para servir una SPA y reduce el costo a almacenamiento y transferencia. |

### 7.2 Alcance de POC y condición para producción

Esta etapa se ejecuta como POC sobre una cuenta AWS de pruebas. No se conectarán datos corporativos reales ni se promoverá a producción en este alcance. Convertir Atlas en servicio operativo requerirá una decisión posterior y una cuenta AWS corporativa con propietario operativo, presupuesto y alertas, DNS/TLS, control de acceso federado, respaldo y restauración verificada.

### 7.3 Scope Limitations

| ID | Área | Descripción | Motivo | Impacto |
|---|---|---|---|---|
| SL-PLAT-001 | Continuidad | No se implementa alta disponibilidad multi-región ni recuperación entre regiones. | El objetivo actual es tolerancia a reinicios y fallos previsibles. | Una interrupción regional prolongada afectaría la disponibilidad del portal. |
| SL-PLAT-002 | Gobierno | La plataforma no define presupuesto, propietario ni aprobadores. | Son decisiones administrativas fuera del alcance técnico. | La conversión a producción queda condicionada a que se definan. |
| SL-PLAT-003 | Entorno | La POC opera únicamente en `no-prod` con datos ficticios o no sensibles; no se habilita `prod`. | La cuenta disponible es de pruebas y el objetivo es validar viabilidad. | No hay operación corporativa ni compromisos de servicio en esta etapa. |

### 7.4 Technical Debt

| ID | Área | Decisión actual | Alternativa robusta | Motivo | Costo futuro | Disparador | Cuadrante |
|---|---|---|---|---|---|---|---|
| TD-PLAT-001 | Observabilidad | Alarmas y registros básicos por dominio. | Observabilidad con paneles y correlación de trazas de extremo a extremo. | Suficiente para validar la primera versión con bajo costo. | Diagnóstico más lento ante incidentes complejos. | Primer incidente que no se explique con los registros actuales. | Prudent-Deliberate |

## 8. Slices

### Índice

| # | Slice | Objetivo | Est. | Estado |
|---|---|---|---|---|
| 01 | Base desplegable reproducible | Disponer del entorno completo de Atlas creado desde IaC en `no-prod`. | 3d | completed |
| 02 | Límites de cómputo y permisos | Separar los tres dominios de cómputo con roles de mínimo privilegio. | 2d | ai-identified |
| 03 | Observabilidad y alertas de costo | Detectar errores, saturación, latencia y desviación de presupuesto. | 2d | ai-identified |
| 04 | Continuidad y restauración verificada | Probar que los datos confirmados sobreviven y se pueden restaurar. | 3d | ai-identified |
| 05 | Validación y promoción controlada | Promover a `prod` solo con verificación, evidencia y autorización. | 2d | ai-identified |
| | | **Total** | **12d** | |

---

### Slice 01: Base desplegable reproducible

| Campo | Contenido |
|---|---|
| **Objetivo** | Un desarrollador puede crear el entorno completo de Atlas en `no-prod` ejecutando el despliegue versionado. |
| **Flujo** | Cambio integrado → despliegue IaC → creación de frontend, API, pasarela MCP, procesamiento y persistencia → verificación de recursos etiquetados. |
| **Cobertura** | • 2.1: despliegue reproducible y configuración por entorno |
| **Contexto** | Servicios administrados, etiquetado obligatorio, secretos desde gestor de configuración. |
| **Est.** | 3d |
| **Deps** | — |
| **Fuera de alcance** | Funcionalidad de portafolio, MCP, documentación y métricas. |

**Criterios de aceptación**:
- [ ] El despliegue desde cero crea la plataforma sin pasos manuales.
- [ ] Repetirlo sin cambios no genera modificaciones inesperadas.
- [ ] Todos los recursos exponen etiquetas de proyecto, entorno y dominio.
- [ ] No hay secretos en el repositorio.

---

### Slice 02: Límites de cómputo y permisos

| Campo | Contenido |
|---|---|
| **Objetivo** | Los tres dominios operan aislados con permisos mínimos, evitando fragmentación y privilegios amplios. |
| **Flujo** | Definición de dominios → asignación de roles → verificación de accesos permitidos y denegados. |
| **Cobertura** | • 2.2: límites de cómputo por dominio |
| **Contexto** | API del portal, pasarela MCP y procesamiento asíncrono con roles separados. |
| **Est.** | 2d |
| **Deps** | 01 |

**Criterios de aceptación**:
- [ ] Existen exactamente tres límites de cómputo.
- [ ] Cada límite usa un rol propio de mínimo privilegio.
- [ ] La pasarela MCP no comparte permisos de escritura con el procesamiento de métricas.

---

### Slice 03: Observabilidad y alertas de costo

| Campo | Contenido |
|---|---|
| **Objetivo** | El equipo detecta fallas, saturación, latencia y desviaciones de costo sin revisar recursos manualmente. |
| **Flujo** | Operación ejecutada → registro estructurado y métricas técnicas → alarma cuando se cruza un umbral. |
| **Cobertura** | • 2.3: observabilidad y control de costo |
| **Contexto** | Registros sin datos prohibidos; presupuesto como parámetro operativo. |
| **Est.** | 2d |
| **Deps** | 02 |

**Criterios de aceptación**:
- [ ] Autenticación, mutaciones, operaciones MCP y procesamiento generan registros con entorno, dominio y resultado.
- [ ] Hay alarmas activas de errores, saturación, latencia y presupuesto.
- [ ] Los registros no incluyen secretos, código ni contenido documental completo.

---

### Slice 04: Continuidad y restauración verificada

| Campo | Contenido |
|---|---|
| **Objetivo** | Demostrar que Atlas conserva los datos confirmados y puede restaurarlos tras un fallo. |
| **Flujo** | Operación confirmada → interrupción simulada → verificación de persistencia → restauración en entorno desechable. |
| **Cobertura** | • 2.4: continuidad y recuperación |
| **Contexto** | Respaldos de persistencia operativa y contenido documental; manejo de fallos asíncronos. |
| **Est.** | 3d |
| **Deps** | 02 |

**Criterios de aceptación**:
- [ ] Una interrupción del cómputo no pierde operaciones confirmadas.
- [ ] Los mensajes asíncronos fallidos quedan retenidos para reproceso.
- [ ] La restauración se ejecuta y se documenta sobre un entorno desechable.

---

### Slice 05: Validación de la POC y evidencia para decidir

| Campo | Contenido |
|---|---|
| **Objetivo** | Producir evidencia verificable de que Atlas funciona en `no-prod` y de qué haría falta para operarlo, sin habilitar producción. |
| **Flujo** | Integración → despliegue automático a `no-prod` → validación con datos ficticios → registro de resultados, costo y limitaciones. |
| **Cobertura** | • 2.5: validación de la POC y evidencia para decidir |
| **Contexto** | Excepción de rama `integration`; cuenta de pruebas; entorno marcado como no productivo. |
| **Est.** | 2d |
| **Deps** | 03, 04 |
| **Fuera de alcance** | Habilitar `prod`, cargar datos corporativos reales o declarar servicio operativo. |

**Criterios de aceptación**:
- [ ] La integración a `no-prod` despliega automáticamente y registra el resultado.
- [ ] La validación con datos ficticios cubre despliegue, observabilidad, recuperación y latencia objetivo.
- [ ] El entorno se identifica visiblemente como no productivo.
- [ ] Existe un informe con evidencia de funcionamiento, costo observado y limitaciones.
- [ ] No se habilita `prod` ni se cargan datos corporativos reales.
