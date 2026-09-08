---
taxonomy: ui-reference-index
key: stt-atlas-ui-references
initiative: ../../../stt-atlas.md
language: es
---

# Imágenes de referencia de UI — ST&T Atlas

Carpeta destino de los mockups generados a partir de los prompts en `../prompts/`. Estas imágenes son la referencia visual que se consulta durante la implementación.

## Convención de nombres

```
{numero}-{pantalla}--{variante}--v{n}.png
```

- `numero-pantalla`: coincide con el archivo de prompt que la originó.
- `variante`: `desktop`, `mobile`, `sin-datos`, `error`, `solo-lectura`.
- `v{n}`: versión incremental. No se sobrescribe una versión anterior.

## Registro

Cada imagen nueva se registra en la sección **Versiones generadas** del archivo de prompt correspondiente, indicando qué cambió respecto a la versión previa.

## Reglas

- Solo datos ficticios. Ninguna captura con información corporativa real, clientes o datos personales.
- Formato PNG. Vista de escritorio a 1440 px de ancho como referencia principal.
- Una imagen que contradiga los documentos de solución no habilita esa funcionalidad: primero se corrige el documento, luego se regenera la imagen.

## Activos de marca

`brand/` contiene el logotipo y la paleta corporativa provistos por ST&T. Mientras no existan, los mockups se consideran preliminares en su tratamiento de marca.
