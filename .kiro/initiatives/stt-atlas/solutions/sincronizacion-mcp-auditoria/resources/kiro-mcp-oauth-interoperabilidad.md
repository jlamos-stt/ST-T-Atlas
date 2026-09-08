---
taxonomy: operational-guide
key: kiro-mcp-oauth-interoperabilidad
initiative: ../../../stt-atlas.md
solution: sincronizacion-mcp-auditoria
language: es
---

# Guía operativa: interoperabilidad OAuth de Kiro con el servidor MCP de Atlas

Resultado de la investigación documental que resuelve el bloqueo de identidad y autorización del servidor MCP. Sustituye suposiciones por capacidades verificadas en la documentación oficial de Kiro.

> **Estado**: evidencia documental. La verificación funcional con una instancia real de Atlas sigue siendo parte del slice de interoperabilidad.

## 1. Capacidades confirmadas de Kiro como cliente MCP

| Capacidad | Situación | Implicación para Atlas |
|---|---|---|
| Servidores MCP remotos por HTTPS | Soportado mediante la propiedad `url` | Atlas puede exponer un endpoint remoto; no requiere proceso local |
| Flujo OAuth en navegador | Kiro lo gestiona automáticamente al conectar con un servidor protegido | No hace falta construir un intercambio de credenciales propio |
| Dynamic Client Registration (DCR) | Intentado por defecto, con repliegue si falla | Atlas puede operar sin DCR usando un `clientId` preregistrado |
| Cliente público con PKCE | Soportado en el IDE | Compatible con un cliente público de Cognito sin secreto |
| Cliente confidencial con secreto | Solo en la CLI, no en el IDE | Atlas **no** debe exigir `client_secret` |
| Scopes solicitados | Configurables en `oauth.oauthScopes` | Atlas puede definir scopes propios por dominio |
| Renovación de token a mitad de sesión | Reautenticación automática en navegador | Tokens de vida corta son viables |
| Aprobación explícita de herramientas | El usuario aprueba cada herramienta antes de ejecutarla | Existe un punto real de consentimiento humano |
| `autoApprove` por herramienta | Permite omitir la confirmación de herramientas indicadas | El consentimiento del cliente es configurable y no garantizado |
| `disabledTools` | Permite ocultar herramientas al agente | Control adicional del lado del cliente |
| Proveedor de identidad propio | Requiere que el servidor publique metadatos de servidor de autorización y valide tokens contra el JWKS del proveedor | Define la responsabilidad técnica de Atlas |

Fuentes: [Configuración MCP de Kiro](https://kiro.dev/docs/mcp/configuration/) y [Buenas prácticas de seguridad MCP](https://kiro.dev/docs/mcp/security/).

## 2. Consecuencia crítica para el diseño

Kiro permite que el usuario marque herramientas como aprobadas automáticamente. Por tanto, **la confirmación del cliente no puede ser el único control de una operación sensible**: un usuario podría añadir esas herramientas a `autoApprove` y eliminar el punto de consentimiento.

Atlas debe conservar la autorización en el servidor:

- Validar rol, estado del perfil y scope en cada operación.
- Exigir un token con un scope sensible específico, no concedido por defecto.
- Registrar en auditoría que la operación fue sensible y con qué scope se autorizó.

La confirmación en el cliente se mantiene como una capa deseable, no como la garantía.

## 3. Requisitos técnicos para el servidor MCP de Atlas

1. Exponer el endpoint MCP por HTTPS.
2. Publicar `/.well-known/oauth-protected-resource` identificando su servidor de autorización.
3. Publicar o referenciar los metadatos del servidor de autorización según requiere Kiro cuando se usa un proveedor propio.
4. Responder con `401` y la indicación de autorización cuando falte un token válido.
5. Validar cada token contra el JWKS del proveedor: firma, emisor, expiración, audiencia y scopes.
6. No aceptar ni reenviar tokens emitidos para otro destinatario.
7. No requerir `client_secret`, para preservar compatibilidad con el IDE.

## 4. Configuración esperada en el cliente

Configuración de referencia para `.kiro/settings/mcp.json` en un entorno de desarrollo:

```json
{
  "mcpServers": {
    "stt-atlas": {
      "url": "https://<endpoint-de-atlas>/mcp",
      "oauth": {
        "clientId": "<client-id-publico>",
        "redirectUri": "http://127.0.0.1:8976/oauth/callback",
        "oauthScopes": ["atlas/portfolio.write", "atlas/docs.write", "atlas/metrics.write"]
      }
    }
  }
}
```

Notas:

- El `redirectUri` debe fijarse y coincidir exactamente con el registrado en el proveedor.
- No se incluye `clientSecret`: el IDE solo admite clientes públicos.
- Los scopes sensibles se solicitan de forma explícita y separada.
- El archivo no debe contener secretos ni credenciales.

## 5. Verificación pendiente en el slice de interoperabilidad

- Conexión efectiva y obtención de token con el cliente público.
- Comportamiento ante token expirado sin refresh token.
- Rechazo correcto de un token de audiencia ajena.
- Comportamiento de la aprobación de herramientas y efecto real de `autoApprove`.
- Idempotencia ante reintento de una operación mutante.
