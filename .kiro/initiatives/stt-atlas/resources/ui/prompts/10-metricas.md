---
taxonomy: ui-prompt
key: 10-metricas
screen: Métricas y retroalimentación
initiative: ../../../stt-atlas.md
solution: metricas-retroalimentacion-operativa
language: es
---

# 10 — Métricas y retroalimentación

**Solución**: Métricas y retroalimentación operativa (2.4, 2.5)
**Rol**: todos los perfiles autenticados

## Propósito

Consulta de métricas por proyecto, slice y persona, distinguiendo métricas observadas por Atlas de valores reportados por el cliente MCP.

## Prompt de pantalla

> Página "Métricas" con subtítulo "Actividad del desarrollo AI-First". En el encabezado, a la derecha, un selector de periodo con "Últimos 7 días" y un selector de alcance con "Todos los proyectos".
>
> Primera fila: cuatro tarjetas de indicador con etiqueta y número grande: "Eventos sincronizados 1.248", "Proyectos actualizados 7", "Desarrolladores activos 6", "Latencia media 2,1 s". Cada tarjeta incluye al pie una nota diminuta de frescura: "Actualizado hace 12 min".
>
> Segunda fila: gráfico de barras "Actividad diaria" de catorce días, limpio y sin decoración excesiva.
>
> Tercera fila, dos bloques. Izquierda: "Actividad por persona", tabla de cinco filas con avatar y nombre, y columnas "Eventos", "Slices activas" y "Tokens reportados". La columna de tokens lleva un icono de información y la etiqueta "Reportado por el cliente". Sin posiciones, sin puntajes, sin ordenamiento por desempeño. Derecha: "Actividad por proyecto", tabla de cinco filas con nombre de proyecto, eventos y última actualización.
>
> Al pie de la página, una nota informativa discreta: "Los tokens y las líneas generadas son valores reportados por el entorno de desarrollo; Atlas no los verifica de forma independiente."
>
> Mantén el indicador de entorno no productivo. Datos ficticios. No incluyas rankings, medallas, posiciones, puntajes de productividad ni comparativas de desempeño entre personas.

## Variantes

**Métricas de un proyecto**
> Mismo diseño con alcance "Atlas Interno" y una tabla adicional "Actividad por slice" en lugar de la tabla de proyectos.

**Sin datos suficientes**
> Indicadores en cero y un aviso central: "Todavía no hay suficiente actividad sincronizada para mostrar métricas."

**Cobertura parcial**
> Aviso discreto bajo los indicadores: "Solo 3 de 6 desarrolladores han sincronizado actividad en este periodo. Las métricas pueden no representar al equipo completo."

## Elementos que no deben aparecer

- Rankings, posiciones, medallas o puntajes.
- Evaluación de desempeño o recomendaciones disciplinarias.
- Costos monetarios de proveedores de IA.
- Líneas de código presentadas como medición verificada por Atlas.

## Versiones generadas

| Imagen | Fecha | Cambios |
|---|---|---|
| — | — | Pendiente de generar |
