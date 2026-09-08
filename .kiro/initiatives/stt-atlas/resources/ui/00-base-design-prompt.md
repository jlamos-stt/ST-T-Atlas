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

- Minimalista y profesional. Densidad de información media: suficiente para transmitir solidez, sin saturar.
- Jerarquía clara: un título por vista, secciones bien separadas, mucho espacio en blanco.
- Tipografía sans-serif legible. Números y métricas con peso visual mayor que sus etiquetas.
- Paleta sobria: neutros como base, un color de acento corporativo usado con moderación en acciones primarias y elementos activos.
- Estados con color mínimo y significado consistente: neutro para reposo, acento para progreso, ámbar para bloqueado, verde para completado.
- Bordes suaves, sombras discretas, sin degradados llamativos ni ilustraciones decorativas.
- Modo claro por defecto.

## Estructura común

- Barra superior con logotipo, nombre del portal, indicador de entorno y acceso al perfil.
- Navegación lateral izquierda persistente con las secciones principales: Inicio, Proyectos, Métricas, Documentación y Administración cuando el rol lo permite.
- Área de contenido a la derecha con título de página y, cuando corresponda, migas de navegación.
- Acciones primarias alineadas a la derecha del encabezado de contenido.

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

> Diseña un mockup de interfaz web de alta fidelidad para un portal interno corporativo llamado ST&T Atlas, en español, estilo minimalista y profesional, modo claro, tipografía sans-serif, paleta de neutros con un solo color de acento, jerarquía clara y espacio en blanco generoso. Incluye barra superior con logotipo, nombre del portal, un indicador visible de entorno no productivo y acceso al perfil; navegación lateral izquierda persistente con Inicio, Proyectos, Métricas, Documentación y Administración; y un área de contenido con título de página. Usa exclusivamente datos ficticios de ejemplo. No incluyas código fuente, pull requests, commits, ramas ni diffs. No incluyas editores de texto ni acciones de guardar o restaurar documentación. No incluyas rankings ni puntajes de desempeño de personas. Vista de escritorio de 1440 px de ancho, encuadre completo, sin marco de navegador ni anotaciones externas.
