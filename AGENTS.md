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
- `skills/vitest/SKILL.md` → leerla al escribir tests unitarios, configurar cobertura, mocking con `vi`, o trabajar con fixtures y snapshots de Vitest.
- `skills/vite/SKILL.md` → leerla al configurar `vite.config.ts`, crear plugins de Vite, trabajar con SSR o migrar a Vite 8 (Rolldown).
- `skills/typescript-advanced-types/SKILL.md` → leerla al implementar tipos complejos: generics, conditional types, mapped types, template literals, utility types y patrones type-safe.
- `skills/composition-patterns/SKILL.md` → leerla al refactorizar componentes React con muchos boolean props, diseñar compound components, o trabajar con context providers. Incluye APIs de React 19.
- `skills/react-best-practices/SKILL.md` → leerla al escribir, revisar o refactorizar código React/Next.js: optimización de re-renders, data fetching, bundle size, eliminación de waterfalls.
- `skills/nodejs-best-practices/SKILL.md` → leerla al tomar decisiones de arquitectura Node.js: selección de framework (Hono/Fastify/Express), patrones async, seguridad y despliegue.
- `skills/nodejs-backend-patterns/SKILL.md` → leerla al construir APIs REST/GraphQL, implementar autenticación JWT, middleware, integración con bases de datos o microservicios en Node.js.

**Regla de auto-registro — obligatoria para TODO agente IA:** antes de empezar cualquier tarea, escanea la carpeta `skills/` en la raíz del repo. Cada subcarpeta que contenga un archivo `SKILL.md` es una skill instalada. Si encuentras alguna que no aparezca en la lista de arriba, léela, añádela aquí (una línea: ruta → cuándo leerla, deducido de su descripción) y guarda el archivo antes de continuar. El propietario instala skills sin avisar; mantener esta lista al día es responsabilidad del agente, no del propietario.

**Convención de ubicación:** Las skills SIEMPRE se almacenan en `skills/<nombre-skill>/SKILL.md`. Si aparecen en `.agents/skills/` u otra ubicación oculta, muévelas a `skills/` antes de registrarlas.

## Conflictos

Propietario > Design system (visual) / Plan (funcional) > este archivo > otras skills. No resuelvas contradicciones en silencio: repórtalas.
