---
taxonomy: ui-prompt
key: 11-admin-usuarios
screen: Administración de usuarios
initiative: ../../../stt-atlas.md
solution: acceso-gobierno-usuarios
language: es
---

# 11 — Administración de usuarios

**Solución**: Acceso corporativo y gobierno de usuarios (2.4, 2.5, 2.6)
**Rol**: solo superadministrador

## Propósito

Gobierno de perfiles: consultar usuarios, cambiar roles, retirar accesos y reactivarlos, con trazabilidad.

## Prompt de pantalla

> Página "Administración" con subtítulo "Usuarios y roles", visible solo para superadministradores. Campo de búsqueda por nombre o correo y filtros ligeros: "Todos", "Activos", "Retirados".
>
> Tabla de siete filas con columnas: "Persona" con avatar, nombre y correo corporativo debajo; "Rol" como selector en línea con opciones "Administrativo", "Desarrollador" y "Superadministrador"; "Estado" con etiqueta "Activo" o "Retirado"; "Último ingreso" en formato relativo; y una columna de acciones con un menú discreto.
>
> Datos ficticios: "Ana Ríos — Desarrollador — Activo", "Luis Mena — Administrativo — Activo", "Carla Ortiz — Superadministrador — Activo", "Diego Sanz — Desarrollador — Retirado".
>
> En el pie de la tabla, una nota discreta: "Retirar un perfil revoca su acceso y conserva su historial de actividad."
>
> Mantén el indicador de entorno no productivo. No incluyas gestión de contraseñas, invitaciones por correo, permisos por proyecto ni creación manual de credenciales.

## Variantes

**Confirmación de retiro**
> Diálogo modal compacto: título "Retirar acceso", texto "Diego Sanz no podrá volver a ingresar. Su historial de actividad se conserva." y botones "Cancelar" y "Retirar acceso".

**Cambio de rol**
> Diálogo modal breve: "Cambiar rol de Ana Ríos de Desarrollador a Superadministrador. Esta acción queda registrada." con botones "Cancelar" y "Confirmar".

**Registro de auditoría**
> Panel lateral "Actividad de administración" con seis entradas cronológicas: actor, acción, perfil afectado y fecha, por ejemplo "Carla Ortiz cambió el rol de Ana Ríos a Desarrollador — hace 3 d".

## Elementos que no deben aparecer

- Contraseñas, restablecimiento de credenciales o invitaciones manuales.
- Permisos por proyecto.
- Datos personales adicionales al nombre, correo y descripción.

## Versiones generadas

| Imagen | Fecha | Cambios |
|---|---|---|
| `11-admin-usuarios--desktop--v1.png` | 2026-09-08 | Administración de usuarios y roles |
