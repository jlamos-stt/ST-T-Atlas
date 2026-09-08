---
taxonomy: solution
key: sincronizacion-mcp-auditoria
solution: Sincronización MCP y auditoría gobernada
initiative: ../../stt-atlas.md
author: Juan Felipe Lamos
created: 2026-09-08
updated: 2026-09-08
status: drafting
language: es
---

# Sincronización MCP y auditoría gobernada

## 1. Visión general

Esta solución expone el servidor MCP estándar y autenticado que permite a IDEs y agentes actualizar información administrativa de Atlas. Cubre autenticación, autorización, ejecución de herramientas, confirmación de operaciones sensibles, idempotencia, auditoría y respuesta con estado canónico.

Es el punto de conexión diferencial entre el desarrollo asistido por IA y la actualización continua del portal, sin aceptar secretos, datos personales, código fuente ni historial Git.

## 2. Narrativa de la solución

### 2.1 Servidor MCP como recurso protegido

El servidor MCP se publica sobre HTTPS y se comporta como un recurso protegido: recibe solicitudes de clientes MCP, exige un token de acceso válido y nunca emite credenciales propias. Cuando una solicitud llega sin token o con uno inaceptable, responde con un rechazo que indica cómo descubrir los requisitos de autorización del recurso.

La validación es explícita en cada solicitud: firma, emisor esperado, vigencia, audiencia correspondiente a Atlas y alcances asociados a la operación solicitada. Un token emitido para otro destinatario no se acepta ni se reenvía a otro servicio, aunque provenga de un entorno corporativo conocido.

### 2.2 Identidad del actor y del cliente

Cada llamada resuelve dos identidades. La primera es el cliente MCP, es decir, el IDE o agente que ejecuta la solicitud. La segunda es el actor humano al que se atribuye el trabajo, resuelto a partir del perfil corporativo vigente en Atlas.

El MCP no transporta datos personales: recibe un identificador validado y Atlas lo asocia internamente con el perfil corporativo. Si el perfil no existe, está retirado o no tiene rol suficiente, la operación se rechaza. Así la actualización automática nunca amplía los permisos de la persona que trabaja con el agente.

### 2.3 Catálogo de herramientas por dominio

Las capacidades se exponen como herramientas agrupadas por dominio administrativo, no como una herramienta por endpoint técnico. Un grupo cubre proyectos, slices y asignaciones; otro cubre publicación de documentación; otro cubre reporte de actividad y métricas; y un último permite consultar el estado canónico antes de escribir.

Cada herramienta declara su propósito, su esquema de entrada, el alcance que exige y su clasificación de sensibilidad. Un cliente puede descubrir el catálogo, pero solo puede ejecutar aquello que su token autoriza y que el rol del actor permite.

### 2.4 Operaciones automáticas y operaciones sensibles

Las operaciones aditivas o reversibles pueden ejecutarse sin confirmación adicional: registrar actividad, actualizar progreso no terminal, publicar documentación validada y reportar métricas. Son cambios que la auditoría explica y que no alteran propiedad ni acceso.

Las operaciones sensibles requieren confirmación explícita del usuario en el cliente antes de ejecutarse: crear o archivar proyectos, crear, reasignar o eliminar asignaciones, marcar una slice como `completed` y cualquier cambio de rol o baja de perfil. Atlas no confía únicamente en la declaración del agente: valida rol, estado y alcance, y registra que la confirmación fue presentada y aceptada. Si un cliente no puede presentar confirmaciones, sus credenciales no reciben alcances sensibles.

### 2.5 Escrituras idempotentes y estado canónico

Toda operación mutante viaja con una clave de idempotencia y, cuando modifica una entidad existente, con la versión esperada. Si la clave se repite, Atlas devuelve el resultado original en lugar de aplicar el cambio dos veces; si la versión está desactualizada, rechaza la escritura e informa el estado vigente para que el cliente reintente con datos frescos.

El cambio administrativo y su evento de auditoría se registran como una sola unidad lógica: no existe un cambio aceptado sin auditoría, ni una auditoría de un cambio que no se aplicó. La respuesta devuelve el estado canónico resultante, de modo que el agente y el portal comparten la misma verdad inmediatamente después de la escritura.

### 2.6 Auditoría y observabilidad de la sincronización

Cada operación produce un registro inmutable con actor, cliente de origen, herramienta, alcance utilizado, clave de idempotencia, resultado y fecha. Los rechazos también se registran, porque un intento fallido de operación sensible es información de seguridad relevante.

Sobre esos registros se observa la salud de la integración: volumen aceptado y rechazado, latencia hasta que el cambio es visible y reintentos. Esta observación es la que permite verificar el objetivo de sincronización de la plataforma y detectar clientes mal configurados antes de que degraden la confianza en el portal.

### 2.7 Habilitación por interoperabilidad verificada

Antes de habilitar la integración, se valida con el cliente MCP objetivo de la POC, que es Kiro. La verificación cubre descubrimiento de autorización, obtención de token, ejecución de herramientas, comportamiento ante confirmaciones sensibles, manejo de rechazos y reintentos idempotentes.

La selección del servidor de autorización se decide con esa evidencia, no antes: un proveedor que Kiro no pueda usar no es una opción válida. El diseño se mantiene apegado al estándar MCP y sin dependencias propietarias, de modo que otros IDEs puedan incorporarse más adelante superando la misma verificación.

## 3. Fuera de alcance

- Reutilizar tokens de Kiro como credenciales transferibles.
- Sincronizar contenido prohibido por la iniciativa.
- Crear una IA propia o decidir autónomamente la estrategia de desarrollo.
- Emitir tokens o actuar como servidor de autorización.
- Ejecutar acciones sensibles sin confirmación del usuario.
- Recibir PRs, commits, historial Git o código fuente.

## 4. Contexto técnico

Cada operación aceptada debe asociar el cambio y la auditoría en una única operación lógica, incluir clave de idempotencia, controlar concurrencia y devolver estado canónico. Las proyecciones asíncronas no confirman una escritura crítica.

El servidor MCP se despliega en su propio límite de cómputo, con permisos separados de la API del portal y del procesamiento de métricas. Comparte el modelo de versión, origen y auditoría del portafolio, de modo que un cambio hecho por un agente y otro hecho por una persona son comparables y trazables.

Los alcances se conceden por dominio y sensibilidad, con el mínimo privilegio necesario. Los límites de tamaño y frecuencia protegen la disponibilidad frente a clientes defectuosos.

## 5. Criterios de aceptación

### Servidor MCP como recurso protegido

- Una solicitud sin token válido es rechazada e indica cómo descubrir los requisitos de autorización.
- Se rechazan tokens con firma inválida, emisor incorrecto, vencidos o con audiencia ajena a Atlas.
- El servidor no emite tokens ni reenvía el token recibido a otros servicios.

### Identidad del actor y del cliente

- Cada operación registra el cliente de origen y el actor corporativo atribuido.
- Una operación cuyo actor no tiene perfil vigente o rol suficiente es rechazada.
- La solicitud no requiere ni almacena datos personales del actor más allá del vínculo interno.

### Catálogo de herramientas

- El catálogo se agrupa por dominios administrativos y declara esquema, alcance y sensibilidad de cada herramienta.
- Un cliente solo ejecuta herramientas permitidas por su token y por el rol del actor.
- Existe una herramienta de consulta del estado canónico previa a escritura.

### Operaciones automáticas y sensibles

- Las operaciones aditivas o reversibles se ejecutan sin confirmación adicional y quedan auditadas.
- Las operaciones sensibles no se ejecutan sin confirmación explícita registrada.
- Un cliente sin capacidad de confirmación no recibe alcances sensibles.
- El servidor valida rol, estado y alcance aunque el cliente afirme tener autorización.

### Idempotencia y estado canónico

- Repetir una solicitud con la misma clave de idempotencia no duplica el efecto y devuelve el resultado original.
- Una escritura con versión desactualizada es rechazada e informa el estado vigente.
- No existe cambio aceptado sin auditoría ni auditoría de un cambio no aplicado.
- La respuesta incluye el estado canónico resultante.

### Auditoría y observabilidad

- Cada operación, aceptada o rechazada, produce un registro inmutable con actor, cliente, herramienta, alcance, clave, resultado y fecha.
- La auditoría no contiene tokens, secretos ni código fuente.
- Se observan volumen, rechazos, latencia de visibilidad y reintentos de la integración.

### Habilitación por interoperabilidad

- Existe evidencia documentada de la verificación con Kiro como cliente MCP.
- La integración no se habilita antes de completar esa verificación.
- El servidor no depende de comportamientos propietarios de Kiro para funcionar.
- Cualquier IDE adicional se declara compatible solo tras superar la misma verificación.

## 6. Riesgos y supuestos

### Supuestos

- Los IDEs objetivo pueden configurar un cliente MCP con autenticación válida.
- Existirá un servidor de autorización disponible que cumpla los requisitos verificados.
- La solución de portafolio provee el modelo de entidades, versión y auditoría.

### Riesgos

- **Autenticación MCP incompatible o insuficiente**: un cliente podría no soportar el flujo requerido o aceptarse un token indebido. Mitigado por validación estricta, verificación previa con clientes reales y no compartir credenciales humanas.
- **Ejecución sensible sin consentimiento**: un agente podría intentar cambios de propiedad o acceso. Mitigado por clasificación de herramientas, confirmación registrada y validación de rol en el servidor.
- **Duplicación por reintentos**: fallos de red podrían repetir operaciones. Mitigado por clave de idempotencia, versión esperada y auditoría unificada.
- **Escalada de privilegios por agente**: la automatización podría exceder los permisos de la persona. Mitigado al resolver el rol del actor corporativo en cada operación.
- **Cliente defectuoso o excesivo**: un agente mal configurado podría saturar el servicio. Mitigado por límites de tamaño y frecuencia, y por observabilidad de rechazos.
- **Filtración de contenido prohibido**: una herramienta podría recibir datos no permitidos. Mitigado por validación de esquema, rechazo explícito y auditoría del intento.

## 7. Registro de decisiones

### 7.1 Decisiones adoptadas

| ID | Decisión | Motivo |
|---|---|---|
| ADR-MCP-001 | El servidor MCP usará transporte HTTP seguro y se comportará como OAuth Resource Server; validará tokens, audiencia y scopes, pero no reutilizará ni emitirá tokens de otros IDEs. | Es el modelo de seguridad previsto por MCP para servidores HTTP protegidos y evita credenciales transferibles. |
| ADR-MCP-002 | El único cliente MCP objetivo de la POC será Kiro; otros IDEs se declararán compatibles solo tras superar la misma verificación. | Concentra el esfuerzo en el entorno que ST&T usa hoy y evita afirmar compatibilidad sin evidencia. |
| ADR-MCP-003 | La elección del Authorization Server se resolvió con evidencia documental de las capacidades OAuth de Kiro; la verificación funcional permanece en el slice de interoperabilidad. | Un proveedor que Kiro no pueda usar no es una opción válida, por lo que la decisión requería evidencia y no conveniencia. |
| ADR-MCP-011 | El servidor se diseñará conforme al estándar MCP y sin dependencias propietarias de Kiro, aunque solo se verifique con Kiro en la POC. | Permite incorporar otros IDEs después sin rediseñar la integración. |
| ADR-MCP-004 | Herramientas automáticas iniciales: registrar actividad, actualizar progreso no terminal, publicar Markdown validado y reportar métricas agregadas. | Son operaciones reversibles o aditivas que pueden validarse por contrato y auditoría. |
| ADR-MCP-005 | Requerirán confirmación explícita: crear o archivar proyectos; crear, reasignar o eliminar asignaciones; marcar una slice como `completed`; cambios de rol o baja de usuarios. | Estas acciones afectan propiedad, visibilidad, estado final o acceso y no deben depender solo de interpretación del agente. |
| ADR-MCP-006 | Cada solicitud mutante incluirá una clave de idempotencia, versión esperada cuando modifique una entidad y un registro de auditoría inmutable del resultado. | Hace seguros los reintentos y permite reconstruir qué ocurrió sin duplicar efectos. |
| ADR-MCP-007 | La auditoría retendrá eventos operativos durante 24 meses; la retención se revisará antes de producción con la política corporativa de datos. | Da trazabilidad suficiente para el piloto y la operación inicial, con un límite explícito de costo y privacidad. |
| ADR-MCP-008 | Las herramientas se agruparán por dominio administrativo y el alcance se concederá por dominio y sensibilidad. | Evita multiplicar herramientas y permisos por endpoint y facilita el mínimo privilegio. |
| ADR-MCP-009 | El rol efectivo se resolverá siempre desde el perfil corporativo del actor, no desde afirmaciones del cliente. | Impide que la automatización amplíe los permisos de la persona. |
| ADR-MCP-010 | Un cliente que no pueda presentar confirmaciones no recibirá alcances sensibles. | Mantiene el control humano incluso con clientes de capacidades limitadas. |

| ADR-MCP-012 | Usar Amazon Cognito como servidor de autorización del MCP, con un cliente público y PKCE, sin `client_secret`. | Kiro admite clientes públicos en el IDE y solo acepta secretos en la CLI; exigir secreto rompería la compatibilidad. Cognito ya está en AWS, admite resource servers, scopes personalizados e indicadores de recurso, y evita introducir un proveedor externo en la POC. |
| ADR-MCP-013 | Definir scopes por dominio y sensibilidad: `atlas/portfolio.read`, `atlas/portfolio.write`, `atlas/docs.write`, `atlas/metrics.write` y `atlas/admin.sensitive`. | Permite mínimo privilegio por cliente sin multiplicar permisos por herramienta. |
| ADR-MCP-014 | La autorización de operaciones sensibles se resuelve en el servidor mediante rol, estado del perfil y un scope sensible explícito; la confirmación en el cliente es una capa complementaria. | Kiro permite marcar herramientas como `autoApprove`, por lo que la confirmación del cliente no es una garantía y no puede ser el único control. |
| ADR-MCP-015 | Emitir tokens de vida corta y no depender de credenciales de larga duración en el cliente. | Kiro reautentica automáticamente cuando el token expira sin refresh token, por lo que la vida corta no degrada la experiencia. |

### 7.2 Bloqueador resuelto

La investigación documental confirmó que Kiro admite servidores MCP remotos por HTTPS, gestiona el flujo OAuth en navegador, permite un `clientId` preregistrado cuando no hay DCR y acepta clientes públicos con PKCE en el IDE. Con esa evidencia se selecciona Cognito como servidor de autorización y se levanta el bloqueo de diseño.

Permanece pendiente la verificación funcional contra una instancia real de Atlas, cubierta por el slice de interoperabilidad. La especificación MCP mantiene al servidor protegido como recurso OAuth que valida tokens y no los emite. [Referencia MCP](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization)

> **Guía operativa**: [Interoperabilidad OAuth de Kiro con el servidor MCP](./resources/kiro-mcp-oauth-interoperabilidad.md)

### 7.3 Scope Limitations

| ID | Área | Descripción | Motivo | Impacto |
|---|---|---|---|---|
| SL-MCP-001 | Compatibilidad | La POC solo verifica Kiro; no se declara soporte de otros IDEs. | La compatibilidad requiere evidencia por cliente. | Otros entornos quedan fuera hasta ser verificados, aunque el diseño no los excluye. |
| SL-MCP-002 | Autorización | Atlas no emite credenciales ni administra el servidor de autorización. | Fuera del rol de recurso protegido definido. | Depende de un proveedor de identidad externo. |

### 7.4 Technical Debt

| ID | Área | Decisión actual | Alternativa robusta | Motivo | Costo futuro | Disparador | Cuadrante |
|---|---|---|---|---|---|---|---|
| TD-MCP-001 | Alcances | Alcances por dominio y sensibilidad. | Alcances granulares por herramienta y entidad. | Simplifica la primera versión y reduce configuración por cliente. | Permisos más amplios de lo estrictamente necesario. | Cuando un cliente requiera acceso parcial dentro de un dominio. | Prudent-Deliberate |

## 8. Slices

### Índice

| # | Slice | Objetivo | Est. | Estado |
|---|---|---|---|---|
| 01 | Verificación de interoperabilidad MCP | Obtener evidencia de qué clientes y flujo de autorización funcionan. | 3d | ai-identified |
| 02 | Recurso MCP autenticado | Aceptar solo solicitudes con token válido para Atlas. | 3d | ai-identified |
| 03 | Catálogo de herramientas y alcances | Exponer capacidades por dominio con mínimo privilegio. | 2d | ai-identified |
| 04 | Escrituras idempotentes con auditoría | Aplicar cambios seguros con estado canónico y trazabilidad. | 3d | ai-identified |
| 05 | Operaciones sensibles con consentimiento | Impedir cambios críticos sin confirmación humana. | 2d | ai-identified |
| 06 | Observabilidad de la sincronización | Medir salud, latencia y rechazos de la integración. | 2d | ai-identified |
| | | **Total** | **15d** | |

---

### Slice 01: Verificación de interoperabilidad con Kiro

| Campo | Contenido |
|---|---|
| **Objetivo** | Saber con evidencia qué flujo de autorización MCP funciona realmente con Kiro antes de construir la integración definitiva. |
| **Flujo** | Configurar Kiro como cliente MCP → probar descubrimiento y autorización → probar ejecución, confirmaciones y rechazos → documentar resultados y limitaciones. |
| **Cobertura** | • 2.7: habilitación por interoperabilidad verificada |
| **Contexto** | Gate de ADR-MCP-002, ADR-MCP-003 y ADR-MCP-011; sin datos sensibles. |
| **Est.** | 3d |
| **Deps** | — |
| **Fuera de alcance** | Verificar otros IDEs, elegir proveedor sin evidencia o habilitar uso operativo. |

**Criterios de aceptación**:
- [ ] Existe evidencia documentada de la prueba con Kiro.
- [ ] Se registra el comportamiento ante confirmaciones sensibles y rechazos.
- [ ] La recomendación de servidor de autorización se sustenta en los resultados.
- [ ] Se documentan las limitaciones encontradas y su impacto en el diseño.

---

### Slice 02: Recurso MCP autenticado

| Campo | Contenido |
|---|---|
| **Objetivo** | Un cliente MCP autorizado se conecta a Atlas y ninguno sin token válido puede operar. |
| **Flujo** | Solicitud → validación de token y audiencia → resolución de actor corporativo → aceptación o rechazo auditado. |
| **Cobertura** | • 2.1: recurso protegido<br>• 2.2: identidad de actor y cliente |
| **Contexto** | Límite de cómputo propio; sin emisión ni reenvío de tokens. |
| **Est.** | 3d |
| **Deps** | 01 |

**Criterios de aceptación**:
- [ ] Solicitudes sin token válido son rechazadas indicando cómo autorizarse.
- [ ] Se rechazan tokens inválidos, vencidos o de audiencia ajena.
- [ ] Cada operación registra cliente y actor corporativo.
- [ ] Un actor sin perfil vigente o rol suficiente es rechazado.

---

### Slice 03: Catálogo de herramientas y alcances

| Campo | Contenido |
|---|---|
| **Objetivo** | Los agentes descubren capacidades claras por dominio y solo ejecutan lo que su alcance y rol permiten. |
| **Flujo** | Cliente → descubrir catálogo → invocar herramienta permitida → rechazo explícito si falta alcance o rol. |
| **Cobertura** | • 2.3: catálogo de herramientas por dominio |
| **Contexto** | Esquemas declarados, sensibilidad y alcance por dominio; herramienta de consulta canónica. |
| **Est.** | 2d |
| **Deps** | 02 |

**Criterios de aceptación**:
- [ ] El catálogo declara esquema, alcance y sensibilidad por herramienta.
- [ ] Un cliente no ejecuta herramientas fuera de su alcance o del rol del actor.
- [ ] Existe consulta del estado canónico antes de escribir.

---

### Slice 04: Escrituras idempotentes con auditoría

| Campo | Contenido |
|---|---|
| **Objetivo** | Un agente actualiza el portafolio sin duplicar efectos y con trazabilidad verificable. |
| **Flujo** | Solicitud mutante con clave e versión → validación → cambio y auditoría en una unidad lógica → respuesta con estado canónico. |
| **Cobertura** | • 2.5: idempotencia y estado canónico<br>• 2.6: auditoría |
| **Contexto** | Mismo modelo de versión y origen del portafolio. |
| **Est.** | 3d |
| **Deps** | 03 |

**Criterios de aceptación**:
- [ ] Reintentar con la misma clave no duplica el efecto y devuelve el resultado original.
- [ ] Una versión desactualizada se rechaza informando el estado vigente.
- [ ] No hay cambio sin auditoría ni auditoría sin cambio aplicado.
- [ ] La respuesta entrega el estado canónico.

---

### Slice 05: Operaciones sensibles con consentimiento

| Campo | Contenido |
|---|---|
| **Objetivo** | Ningún cambio crítico de propiedad, estado final o acceso ocurre sin autorización humana verificable. |
| **Flujo** | Solicitud sensible → confirmación en el cliente → validación de rol, estado y alcance → ejecución y registro del consentimiento. |
| **Cobertura** | • 2.4: operaciones automáticas y sensibles |
| **Contexto** | ADR-MCP-005 y ADR-MCP-010; validación en servidor. |
| **Est.** | 2d |
| **Deps** | 04 |

**Criterios de aceptación**:
- [ ] Las operaciones sensibles no se ejecutan sin confirmación registrada.
- [ ] Un cliente sin capacidad de confirmación no recibe alcances sensibles.
- [ ] El servidor valida rol, estado y alcance aunque el cliente declare autorización.
- [ ] Los intentos rechazados quedan auditados.

---

### Slice 06: Observabilidad de la sincronización

| Campo | Contenido |
|---|---|
| **Objetivo** | El equipo puede comprobar que la sincronización cumple su objetivo y detectar clientes mal configurados. |
| **Flujo** | Operaciones y rechazos → métricas técnicas de volumen, latencia y reintentos → alertas ante degradación. |
| **Cobertura** | • 2.6: auditoría y observabilidad |
| **Contexto** | SLO de sincronización definido en la plataforma. |
| **Est.** | 2d |
| **Deps** | 04 |

**Criterios de aceptación**:
- [ ] Se observan volumen aceptado, rechazos, latencia de visibilidad y reintentos.
- [ ] Existe alerta cuando la latencia supera el objetivo definido.
- [ ] Los registros no contienen tokens, secretos ni código fuente.
