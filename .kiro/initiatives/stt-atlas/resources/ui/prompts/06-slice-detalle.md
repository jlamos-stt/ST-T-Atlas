---
taxonomy: ui-prompt
key: 06-slice-detalle
screen: Detalle de slice
initiative: ../../../stt-atlas.md
solution: gestion-portafolio-desarrollo
language: es
---

# 06 — Detalle de slice

**Solución**: Gestión de portafolio de desarrollo (2.2, 2.3)
**Rol**: todos; gestión de estado y asignaciones solo para desarrollador

## Propósito

Vista de una unidad de trabajo: objetivo, estado, responsables, documentación asociada y actividad.

## Prompt de pantalla

> Página de detalle con migas "Proyectos / Atlas Interno / Ingreso corporativo". Encabezado con el nombre de la slice "Ingreso corporativo", etiqueta de estado "En progreso" y etiqueta de fase "Fase 1 · Fundación". A la derecha, un selector de estado con las opciones "Planeado", "En progreso", "Bloqueado" y "Completado", y un botón secundario "Asignar persona".
>
> Bloque "Objetivo" con dos líneas de texto descriptivo.
>
> Bloque "Responsables": dos tarjetas compactas de persona con avatar, nombre y etiqueta de responsabilidad "Líder" o "Colaborador", cada una con una acción discreta de quitar.
>
> Bloque "Documentación asociada": tres entradas en lista con nombre de documento, tipo, versión y fecha, por ejemplo "Diseño de autenticación — solution — v4 — hace 1 d".
>
> Bloque "Actividad": cinco entradas cronológicas con hora, actor, acción y origen, mostrando tanto "Portal" como "MCP" como origen, por ejemplo "09:15 — Ana Ríos cambió el estado a En progreso · MCP".
>
> Mantén el indicador de entorno no productivo. Datos ficticios. No incluyas estimaciones, dependencias entre slices, código ni referencias a commits.

## Variantes

**Bloqueado**
> Estado "Bloqueado" con un aviso discreto sobre el bloque de objetivo: "Esta slice está marcada como bloqueada." Sin campos de causa estructurada.

**Solo lectura**
> Sin selector de estado ni acciones de asignación.

## Elementos que no deben aparecer

- Dependencias entre slices o diagramas de secuencia.
- Estimaciones y fechas comprometidas.
- Código, diffs o enlaces a repositorios.

## Versiones generadas

| Imagen | Fecha | Cambios |
|---|---|---|
| — | — | Pendiente de generar |
