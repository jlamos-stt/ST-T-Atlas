---
taxonomy: ui-prompt
key: 14-slices-transversal
screen: Vista transversal de slices
initiative: ../../../stt-atlas.md
solution: gestion-portafolio-desarrollo
language: es
---

# 14 — Vista transversal de slices

**Solución**: Gestión de portafolio de desarrollo (2.4)
**Rol**: todos los perfiles autenticados, en modo lectura

## Propósito

Reúne el trabajo en curso de todos los proyectos para responder qué se está haciendo ahora y quién responde, sin recorrer proyecto por proyecto. Es de solo lectura: la gestión de una slice ocurre en su proyecto.

## Prompt de pantalla

> Página "Slices" con subtítulo "Trabajo en curso en todos los proyectos", con la sección "Slices" activa en la navegación lateral. En el encabezado, a la derecha, dos selectores discretos: uno de estado con "Todos los estados" y uno de responsable con "Todas las personas".
>
> Tabla de nueve filas con columnas: "Slice" con nombre y objetivo breve debajo, "Proyecto" con el nombre del proyecto de origen, "Estado" con etiqueta redondeada y punto de color, "Responsables" con avatares superpuestos, "Última actualización" en formato relativo, y una columna final con un chevron de acceso al detalle.
>
> Datos ficticios sugeridos: "Ingreso corporativo — Atlas Interno — En progreso", "Sincronización MCP — Atlas Interno — Bloqueado", "Visor de documentación — Atlas Interno — Planeado", "Alta de clientes — Portal Clientes Demo — En progreso", "Carga inicial — Migración Datos Piloto — Completado", "Panel de reportes — Gestión Comercial Piloto — En progreso".
>
> No incluyas botones de creación, edición ni asignación: la vista es de solo lectura. Mantén la barra superior con el indicador de entorno no productivo. Datos ficticios.

## Variantes

**Filtrada por responsable**
> Selector de responsable con "Ana Ríos" seleccionado y la tabla reducida a cuatro filas de distintos proyectos.

**Sin datos**
> Encabezado y filtros presentes con estado vacío al centro: "No hay slices que coincidan con los filtros seleccionados."

## Elementos que no deben aparecer

- Acciones de crear, editar, reasignar o cambiar estado.
- Estimaciones, fechas comprometidas o dependencias entre slices.
- Código, PRs o referencias a repositorios.

## Versiones generadas

| Imagen | Fecha | Cambios |
|---|---|---|
| — | — | Pendiente de generar |
