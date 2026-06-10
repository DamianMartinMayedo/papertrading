# DESIGN SYSTEM — PaperLab (nombre provisional)

> **Fuente de verdad visual del proyecto.** Toda UI generada por cualquier agente IA sigue estrictamente este documento. No se inventan colores, fuentes, radios ni patrones fuera de lo aquí definido. Si algo no está cubierto, se resuelve con la opción más sobria coherente con la identidad y se documenta aquí.
>
> Complementa (no sustituye) al PLAN_PAPER_TRADING.md. Este documento define el CÓMO se ve; el plan define el QUÉ hace.

---

## 1. Identidad: "Precisión fría"

PaperLab es un instrumento, no un escaparate. La referencia emocional es el terminal financiero profesional y la herramienta de medición: superficie oscura, datos nítidos, cero decoración que no informe. La interfaz debe transmitir que aquí los números son honestos — incluida la pérdida.

Principios:
1. **El dato es el protagonista.** El color, el tamaño y el movimiento existen para jerarquizar información, nunca para adornar.
2. **Frialdad deliberada.** Base oscura azulada-neutra, acento frío. El único calor visual permitido es el semántico (ámbar de aviso) y el rojo/verde de P&L.
3. **Quietud.** Una herramienta de uso diario no sorprende: misma estructura siempre, transiciones mínimas, sin animaciones ambientales.
4. **Honestidad tipográfica.** Todo número se muestra en monoespaciada con cifras tabulares. Un P&L nunca se "suaviza" visualmente.

**Elemento firma:** el *caret de datos* — una línea vertical de 2px en color acento que marca el elemento vivo o seleccionado (fila activa de una tabla, posición abierta destacada, paso actual del replay, input con foco). Es el único gesto recurrente de identidad. Se usa con disciplina: máximo uno visible por bloque de contenido.

---

## 2. Color

### 2.1 Modo

**Dark exclusivo.** No existe modo claro ni se prepara su soporte. `color-scheme: dark` a nivel raíz.

### 2.2 Tokens base (escala de superficies y texto)

Base neutra fría (gris azulado, nunca negro puro):

```css
:root {
  color-scheme: dark;

  /* ===== Superficies ===== */
  --bg-base:        #0B0E14;  /* fondo de la app */
  --bg-raised:      #11151D;  /* paneles, sidebar, header */
  --bg-elevated:    #171C26;  /* dropdowns, modales, tooltips */
  --bg-inset:       #07090D;  /* pozos: área del gráfico, code, inputs */
  --bg-hover:       #1A2030;  /* hover de filas e items */
  --bg-active:      #1F2638;  /* fila/ítem seleccionado */

  /* ===== Bordes y líneas ===== */
  --line-soft:      #1C212C;  /* divisores entre filas/secciones */
  --line-strong:    #2A3142;  /* bordes de inputs, contornos de panel */

  /* ===== Texto ===== */
  --text-primary:   #E8ECF4;  /* títulos, datos clave */
  --text-secondary: #9AA3B5;  /* labels, descripciones */
  --text-muted:     #5C6577;  /* metadatos, placeholders, disabled */

  /* ===== Acento (cian hielo) — el ÚNICO color de marca ===== */
  --accent:         #3DD6F5;  /* acciones, links, foco, caret firma */
  --accent-strong:  #19B8DB;  /* hover/active de acciones */
  --accent-subtle:  #0E2A33;  /* fondos de selección/acento al 100% opaco */
  --accent-text:    #06171C;  /* texto SOBRE superficies de acento */

  /* ===== Semántica de trading (INTOCABLE) ===== */
  --profit:         #2FBF71;  /* ganancia, compra, long */
  --profit-subtle:  #0D2A1C;
  --loss:           #F23645;  /* pérdida, venta, short */
  --loss-subtle:    #2E1217;
  --warning:        #E5A30D;  /* señales pendientes, avisos de riesgo */
  --warning-subtle: #2B2208;
  --neutral-flat:   #9AA3B5;  /* variación 0,00% / sin cambio */

  /* ===== Gráficos (series no semánticas, en orden de uso) ===== */
  --chart-1: #3DD6F5;  /* serie principal = acento */
  --chart-2: #8B7CF6;  /* benchmark / comparativa */
  --chart-3: #E5A30D;
  --chart-4: #5C6577;
}
```

### 2.3 Reglas de color (obligatorias)

- **Verde y rojo son léxico, no decoración.** `--profit` y `--loss` solo aparecen ligados a significado financiero (P&L, flechas de variación, lado compra/venta, drawdown). Jamás en botones genéricos, ilustraciones o estados de UI.
- **Errores de sistema** (validación, fallo de red) usan `--loss` con contexto textual claro; nunca pueden confundirse con una pérdida financiera (siempre acompañados de icono + texto, nunca solo el número en rojo).
- **Un solo acento.** Cualquier elemento interactivo no semántico (botones primarios, links, tabs activos, foco) usa el cian. Prohibido introducir un segundo color de marca.
- **Sin gradientes** salvo el área bajo curva de los gráficos de capital (degradado vertical del color de la serie a transparente, máx. 12% de opacidad en origen).
- **Sin negro puro (#000) ni blanco puro (#FFF)** en ningún punto.
- Variación exactamente 0,00% → `--neutral-flat`, nunca verde ni rojo.
- Contraste mínimo WCAG AA (4,5:1) en todo texto sobre su superficie; los pares definidos arriba ya cumplen — no alterar lightness por estética.

---

## 3. Tipografía

### 3.1 Familias (3 roles, las tres gratuitas)

| Rol | Fuente | Origen | Uso |
|---|---|---|---|
| **Display** | Cabinet Grotesk (700/800) | Fontshare | H1–H2, cifras-héroe de dashboard, nombre de carteras |
| **UI / Cuerpo** | General Sans (400/500/600) | Fontshare | Todo el texto de interfaz, labels, párrafos, botones |
| **Datos** | JetBrains Mono (400/600) | Google Fonts | TODO valor numérico, símbolos de ticker, fechas en tablas, código |

Autohospedadas (`@font-face`, `font-display: swap`, woff2 en `/public/fonts`). Nunca `<link>` a CDN de fuentes.

### 3.2 Reglas tipográficas (obligatorias)

- **Todo número viste mono:** precios, P&L, %, cantidades, fechas tabulares → JetBrains Mono con `font-variant-numeric: tabular-nums`. Sin excepción. Un número en General Sans es un bug.
- Los símbolos de activo (SPY, BTC) van en mono 600, tamaño del contexto.
- Display se usa con avaricia: máximo un elemento display por vista (el dato o título héroe). El resto es jerarquía por peso y color, no por tamaño.
- Escala: `12 / 13 / 14 (base UI) / 16 / 20 / 28 / 40px`. Interlineado: 1.5 en cuerpo, 1.1 en display, 1.4 en celdas de tabla.
- `letter-spacing: -0.02em` en display; normal en todo lo demás. Sin texto en mayúsculas sostenidas salvo símbolos de ticker.

---

## 4. Espaciado, densidad y radios

### 4.1 Dos densidades, declaradas por vista

- **Cockpit** (dashboard, tablas de posiciones, comparativas, bandeja de señales): unidad 4px; padding de celda `6px 12px`; filas de 36px; secciones separadas por `--line-soft`, no por espacio.
- **Lectura** (informes, glosario, diario, configuración del ¿Y si...?): unidad 8px; ancho de texto máx. `65ch`; padding generoso `24–32px`.

Cada pantalla pertenece a UNA densidad. No se mezclan en la misma vista (excepción: un panel de datos embebido en un informe conserva su densidad cockpit dentro de un contenedor con borde).

### 4.2 Radios (sistema único)

`--radius-sm: 6px` (inputs, badges, celdas seleccionadas) · `--radius-md: 10px` (paneles, modales, botones) · `0` (tablas, gráficos: el dato no se redondea). Nada de pills salvo badges de estado. Prohibido introducir otros valores.

### 4.3 Anti-tarjeta

Por defecto, la agrupación se hace con divisores (`--line-soft`) y espacio, no con cajas. Un panel con fondo `--bg-raised` + borde `--line-soft` se reserva para bloques verdaderamente independientes (un gráfico, la bandeja de señales, un modal). Prohibidas las tarjetas anidadas y las sombras como separador. Sombra solo en `--bg-elevated` (modales/dropdowns): `0 8px 24px rgb(0 0 0 / 0.45)`.

---

## 5. Componentes: reglas esenciales

- **Botón primario:** fondo `--accent`, texto `--accent-text`, radio md, sin sombra ni glow; hover → `--accent-strong`; active → `scale(0.98)`. Uno por vista como máximo.
- **Botón secundario:** transparente + borde `--line-strong` + texto `--text-primary`. **Destructivo:** solo en confirmaciones (borde y texto `--loss`).
- **Acciones de trading:** los botones Comprar/Vender son el ÚNICO caso de botón verde/rojo (fondo subtle + texto y borde del semántico). Siempre en pareja, siempre con confirmación.
- **Tablas:** cabecera en `--text-muted` 12px; números alineados a la derecha, texto a la izquierda; fila hover `--bg-hover`; fila activa `--bg-active` + caret firma a la izquierda. Cifras P&L con signo explícito (+/−) y color semántico.
- **Inputs:** fondo `--bg-inset`, borde `--line-strong`, foco = borde `--accent` (sin glow). Label encima, error debajo en `--loss` 12px. Nunca placeholder-como-label.
- **Badges de estado** (señal pendiente/ejecutada/rechazada, modo de cartera): fondo subtle del semántico + texto del semántico, radio pill, 11px mono.
- **Estados obligatorios** en todo componente con datos: cargando (skeleton con la forma final, sin spinners), vacío (qué hacer para poblarlo), error (qué pasó y cómo reintentar).
- **Tooltips de glosario:** todo término del diccionario (§2 del plan) se subraya con puntos (`text-decoration: underline dotted --text-muted`) y muestra la traducción llana al hover/tap. Es el mecanismo central de la capa de aprendizaje en UI.

---

## 6. Movimiento

Mínimo y funcional. `transition: 120ms ease-out` para hover/foco; `200ms` para apertura de paneles/modales. Los cambios de valor numérico en vivo parpadean el fondo de la celda al subtle semántico durante 400ms y vuelven (patrón terminal). Prohibido: animaciones infinitas, parallax, scroll-hijack, contadores animados de P&L (el dato aparece, no "corre"). Respetar `prefers-reduced-motion` eliminando incluso los flashes de celda.

---

## 7. Tema de gráficos (TradingView Lightweight Charts)

```ts
// theme/charts.ts — única fuente del tema de gráficos
export const chartTheme = {
  layout: {
    background: { color: '#07090D' },          // --bg-inset
    textColor: '#9AA3B5',                       // --text-secondary
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
  },
  grid: {
    vertLines: { color: '#1C212C' },            // --line-soft
    horzLines: { color: '#1C212C' },
  },
  crosshair: {
    vertLine: { color: '#3DD6F5', width: 1, style: 3, labelBackgroundColor: '#19B8DB' },
    horzLine: { color: '#3DD6F5', width: 1, style: 3, labelBackgroundColor: '#19B8DB' },
  },
  timeScale: { borderColor: '#2A3142' },        // --line-strong
  rightPriceScale: { borderColor: '#2A3142' },
} as const;

export const candleColors = {
  upColor: '#2FBF71', downColor: '#F23645',     // --profit / --loss
  borderUpColor: '#2FBF71', borderDownColor: '#F23645',
  wickUpColor: '#2FBF71', wickDownColor: '#F23645',
} as const;

export const equityCurveColors = {
  portfolio: '#3DD6F5',                          // --chart-1 (acento)
  benchmark: '#8B7CF6',                          // --chart-2
  areaTopOpacity: 0.12, areaBottomOpacity: 0,
} as const;
```

Marcadores de operación sobre el gráfico: compra = triángulo arriba `--profit`, venta = triángulo abajo `--loss`, señal no ejecutada = círculo `--warning`.

---

## 8. Voz y microcopy

Castellano, tono sobrio y directo, sentence case. Los botones nombran la acción exacta ("Ejecutar orden", no "Aceptar"). Los errores dicen qué pasó y qué hacer, sin disculpas ni vaguedad. Las cifras nunca se celebran ni se lamentan con copy ("¡Enhorabuena!" prohibido): el verde y el rojo ya hablan. La doble capa del glosario vive en tooltips e informes, no inflando los labels de la UI.

---

## 9. Reglas para agentes IA (resumen ejecutable)

1. Importar SIEMPRE los tokens desde el CSS raíz; cero hex hardcodeados en componentes (excepción: `theme/charts.ts`, que es la traducción oficial de los tokens para Lightweight Charts).
2. **PROHIBIDO el estilo inline** (`style={...}` en JSX, atributo `style=""` en HTML). Todo estilo vive en clases CSS reutilizables y nombradas; los estados dinámicos se resuelven alternando clases. Única excepción tolerada: una CSS custom property pasada por style cuando el valor es genuinamente dinámico (p. ej. `--progress: 34%` en una barra), y aun así la regla visual que la consume vive en la clase.
3. Número nuevo en pantalla → JetBrains Mono + tabular-nums + signo y color semántico si es variación.
4. Verde/rojo solo con significado financiero. Acento cian para todo lo interactivo. Ningún color nuevo sin editar este documento primero.
5. Antes de crear una "tarjeta", justificar por qué no basta un divisor.
6. Toda vista declara su densidad (cockpit o lectura) en un comentario de cabecera del componente página.
7. Estados loading/vacío/error implementados antes de dar un componente por terminado.
8. Términos de trading en UI → tooltip de glosario conectado a la tabla `glossary`.
9. Si una decisión visual no está cubierta aquí: elegir lo más sobrio, implementarlo y proponer la adición a este documento en el mismo PR/commit.
