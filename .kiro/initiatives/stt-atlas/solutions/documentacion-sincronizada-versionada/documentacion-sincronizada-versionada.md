---
taxonomy: solution
key: documentacion-sincronizada-versionada
solution: Documentación sincronizada y versionada
initiative: ../../stt-atlas.md
author: Juan Felipe Lamos
created: 2026-09-08
updated: 2026-09-08
status: drafting
language: es
---

# Documentación sincronizada y versionada

## 1. Visión general

Esta solución recibe documentación Markdown mediante MCP, la valida, conserva versiones inmutables y permite consultar el documento vigente y su historial desde el proyecto o slice correspondiente. Atlas ofrece lectura segura; no permite escribir ni editar Markdown desde la interfaz.

Cada versión debe mantener su hash, actor técnico, origen, fecha y relación con un proyecto o slice, sin transformar Atlas en un repositorio Git alternativo.

## 2. Narrativa de la solución

### 2.1 Recepción y validación del documento

La documentación entra exclusivamente por la herramienta MCP correspondiente. La solicitud declara el proyecto, opcionalmente la slice, el tipo documental, un identificador estable del documento y el contenido Markdown.

Antes de aceptar el contenido, Atlas comprueba que el proyecto exista y admita cambios, que la slice pertenezca a ese proyecto cuando se indique, que el tipo documental sea válido y que el tamaño no exceda el límite definido. Si alguna comprobación falla, la solicitud se rechaza indicando el motivo y el intento queda auditado sin almacenar el contenido.

### 2.2 Versionado inmutable

Cuando el contenido es aceptado, Atlas calcula su hash y lo almacena como un objeto inmutable. Los metadatos de la versión —número secuencial, hash, actor técnico, origen, fecha y vínculo con proyecto o slice— se indexan para consulta.

Si el hash coincide con la versión vigente, la operación es idempotente: no se crea una nueva versión y la respuesta confirma la versión actual. Así, reintentos o publicaciones repetidas del mismo contenido no inflan el historial ni el almacenamiento.

Cuando el contenido cambia, se crea una versión nueva y la anterior permanece intacta. El historial nunca se reescribe: una corrección es siempre una versión posterior.

### 2.3 Consulta contextual del contenido

Desde el detalle de un proyecto, cualquier perfil autenticado ve los documentos disponibles agrupados por tipo y por slice cuando corresponde. Al abrir uno, el portal presenta la versión vigente renderizada de forma legible.

El renderizado aplica una lista permitida de elementos Markdown, bloquea HTML embebido y admite únicamente enlaces seguros. El contenido llega de entornos de desarrollo y se trata como no confiable, de modo que nunca puede ejecutar comportamiento activo dentro del portal.

### 2.4 Historial y trazabilidad

Cada documento expone su historial de versiones con número, fecha, actor técnico y origen. Esto permite responder quién publicó qué y cuándo, sin necesidad de abrir el repositorio de código.

El portal no ofrece edición, comparación visual de diferencias ni restauración: si una versión debe corregirse, el flujo correcto es publicar una versión nueva desde el entorno de desarrollo. Atlas conserva el rastro completo de esa evolución.

### 2.5 Retención y costo del historial

El historial se conserva dentro de límites explícitos: un máximo de versiones por documento y un tamaño máximo por documento. Cuando se supera el número de versiones conservadas en línea, las más antiguas pasan a archivo y siguen siendo referenciables por metadatos.

Estos límites existen para que el versionado no genere crecimiento indefinido de almacenamiento. La política definitiva de retención y borrado se confirmará con la política corporativa de datos antes de operar con información real.

## 3. Fuera de alcance

- Edición de Markdown en Atlas.
- Código fuente, secretos, datos personales e historial Git.
- Sustituir un repositorio documental o Git.
- Comparación visual de diferencias y restauración de versiones desde el portal.
- Comentarios, aprobaciones o flujos de revisión documental.

## 4. Contexto técnico

El contenido se validará por estructura y tamaño y se renderizará con una lista permitida de elementos seguros. Los reintentos no deben crear versiones duplicadas y los rechazos deben quedar auditados.

El contenido se almacena en almacenamiento de objetos como dato inmutable, mientras que los metadatos y el índice de versiones residen en la persistencia administrada. Esta separación mantiene bajo el costo de consulta administrativa y evita transportar contenido extenso en operaciones frecuentes.

La publicación depende de la herramienta MCP autenticada y de su auditoría. Los límites vigentes son 2 MiB por documento y 100 versiones en línea por documento.

## 5. Criterios de aceptación

### Recepción y validación

- Se rechaza una publicación cuyo proyecto no exista o no admita cambios.
- Se rechaza una slice que no pertenezca al proyecto indicado.
- Se rechaza un tipo documental no válido o un contenido que exceda 2 MiB.
- Un rechazo no almacena el contenido y queda auditado con su motivo.

### Versionado inmutable

- Una publicación aceptada crea una versión con número secuencial, hash, actor técnico, origen y fecha.
- Publicar contenido con el mismo hash de la versión vigente no crea una versión nueva.
- Una versión existente no se modifica ni se elimina al publicar contenido nuevo.

### Consulta contextual

- El detalle de proyecto lista los documentos disponibles y su asociación con slices.
- La versión vigente se muestra renderizada de forma legible.
- El renderizado bloquea HTML embebido, scripts y enlaces no permitidos.
- Un perfil administrativo puede consultar la documentación sin poder modificarla.

### Historial y trazabilidad

- Cada documento muestra su historial con número de versión, fecha, actor técnico y origen.
- El portal no ofrece edición, diferencias visuales ni restauración.

### Retención y costo

- Se respeta el límite de versiones en línea por documento.
- Las versiones que exceden el límite quedan archivadas y referenciables por metadatos.

## 6. Riesgos y supuestos

### Supuestos

- La documentación enviada por MCP incluye el contexto administrativo necesario para asociarla a proyecto o slice.
- La solución MCP provee autenticación, autorización y auditoría de la publicación.
- Los artefactos metodológicos habituales caben dentro del límite de tamaño definido.

### Riesgos

- **Markdown malicioso, sobredimensionado o no permitido**: podría afectar seguridad o costo. Mitigado por validación, sanitización, cuotas, hash y pruebas de contenido hostil.
- **Crecimiento de almacenamiento**: el versionado continuo puede acumular contenido. Mitigado por límites de versiones, archivo y revisión de retención.
- **Contenido prohibido**: un agente podría intentar publicar secretos o código. Mitigado por validación, rechazo explícito y auditoría del intento.
- **Expectativa de repositorio documental**: los usuarios podrían esperar edición o restauración. Mitigado por límites de alcance explícitos y por el flujo de nueva versión.
- **Documentos huérfanos**: cambios de proyecto o slice podrían dejar documentos sin contexto claro. Mitigado por validar la relación en cada publicación y conservar el vínculo en los metadatos.

## 7. Registro de decisiones

### 7.1 Decisiones adoptadas

| ID | Decisión | Motivo |
|---|---|---|
| ADR-DOC-001 | Los documentos se asociarán a un proyecto y opcionalmente a una slice; sus tipos iniciales serán `initiative`, `solution`, `slice`, `decision` y `general`. | Cubre los artefactos metodológicos definidos sin exigir un sistema documental genérico. |
| ADR-DOC-002 | El contenido Markdown se almacenará de forma inmutable en almacenamiento de objetos y sus metadatos/versiones se indexarán en la persistencia operativa. | Separa contenido potencialmente grande de consultas administrativas y reduce costo de almacenamiento/transacción. |
| ADR-DOC-003 | Cada publicación conservará hash de contenido, versión secuencial, actor técnico, origen y fecha; si el hash ya es la versión vigente, la solicitud será idempotente. | Evita versiones duplicadas por reintentos y hace verificable el historial. |
| ADR-DOC-004 | Se admitirán hasta 2 MiB por documento y 100 versiones por documento en la primera versión; el contenido más antiguo se conservará en archivo hasta revisión de retención corporativa. | Protege costo y rendimiento sin impedir los artefactos Markdown habituales del flujo. |
| ADR-DOC-005 | El renderizador bloqueará HTML embebido y aplicará una lista permitida de Markdown y enlaces HTTPS seguros. | Reduce XSS y evita que Markdown externo ejecute contenido activo en el portal. |
| ADR-DOC-006 | Una corrección se publica como versión nueva; el historial no se reescribe ni se elimina desde el portal. | Preserva trazabilidad y evita pérdida de evidencia documental. |
| ADR-DOC-007 | No se incorporan estados de borrador ni contenido no publicado. Toda versión recibida por MCP es publicada y visible. | Los mockups mostraban entradas "Borrador", pero el borrador vive en el entorno de desarrollo. Introducirlo exigiría un ciclo de aprobación documental que está fuera de alcance y contradice el propósito de visibilidad inmediata. |

### 7.2 Scope Limitations

| ID | Área | Descripción | Motivo | Impacto |
|---|---|---|---|---|
| SL-DOC-001 | Edición | Atlas será solo lectura para Markdown; no habrá edición, comparación visual de diffs ni restauración de versiones desde la interfaz. | La fuente de contenido es MCP y el objetivo no es reemplazar Git o un editor documental. | La corrección o restauración se enviará como una nueva publicación desde el entorno de desarrollo. |
| SL-DOC-002 | Colaboración | No habrá comentarios, aprobaciones ni flujos de revisión documental. | No forman parte del alcance de la primera versión. | La discusión sigue ocurriendo en las herramientas actuales del equipo. |
| SL-DOC-003 | Ciclo de vida | No existen versiones en estado borrador dentro de Atlas. | El borrador pertenece al entorno de desarrollo y su gestión implicaría un flujo de aprobación no contemplado. | Una versión publicada es inmediatamente visible; no hay retención previa a publicación. |

### 7.3 Future Improvements

| ID | Área | Mejora propuesta | Beneficio | Prioridad | Dependencias |
|---|---|---|---|---|---|
| FI-DOC-001 | Consulta | Comparación de versiones y búsqueda de texto en documentos. | Facilita seguir la evolución documental. | Media | Volumen documental y definición de indexado. |

## 8. Slices

### Índice

| # | Slice | Objetivo | Est. | Estado |
|---|---|---|---|---|
| 01 | Publicación validada de documentos | Aceptar solo documentación válida y asociada a su contexto. | 2d | ai-identified |
| 02 | Versionado inmutable e idempotente | Conservar historial verificable sin duplicar versiones. | 3d | ai-identified |
| 03 | Lectura segura en el portal | Permitir consultar la documentación sin riesgo de contenido activo. | 2d | ai-identified |
| 04 | Historial y retención controlada | Mostrar la evolución documental con límites de costo. | 2d | ai-identified |
| | | **Total** | **9d** | |

---

### Slice 01: Publicación validada de documentos

| Campo | Contenido |
|---|---|
| **Objetivo** | Solo entra documentación correctamente asociada a un proyecto o slice y dentro de los límites permitidos. |
| **Flujo** | Herramienta MCP → validación de proyecto, slice, tipo y tamaño → aceptación o rechazo auditado. |
| **Cobertura** | • 2.1: recepción y validación |
| **Contexto** | Tipos documentales definidos; límite de 2 MiB; auditoría del intento. |
| **Est.** | 2d |
| **Deps** | — |
| **Fuera de alcance** | Renderizado y consulta en el portal. |

**Criterios de aceptación**:
- [ ] Se rechaza un proyecto inexistente o que no admite cambios.
- [ ] Se rechaza una slice que no pertenece al proyecto.
- [ ] Se rechaza un tipo inválido o contenido mayor al límite.
- [ ] El rechazo no almacena contenido y queda auditado.

---

### Slice 02: Versionado inmutable e idempotente

| Campo | Contenido |
|---|---|
| **Objetivo** | Cada publicación queda registrada de forma verificable y los reintentos no ensucian el historial. |
| **Flujo** | Contenido aceptado → hash → objeto inmutable → metadatos de versión → respuesta idempotente si el hash ya es vigente. |
| **Cobertura** | • 2.2: versionado inmutable |
| **Contexto** | Contenido en almacenamiento de objetos; metadatos en persistencia administrada. |
| **Est.** | 3d |
| **Deps** | 01 |

**Criterios de aceptación**:
- [ ] Una publicación crea versión con número, hash, actor técnico, origen y fecha.
- [ ] El mismo hash de la versión vigente no crea versión nueva.
- [ ] Las versiones anteriores no se modifican ni eliminan.

---

### Slice 03: Lectura segura en el portal

| Campo | Contenido |
|---|---|
| **Objetivo** | Cualquier perfil autenticado lee la documentación del proyecto sin exponerse a contenido activo. |
| **Flujo** | Detalle de proyecto → lista de documentos → apertura → renderizado sanitizado de la versión vigente. |
| **Cobertura** | • 2.3: consulta contextual |
| **Contexto** | Lista permitida de Markdown; sin HTML ni scripts; enlaces seguros. |
| **Est.** | 2d |
| **Deps** | 02 |

**Criterios de aceptación**:
- [ ] El detalle lista documentos y su asociación con slices.
- [ ] La versión vigente se muestra legible.
- [ ] Se bloquean HTML embebido, scripts y enlaces no permitidos.
- [ ] Un perfil administrativo consulta sin poder modificar.

---

### Slice 04: Historial y retención controlada

| Campo | Contenido |
|---|---|
| **Objetivo** | El equipo puede seguir la evolución de un documento sin que el historial genere costo indefinido. |
| **Flujo** | Documento → historial de versiones → consulta de versión previa → archivo de versiones excedentes. |
| **Cobertura** | • 2.4: historial y trazabilidad<br>• 2.5: retención y costo |
| **Contexto** | Límite de 100 versiones en línea; política corporativa pendiente de confirmación. |
| **Est.** | 2d |
| **Deps** | 02 |
| **Fuera de alcance** | Restauración y comparación visual de diferencias. |

**Criterios de aceptación**:
- [ ] El historial muestra número, fecha, actor técnico y origen.
- [ ] El portal no ofrece edición, diffs visuales ni restauración.
- [ ] Se respeta el límite de versiones en línea.
- [ ] Las versiones excedentes quedan archivadas y referenciables.
