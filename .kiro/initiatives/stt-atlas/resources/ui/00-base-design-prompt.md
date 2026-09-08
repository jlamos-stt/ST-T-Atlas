---
taxonomy: ui-prompt
key: base-design-prompt
initiative: ../../stt-atlas.md
language: es
---

# Prompt base de diseño — ST&T Atlas

Este bloque se incluye **antes** del prompt de cada pantalla. Define producto, audiencia, estilo y restricciones comunes.

## Contexto del producto

ST&T Atlas es un portal web interno de una empresa de desarrollo de software. Centraliza la visibilidad y gestión administrativa del trabajo de desarrollo asistido por IA: proyectos, slices, asignaciones, documentación sincronizada y métricas de actividad. No es una herramienta de código: no muestra repositorios, PRs, commits ni código fuente.

## Audiencias

- **Perfil administrativo**: consulta información y necesita entender el estado sin conocimiento técnico profundo.
- **Perfil desarrollador**: consulta y además crea o actualiza proyectos, slices y asignaciones.
- **Perfil superadministrador**: además administra perfiles y roles.

## Lenguaje visual

Calibrado con las referencias generadas en `references/`.

- Minimalista y profesional. Densidad de información media: suficiente para transmitir solidez, sin saturar.
- Jerarquía clara: un título por vista en azul marino oscuro con subtítulo gris, secciones bien separadas, espacio en blanco generoso.
- Tipografía sans-serif geométrica. Números y métricas con peso visual mayor que sus etiquetas.
- Paleta: fondo blanco y gris muy claro, texto principal azul marino oscuro, azul corporativo vivo como único acento en acciones primarias, elementos activos y series de datos.
- Estados con etiqueta redondeada de fondo tenue y punto de color: verde para activo o completado, azul para en progreso, ámbar para en pausa, rojo para bloqueado, archivado o retirado, gris para borrador o planeado.
- Tarjetas blancas con borde gris claro, esquinas redondeadas y sombra muy discreta. Sin degradados llamativos ni ilustraciones decorativas.
- Iconos lineales de trazo medio, encerrados en un cuadro redondeado de fondo azul claro cuando acompañan a un indicador o entidad.
- Modo claro por defecto.

## Estructura común

- Barra superior blanca con el logotipo ST&T ATLAS a la izquierda; a la derecha, la etiqueta redondeada "Entorno de pruebas — POC", un icono de notificaciones con punto indicador y el avatar con nombre de la persona.
- Navegación lateral izquierda persistente sobre fondo blanco, con icono y texto por sección: Inicio, Proyectos, Slices, Documentación, Métricas y Administración cuando el rol lo permite. La sección activa se resalta con fondo azul claro y texto azul.
- Área de contenido sobre fondo gris muy claro, con título de página grande y, cuando corresponda, migas de navegación encima.
- Acciones primarias como botón azul sólido con icono, alineadas a la derecha del encabezado de contenido.

## Restricciones obligatorias

- Todos los datos visibles son **ficticios y evidentemente de ejemplo**.
- No mostrar PRs, commits, ramas, diffs ni código fuente.
- No mostrar editores de documentación ni acciones de guardar, editar o restaurar contenido Markdown.
- No mostrar rankings de personas, puntajes de productividad ni comparativas de desempeño.
- Incluir un indicador visible de **entorno no productivo (POC)** en la barra superior.
- Interfaz en español.

## Formato de salida esperado

Mockup de interfaz web de alta fidelidad, vista de escritorio a 1440 px de ancho, encuadre completo de la pantalla, sin marco de navegador, sin mano ni dispositivo, sin texto explicativo fuera de la interfaz.

## Bloque reutilizable

> Diseña un mockup de interfaz web de alta fidelidad para un portal interno corporativo llamado ST&T Atlas, en español, estilo minimalista y profesional, modo claro. Tipografía sans-serif geométrica, texto principal azul marino oscuro, fondo blanco y gris muy claro, y un azul corporativo vivo como único color de acento en acciones primarias y elementos activos. Tarjetas blancas con borde gris claro, esquinas redondeadas y sombra discreta; iconos lineales sobre cuadro redondeado azul claro; etiquetas de estado redondeadas con punto de color.
>
> Incluye barra superior blanca con el logotipo ST&T ATLAS, la etiqueta "Entorno de pruebas — POC", un icono de notificaciones y el avatar con nombre de la persona. Incluye navegación lateral izquierda persistente con Inicio, Proyectos, Slices, Documentación y Métricas, resaltando la sección activa con fondo azul claro. El área de contenido va sobre fondo gris muy claro, con título de página grande y subtítulo gris.
>
> Usa exclusivamente datos ficticios de ejemplo. No incluyas código fuente, pull requests, commits, ramas ni diffs. No incluyas editores de texto ni acciones de guardar o restaurar documentación. No incluyas versiones en estado borrador. No incluyas rankings ni puntajes de desempeño de personas. Vista de escritorio de 1440 px de ancho, encuadre completo, sin marco de navegador ni anotaciones externas.
