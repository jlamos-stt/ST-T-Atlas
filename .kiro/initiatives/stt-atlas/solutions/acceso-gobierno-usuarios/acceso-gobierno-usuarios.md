---
taxonomy: solution
key: acceso-gobierno-usuarios
solution: Acceso corporativo y gobierno de usuarios
initiative: ../../stt-atlas.md
author: Juan Felipe Lamos
created: 2026-09-08
updated: 2026-09-09
status: drafting
language: es
---

# Acceso corporativo y gobierno de usuarios

## 1. Visión general

Esta solución permite que únicamente personas autorizadas de ST&T accedan al portal mediante Google Workspace y que Atlas gestione sus perfiles, onboarding y roles globales. Incluye los roles Administrativo, Desarrollador y Superadministrador, además del retiro de perfiles con preservación de la auditoría histórica.

La identidad web de las personas permanece separada de las credenciales que usarán los clientes MCP.

## 2. Narrativa de la solución

### 2.1 Habilitación del proveedor de identidad

Antes de que exista un ingreso funcional, una persona con permisos administrativos configura manualmente el proyecto de Google Cloud, la pantalla de consentimiento interna, las credenciales de cliente y la verificación del dominio corporativo. Ese trabajo se realiza una vez por entorno y queda registrado, sin exponer secretos en el repositorio.

Atlas consume esa configuración a través del gestor de configuración de la plataforma. Si la configuración no existe o es incorrecta, el portal no puede autenticar y el fallo debe ser visible como problema de configuración, no como rechazo de la persona.

### 2.2 Autenticación corporativa

El acceso comienza en una pantalla de ingreso que ofrece únicamente el inicio de sesión con Google. La persona selecciona su cuenta corporativa y el navegador regresa a Atlas con el resultado de la autenticación; el portal no solicita ni almacena contraseñas.

El backend valida el token recibido antes de conceder cualquier acceso: comprueba la firma contra las claves públicas del emisor, el emisor esperado, la audiencia emitida para Atlas, la vigencia temporal y el dominio corporativo declarado. Si alguna comprobación falla, la sesión no se establece y el intento queda registrado como rechazo, sin exponer detalles internos al cliente.

Con el token validado, Atlas usa el identificador estable del usuario para localizar su perfil. El correo se conserva como dato de contacto y presentación, pero no es el vínculo de identidad: un cambio de correo no debe crear un perfil duplicado ni transferir permisos.

### 2.3 Perfil y onboarding inicial

Cuando el identificador estable no corresponde a ningún perfil existente, Atlas crea uno nuevo en estado activo con el rol de menor privilegio y lo marca como pendiente de onboarding. La persona recibe una secuencia breve que confirma su nombre visible, permite ajustar su imagen y descripción, y presenta las áreas principales del portal.

El onboarding se completa una sola vez y queda registrado en el perfil. En visitas posteriores el ingreso lleva directamente al portal, y la persona puede volver a consultar la presentación desde su perfil sin repetir el flujo obligatorio.

Los campos editables por la propia persona se limitan a presentación: nombre visible, imagen y descripción. El rol, el estado y la identidad corporativa no son editables por el titular del perfil.

### 2.4 Roles y autorización efectiva

Sobre los perfiles existentes, Atlas aplica tres roles globales. El rol Administrativo permite consultar la información del portal. El rol Desarrollador añade la gestión operativa de proyectos, slices y asignaciones. El rol Superadministrador añade el gobierno de perfiles: consultar la lista de usuarios, cambiar roles, retirar perfiles y reactivarlos.

La autorización se evalúa en el servidor en cada operación, a partir del perfil vigente y no del contenido del token. Ocultar una acción en la interfaz no se considera un control de acceso: una solicitud sin rol suficiente debe ser rechazada aunque llegue directamente a la API.

El primer superadministrador se establece por configuración del despliegue con una cuenta corporativa aprobada administrativamente. A partir de ese momento, los cambios de rol se realizan dentro de Atlas y quedan auditados con actor, perfil afectado, valor anterior y nuevo.

### 2.5 Retiro y reactivación de perfiles

Cuando una persona deja de requerir acceso, un superadministrador retira su perfil. El perfil pasa a estado inactivo, sus sesiones dejan de ser válidas y cualquier nuevo intento de ingreso es rechazado incluso si su cuenta de Google sigue existiendo.

El retiro conserva la identidad mínima necesaria y la auditoría histórica, de modo que las acciones pasadas siguen siendo atribuibles. La reactivación es una acción explícita de superadministrador que restablece el acceso y también queda auditada.

### 2.6 Auditoría del ciclo de acceso

Cada evento relevante del ciclo de acceso queda registrado: ingreso exitoso, rechazo de autenticación, creación de perfil, finalización de onboarding, cambio de rol, retiro y reactivación. El registro incluye actor, perfil afectado, acción, fecha y resultado.

Los registros no almacenan tokens, credenciales ni datos ajenos a la operación descrita. Esta auditoría es la base con la que otras soluciones atribuyen actividad a una persona sin depender de datos personales transportados por el MCP.

## 3. Fuera de alcance

- Contraseñas locales.
- Permisos diferenciados por proyecto.
- Gestión de identidad para clientes MCP.
- Sincronización automática de altas y bajas desde el directorio corporativo.
- Autoservicio de solicitud o aprobación de roles.

## 4. Contexto técnico

El backend validará tokens OIDC emitidos para Atlas, incluyendo firma, emisor, audiencia, expiración, identificador estable y dominio corporativo `@stt.com.co`. El correo por sí solo no autoriza acceso.

La sesión del portal se mantiene mediante un mecanismo propio de Atlas con expiración y cierre de sesión, de forma que el estado del perfil pueda revocar el acceso sin depender de la vigencia del token original. Los identificadores de cliente y los secretos de la integración con Google se resuelven desde el gestor de configuración de la plataforma.

La habilitación del proveedor de identidad es una tarea manual de administración corporativa y no forma parte del despliegue automatizado.

> **Referencia operativa**: los pasos de configuración están documentados en [Configuración manual de Google Cloud y Workspace](./resources/google-workspace-oidc-setup.md).

Los roles son globales y se almacenan en el perfil interno. Las decisiones de autorización se toman en el servidor, en todas las rutas del portal y en las operaciones que otras soluciones expongan sobre entidades administrativas.

## 5. Criterios de aceptación

### Habilitación del proveedor de identidad

- Existe una guía operativa que permite completar la configuración manual sin conocimiento previo del proyecto.
- La aplicación OAuth está configurada como interna y limitada al dominio corporativo.
- Los alcances solicitados se limitan a autenticación e identificación básica del perfil.
- El secreto de cliente no está en el repositorio y se resuelve desde el gestor de configuración.
- Una configuración ausente o incorrecta se reporta como error de configuración y no como rechazo del usuario.

### Autenticación corporativa

- Una cuenta del dominio corporativo puede iniciar sesión sin credenciales locales.
- Un token con firma inválida, emisor incorrecto, audiencia ajena o expirado es rechazado.
- Una cuenta de Google fuera del dominio corporativo no obtiene acceso.
- Los rechazos de autenticación quedan registrados sin exponer detalles internos al cliente.

### Perfil y onboarding inicial

- El primer ingreso crea un perfil con el rol de menor privilegio y lo marca pendiente de onboarding.
- La persona puede confirmar nombre visible, imagen y descripción durante el onboarding.
- El onboarding no se repite obligatoriamente en ingresos posteriores.
- Una persona no puede modificar su propio rol, estado ni identidad corporativa.
- Un cambio de correo en Workspace no crea un perfil duplicado.

### Roles y autorización efectiva

- Un perfil Administrativo puede consultar información y no puede ejecutar mutaciones.
- Un perfil Desarrollador puede gestionar proyectos, slices y asignaciones.
- Solo un Superadministrador puede cambiar roles, retirar y reactivar perfiles.
- Una solicitud directa a la API sin rol suficiente es rechazada.
- El primer superadministrador queda disponible tras el despliegue mediante configuración.

### Retiro y reactivación de perfiles

- Al retirar un perfil, sus sesiones dejan de ser válidas.
- Un perfil retirado no puede volver a ingresar aunque su cuenta de Google siga activa.
- La auditoría histórica del perfil retirado se conserva y sigue siendo atribuible.
- La reactivación restablece el acceso y queda registrada.

### Auditoría del ciclo de acceso

- Ingreso, rechazo, creación de perfil, onboarding, cambio de rol, retiro y reactivación generan un evento con actor, perfil afectado, acción, fecha y resultado.
- Los registros no contienen tokens ni credenciales.

## 6. Riesgos y supuestos

### Supuestos

- Google Workspace es la fuente corporativa de identidad y permite crear la aplicación necesaria para el portal.
- Existirá una cuenta corporativa designada administrativamente para el primer superadministrador.
- Las personas con acceso pertenecen a la misma corporación y pueden ver la misma información operativa.

### Riesgos

- **Autorizar por sufijo de correo sin validar el token**: permitiría suplantación. Mitigado por validación OIDC completa y perfil interno asociado a identidad estable.
- **Baja no propagada desde el directorio corporativo**: una persona retirada de Workspace podría conservar acceso si Atlas no se actualiza. Mitigado por revocación explícita en Atlas y por la validación del estado del perfil en cada sesión.
- **Autorización solo en la interfaz**: ocultar botones no impide llamadas directas. Mitigado por evaluación de rol en el servidor para toda operación.
- **Pérdida del acceso administrativo**: un retiro incorrecto podría dejar el portal sin superadministrador. Mitigado por la configuración de arranque y por impedir que el último superadministrador se retire a sí mismo.
- **Datos de perfil innecesarios**: recopilar más información de la requerida aumenta la exposición. Mitigado por limitar los campos a presentación.

## 7. Registro de decisiones

### 7.1 Decisiones adoptadas

| ID | Decisión | Motivo |
|---|---|---|
| ADR-IAM-001 | Google Workspace será el único proveedor de identidad humana para el portal; Atlas no tendrá contraseñas locales. | Reduce administración de credenciales y se alinea con la identidad corporativa existente. |
| ADR-IAM-002 | Atlas validará en backend los tokens OIDC y usará el identificador estable `sub` como vínculo interno de identidad; correo y dominio solo complementan la política de acceso. | Evita depender de un atributo mutable o insuficiente para autenticar y revocar accesos. |
| ADR-IAM-003 | Los roles se administrarán dentro de Atlas y no mediante grupos de Workspace en la primera versión. | Permite iniciar sin depender de una taxonomía corporativa de grupos y mantiene una auditoría explícita de cambios de rol. |
| ADR-IAM-004 | El primer superadministrador se configurará por despliegue con una cuenta corporativa aprobada administrativamente; luego podrá administrar altas, roles y bajas desde Atlas. | Resuelve el arranque sin una interfaz administrativa abierta antes de existir un administrador autorizado. |
| ADR-IAM-005 | La baja desactiva el acceso futuro y preserva la identidad mínima y la auditoría histórica; la reactivación será una acción explícita de superadministrador. | Conserva trazabilidad sin mantener acceso a perfiles retirados. |
| ADR-IAM-006 | Atlas mantendrá su propia sesión con expiración, de modo que el estado del perfil pueda revocar el acceso sin depender del token original. | Permite que un retiro tenga efecto inmediato en el portal. |
| ADR-IAM-007 | El perfil solo almacenará nombre visible, imagen, descripción, identidad corporativa, rol y estado. | Minimiza datos personales y reduce la superficie de exposición. |
| ADR-IAM-008 | La configuración de Google Cloud y Workspace se realizará manualmente siguiendo una guía operativa documentada; Atlas no la automatizará. | Requiere permisos administrativos corporativos y ocurre una sola vez por entorno, por lo que automatizarla no aporta valor en la POC. |
| ADR-IAM-009 | La aplicación OAuth se configurará como interna, limitada al dominio corporativo y con los alcances mínimos de autenticación e identificación. | Impide que cuentas externas otorguen consentimiento y evita solicitar accesos a Workspace que Atlas no usa. |

### 7.2 Scope Limitations

| ID | Área | Descripción | Motivo | Impacto |
|---|---|---|---|---|
| SL-IAM-001 | Autorización | No se usarán permisos por proyecto ni grupos Workspace durante la primera versión. | Todos los usuarios pertenecen a una sola corporación y no se ha definido segregación por proyecto. | Los roles son globales; una futura necesidad de segmentación requerirá ampliar el modelo. |
| SL-IAM-002 | Ciclo de vida | No habrá aprovisionamiento ni desaprovisionamiento automático desde el directorio corporativo. | Requiere permisos y política administrativa aún no definidos. | Las bajas deben ejecutarse manualmente en Atlas. |

### 7.3 Technical Debt

| ID | Área | Decisión actual | Alternativa robusta | Motivo | Costo futuro | Disparador | Cuadrante |
|---|---|---|---|---|---|---|---|
| TD-IAM-001 | Gobierno de identidad | Roles administrados manualmente dentro de Atlas. | Sincronización con grupos del directorio corporativo. | Permite iniciar sin depender de una taxonomía de grupos aprobada. | Riesgo de perfiles desactualizados y trabajo administrativo recurrente. | Cuando el volumen de usuarios o la rotación haga inviable la gestión manual. | Prudent-Deliberate |

## 8. Slices

### Índice

| # | Slice | Objetivo | Est. | Estado |
|---|---|---|---|---|
| 01 | Habilitación manual del proveedor | Dejar configurado el acceso corporativo con una guía reproducible. | 1d | blocked |
| 02 | Ingreso corporativo validado | Permitir el acceso solo a cuentas corporativas con token verificado. | 3d | in-progress |
| 03 | Perfil y onboarding inicial | Crear el perfil en el primer ingreso y completar su presentación. | 2d | in-progress |
| 04 | Roles y autorización en servidor | Aplicar los tres roles globales en todas las operaciones. | 2d | in-progress |
| 05 | Gobierno de perfiles | Administrar roles, retiros y reactivaciones con auditoría. | 2d | ai-identified |
| | | **Total** | **10d** | |

---

### Slice 01: Habilitación manual del proveedor

| Campo | Contenido |
|---|---|
| **Objetivo** | El entorno de POC queda habilitado para autenticación corporativa mediante una configuración manual documentada y repetible. |
| **Flujo** | Administrador → proyecto de Google Cloud → consentimiento interno → credenciales de cliente → verificación de dominio → registro de parámetros en el gestor de configuración. |
| **Cobertura** | • 2.1: habilitación del proveedor de identidad |
| **Contexto** | Guía operativa en `resources/`; secretos fuera del repositorio; aplicación interna con alcances mínimos. |
| **Est.** | 1d |
| **Deps** | — |
| **Bloqueo** | Requiere una cuenta administradora de Google Workspace/Cloud de ST&T para crear o configurar el proyecto corporativo, registrar la aplicación OAuth interna y aplicar las políticas de acceso. |
| **Fuera de alcance** | Automatizar la creación del proyecto o de las credenciales. |

**Desbloqueo**: contar con la intervención del administrador corporativo y recibir los parámetros no secretos de configuración —proyecto, `client ID`, orígenes, URI de callback y alcances aprobados— manteniendo el secreto fuera del repositorio.

**Criterios de aceptación**:
- [ ] La guía permite completar la configuración sin conocimiento previo del proyecto.
- [ ] La aplicación OAuth es interna y limitada al dominio corporativo.
- [ ] Los alcances se limitan a autenticación e identificación básica.
- [ ] El secreto de cliente no está en el repositorio.
- [ ] Una configuración ausente se reporta como error de configuración.

---

### Slice 02: Ingreso corporativo validado

| Campo | Contenido |
|---|---|
| **Objetivo** | Una persona de ST&T entra al portal con su cuenta corporativa y nadie más obtiene acceso. |
| **Flujo** | Pantalla de ingreso → autenticación con Google → validación de token en backend → sesión de Atlas o rechazo auditado. |
| **Cobertura** | • 2.2: autenticación corporativa<br>• 2.6: registro de ingreso y rechazo |
| **Contexto** | Validación de firma, emisor, audiencia, vigencia y dominio; secretos desde el gestor de configuración. |
| **Est.** | 3d |
| **Deps** | 01 |
| **Fuera de alcance** | Roles, onboarding y gestión de perfiles. |

**Nota de implementación**: se implementa el contrato de autenticación y la pantalla de ingreso, pero la verificación end-to-end queda pendiente de la configuración administrativa de la slice 01.

**Configuración requerida**: `ATLAS_GOOGLE_CLIENT_ID`, `ATLAS_GOOGLE_DOMAIN` y `ATLAS_SESSION_SECRET` deben resolverse desde la configuración del entorno; el origen del portal se registra en `ATLAS_PORTAL_ORIGIN`. Ninguno de estos valores debe hardcodearse en la SPA o el repositorio.

**Criterios de aceptación**:
- [ ] Una cuenta corporativa inicia sesión sin credenciales locales.
- [ ] Tokens inválidos, expirados o de audiencia ajena son rechazados.
- [ ] Una cuenta ajena al dominio no obtiene acceso.
- [ ] Ingresos y rechazos quedan auditados sin registrar tokens.

---

### Slice 03: Perfil y onboarding inicial

| Campo | Contenido |
|---|---|
| **Objetivo** | La persona queda registrada con su perfil corporativo y conoce las áreas principales del portal. |
| **Flujo** | Primer ingreso → creación de perfil con rol mínimo → onboarding de presentación → acceso directo en ingresos posteriores. |
| **Cobertura** | • 2.3: perfil y onboarding<br>• 2.6: auditoría de creación y onboarding |
| **Contexto** | Identidad por identificador estable; campos limitados a presentación. |
| **Est.** | 2d |
| **Deps** | 02 |

**Criterios de aceptación**:
- [ ] El primer ingreso crea el perfil con rol de menor privilegio.
- [ ] La persona ajusta nombre visible, imagen y descripción.
- [ ] El onboarding no se repite obligatoriamente.
- [ ] Un cambio de correo no genera un perfil duplicado.

**Nota de implementación actual**: En `NOPROD` existe un recorrido demo con perfil local y persistencia en `localStorage` para validar la experiencia mientras se configura Google. La persistencia canónica en servidor queda pendiente.

---

### Slice 04: Roles y autorización en servidor

| Campo | Contenido |
|---|---|
| **Objetivo** | Cada persona solo puede ejecutar lo que su rol permite, incluso llamando directamente a la API. |
| **Flujo** | Solicitud autenticada → resolución de perfil y rol → autorización o rechazo → registro del resultado. |
| **Cobertura** | • 2.4: roles y autorización efectiva |
| **Contexto** | Roles globales en el perfil; decisiones de acceso en el servidor. |
| **Est.** | 2d |
| **Deps** | 03 |

**Criterios de aceptación**:
- [ ] Administrativo solo consulta y no ejecuta mutaciones.
- [ ] Desarrollador gestiona proyectos, slices y asignaciones.
- [ ] Una solicitud directa sin rol suficiente es rechazada.
- [ ] El primer superadministrador está disponible tras el despliegue.

**Nota de implementación actual**: La UI muestra la matriz de permisos del rol demo Administrativo; la autorización efectiva en servidor y el primer superadministrador todavía no están habilitados.

---

### Slice 05: Gobierno de perfiles

| Campo | Contenido |
|---|---|
| **Objetivo** | Un superadministrador puede otorgar roles, retirar accesos y reactivarlos con trazabilidad completa. |
| **Flujo** | Superadministrador → lista de perfiles → cambio de rol, retiro o reactivación → efecto inmediato en sesiones → auditoría. |
| **Cobertura** | • 2.4: cambios de rol<br>• 2.5: retiro y reactivación<br>• 2.6: auditoría del ciclo |
| **Contexto** | Sesión propia de Atlas para revocación inmediata; conservación de auditoría histórica. |
| **Est.** | 2d |
| **Deps** | 04 |

**Criterios de aceptación**:
- [ ] Solo un Superadministrador cambia roles, retira y reactiva perfiles.
- [ ] Al retirar un perfil sus sesiones dejan de ser válidas y no puede volver a ingresar.
- [ ] La auditoría del perfil retirado se conserva y sigue siendo atribuible.
- [ ] El último superadministrador no puede retirarse a sí mismo.
