---
taxonomy: ui-prompt
key: 01-login
screen: Ingreso corporativo
initiative: ../../../stt-atlas.md
solution: acceso-gobierno-usuarios
language: es
---

# 01 — Ingreso corporativo

**Solución**: Acceso corporativo y gobierno de usuarios (2.2)
**Rol**: cualquier persona con cuenta corporativa

## Propósito

Primera pantalla del portal. Solo ofrece inicio de sesión con Google, sin campos de usuario ni contraseña.

## Prompt de pantalla

> Pantalla de ingreso centrada, sin navegación lateral. Un contenedor único al centro con el logotipo corporativo, el nombre "ST&T Atlas" y una línea descriptiva breve: "Portal interno de desarrollo AI-First". Debajo, un solo botón primario ancho con el texto "Continuar con Google" y el icono de Google. Bajo el botón, un texto secundario pequeño: "Acceso exclusivo para cuentas corporativas @stt.com.co". En la parte inferior del contenedor, una etiqueta discreta de entorno: "Entorno de pruebas — POC". Fondo neutro claro y limpio, sin imágenes decorativas ni ilustraciones. No incluyas campos de correo, contraseña, registro, recuperación de contraseña ni inicio de sesión con otros proveedores.

## Variantes

**Rechazo de dominio**
> Misma pantalla, con un mensaje de error visible sobre el botón: "Esta cuenta no pertenece al dominio corporativo. Usa tu cuenta @stt.com.co." El mensaje usa color de advertencia sobrio, sin detalles técnicos ni códigos de error.

**Error de configuración**
> Misma pantalla, con un aviso neutro en lugar del botón: "El acceso no está disponible: configuración pendiente. Contacta al administrador del portal." Sin trazas técnicas visibles.

## Elementos que no deben aparecer

- Campos de usuario, contraseña o registro.
- Proveedores de identidad distintos de Google.
- Detalles técnicos de tokens, emisores o audiencias.

## Versiones generadas

| Imagen | Fecha | Cambios |
|---|---|---|
| `01-login--desktop--v1.png` | 2026-09-08 | Versión inicial validada |
