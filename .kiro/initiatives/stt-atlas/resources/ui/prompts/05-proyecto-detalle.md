---
taxonomy: ui-prompt
key: 05-proyecto-detalle
screen: Detalle de proyecto
initiative: ../../../stt-atlas.md
solution: gestion-portafolio-desarrollo
language: es
---

# 05 — Detalle de proyecto

**Solución**: Gestión de portafolio de desarrollo (2.2, 2.3, 2.4)
**Rol**: todos; acciones de gestión solo para desarrollador y superadministrador

## Propósito

Vista central de un proyecto: estado, slices, asignaciones, documentación disponible, actividad y métricas.

## Prompt de pantalla

> Página de detalle con migas de navegación "Proyectos / Atlas Interno". Encabezado con el nombre "Atlas Interno", identificador "ATL", etiqueta de estado "Activo" y una descripción breve de una línea. A la derecha, botón primario "Nueva slice" y un botón secundario de más acciones.
>
> Fila de resumen con cuatro datos compactos: "Avance 67%", "Slices 12", "Personas 4", "Última actualización hace 2 h".
>
> Pestañas de contenido: "Slices", "Documentación", "Actividad", "Métricas". La pestaña "Slices" está activa.
>
> Contenido de "Slices": lista agrupada por etiqueta de fase, con dos grupos: "Fase 1 · Fundación" y "Fase 2 · Integración". Cada slice se muestra como fila con nombre, etiqueta de estado, avatares de responsables y fecha de última actualización. Estados visibles entre las filas: "Completado", "En progreso", "Bloqueado" y "Planeado". Ejemplos ficticios: "Base desplegable — Completado", "Ingreso corporativo — En progreso", "Sincronización MCP — Bloqueado", "Visor de documentación — Planeado".
>
> En la barra lateral derecha del contenido, un panel compacto "Documentación reciente" con tres entradas y su tipo, y otro panel "Responsables" con la lista de personas y su rol en el proyecto.
>
> Mantén el indicador de entorno no productivo. Datos ficticios. No incluyas PRs, commits, ramas ni enlaces a repositorios.

## Variantes

**Solo lectura**
> Sin botones de creación ni acciones de fila, como lo ve un perfil administrativo.

**Proyecto archivado**
> Etiqueta de estado "Archivado", acciones de gestión ausentes y un aviso discreto: "Este proyecto está archivado y no admite cambios."

## Elementos que no deben aparecer

- Actividad de Git o código.
- Edición de documentación.
- Estimaciones o fechas comprometidas.

## Versiones generadas

| Imagen | Fecha | Cambios |
|---|---|---|
| `05-proyecto-detalle--desktop--v1.png` | 2026-09-08 | Detalle con slices agrupadas por fase |
