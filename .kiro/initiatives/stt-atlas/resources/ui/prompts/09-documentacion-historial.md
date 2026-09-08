---
taxonomy: ui-prompt
key: 09-documentacion-historial
screen: Historial de versiones
initiative: ../../../stt-atlas.md
solution: documentacion-sincronizada-versionada
language: es
---

# 09 — Historial de versiones

**Solución**: Documentación sincronizada y versionada (2.4, 2.5)
**Rol**: todos los perfiles autenticados, en modo lectura

## Propósito

Muestra la evolución de un documento: quién publicó cada versión, cuándo y desde qué origen. No ofrece restauración ni comparación visual.

## Prompt de pantalla

> Panel lateral derecho sobre el visor de documentación, con encabezado "Historial de versiones" y subtítulo con el nombre del documento "Sincronización MCP y auditoría".
>
> Lista cronológica descendente de seis versiones. Cada entrada muestra: número de versión destacado, fecha y hora, actor, origen "MCP", y una huella de contenido corta y abreviada en tipografía monoespaciada. La versión más reciente lleva la etiqueta "Vigente". Las entradas son seleccionables para lectura.
>
> Al pie de la lista, una nota discreta: "Las versiones anteriores se conservan en archivo. Para corregir un documento, publica una nueva versión desde tu entorno de desarrollo."
>
> Mantén el indicador de entorno no productivo. No incluyas botones de restaurar, comparar, editar ni eliminar. Datos ficticios.

## Variantes

**Versión archivada**
> Una entrada antigua marcada con etiqueta "Archivada" y disponible solo por metadatos, con nota "Contenido en archivo".

## Elementos que no deben aparecer

- Restaurar, revertir o eliminar versiones.
- Comparación visual de diferencias o vista de diff.
- Referencias a commits o ramas.

## Versiones generadas

| Imagen | Fecha | Cambios |
|---|---|---|
| — | — | Pendiente de generar |
