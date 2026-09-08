---
taxonomy: solution
key: gestion-portafolio-desarrollo
solution: Gestión de portafolio de desarrollo
initiative: ../../stt-atlas.md
author: Juan Felipe Lamos
created: 2026-09-08
updated: 2026-09-08
status: drafting
language: es
---

# Gestión de portafolio de desarrollo

## 1. Visión general

Esta solución proporciona el recorrido principal de Atlas: dashboard general, listado de proyectos y detalle de proyectos con slices, asignaciones, documentación, actividad y métricas. Los desarrolladores gestionan proyectos, slices y asignaciones; los administrativos consultan la misma información sin modificarla.

Las mutaciones deben conservar su origen y convivir con futuras actualizaciones recibidas por MCP.

## 2. Narrativa de la solución

### 2.1 Proyectos como unidad de portafolio

El portafolio se construye sobre el proyecto. Un desarrollador crea un proyecto con nombre, identificador legible y descripción breve, y este nace en estado `draft`. Cuando el trabajo comienza pasa a `active`; si se detiene temporalmente queda `paused`; y al concluir se `archived`, conservando su historia sin admitir nuevas modificaciones operativas.

Cada creación o actualización registra quién la realizó, cuándo y desde qué origen. Los proyectos archivados siguen siendo consultables, de modo que el portafolio funciona también como registro histórico y no solo como lista de trabajo en curso.

### 2.2 Slices como unidad de avance

Sobre un proyecto activo se registran sus slices: unidades de trabajo funcional de extremo a extremo. Una slice tiene nombre, objetivo breve, estado y una etiqueta opcional de agrupación que permite representar fases sin crear una entidad separada.

El estado de una slice avanza entre `planned`, `in-progress`, `blocked` y `completed`. El progreso del proyecto se deriva de sus slices, de modo que actualizar una slice actualiza la lectura del proyecto sin exigir un doble registro manual.

### 2.3 Asignación de responsables

Con proyectos y slices establecidos, un desarrollador asigna personas a slices. Cada asignación vincula un perfil activo con una slice e indica si su responsabilidad es `lead` o `contributor`. Una slice puede tener varias personas, y la misma persona puede participar en varias slices.

Las asignaciones se pueden modificar y eliminar. Eliminar una asignación no borra el historial: la auditoría conserva quién asignó, quién fue asignado y cuándo cambió, de modo que la atribución de actividad pasada permanece válida.

### 2.4 Consulta del portafolio

La entrada al portal es un dashboard minimalista con indicadores agregados: proyectos activos, slices en curso, actividad reciente y estado general de sincronización. Desde allí se accede a un listado completo de proyectos con su estado y avance.

Al abrir un proyecto se presenta su detalle: descripción, estado, slices con su avance, asignaciones, documentación disponible, actividad reciente y métricas asociadas. Los perfiles administrativos recorren exactamente la misma información en modo consulta, sin acciones de modificación disponibles ni permitidas por el servidor.

### 2.5 Concurrencia entre portal y MCP

Como las entidades pueden cambiar desde el portal o desde un cliente MCP, cada entidad mantiene una versión y cada mutación declara su origen. Una escritura que llega con una versión desactualizada se rechaza e informa el estado vigente, en lugar de sobrescribir silenciosamente el cambio previo.

Esta regla se aplica igual a personas y agentes. La consecuencia práctica es que el portal siempre puede mostrar un estado canónico coherente y explicar, mediante la auditoría, qué actor produjo cada cambio y en qué orden.

## 3. Fuera de alcance

- PRs, commits, código fuente e historial Git.
- Permisos por proyecto.
- Edición de documentación Markdown.
- Fases como entidad independiente con ciclo de vida propio.
- Estimaciones, cronogramas, dependencias entre slices y gestión de capacidad.
- Definición visual final, mockups y branding.

## 4. Contexto técnico

La interfaz no tiene que enseñar la metodología AI-First. El diseño visual y los mockups con branding son un hito posterior. La auditoría es obligatoria para mutaciones y debe distinguir su origen.

Las entidades del portafolio —proyecto, slice y asignación— residen en la persistencia administrada definida por la plataforma y comparten el mismo modelo de versión y auditoría que usarán las operaciones MCP. Las lecturas del detalle de proyecto deben resolverse contra el estado canónico; los indicadores agregados del dashboard pueden provenir de proyecciones y no se usan como confirmación de una escritura.

La autorización se evalúa en el servidor según el rol global del perfil, conforme a la solución de acceso corporativo.

## 5. Criterios de aceptación

### Proyectos

- Un desarrollador crea un proyecto con nombre, identificador legible y descripción.
- Un proyecto transita entre `draft`, `active`, `paused` y `archived`.
- Un proyecto archivado permanece consultable y no admite nuevas mutaciones operativas.
- Cada creación o actualización registra actor, fecha y origen.

### Slices

- Un desarrollador crea slices asociadas a un proyecto con nombre, objetivo y estado inicial.
- Una slice transita entre `planned`, `in-progress`, `blocked` y `completed`.
- Una slice admite una etiqueta opcional de agrupación o fase.
- El avance mostrado del proyecto refleja el estado de sus slices sin registro manual duplicado.

### Asignaciones

- Un desarrollador asigna un perfil activo a una slice con responsabilidad `lead` o `contributor`.
- Una slice admite múltiples asignaciones y una persona puede estar en varias slices.
- Modificar o eliminar una asignación conserva el historial en auditoría.
- No es posible asignar un perfil retirado.

### Consulta del portafolio

- El dashboard muestra indicadores agregados de proyectos, slices y actividad reciente.
- El listado de proyectos permite abrir el detalle de cada proyecto.
- El detalle muestra slices, asignaciones, documentación disponible, actividad y métricas.
- Un perfil administrativo consulta la misma información y no puede ejecutar mutaciones, incluso llamando directamente a la API.

### Concurrencia

- Cada entidad expone una versión y cada mutación registra su origen (`portal` o `mcp`).
- Una escritura con versión desactualizada es rechazada e informa el estado vigente.
- La auditoría permite reconstruir el orden de los cambios y el actor de cada uno.

## 6. Riesgos y supuestos

### Supuestos

- Todos los usuarios corporativos pueden visualizar los mismos proyectos inicialmente.
- La solución de acceso corporativo provee perfiles válidos, roles y estado activo.
- La plataforma provee la persistencia, observabilidad y despliegue necesarios.

### Riesgos

- **Conflicto entre cambios manuales y MCP**: dos actores podrían modificar la misma entidad. Mitigado por versión de entidad, rechazo de escrituras desactualizadas, origen registrado y auditoría.
- **Lectura inconsistente en el dashboard**: los agregados pueden ir por detrás del estado canónico. Mitigado al resolver el detalle contra el estado canónico y no usar proyecciones como confirmación.
- **Modelo insuficiente para planificación**: la ausencia de fases, estimaciones y dependencias puede generar expectativas mayores. Mitigado por límites explícitos de alcance y por la etiqueta de agrupación en slices.
- **Autorización incompleta**: ocultar acciones en la interfaz no impide llamadas directas. Mitigado por evaluación de rol en el servidor para cada mutación.
- **Asignaciones inválidas**: asignar perfiles retirados degradaría métricas y responsabilidad. Mitigado por validar el estado del perfil al crear o modificar asignaciones.

## 7. Registro de decisiones

### 7.1 Decisiones adoptadas

| ID | Decisión | Motivo |
|---|---|---|
| ADR-PORT-001 | Un proyecto tendrá los estados `draft`, `active`, `paused` y `archived`. | Distingue preparación, ejecución, suspensión y cierre sin añadir un flujo complejo de estados. |
| ADR-PORT-002 | Una slice será la unidad mínima de trabajo funcional de extremo a extremo y tendrá los estados `planned`, `in-progress`, `blocked` y `completed`. | Mantiene la definición de slice de la metodología y permite reportar progreso sin modelar una entidad de fase duplicada. |
| ADR-PORT-003 | La primera versión no creará una entidad independiente de fase; si se necesita, una slice podrá incluir un campo de agrupación o etiqueta de fase. | El usuario indicó que una fase puede considerarse slice; esta decisión evita duplicar ciclos de vida y simplifica el modelo inicial. |
| ADR-PORT-004 | Una asignación vincula una persona con una slice e indica responsabilidad `lead` o `contributor`. | Permite atribución y métricas sin introducir jerarquías de equipo no definidas. |
| ADR-PORT-005 | Cada mutación llevará versión de entidad y origen (`portal` o `mcp`). Las escrituras desactualizadas serán rechazadas y el cliente deberá consultar el estado canónico antes de reintentar. | Evita que el último escritor sobrescriba silenciosamente cambios manuales o enviados por agentes. |
| ADR-PORT-006 | El avance del proyecto se deriva del estado de sus slices y no se captura como campo manual independiente. | Evita datos contradictorios entre proyecto y slices. |
| ADR-PORT-007 | Un proyecto archivado se conserva como registro consultable y no admite nuevas mutaciones operativas. | Preserva historia sin mantener trabajo cerrado como activo. |

### 7.2 Scope Limitations

| ID | Área | Descripción | Motivo | Impacto |
|---|---|---|---|---|
| SL-PORT-001 | Modelo operativo | No se modelan fases como entidad independiente en la primera versión. | Se solapan con slices y no existe una definición adicional aprobada. | Si se requiere planificación por fases con reglas propias, se añadirá posteriormente. |
| SL-PORT-002 | Planificación | No se incluyen estimaciones, fechas comprometidas, dependencias entre slices ni capacidad por persona. | No forman parte del alcance acordado para la primera versión. | El portal informa avance y responsabilidad, no planificación predictiva. |

### 7.3 Future Improvements

| ID | Área | Mejora propuesta | Beneficio | Prioridad | Dependencias |
|---|---|---|---|---|---|
| FI-PORT-001 | Portafolio | Vista de dependencias y secuencia entre slices. | Mejor lectura de bloqueos y orden de trabajo. | Media | Modelo de dependencias aprobado. |
| FI-PORT-002 | Consulta | Filtros y búsqueda avanzada por estado, persona y etiqueta. | Navegación más rápida cuando crezca el portafolio. | Baja | Volumen de datos que lo justifique. |

## 8. Slices

### Índice

| # | Slice | Objetivo | Est. | Estado |
|---|---|---|---|---|
| 01 | Registro de proyectos | Permitir crear y mantener proyectos con su ciclo de estados. | 2d | ai-identified |
| 02 | Registro de slices y avance | Registrar slices y derivar el avance del proyecto. | 2d | ai-identified |
| 03 | Asignación de responsables | Vincular personas a slices con responsabilidad clara. | 2d | ai-identified |
| 04 | Dashboard y detalle de proyecto | Ofrecer la lectura centralizada del portafolio. | 3d | ai-identified |
| 05 | Control de concurrencia y origen | Evitar sobrescrituras entre portal y MCP. | 2d | ai-identified |
| | | **Total** | **11d** | |

---

### Slice 01: Registro de proyectos

| Campo | Contenido |
|---|---|
| **Objetivo** | Un desarrollador registra los proyectos de la corporación y refleja su estado real de ejecución. |
| **Flujo** | Desarrollador → crear proyecto → cambiar estado según avance → archivar al cerrar → auditoría de cada cambio. |
| **Cobertura** | • 2.1: proyectos como unidad de portafolio |
| **Contexto** | Autorización por rol en servidor; auditoría con actor, fecha y origen. |
| **Est.** | 2d |
| **Deps** | — |

**Criterios de aceptación**:
- [ ] Se crea un proyecto con nombre, identificador legible y descripción.
- [ ] El proyecto transita entre `draft`, `active`, `paused` y `archived`.
- [ ] Un proyecto archivado es consultable y no admite mutaciones operativas.
- [ ] Cada cambio registra actor, fecha y origen.

---

### Slice 02: Registro de slices y avance

| Campo | Contenido |
|---|---|
| **Objetivo** | El avance de un proyecto se entiende a partir de sus slices, sin registros manuales duplicados. |
| **Flujo** | Desarrollador → crear slice en un proyecto → actualizar su estado → el avance del proyecto se recalcula. |
| **Cobertura** | • 2.2: slices como unidad de avance |
| **Contexto** | Etiqueta opcional de agrupación en lugar de entidad fase. |
| **Est.** | 2d |
| **Deps** | 01 |

**Criterios de aceptación**:
- [ ] Se crean slices asociadas a un proyecto con nombre, objetivo y estado inicial.
- [ ] La slice transita entre `planned`, `in-progress`, `blocked` y `completed`.
- [ ] La slice admite una etiqueta opcional de agrupación.
- [ ] El avance del proyecto refleja el estado de sus slices.

---

### Slice 03: Asignación de responsables

| Campo | Contenido |
|---|---|
| **Objetivo** | Cada slice muestra quién es responsable y quién contribuye, habilitando atribución de actividad. |
| **Flujo** | Desarrollador → asignar perfil activo a slice → definir `lead` o `contributor` → modificar o eliminar con historial. |
| **Cobertura** | • 2.3: asignación de responsables |
| **Contexto** | Validación del estado del perfil; auditoría de altas y bajas de asignación. |
| **Est.** | 2d |
| **Deps** | 02 |

**Criterios de aceptación**:
- [ ] Se asigna un perfil activo con responsabilidad `lead` o `contributor`.
- [ ] Una slice admite múltiples asignaciones y una persona varias slices.
- [ ] No es posible asignar un perfil retirado.
- [ ] Modificar o eliminar una asignación conserva el historial.

---

### Slice 04: Dashboard y detalle de proyecto

| Campo | Contenido |
|---|---|
| **Objetivo** | Cualquier perfil autenticado entiende el estado del portafolio y puede profundizar en un proyecto. |
| **Flujo** | Ingreso → dashboard con indicadores → listado de proyectos → detalle con slices, asignaciones, documentación, actividad y métricas. |
| **Cobertura** | • 2.4: consulta del portafolio |
| **Contexto** | Detalle contra estado canónico; agregados desde proyecciones; modo consulta para administrativos. |
| **Est.** | 3d |
| **Deps** | 03 |
| **Fuera de alcance** | Diseño visual definitivo y branding. |

**Criterios de aceptación**:
- [ ] El dashboard muestra indicadores agregados de proyectos, slices y actividad.
- [ ] El listado permite abrir el detalle de un proyecto.
- [ ] El detalle presenta slices, asignaciones, documentación, actividad y métricas.
- [ ] Un perfil administrativo no puede mutar datos ni desde la API.

---

### Slice 05: Control de concurrencia y origen

| Campo | Contenido |
|---|---|
| **Objetivo** | Los cambios del portal y del MCP conviven sin sobrescrituras silenciosas y con trazabilidad de actor. |
| **Flujo** | Mutación → verificación de versión esperada → aceptación con registro de origen o rechazo con estado vigente. |
| **Cobertura** | • 2.5: concurrencia entre portal y MCP |
| **Contexto** | Mismo modelo de versión y auditoría que usarán las operaciones MCP. |
| **Est.** | 2d |
| **Deps** | 01, 02, 03 |

**Criterios de aceptación**:
- [ ] Cada entidad expone versión y cada mutación registra origen.
- [ ] Una escritura desactualizada es rechazada e informa el estado vigente.
- [ ] La auditoría permite reconstruir el orden de cambios y su actor.
