---
taxonomy: solution
key: metricas-retroalimentacion-operativa
solution: Métricas y retroalimentación operativa
initiative: ../../stt-atlas.md
author: Juan Felipe Lamos
created: 2026-09-08
updated: 2026-09-08
status: drafting
language: es
---

# Métricas y retroalimentación operativa

## 1. Visión general

Esta solución transforma los eventos auditados y la actividad del MCP en métricas por persona, slice y proyecto para consulta en dashboards y retroalimentación diaria. Incluye uso de IA, tokens, líneas de código y actividad únicamente cuando el contrato MCP pueda entregar cada dato de manera confiable.

Los indicadores son visibles para todos los perfiles autenticados, pero deben acompañarse de contexto y reglas de uso para diferenciar la telemetría operativa de una evaluación individual.

## 2. Narrativa de la solución

### 2.1 Catálogo de métricas y su origen

El punto de partida es un catálogo explícito. Cada métrica declara qué mide, de qué evento proviene, cómo se calcula, en qué nivel se agrega, cuánto tiempo se conserva y quién puede verla.

El catálogo inicial se divide en dos familias. La primera son métricas observadas por Atlas: eventos MCP aceptados y rechazados, latencia de sincronización, proyectos actualizados, actividad de slices y desarrolladores activos. La segunda son métricas reportadas por el cliente: tokens consumidos y líneas de código generadas.

Esa distinción es visible para el usuario. Atlas no recibe código fuente ni ejecuta los modelos, por lo que no puede verificar tokens ni líneas: los presenta como valores declarados por el entorno de desarrollo, no como mediciones propias.

### 2.2 Ingesta desde eventos auditados

Las métricas no se capturan por un canal paralelo: se derivan de los eventos ya auditados de portal y MCP. Cuando una operación queda registrada, el procesamiento asíncrono la consume y actualiza los agregados correspondientes.

La ingesta es idempotente. Un evento reprocesado no se cuenta dos veces, porque el agregado se construye a partir de identificadores de evento y no de incrementos ciegos. Los eventos que no pueden procesarse quedan retenidos para inspección en lugar de descartarse en silencio.

### 2.3 Agregación por persona, slice y proyecto

Sobre los eventos válidos se construyen agregados diarios en tres niveles. El nivel de proyecto responde qué tanto avanza y se actualiza el portafolio. El nivel de slice muestra dónde ocurre el trabajo. El nivel de persona atribuye actividad a partir de asignaciones y de la identidad corporativa resuelta en cada operación.

Cada agregado indica la ventana temporal que representa y la última vez que fue recalculado. Cuando aparecen correcciones, reintentos o eventos tardíos, el día afectado se recalcula, de modo que el histórico converge hacia la auditoría en lugar de conservar cifras inconsistentes.

### 2.4 Consulta de indicadores

El dashboard general muestra los indicadores agregados de todos los proyectos, suficientes para entender la actividad reciente y la salud de la sincronización. Dentro de un proyecto o una slice, los mismos indicadores aparecen contextualizados en su alcance.

Cada indicador se presenta con su significado y su naturaleza: métrica observada o valor reportado por cliente. También se indica la frescura del dato, porque los agregados se procesan de forma asíncrona y no sirven como confirmación de una escritura individual.

Todos los perfiles autenticados ven las mismas métricas, incluidas las de personas. Atlas no publica rankings, puntajes de productividad ni recomendaciones disciplinarias automáticas: entrega datos con contexto para que la conversación de retroalimentación la conduzcan las personas.

### 2.5 Retroalimentación diaria

Al cierre de cada día los agregados están disponibles para revisión. La lectura combina adopción —quién usó el MCP y con qué frecuencia—, actualización —qué proyectos se mantuvieron al día— y confiabilidad —cuántas operaciones fueron rechazadas y con qué latencia se reflejaron.

Con esa base, el equipo puede detectar rápido dos situaciones distintas: un uso irregular de la integración y una configuración defectuosa de un cliente. Ambas se atienden de forma diferente, y el portal ofrece la evidencia para distinguirlas en lugar de suponerlo.

## 3. Fuera de alcance

- Capturar secretos, código fuente, datos personales o historial Git.
- Inferir productividad o realizar evaluación automatizada de personas.
- Afirmar métricas que el contrato MCP no pueda respaldar.
- Rankings, comparativas de desempeño y alertas disciplinarias.
- Análisis o recomendaciones generadas por IA sobre las métricas.
- Costos monetarios de proveedores de IA y facturación.

## 4. Contexto técnico

Los agregados pueden procesarse de forma asíncrona, pero deben reconciliarse frente a eventos auditados e idempotentes. El catálogo debe definir finalidad, fórmula, campos, retención, visibilidad y uso permitido antes del piloto.

El procesamiento ocurre en el límite de cómputo asíncrono definido por la plataforma y consume eventos de auditoría del portal y del MCP. Los agregados se conservan 24 meses y no almacenan contenido documental ni datos personales adicionales a la identidad corporativa ya presente en Atlas.

La visibilidad se aplica en el servidor: cualquier perfil autenticado puede consultar los indicadores definidos como visibles, y no existen vistas de métricas fuera del catálogo aprobado.

## 5. Criterios de aceptación

### Catálogo de métricas

- Cada métrica publicada existe en el catálogo con finalidad, fuente, fórmula, nivel, retención y visibilidad.
- Las métricas reportadas por cliente están identificadas como tales en la interfaz.
- No se muestran métricas que el contrato MCP no entregue de forma explícita.

### Ingesta

- Los agregados se derivan de eventos auditados de portal y MCP.
- Reprocesar un evento no altera el resultado del agregado.
- Un evento que no puede procesarse queda retenido para inspección y no se descarta.

### Agregación

- Existen agregados diarios por proyecto, slice y persona.
- La atribución por persona usa la identidad corporativa registrada en la operación.
- Cada agregado indica su ventana temporal y su última actualización.
- Una corrección o evento tardío provoca el recálculo del día afectado.

### Consulta

- El dashboard muestra indicadores agregados de todos los proyectos.
- Los indicadores aparecen contextualizados dentro de un proyecto o slice.
- Cada indicador informa su naturaleza y la frescura del dato.
- Todos los perfiles autenticados pueden consultar las métricas definidas como visibles.
- No se presentan rankings, puntajes de productividad ni recomendaciones disciplinarias.

### Retroalimentación diaria

- Al cierre del día los agregados del día están disponibles.
- Es posible distinguir adopción de la integración frente a fallos de configuración de un cliente.
- Los datos permiten identificar proyectos sin actualización reciente.

## 6. Riesgos y supuestos

### Supuestos

- MCP reportará eventos y atributos suficientes, válidos y autorizados para calcular métricas.
- Las asignaciones del portafolio permiten atribuir actividad a personas.
- La plataforma provee el procesamiento asíncrono y su manejo de fallos.

### Riesgos

- **Conclusiones injustificadas por métricas individuales**: podrían interpretarse como evaluación de desempeño. Mitigado por política de uso, contexto, minimización de datos, trazabilidad y ausencia de rankings.
- **Datos reportados poco confiables**: tokens y líneas dependen del cliente. Mitigado al etiquetarlos como reportados y no usarlos como medida oficial de rendimiento.
- **Métricas incompletas por adopción parcial**: si pocos clientes reportan, los agregados no representan la realidad. Mitigado al mostrar cobertura de adopción junto a los indicadores.
- **Doble conteo o pérdida de eventos**: reintentos y fallos pueden distorsionar cifras. Mitigado por ingesta idempotente, retención de eventos fallidos y recálculo diario.
- **Costo de almacenamiento y procesamiento**: el histórico puede crecer. Mitigado por agregados diarios, retención de 24 meses y alarmas de costo de la plataforma.

## 7. Registro de decisiones

### 7.1 Decisiones adoptadas

| ID | Decisión | Motivo |
|---|---|---|
| ADR-MET-001 | El catálogo inicial incluirá: eventos MCP aceptados/rechazados, latencia de sincronización, proyectos actualizados, actividad de slices, desarrolladores activos, tokens reportados y líneas generadas reportadas. | Mide adopción, actualización y confiabilidad; tokens y líneas solo se muestran cuando el cliente MCP las declara explícitamente. |
| ADR-MET-002 | Tokens y líneas de código se etiquetarán como métricas reportadas por cliente, no como mediciones independientes de Atlas. | Atlas no recibe código fuente ni puede verificar estos valores directamente. |
| ADR-MET-003 | Se calcularán agregados diarios por persona, slice y proyecto; los eventos de auditoría serán la fuente de reconciliación. | Habilita el feedback diario pedido sin usar proyecciones no verificadas como fuente de verdad. |
| ADR-MET-004 | Las métricas serán visibles a todo perfil autenticado, pero Atlas no mostrará rankings, puntajes de productividad ni recomendaciones disciplinarias automáticas. | Respeta la visibilidad corporativa acordada y reduce el riesgo de interpretar telemetría como evaluación automática de personas. |
| ADR-MET-005 | Los agregados se conservarán 24 meses y se recalcularán cuando existan reintentos o correcciones de eventos. | Alinea el horizonte de análisis con la auditoría inicial y conserva consistencia de datos. |
| ADR-MET-006 | La ingesta se derivará de los eventos auditados y será idempotente por identificador de evento. | Evita canales paralelos de telemetría y previene doble conteo. |
| ADR-MET-007 | Cada indicador expondrá su naturaleza y la frescura del dato. | Impide que un agregado asíncrono se interprete como confirmación de una escritura. |

### 7.2 Scope Limitations

| ID | Área | Descripción | Motivo | Impacto |
|---|---|---|---|---|
| SL-MET-001 | Analítica | No habrá rankings, comparativas de desempeño ni evaluación automatizada. | Riesgo de interpretar telemetría como medición de personas. | La retroalimentación la conducen personas con contexto. |
| SL-MET-002 | Alcance de datos | No se incluirán costos monetarios de proveedores de IA. | No forman parte del contrato MCP definido. | El análisis financiero se mantiene fuera de Atlas. |

### 7.3 Future Improvements

| ID | Área | Mejora propuesta | Beneficio | Prioridad | Dependencias |
|---|---|---|---|---|---|
| FI-MET-001 | Métricas | Añadir análisis asistido por IA o recomendaciones sobre métricas. | Mayor capacidad de detectar patrones y oportunidades. | Media | Política corporativa, datos suficientes y evaluación C3D si introduce incertidumbre AI propia. |
| FI-MET-002 | Métricas | Exportación de agregados para análisis externo. | Facilita reportes corporativos sin ampliar el portal. | Baja | Política de datos y formato acordado. |

## 8. Slices

### Índice

| # | Slice | Objetivo | Est. | Estado |
|---|---|---|---|---|
| 01 | Catálogo de métricas aprobado | Definir qué se mide, cómo y con qué reglas de uso. | 2d | ai-identified |
| 02 | Ingesta idempotente de eventos | Derivar métricas de la auditoría sin doble conteo. | 3d | ai-identified |
| 03 | Agregados diarios multinivel | Obtener métricas por proyecto, slice y persona. | 3d | ai-identified |
| 04 | Consulta de indicadores en el portal | Presentar métricas con contexto y frescura. | 2d | ai-identified |
| 05 | Revisión diaria de adopción | Habilitar retroalimentación basada en evidencia. | 2d | ai-identified |
| | | **Total** | **12d** | |

---

### Slice 01: Catálogo de métricas aprobado

| Campo | Contenido |
|---|---|
| **Objetivo** | El equipo comparte una definición única de cada métrica, su origen y su uso permitido antes de publicarla. |
| **Flujo** | Definir métricas → declarar fuente, fórmula, nivel, retención y visibilidad → aprobar catálogo. |
| **Cobertura** | • 2.1: catálogo de métricas y su origen |
| **Contexto** | Separación entre métricas observadas y reportadas por cliente. |
| **Est.** | 2d |
| **Deps** | — |
| **Fuera de alcance** | Implementación de la ingesta. |

**Criterios de aceptación**:
- [ ] Cada métrica del catálogo declara finalidad, fuente, fórmula, nivel, retención y visibilidad.
- [ ] Las métricas reportadas por cliente están identificadas.
- [ ] No se contempla ninguna métrica sin fuente disponible en el contrato MCP.

---

### Slice 02: Ingesta idempotente de eventos

| Campo | Contenido |
|---|---|
| **Objetivo** | Las métricas provienen de la auditoría y no se distorsionan con reintentos o fallos. |
| **Flujo** | Evento auditado → procesamiento asíncrono → actualización de agregado por identificador de evento → retención de fallidos. |
| **Cobertura** | • 2.2: ingesta desde eventos auditados |
| **Contexto** | Límite de cómputo asíncrono; manejo de fallos de la plataforma. |
| **Est.** | 3d |
| **Deps** | 01 |

**Criterios de aceptación**:
- [ ] Los agregados se derivan de eventos auditados de portal y MCP.
- [ ] Reprocesar un evento no altera el resultado.
- [ ] Un evento no procesable queda retenido para inspección.

---

### Slice 03: Agregados diarios multinivel

| Campo | Contenido |
|---|---|
| **Objetivo** | Disponer de métricas comparables por proyecto, slice y persona con convergencia hacia la auditoría. |
| **Flujo** | Eventos válidos → agregación diaria en tres niveles → recálculo del día ante correcciones o eventos tardíos. |
| **Cobertura** | • 2.3: agregación por persona, slice y proyecto |
| **Contexto** | Atribución por identidad corporativa y asignaciones; retención de 24 meses. |
| **Est.** | 3d |
| **Deps** | 02 |

**Criterios de aceptación**:
- [ ] Existen agregados diarios por proyecto, slice y persona.
- [ ] La atribución usa la identidad corporativa registrada.
- [ ] Cada agregado indica ventana temporal y última actualización.
- [ ] Una corrección provoca recálculo del día afectado.

---

### Slice 04: Consulta de indicadores en el portal

| Campo | Contenido |
|---|---|
| **Objetivo** | Cualquier perfil autenticado interpreta las métricas correctamente, sin confundirlas con evaluación de personas. |
| **Flujo** | Dashboard o detalle → indicadores agregados → naturaleza y frescura del dato. |
| **Cobertura** | • 2.4: consulta de indicadores |
| **Contexto** | Visibilidad aplicada en servidor; sin rankings ni puntajes. |
| **Est.** | 2d |
| **Deps** | 03 |

**Criterios de aceptación**:
- [ ] El dashboard presenta indicadores agregados de todos los proyectos.
- [ ] Los indicadores aparecen contextualizados en proyecto y slice.
- [ ] Cada indicador informa naturaleza y frescura.
- [ ] No se muestran rankings, puntajes ni recomendaciones disciplinarias.

---

### Slice 05: Revisión diaria de adopción

| Campo | Contenido |
|---|---|
| **Objetivo** | El equipo puede revisar cada día si la integración se usa y si funciona, con evidencia para actuar. |
| **Flujo** | Cierre del día → agregados disponibles → lectura de adopción, actualización y confiabilidad. |
| **Cobertura** | • 2.5: retroalimentación diaria |
| **Contexto** | Distinción entre uso irregular y cliente mal configurado. |
| **Est.** | 2d |
| **Deps** | 04 |
| **Fuera de alcance** | Evaluación de desempeño y acciones automáticas. |

**Criterios de aceptación**:
- [ ] Los agregados del día están disponibles al cierre.
- [ ] Es posible distinguir baja adopción de fallos de configuración.
- [ ] Se identifican proyectos sin actualización reciente.
