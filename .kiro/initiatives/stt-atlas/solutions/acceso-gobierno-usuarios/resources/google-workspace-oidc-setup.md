# Guía operativa: configuración manual de Google Cloud y Workspace

Guía de referencia para habilitar el inicio de sesión corporativo de ST&T Atlas durante la POC. La configuración se realiza manualmente por una persona con permisos de administración; Atlas no la automatiza.

> **Alcance**: entorno de POC en `no-prod`, con datos ficticios o no sensibles. Los valores concretos —proyecto, dominio, cuentas— los define ST&T.

## Requisitos previos

- Cuenta con permisos de administración en Google Cloud para crear o usar un proyecto.
- Cuenta con permisos de administración de Google Workspace del dominio corporativo.
- URL de retorno del entorno de POC de Atlas (callback de autenticación).
- Cuenta corporativa designada como primer superadministrador.

## Pasos

### 1. Proyecto de Google Cloud

1. Ingresar a la consola de Google Cloud.
2. Crear un proyecto dedicado para Atlas o seleccionar uno existente destinado a herramientas internas.
3. Registrar el identificador del proyecto para la documentación operativa.

Un proyecto dedicado facilita revocar credenciales y revisar consentimientos sin afectar otros sistemas.

### 2. Pantalla de consentimiento OAuth

1. Abrir la configuración de la pantalla de consentimiento OAuth del proyecto.
2. Seleccionar el tipo **interno**, de modo que solo cuentas del dominio corporativo puedan autorizar la aplicación.
3. Completar nombre de la aplicación, correo de soporte y datos de contacto del responsable.
4. Solicitar únicamente los alcances necesarios para autenticación e identificación básica del perfil. No solicitar acceso a servicios de Workspace que Atlas no utiliza.
5. Guardar la configuración.

El tipo interno es el control que impide que cuentas ajenas al dominio otorguen consentimiento.

### 3. Credenciales de cliente OAuth

1. Crear una credencial de tipo **ID de cliente OAuth** para aplicación web.
2. Registrar el origen autorizado del entorno de POC.
3. Registrar la URI de redirección de Atlas exactamente como la expone el entorno.
4. Guardar el identificador de cliente y el secreto.

No incorporar el secreto al repositorio. Debe almacenarse en el gestor de configuración de la plataforma y referenciarse desde el despliegue.

### 4. Verificación del dominio corporativo

1. Confirmar en Workspace que el dominio corporativo administrado es el esperado.
2. Verificar que las cuentas que participarán en la POC existan y estén activas.
3. Confirmar la política de acceso a aplicaciones internas, si el dominio la aplica.

Atlas validará el dominio en el token recibido, pero la política del directorio es la que determina qué cuentas existen y siguen vigentes.

### 5. Primer superadministrador

1. Definir la cuenta corporativa que asumirá el rol inicial.
2. Registrarla como parámetro del despliegue de la POC.
3. Confirmar que la persona titular conoce y acepta esa responsabilidad.

A partir de ese momento, los cambios de rol se realizan dentro de Atlas y quedan auditados.

## Verificación posterior

- Iniciar sesión con una cuenta corporativa y confirmar la creación del perfil.
- Intentar el acceso con una cuenta ajena al dominio y confirmar el rechazo.
- Confirmar que el rechazo queda registrado y no expone detalles internos.
- Confirmar que el primer superadministrador puede administrar roles.

## Registro operativo

Documentar, sin incluir secretos: identificador del proyecto, identificador de cliente, orígenes y URIs registradas, alcances solicitados, dominio corporativo, cuenta del primer superadministrador y responsable de la configuración.

## Revocación

Para retirar el acceso de la POC: eliminar o deshabilitar la credencial de cliente, retirar el consentimiento de la aplicación en Workspace y desactivar los perfiles correspondientes en Atlas.

Referencia oficial del mecanismo de identidad utilizado: [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect)
