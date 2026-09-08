---
taxonomy: ui-prompt
key: 08-documentacion-visor
screen: Visor de documentación
initiative: ../../../stt-atlas.md
solution: documentacion-sincronizada-versionada
language: es
---

# 08 — Visor de documentación

**Solución**: Documentación sincronizada y versionada (2.3)
**Rol**: todos los perfiles autenticados, siempre en modo lectura

## Propósito

Lectura del Markdown sincronizado desde los entornos de desarrollo, con su contexto y metadatos de versión. El portal nunca permite editar.

## Prompt de pantalla

> Vista de dos columnas dentro del portal. Columna izquierda estrecha: índice de documentos del proyecto "Atlas Interno", agrupados por tipo con encabezados "Iniciativa", "Soluciones", "Slices" y "Decisiones"; ocho entradas en total, una de ellas seleccionada y resaltada.
>
> Columna derecha, área de lectura: encabezado del documento con título "Sincronización MCP y auditoría", una fila de metadatos discretos con "Versión 4", "Actualizado hace 1 d", "Origen MCP", "Autor Ana Ríos", y un botón secundario "Ver historial".
>
> Debajo, contenido Markdown renderizado de forma legible con ancho de lectura cómodo: un título de sección, dos párrafos, una lista de tres elementos y una tabla pequeña de dos columnas. Tipografía de lectura clara, buen interlineado.
>
> Mantén el indicador de entorno no productivo. No incluyas barra de herramientas de edición, botones de guardar, editar, restaurar ni comentarios. Datos ficticios.

## Variantes

**Sin documentación**
> Columna izquierda vacía y estado vacío al centro: "Este proyecto todavía no tiene documentación sincronizada. Los documentos aparecerán cuando se publiquen desde el entorno de desarrollo."

**Móvil**
> Índice colapsado en un selector superior y contenido a ancho completo en una sola columna.

## Elementos que no deben aparecer

- Editor, botones de guardar o cargar archivos.
- Restauración de versiones o comparación visual de diferencias.
- Comentarios, aprobaciones o flujos de revisión.
- Código fuente del proyecto o vistas de repositorio.

## Versiones generadas

| Imagen | Fecha | Cambios |
|---|---|---|
| `08-documentacion-visor--desktop--v1.png` | 2026-09-08 | Visor con índice por tipo documental |
