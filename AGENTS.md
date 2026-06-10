# AGENTS.md — Enrutador de PaperLab

Lee SOLO lo que tu tarea necesita según esta tabla. No leas el resto.

## Reglas globales (siempre, sin excepción)

1. Dark mode EXCLUSIVO. Código de modo claro = error.
2. Un solo motor de simulación (TS puro, sin React/Netlify) para vivo, backtest y replay.
3. Sin IA/LLM en runtime: las señales son reglas deterministas.
4. Local-first: Netlify solo en la fase final.
5. Cero hex fuera de tokens (excepción: `theme/charts.ts`).
6. PROHIBIDO el estilo inline (`style={}` / `style=""`): todo estilo vive en clases reutilizables.
7. Tablas contables inmutables.

## Enrutado

| Tarea | Leer |
|---|---|
| UI / estilos / componentes / gráficos | `design-system/DESIGN_SYSTEM_MASTER.md` |
| Motor / órdenes / P&L | Plan §5, §6.4, §14 |
| Estrategias / señales | Plan §6 |
| Backtest / ¿Y si...? / Replay | Plan §7 |
| BD / esquema / migraciones | Plan §11, §14 |
| Proveedores de datos / ingesta | Plan §3.3, §14.7 |
| Métricas / informes / glosario | Plan §8, §2 |
| Panel admin | Plan §11.bis |
| Microcopy / textos | Design system §8 + Plan §2 |
| Despliegue | Plan §12.4 |
| Visión general (solo si es tu primera tarea) | Plan completo |

Plan = `docs/PLAN_PAPER_TRADING.md`

## Skills instaladas

- `skills/emil-design-eng/SKILL.md` → leerla al implementar o revisar interacciones de UI: animaciones, transiciones, easing, gestos, estados :active/hover y rendimiento de animación. Complementa al design system §6 (movimiento); en caso de conflicto manda el design system (p. ej. su prohibición de contadores animados de P&L y de animaciones ambientales).

**Regla de auto-registro — obligatoria para TODO agente IA:** antes de empezar cualquier tarea, escanea la carpeta `skills/` en la raíz del repo. Cada subcarpeta que contenga un archivo `SKILL.md` es una skill instalada. Si encuentras alguna que no aparezca en la lista de arriba, léela, añádela aquí (una línea: ruta → cuándo leerla, deducido de su descripción) y guarda el archivo antes de continuar. El propietario instala skills sin avisar; mantener esta lista al día es responsabilidad del agente, no del propietario.

## Conflictos

Propietario > Design system (visual) / Plan (funcional) > este archivo > otras skills. No resuelvas contradicciones en silencio: repórtalas.
