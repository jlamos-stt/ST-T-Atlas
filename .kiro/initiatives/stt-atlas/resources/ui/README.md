---
taxonomy: ui-prompt-index
key: stt-atlas-ui
initiative: ../../stt-atlas.md
language: es
---

# Biblioteca de prompts de UI — ST&T Atlas

Documentación de los prompts usados para generar imágenes de referencia de cada pantalla de ST&T Atlas. Las imágenes resultantes son **referencia visual y funcional**, no especificación normativa: el alcance obligatorio sigue estando en la iniciativa y en los documentos de solución.

## Para qué sirve

- Conservar los prompts reales que produjeron cada mockup, de modo que puedan repetirse y ajustarse.
- Dar a quien implemente una referencia visual consistente sin inventar estructura ni contenido.
- Evitar que cada pantalla se diseñe con criterios distintos.

## Estructura

```
resources/ui/
├── README.md                     # este documento
├── 00-base-design-prompt.md      # prompt base heredado por todas las pantallas
├── prompts/                      # un archivo por pantalla
│   ├── 01-login.md
│   ├── 02-onboarding.md
│   ├── 03-dashboard.md
│   ├── 04-proyectos-listado.md
│   ├── 05-proyecto-detalle.md
│   ├── 06-slice-detalle.md
│   ├── 07-formularios-gestion.md
│   ├── 08-documentacion-visor.md
│   ├── 09-documentacion-historial.md
│   ├── 10-metricas.md
│   ├── 11-admin-usuarios.md
│   ├── 12-perfil.md
│   ├── 13-estados-sistema.md
│   └── 14-slices-transversal.md
└── references/                   # imágenes generadas
    ├── README.md
    └── brand/                    # activos de marca provistos por ST&T
```

## Estado de las referencias

| Prompt | Imagen | Estado |
|---|---|---|
| 01 Ingreso corporativo | v1 | Generada |
| 02 Onboarding | v1 | Generada, paso 1 |
| 03 Dashboard | v1, v2 | Generadas |
| 04 Listado de proyectos | v1 | Generada |
| 05 Detalle de proyecto | v1 | Generada |
| 06 Detalle de slice | v1 | Generada |
| 07 Formularios de gestión | v1 | Generada, nuevo proyecto |
| 08 Visor de documentación | v1 | Generada |
| 09 Historial de versiones | v1 | Regenerar sin estados de borrador |
| 10 Métricas | v1 | Generada |
| 11 Administración de usuarios | v1 | Generada |
| 12 Perfil personal | — | Pendiente |
| 13 Estados del sistema | v1 | Generada |
| 14 Vista transversal de slices | — | Pendiente |

## Cómo se usa

1. Leer `00-base-design-prompt.md`: define marca, tono, estructura y restricciones comunes.
2. Abrir el archivo de la pantalla a diseñar en `prompts/`.
3. Componer el prompt final: **prompt base + prompt de pantalla**.
4. Generar la imagen con la herramienta de IA disponible.
5. Guardar el resultado en `references/` siguiendo la convención de nombres.
6. Registrar en el archivo de la pantalla la versión generada y qué se ajustó.

## Convención de nombres de imagen

```
{numero}-{pantalla}--{variante}--v{n}.png
```

Ejemplos:

```
03-dashboard--desktop--v1.png
03-dashboard--desktop--v2.png
05-proyecto-detalle--desktop--v1.png
13-estados-sistema--sin-datos--v1.png
```

- `variante`: `desktop`, `mobile`, `sin-datos`, `error`, `solo-lectura`.
- `v{n}`: se incrementa; no se reemplaza una versión anterior.

## Reglas de contenido

- **Datos ficticios siempre.** Nombres de proyecto, personas y métricas deben ser inventados y evidentemente de ejemplo. Nunca usar información corporativa real, clientes reales ni datos personales.
- **Nada de código ni Git.** Las pantallas no muestran PRs, commits, diffs ni código fuente: está fuera de alcance.
- **Sin edición de documentación.** El visor de Markdown es de lectura; no dibujar editores, botones de guardar ni restaurar versiones.
- **Marcar el entorno.** Esta etapa es una POC: las pantallas incluyen un indicador visible de entorno no productivo.
- **Sin rankings de personas.** Las métricas por persona se muestran como actividad, no como puntaje, comparativa ni evaluación de desempeño.

## Límite de autoridad

Si una imagen generada sugiere una funcionalidad que no está en los documentos de solución, la imagen no la habilita. Cualquier diferencia se resuelve actualizando primero el documento correspondiente y, solo después, regenerando el mockup.

## Activos de marca

El logotipo y la paleta corporativa los provee ST&T y se guardan en `references/brand/`. Mientras no estén disponibles, los prompts usan una descripción neutra de marca y las imágenes se consideran preliminares.
