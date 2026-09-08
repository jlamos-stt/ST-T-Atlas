---
taxonomy: ui-prompt
key: 03-dashboard
screen: Dashboard general
initiative: ../../../stt-atlas.md
solution: gestion-portafolio-desarrollo
language: es
---

# 03 — Dashboard general

**Solución**: Gestión de portafolio de desarrollo (2.4)
**Rol**: todos los perfiles autenticados

## Propósito

Entrada al portal. Vista minimalista con indicadores agregados de todos los proyectos y acceso al listado detallado. No lista todos los proyectos de entrada.

## Prompt de pantalla

> Página de inicio del portal con barra superior y navegación lateral, título "Inicio" y subtítulo "Estado general del desarrollo".
>
> Primera fila: cuatro tarjetas de indicador, cada una con etiqueta pequeña arriba y número grande abajo, más una variación discreta respecto al día anterior. Valores: "Proyectos activos 7", "Slices en curso 14", "Actualizaciones hoy 38", "Desarrolladores activos 6".
>
> Segunda fila, dos bloques de igual ancho. Izquierda: "Actividad de los últimos 14 días", gráfico de barras simple, sin exceso de líneas de referencia. Derecha: "Sincronización", con tres datos en lista: "Eventos aceptados 214", "Rechazados 3", "Latencia media 2,1 s".
>
> Tercera fila: bloque "Actividad reciente" con cinco entradas en lista. Cada entrada muestra hora, persona, acción y contexto, por ejemplo: "10:42 — Ana Ríos actualizó la slice Autenticación corporativa en Atlas Interno". Al pie del bloque, un enlace secundario "Ver todos los proyectos".
>
> Mantén el indicador de entorno no productivo. Usa nombres de proyecto ficticios como "Atlas Interno", "Portal Clientes Demo", "Migración Datos Piloto". No incluyas listados completos de proyectos, tablas densas, ni referencias a commits o PRs.

## Variantes

**Sin datos**
> Misma estructura con estado vacío: indicadores en cero y un mensaje central discreto: "Aún no hay actividad registrada. La información aparecerá cuando se creen proyectos o se sincronice actividad desde los entornos de desarrollo."

**Móvil**
> Misma información en una sola columna, navegación lateral colapsada en icono, tarjetas de indicador apiladas en dos columnas.

## Elementos que no deben aparecer

- Listado completo de proyectos.
- Rankings o comparativas entre personas.
- Datos de repositorios, PRs o commits.

## Versiones generadas

| Imagen | Fecha | Cambios |
|---|---|---|
| `03-dashboard--desktop--v1.png` | 2026-09-08 | Versión inicial |
| `03-dashboard--desktop--v2.png` | 2026-09-08 | Ajuste de indicadores y bloque de sincronización |
