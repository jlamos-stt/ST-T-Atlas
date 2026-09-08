---
taxonomy: initiative
key: stt-atlas
initiative: ST&T Atlas
id: STTA-001
language: es
author: Juan Felipe Lamos
product_owner: Juan Felipe Lamos
created: 2026-09-08
updated: 2026-09-08
status: planning
project: ST&T
---

# ST&T Atlas

## 1. Contexto y problema

ST&T está adoptando una metodología de desarrollo AI-First, pero no dispone de un espacio interno único que haga visible el trabajo de desarrollo de forma alineada con esa metodología. El estado de proyectos, fases, slices, documentación, asignaciones y actividad se distribuye entre repositorios, GitHub, Notion, Trello y conversaciones operativas. Esta fragmentación obliga a reconstruir el contexto desde fuentes diferentes y deja el seguimiento dependiente de herramientas técnicas.

El problema afecta especialmente a los desarrolladores, quienes no cuentan con una representación centralizada de su avance más allá del repositorio, y a los equipos administrativos, para quienes la información de PRs y commits resulta técnica y difícil de interpretar. Las herramientas genéricas existentes no están adaptadas a los procesos, artefactos y trazabilidad de la metodología AI-First de ST&T.

La necesidad es prioritaria porque la organización se encuentra en transición hacia esta forma de trabajo. Sin una capa corporativa de visibilidad y gobernanza, será más difícil mantener los proyectos actualizados, medir el uso de IA y ofrecer retroalimentación oportuna. La adopción diaria de la integración MCP por los desarrolladores es una condición central para que el cambio organizacional sea sostenible.

## 2. Visión de producto

ST&T Atlas será el portal interno de ST&T para centralizar la visibilidad y gestión administrativa del desarrollo AI-First. Permitirá consultar proyectos, slices, asignaciones, documentación metodológica y métricas de actividad en un único lugar, sin sustituir GitHub ni intentar replicar su historial técnico.

El portal ofrecerá una experiencia clara para perfiles técnicos y administrativos, con acceso corporativo y onboarding inicial. Los asistentes de IA conectados a los entornos de desarrollo podrán mantener actualizada la información operativa, reduciendo la dependencia de recordatorios manuales y permitiendo una retroalimentación diaria basada en métricas.

## 3. Descripción de la capacidad

La página inicial ofrecerá un dashboard minimalista con indicadores generales de todos los proyectos, suficiente para evidenciar la actividad y solidez operativa del sistema sin sobrecargar al usuario. Desde allí se accederá a un listado más detallado de proyectos y, al seleccionar uno, a sus slices, asignaciones, documentación sincronizada, actividad y métricas.

Los perfiles administrativos podrán consultar la información disponible. Los perfiles de desarrollo podrán crear y actualizar proyectos, slices y asignaciones. Los superadministradores gestionarán los perfiles y roles, incluida la posibilidad de retirar perfiles cuando corresponda. En la primera versión no habrá permisos diferenciados por proyecto, ya que todos los usuarios pertenecen a la misma corporación.

La documentación se originará fuera del portal y llegará en formato Markdown desde los entornos de desarrollo. Atlas la presentará de manera legible y conservará su historial versionado y auditoría, sin permitir crear o editar Markdown desde la interfaz.

## 4. Alcance y límites

### 4.1 Supuestos

- Google Workspace es la fuente inicial de identidad corporativa.
- Los IDEs o agentes consumidores implementarán MCP estándar y se configurarán con autenticación válida.
- El área administrativa autorizará el piloto y el uso operativo de Atlas.

### 4.2 Fuera de alcance inicial

- Replicar o almacenar PRs, commits, código fuente o historial Git de GitHub.
- Crear o editar documentación Markdown desde el portal.
- Sincronizar secretos, datos sensibles, datos personales, código fuente o historial Git mediante MCP.
- Integrar fuentes corporativas adicionales a Google Workspace.
- Definir permisos específicos por proyecto.
- Incorporar funcionalidades distintas de las descritas para la primera versión.
- Operar en producción, promover a `prod` o gestionar información corporativa real: esta etapa es una POC sobre una cuenta AWS de pruebas.

## 5. Contexto arquitectónico

ST&T Atlas se desplegará sobre AWS. La cuenta disponible en el entorno actual es una cuenta de pruebas y esta etapa se ejecuta como POC: su objetivo es validar el modelo operativo, la integración MCP y la propuesta de valor, no sostener operación corporativa. La disponibilidad permanente, la tolerancia a fallos y la recuperación se diseñan como objetivos de arquitectura y se prueban en ese entorno, sin declararse como servicio productivo.

La promoción a producción con datos corporativos reales queda fuera de esta etapa y requerirá una cuenta AWS corporativa con responsables operativos, presupuesto, controles de acceso, monitoreo, copias de respaldo y recuperación verificada.

La autenticación de personas se integrará con Google Workspace y Google Cloud, limitando el acceso a cuentas corporativas `@stt.com.co`. El backend validará los tokens OIDC y asociará la identidad estable del usuario a su perfil y rol; la restricción por sufijo de correo no será un control suficiente por sí sola.

Atlas expondrá un servidor MCP estándar, agnóstico de IDE y autenticado como servidor de recursos. Antes del piloto se definirá y probará un modelo OAuth interoperable para los IDEs objetivo, que valide emisor, firma, expiración, audiencia y scopes de los tokens. No se asumirán ni reutilizarán tokens individuales de Kiro como credenciales transferibles.

El servidor MCP agrupará las operaciones en dominios funcionales coherentes —por ejemplo, proyectos/slices/asignaciones, documentación versionada y pasarela MCP/auditoría— en vez de crear un recurso o una Lambda por acción. La separación de dominios solo se justificará por diferencias claras de seguridad, escalado, dependencia o ciclo de despliegue. Se aplicarán límites de costo, etiquetado, alertas y observabilidad desde las pruebas.

Cada operación MCP aceptada registrará en una única operación lógica la modificación de la entidad y su evento de auditoría, con identidad, origen, acción, fecha y resultado. El contrato incluirá una clave de idempotencia, control de concurrencia y reintentos seguros para evitar duplicados. Las actualizaciones críticas devolverán el estado canónico; las proyecciones y métricas que se procesen de forma asíncrona no se usarán para prometer consistencia inmediata.

Las herramientas que ejecuten acciones sensibles se marcarán explícitamente y exigirán autorización del usuario, además de la validación de rol y alcance en el servidor. La clasificación concreta de operaciones automáticas y sensibles se definirá antes del piloto. El contenido Markdown se validará por tamaño y estructura, se renderizará mediante una lista permitida de elementos seguros y se conservará con hash, versión, actor y reglas de retención.

## 6. Contexto de desarrollo

El desarrollo seguirá la metodología AI-First de ST&T y utilizará los Powers y reglas operativas disponibles como guía de proceso. Las instrucciones o skills de los entornos de desarrollo deberán orientar a sus asistentes de IA para utilizar el MCP cuando una acción relevante lo requiera, por ejemplo al actualizar una slice, completar y verificar una funcionalidad o sincronizar documentación.

Las métricas por persona, slice y proyecto se acompañarán de un catálogo que defina finalidad, fórmula, campos capturados, retención, visibilidad y uso permitido. La telemetría operativa se diferenciará de la evaluación individual para evitar interpretaciones impropias, incluso cuando sus resultados sean visibles a todos los perfiles autenticados.

## 7. Estrategia de implementación

La primera etapa validará el acceso con Google Workspace, el onboarding y la definición operativa de los roles Administrativo, Desarrollador y Superadministrador. A continuación se habilitarán el dashboard general y la gestión de proyectos, slices y asignaciones.

En paralelo con la base de gestión, se diseñará y validará el contrato de identidad, autorización y herramientas del servidor MCP. Una vez comprobada su interoperabilidad con los IDEs objetivo, se habilitará la sincronización autenticada de cambios con auditoría obligatoria, actualización oportuna y controles explícitos para operaciones sensibles. La visualización de documentación Markdown versionada seguirá a la conexión MCP; las métricas por proyecto, slice y persona completarán la primera versión.

La validación se realizará con datos ficticios, proyectos simulados, documentación y slices de prueba en la cuenta de pruebas. Sobre esa base se ejecutará un piloto acotado que evalúe rapidez, consistencia, seguridad y frecuencia de actualización usando información no sensible; su objetivo es evidencia de viabilidad, no operación corporativa.

Las ramas de artefactos, incluida `initiative/STTA-001-stt-atlas`, se promoverán hacia `no-prod`, único entorno de consolidación de la POC. La promoción a `prod` no forma parte de esta etapa: se planificará cuando exista la cuenta corporativa y la decisión de convertir la POC en producto operativo. Esta es una excepción explícita a la rama `integration` de la metodología general.

Los mockups de interfaz con el branding y logotipo corporativo serán un hito posterior de diseño, previo a decisiones definitivas de experiencia de usuario. Los prompts que generan esas referencias visuales y las imágenes resultantes se mantienen documentados en [resources/ui](./resources/ui/README.md); son referencia de implementación y no sustituyen el alcance definido en los documentos de solución.

## 8. Criterios de éxito

Esta etapa es una POC, por lo que el éxito se mide como evidencia de viabilidad y adopción demostrada en el entorno de pruebas, no como operación corporativa sostenida.

- **Uso demostrado del MCP**: los desarrolladores participantes emplean el servidor MCP de forma recurrente dentro de su flujo asistido por IA durante la POC.
- **Actualización diaria demostrada**: la actividad enviada desde los entornos de desarrollo mantiene actualizados los proyectos de prueba durante días consecutivos.
- **Visibilidad verificada**: perfiles administrativos y de desarrollo consultan estado, slices, asignaciones y documentación sin recorrer repositorios técnicos.
- **Retroalimentación basada en métricas**: los agregados diarios por persona, slice y proyecto permiten conversaciones de mejora sobre el uso de IA.
- **Sincronización oportuna**: los eventos MCP aceptados cumplen el objetivo de latencia definido y quedan registrados en auditoría.
- **Decisión informada**: al cierre de la POC existe evidencia de funcionamiento, costo observado y limitaciones para decidir si Atlas se convierte en producto operativo.

## 9. Riesgos y dependencias

La iniciativa requiere controles tempranos de seguridad, costo y gobierno para que la integración automática mantenga la confianza de los equipos. Los riesgos se gestionarán desde el diseño, las pruebas con datos ficticios y el piloto; ningún riesgo se considerará resuelto únicamente por la existencia de una implementación.

### 9.1 Riesgos técnicos y de seguridad

#### 9.1.1 Autenticación y autorización del MCP [Crítico]

- **Riesgo**: un servidor MCP público podría aceptar, reenviar o validar de forma incorrecta tokens que no fueron emitidos para Atlas, permitiendo suplantación o acceso indebido.
- **Mitigación**: definir el servidor MCP como recurso OAuth 2.1, publicar sus metadatos de recurso protegido y validar emisor, firma, expiración, audiencia, recurso y scopes. No se reutilizarán ni reenviarán tokens obtenidos de Kiro u otros entornos. La interoperabilidad se verificará con los IDEs objetivo antes del piloto. [Especificación MCP](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization)

#### 9.1.2 Control de identidad corporativa incompleto [Alto]

- **Riesgo**: restringir el acceso únicamente por el sufijo del correo no verifica correctamente la identidad, la vigencia ni la revocación de un usuario de Google Workspace.
- **Mitigación**: validar en backend los tokens OIDC y sus atributos de seguridad, asociar el identificador estable del usuario a un perfil interno y aplicar procesos de alta, baja y cambio de rol. [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect)

#### 9.1.3 Operaciones MCP duplicadas o sin trazabilidad [Alto]

- **Riesgo**: reintentos o fallos parciales pueden duplicar cambios, registrar auditoría incompleta o mostrar información contradictoria.
- **Mitigación**: usar claves de idempotencia, control de versiones y operaciones atómicas para el cambio y su auditoría; complementar con reintentos, cola de fallos y reconciliación. [Prácticas de Lambda](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)

#### 9.1.4 Markdown no confiable [Alto]

- **Riesgo**: Markdown enviado desde un IDE puede incluir contenido inseguro, enlaces peligrosos, tamaño excesivo o consumo no controlado de almacenamiento por versionado.
- **Mitigación**: aplicar sanitización con lista permitida, bloquear HTML y scripts no confiables, establecer validaciones de tamaño y estructura, cuotas, hash, retención y pruebas con cargas maliciosas.

#### 9.1.5 Consistencia de la visualización [Moderado]

- **Riesgo**: índices, streams o proyecciones eventualmente consistentes pueden retrasar el dashboard respecto de un cambio aceptado.
- **Mitigación**: definir un objetivo medible para la sincronización; confirmar al cliente con el estado canónico y reservar las vistas asíncronas para analítica o proyecciones no críticas. [Consistencia de DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html)

### 9.2 Riesgos operativos y de costo

#### 9.2.1 Fragmentación y costo de arquitectura serverless [Alto]

- **Riesgo**: una función, permiso, alerta o despliegue por cada operación puede aumentar el número de recursos, la superficie de mantenimiento y los costos operativos.
- **Mitigación**: organizar la solución por dominios funcionales coherentes y separar recursos solo cuando el privilegio, escalado, dependencia o ciclo de despliegue lo exijan. Configurar presupuestos, etiquetado, alertas de costo, errores y saturación desde las pruebas. [AWS Serverless Lens](https://docs.aws.amazon.com/wellarchitected/latest/serverless-applications-lens/welcome.html)

#### 9.2.2 Uso de la POC como si fuera producción [Alto]

- **Riesgo**: aunque la etapa es una POC en cuenta de pruebas, los equipos podrían empezar a depender de ella o cargar información corporativa real, sin propiedad, presupuesto, respaldo ni monitoreo corporativos.
- **Mitigación**: declarar explícitamente el carácter de POC, restringir los datos a información ficticia o no sensible, evitar comunicar el entorno como servicio operativo y exigir una cuenta corporativa antes de cualquier promoción a producción. [Guía AWS multi-cuenta](https://docs.aws.amazon.com/whitepapers/latest/organizing-your-aws-environment/organizing-your-aws-environment.html)

### 9.3 Riesgos de gobierno y adopción

#### 9.3.1 Métricas individuales sin reglas de uso [Alto]

- **Riesgo**: las métricas por persona pueden interpretarse como evaluación individual sin contexto, finalidad, retención o criterios comunes.
- **Mitigación**: establecer el catálogo de métricas y una política corporativa antes del piloto; minimizar datos, diferenciar telemetría de evaluación y registrar el acceso a reportes.

#### 9.3.2 Consentimiento insuficiente en acciones sensibles [Alto]

- **Riesgo**: un asistente de IA podría ejecutar una modificación o eliminación sensible sin evidencia suficiente de autorización humana.
- **Mitigación**: clasificar cada herramienta MCP antes del piloto, exigir confirmación explícita en el cliente cuando corresponda y validar en el servidor rol, scope, estado y resultado de la autorización.

#### 9.3.3 Adopción irregular del MCP [Alto]

- **Riesgo**: si los asistentes o IDEs no incorporan la integración de forma natural, las actualizaciones seguirán dependiendo de recordatorios manuales y las métricas perderán representatividad.
- **Mitigación**: validar la experiencia en IDEs reales, proveer skills o instrucciones equivalentes por entorno, medir frecuencia de uso durante el piloto y ajustar el contrato MCP con retroalimentación de los desarrolladores.

### 9.4 Dependencias críticas

- **Administración de Google Workspace y Google Cloud**: configuración de clientes, política de dominio, identidades, roles y baja de usuarios.
- **Interoperabilidad MCP**: evidencia de compatibilidad OAuth, transporte, confirmaciones y herramientas en los IDEs que utilizará ST&T.
- **Cuenta AWS corporativa**: propiedad, presupuesto, DNS/TLS, controles de seguridad, observabilidad y operación antes de datos reales.
- **Contrato MCP**: esquemas de herramientas, scopes, clasificación de sensibilidad, idempotencia, semántica de éxito y objetivo de sincronización.
- **Política de datos**: reglas de sanitización, retención, eliminación, acceso y uso de Markdown, auditoría y métricas.


## 10. Mapa de soluciones

> **Criterio de organización**: cada solución agrupa flujos completos de usuario, sistema o integración. Las capas técnicas —interfaz, API, persistencia, funciones serverless e infraestructura— se implementarán dentro de esos flujos y no como soluciones independientes.

| Solución | Flujos | Cobertura | Contexto | Prioridad | Estado | Documento |
|---|---|---|---|---|---|---|
| **Fundación y operación de plataforma** | Despliegue y actualización en `no-prod`<br>Observabilidad de disponibilidad, errores, saturación y costo<br>Recuperación ante fallos previsibles<br>Validación y promoción controlada a `prod` | 5: AWS, disponibilidad y recuperación<br>7: validación, piloto y promoción<br>9.2: costo y cuenta corporativa | La cuenta actual solo admite pruebas; producción requiere cuenta corporativa, propiedad operativa, presupuesto, respaldos y recuperación comprobada. Los dominios serverless se separan solo por seguridad, escala, dependencia o ciclo de despliegue. | Alta | drafting | [fundacion-operacion-plataforma](./solutions/fundacion-operacion-plataforma/fundacion-operacion-plataforma.md) |
| **Acceso corporativo y gobierno de usuarios** | Inicio de sesión Workspace → validación OIDC → perfil<br>Onboarding inicial<br>Gestión de roles y retiro de perfiles por superadministrador | 2: acceso corporativo y onboarding<br>3: perfiles y roles<br>5: validación de identidad<br>9.1.2: control de identidad | Solo cuentas `@stt.com.co`; no hay contraseñas locales ni permisos por proyecto. La baja revoca acceso futuro y conserva auditoría histórica. La identidad web es independiente de las credenciales de clientes MCP. | Alta | drafting | [acceso-gobierno-usuarios](./solutions/acceso-gobierno-usuarios/acceso-gobierno-usuarios.md) |
| **Gestión de portafolio de desarrollo** | Dashboard → listado → detalle de proyecto<br>Crear y actualizar proyectos<br>Crear y actualizar slices<br>Crear, modificar y eliminar asignaciones | 2: visibilidad centralizada<br>3: dashboard, proyectos, slices y asignaciones<br>7: gestión base | No replica GitHub ni muestra código, PRs o historial Git. Administrativos consultan; desarrolladores gestionan. Las mutaciones deben coexistir con cambios provenientes del MCP y conservar su origen. | Alta | drafting | [gestion-portafolio-desarrollo](./solutions/gestion-portafolio-desarrollo/gestion-portafolio-desarrollo.md) |
| **Sincronización MCP y auditoría gobernada** | IDE/agente → OAuth MCP → autorización → herramienta<br>Operación no sensible → cambio y auditoría atómica<br>Operación sensible → confirmación → validación → ejecución<br>Reintentos idempotentes y respuesta canónica | 2: actualización asistida por IA<br>5: servidor MCP, scopes, idempotencia y sensibilidad<br>6: skills e instrucciones de desarrollo<br>9.1 y 9.3: riesgos de MCP y consentimiento | Debe ser agnóstico de IDE, autenticar clientes con OAuth interoperable y no aceptar secretos, código, datos personales ni historial Git. Cada herramienta tendrá contrato, scopes, clasificación de sensibilidad y reglas de autorización. | Alta | drafting | [sincronizacion-mcp-auditoria](./solutions/sincronizacion-mcp-auditoria/sincronizacion-mcp-auditoria.md) |
| **Documentación sincronizada y versionada** | Sincronización MCP → validación → versión inmutable<br>Consulta de Markdown por proyecto o slice<br>Consulta de historial<br>Reintento sin duplicar versiones | 3: documentación legible e historial versionado<br>4.2: sin edición desde el portal<br>5: hash, retención y sanitización<br>9.1.4: Markdown no confiable | Atlas solo visualiza documentación. Cada versión conserva hash, actor técnico, origen, fecha y relación con proyecto o slice. El renderizado aplica sanitización y lista permitida de elementos. | Alta | drafting | [documentacion-sincronizada-versionada](./solutions/documentacion-sincronizada-versionada/documentacion-sincronizada-versionada.md) |
| **Métricas y retroalimentación operativa** | Evento auditado → agregación por persona, slice y proyecto<br>Consulta de indicadores globales y contextuales<br>Consulta diaria para retroalimentación<br>Reconciliación de agregados | 1–2: adopción AI-First y retroalimentación<br>3: métricas<br>6: catálogo de métricas<br>8: criterios de éxito<br>9.3.1: gobierno de métricas | Incluye actividad, uso de IA, tokens y líneas de código cuando el contrato MCP lo aporte de forma confiable. Es visible para todos los perfiles autenticados y requiere catálogo, retención y uso permitido antes del piloto. | Media | drafting | [metricas-retroalimentacion-operativa](./solutions/metricas-retroalimentacion-operativa/metricas-retroalimentacion-operativa.md) |

### 10.1 Dependencias y secuencia

1. **Fundación y operación de plataforma** y **Acceso corporativo y gobierno de usuarios** habilitan un entorno seguro de pruebas.
2. **Gestión de portafolio de desarrollo** establece las entidades y los flujos operativos que el portal mostrará y que el MCP actualizará.
3. **Sincronización MCP y auditoría gobernada** puede diseñarse en paralelo con la gestión base, pero solo se habilitará después de validar identidad, autorización e interoperabilidad con los IDEs objetivo.
4. **Documentación sincronizada y versionada** depende de la conexión MCP autenticada y de sus controles de contenido.
5. **Métricas y retroalimentación operativa** depende de eventos MCP y auditoría confiables.


## 11. Mapa de capacidades AI

> **Estado actual**: no se identifican capacidades AI propias de ST&T Atlas para gestionar bajo el ciclo C3D.

ST&T Atlas integra un servidor MCP para que agentes de IA existentes en IDEs compatibles actualicen información administrativa. El comportamiento de esos agentes se orientará mediante skills, Powers o documentación de contexto que indique explícitamente cuándo y cómo usar las herramientas MCP. Esta integración es determinista desde la perspectiva de Atlas: el portal autentica, autoriza, valida, registra y presenta las operaciones recibidas.

Por tanto, no se crean dominios ni intents C3D en esta etapa. Las funciones de gestión, autenticación, sincronización, documentación y métricas permanecen en el Mapa de soluciones. Si en el futuro se incorpora una capacidad con incertidumbre propia —por ejemplo, análisis autónomo de métricas, clasificación semántica de documentación o recomendaciones generadas por IA— se evaluará entonces si requiere un dominio e intent separado.
