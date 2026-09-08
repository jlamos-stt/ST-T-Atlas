---
taxonomy: ui-prompt
key: 07-formularios-gestion
screen: Formularios de gestión
initiative: ../../../stt-atlas.md
solution: gestion-portafolio-desarrollo
language: es
---

# 07 — Formularios de gestión

**Solución**: Gestión de portafolio de desarrollo (2.1, 2.2, 2.3, 2.5)
**Rol**: desarrollador y superadministrador

## Propósito

Formularios de creación y edición de proyecto, slice y asignación, más el aviso de conflicto por versión desactualizada.

## Prompt de pantalla

> Panel lateral derecho deslizante sobre la vista de proyectos, con encabezado "Nuevo proyecto" y botón de cierre. Contiene campos: "Nombre" con el valor "Portal Clientes Demo", "Identificador" con "PCD" y una nota de ayuda breve, "Descripción" como área de texto de tres líneas y "Estado" como selector con "Borrador" seleccionado. Al pie del panel, botones "Cancelar" secundario y "Crear proyecto" primario. Fondo de la página atenuado.
>
> Mantén el indicador de entorno no productivo. Datos ficticios. No incluyas campos de fechas comprometidas, estimaciones, presupuesto ni enlaces a repositorios.

## Variantes

**Nueva slice**
> Mismo panel con encabezado "Nueva slice", campos "Nombre" con "Visor de documentación", "Objetivo" como área de texto, "Estado" con "Planeado" y "Fase" como campo de etiqueta opcional con "Fase 2 · Integración". Botón primario "Crear slice".

**Asignar persona**
> Panel más corto con encabezado "Asignar persona", un buscador de personas con dos resultados en lista mostrando avatar y nombre, y un selector de responsabilidad con opciones "Líder" y "Colaborador". Botón primario "Asignar".

**Confirmación de eliminación**
> Diálogo modal centrado y compacto: título "Quitar asignación", texto "Se quitará a Ana Ríos de la slice Ingreso corporativo. El historial se conserva." y botones "Cancelar" y "Quitar" con tratamiento de acción destructiva sobria.

**Conflicto de versión**
> Mismo panel de edición con un aviso sobre los campos: "Esta información cambió desde otro origen. Revisa el estado actual antes de guardar." y dos botones: "Ver cambios" y "Descartar mis cambios". El botón de guardar aparece deshabilitado.

## Elementos que no deben aparecer

- Campos de estimación, fechas de entrega o dependencias.
- Configuración de permisos por proyecto.
- Formularios de documentación Markdown.

## Versiones generadas

| Imagen | Fecha | Cambios |
|---|---|---|
| `07-formularios-gestion--nuevo-proyecto--v1.png` | 2026-09-08 | Panel lateral de nuevo proyecto |
