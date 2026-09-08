---
taxonomy: ui-prompt
key: 04-proyectos-listado
screen: Listado de proyectos
initiative: ../../../stt-atlas.md
solution: gestion-portafolio-desarrollo
language: es
---

# 04 — Listado de proyectos

**Solución**: Gestión de portafolio de desarrollo (2.1, 2.4)
**Rol**: todos; la acción de crear solo para desarrollador y superadministrador

## Propósito

Vista completa del portafolio con estado y avance de cada proyecto, y punto de entrada al detalle.

## Prompt de pantalla

> Página "Proyectos" con subtítulo "Portafolio de desarrollo". En el encabezado, a la derecha, un botón primario "Nuevo proyecto".
>
> Bajo el encabezado, una fila de filtros discretos: campo de búsqueda por nombre y filtros de estado como pestañas ligeras: "Todos", "Activos", "En pausa", "Borrador", "Archivados".
>
> Tabla de siete filas con columnas: "Proyecto" con nombre e identificador corto debajo, "Estado" con etiqueta de color sobrio, "Slices" con formato "8 / 12", "Avance" con barra de progreso delgada y porcentaje, "Responsables" con dos o tres avatares superpuestos, "Última actualización" en formato relativo como "hace 2 h".
>
> Datos ficticios sugeridos: "Atlas Interno · ATL — Activo — 8/12 — 67%", "Portal Clientes Demo · PCD — Activo — 3/9 — 33%", "Migración Datos Piloto · MDP — En pausa — 5/5 — 100%", "Sandbox Integraciones · SBI — Borrador — 0/4 — 0%", "Reporte Operativo Demo · ROD — Archivado — 6/6 — 100%".
>
> Mantén el indicador de entorno no productivo. Las filas son clicables hacia el detalle. No incluyas fechas de entrega comprometidas, estimaciones, dependencias entre slices ni información de repositorios.

## Variantes

**Solo lectura**
> Misma tabla sin el botón "Nuevo proyecto" ni acciones de fila, como la ve un perfil administrativo.

**Sin datos**
> Encabezado y filtros presentes, con estado vacío al centro: "No hay proyectos registrados todavía." y, para perfiles con permiso, el botón "Crear el primer proyecto".

## Elementos que no deben aparecer

- Cronogramas, fechas comprometidas o estimaciones.
- Dependencias entre slices.
- Enlaces a repositorios o actividad de Git.

## Versiones generadas

| Imagen | Fecha | Cambios |
|---|---|---|
| — | — | Pendiente de generar |
