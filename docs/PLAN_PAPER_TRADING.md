# PLAN MAESTRO — Plataforma Personal de Paper Trading

> **Propósito de este documento:** Skill principal del proyecto. Cualquier agente IA que trabaje en este proyecto debe leer este documento completo antes de escribir código. Define el alcance funcional, el modelo de simulación, las estrategias, los mercados, las métricas y el stack técnico. **No define UI/UX** (decisión reservada al propietario del proyecto).
>
> **Contexto del usuario:** Proyecto personal. El propietario NO tiene experiencia previa en trading. Todo concepto financiero usado en el sistema debe existir en dos capas: terminología clásica (para aprender el vocabulario real) + traducción en lenguaje llano. Esta dualidad es un requisito de producto, no un extra.

---

## 1. Visión y objetivos

### 1.1 Qué es
Plataforma personal de **paper trading** (trading simulado con dinero ficticio y datos de mercado reales) orientada a:
1. Aprender trading sin riesgo económico.
2. Validar estrategias durante meses antes de considerar dinero real.
3. Ejecutar **múltiples estrategias y mercados en paralelo** y compararlas objetivamente.
4. Generar informes que respondan a la pregunta: *"¿qué habría pasado si esto fuese real?"*

### 1.2 Qué NO es
- No es un bróker. Nunca toca dinero real ni se conecta a cuentas reales.
- No es una herramienta de scalping ni day trading de alta frecuencia (las fuentes de datos gratuitas no lo permiten de forma fiel).
- No da consejos de inversión. Es un laboratorio personal.

### 1.3 Principio rector de la simulación
**Pesimismo realista:** ante la duda, la simulación debe ser ligeramente PEOR que la realidad (comisiones algo altas, slippage aplicado siempre, ejecución conservadora). Si una estrategia es rentable bajo condiciones pesimistas, hay más confianza en que lo sería en la realidad. Una simulación optimista produce falsas expectativas, que es el peor resultado posible del proyecto.

---

## 2. Glosario integrado (requisito de producto)

El sistema debe incluir un **diccionario interno** consultable y reutilizable en todo el código (tooltips, informes, logs). Cada término se almacena con: término clásico, traducción llana, ejemplo numérico, y nivel (básico / intermedio / avanzado).

Términos mínimos obligatorios (semilla inicial, ampliable):

| Término clásico | Traducción llana |
|---|---|
| Posición | Una compra que tienes abierta y aún no has vendido |
| Long / Largo | Apostar a que el precio subirá (comprar barato, vender caro) |
| Short / Corto | Apostar a que el precio bajará (en este sistema: solo simulado, ver §5.6) |
| P&L (Profit & Loss) | Cuánto has ganado o perdido, en € y en % |
| P&L realizado / no realizado | Ganancia ya cobrada (vendiste) vs. ganancia "en el aire" (aún no has vendido) |
| Orden de mercado | "Cómprame YA al precio que haya" |
| Orden limitada | "Cómprame solo si baja hasta X €" |
| Stop loss | Venta automática si pierdes más de X — tu freno de emergencia |
| Take profit | Venta automática al alcanzar X de ganancia — recoger beneficios sin avaricia |
| Trailing stop | Stop loss que sube con el precio: protege ganancias acumuladas |
| Spread | Diferencia entre precio de compra y de venta en el mismo instante (un coste oculto) |
| Slippage | El precio se mueve entre que decides y se ejecuta: casi siempre en tu contra |
| Drawdown | La mayor caída desde un máximo: "lo peor que has llegado a estar" |
| Win rate | % de operaciones que acabaron en ganancia |
| Profit factor | € ganados ÷ € perdidos. Mayor que 1 = ganas más de lo que pierdes |
| Sharpe ratio | Cuánta ganancia obtienes por cada unidad de "sustos" (volatilidad) |
| Benchmark | El listón a batir: si no superas a "comprar el índice y no hacer nada", tu estrategia sobra |
| OHLC | Los 4 precios de cada vela: apertura, máximo, mínimo, cierre |
| Vela (candlestick) | Resumen visual del precio en un periodo (1 día, 1 hora...) |
| Volumen | Cuántas acciones/monedas cambiaron de manos: mide el interés |
| ETF | Cesta de muchas acciones que se compra como si fuera una sola |
| DCA (Dollar Cost Averaging) | Comprar una cantidad fija cada cierto tiempo, pase lo que pase |
| Media móvil (SMA/EMA) | El precio "suavizado" de los últimos N días para ver la tendencia |
| RSI | Termómetro de 0 a 100: ¿está esto sobrecomprado (>70) o sobrevendido (<30)? |
| Volatilidad | Cuánto "se mueve" un activo. Alta = más oportunidad y más riesgo |
| Liquidez | Facilidad para comprar/vender sin mover el precio |
| Exposición | % de tu dinero que está invertido (vs. en "cash") |
| Apalancamiento | Operar con dinero prestado (FUERA del alcance de este proyecto, ver §16) |

**Regla para agentes IA:** cualquier métrica, campo o concepto nuevo que se añada al sistema debe registrarse en este diccionario con su traducción llana ANTES de implementarse.

---

## 3. Mercados y activos soportados

### 3.1 Universos preconfigurados (semilla)

**Universo A — ETFs USA (núcleo del proyecto):**
- SPY (S&P 500), QQQ (Nasdaq 100), DIA (Dow Jones), IWM (Russell 2000 — small caps), VTI (mercado total USA), GLD (oro), TLT (bonos largo plazo USA)
- *Por qué:* máxima liquidez, mejores datos gratuitos, comportamiento "educativo" (tendencias claras).

**Universo B — Acciones USA large cap:**
- AAPL, MSFT, GOOGL, AMZN, NVDA, META, TSLA, JPM, JNJ, XOM
- *Por qué:* nombres conocidos (facilita el aprendizaje), datos abundantes.

**Universo C — Crypto:**
- BTC, ETH, SOL, BNB + 2-3 alts líquidas configurables
- *Por qué:* mercado 24/7 (ideal para probar estrategias diarias sin horarios), datos en tiempo real gratuitos.

**Universo D — Benchmark puro (control del experimento):**
- Cartera "no hacer nada": 100% SPY con DCA mensual. Toda estrategia se compara SIEMPRE contra esta.

### 3.2 Particularidades por mercado que el motor DEBE modelar

| Aspecto | Acciones/ETFs USA | Crypto |
|---|---|---|
| Horario | 15:30–22:00 hora española (NYSE), L-V | 24/7/365 |
| Festivos | Calendario NYSE (debe estar en BD) | No aplica |
| Precio de cierre | Cierre oficial diario | "Cierre" convencional 00:00 UTC (definir y documentar) |
| Fracciones | Acciones fraccionadas permitidas (configurable) | Siempre fraccionable (8 decimales) |
| Dividendos | SÍ — deben simularse (ingreso en cash) | No |
| Splits | SÍ — ajuste retroactivo de posiciones | No |
| Comisión simulada por defecto | 1 € por operación + spread | 0,1% por operación (estilo exchange) |
| Slippage por defecto | 0,05% | 0,1% (0,3% para alts) |

### 3.3 Fuentes de datos (capa de proveedores intercambiable)

Diseñar como **interfaz `MarketDataProvider`** con implementaciones intercambiables, porque las APIs gratuitas cambian condiciones con frecuencia:

- **Acciones/ETFs:** Yahoo Finance (no oficial, gratuito, EOD fiable) como primaria; Alpha Vantage (25 req/día gratis) o Finnhub como respaldo; Polygon.io si en el futuro se quiere pagar.
- **Crypto:** CoinGecko (gratuito, generoso) primaria; API pública de Binance como respaldo (sin key para datos de mercado).
- **Requisito:** caché agresiva en Neon (los datos EOD de ayer no cambian nunca: se piden UNA vez y se guardan para siempre). El histórico acumulado se convierte en el activo más valioso del proyecto (alimenta el backtesting).
- **Requisito:** registro de salud del proveedor (último fetch OK, errores, latencia) y failover automático.

---

## 4. Arquitectura de cuentas y carteras paralelas

### 4.1 Jerarquía

```
Usuario (tú)
└── Carteras (N, ilimitadas) — cada una es un experimento aislado
    ├── Configuración: capital inicial, mercado(s), comisiones, slippage, divisa base (€)
    ├── Estrategia asignada (manual o preconfigurada, ver §6)
    ├── Posiciones abiertas
    ├── Historial de órdenes y operaciones cerradas
    ├── Cash disponible
    └── Diario de decisiones (ver §9)
```

### 4.2 Reglas
- Cada cartera es **estanca**: su dinero ficticio no se mezcla con otras.
- Capital inicial libre (ej.: 100 €, 1.000 €, 10.000 €) — permite comparar la misma estrategia con distintos capitales (los costes fijos pesan distinto).
- **Reinversión:** por defecto activada (interés compuesto); configurable a "retirar ganancias" simulado para ver el escenario "vivo de esto".
- Una cartera puede estar en modo **manual** (tú decides cada operación), **asistida** (la estrategia sugiere, tú confirmas) o **automática** (la estrategia ejecuta sola en el cierre diario).
- Carteras archivables (se congelan, no se borran: el histórico es oro).
- **Clonación de carteras:** duplicar una cartera con un parámetro cambiado para hacer test A/B limpio.

---

## 5. Motor de simulación (el corazón del sistema)

### 5.1 Tipos de órdenes soportadas
1. **Market** (a mercado) — se ejecuta al siguiente precio disponible + slippage.
2. **Limit** (limitada) — se ejecuta solo si el precio alcanza el límite. En simulación EOD: si el rango low–high del día siguiente cruza el límite, se considera ejecutada al precio límite.
3. **Stop loss** — orden de venta condicionada: si el precio toca el stop, se vende. Ejecución: precio stop con slippage añadido (pesimismo realista: en caídas bruscas se simula ejecución por debajo del stop si el open del día siguiente abre con hueco/gap por debajo → se ejecuta al open, no al stop. Esto modela los *gaps*, error clásico de simuladores ingenuos).
4. **Take profit** — venta condicionada al alza, misma lógica de cruce de rango.
5. **Trailing stop** — stop dinámico en % o en €, recalculado en cada cierre diario.
6. **OCO (One-Cancels-Other)** — pareja stop loss + take profit: la que se ejecute cancela la otra. Imprescindible para estrategias automáticas.

### 5.2 Modelo de ejecución End-of-Day (modo principal)
- El sistema corre un **ciclo de cierre diario** (cron, ver §12):
  1. Descarga OHLCV del día de todos los activos en seguimiento.
  2. Evalúa órdenes pendientes contra el rango del día (¿se cruzó algún límite/stop?).
  3. Ejecuta las estrategias automáticas → generan órdenes para la apertura del día siguiente.
  4. Recalcula valor de carteras, P&L, métricas.
  5. Genera el snapshot diario (ver §8.4) y el informe si toca.
- **Convención de ejecución:** las órdenes generadas "al cierre" se ejecutan al **precio de apertura del día siguiente** + slippage. NUNCA al cierre del propio día (eso sería *look-ahead bias*: usar información del futuro, el error nº1 que invalida simulaciones).

### 5.3 Modelo de costes (todo configurable por cartera)
- **Comisión:** fija (€/operación), porcentual (%), o mixta. Presets: "bróker barato" (1 €), "bróker tradicional" (0,12% mín. 8 € — estilo banca española), "exchange crypto" (0,1%).
- **Spread:** se aplica como medio-spread en cada lado (compra ligeramente cara, venta ligeramente barata). Preset por liquidez del activo.
- **Slippage:** % configurable, aplicado SIEMPRE en contra.
- **Impuestos (modo España, opcional pero recomendado):** simulación de tramos del ahorro IRPF (19% hasta 6.000 €, 21% hasta 50.000 €, 23% hasta 200.000 €...) aplicados sobre ganancias realizadas anuales + regla informativa de los "2 meses" (norma antiaplicación de pérdidas en recompras). Es la diferencia entre "gané 1.000 €" y "gané 1.000 € pero Hacienda se lleva 190". Pocos simuladores lo hacen y es clave para el objetivo de ingreso real.

### 5.4 Eventos corporativos
- **Dividendos:** en fecha ex-dividendo, ingreso en cash de la cartera (con retención simulada del 19% si modo España + 15% withholding USA con nota informativa W-8BEN). Datos de dividendos vía proveedor.
- **Splits:** ajuste automático de número de acciones y precio medio de compra.
- Si el proveedor da precios ajustados (adjusted close), documentar qué serie se usa para qué (ajustada para señales de estrategia; sin ajustar + dividendos explícitos para contabilidad de cartera).

### 5.5 Realismo configurable ("dial de realismo")
Cada cartera tiene un nivel de realismo seleccionable, pensado para el aprendizaje progresivo:
- **Nivel 1 — Aprendiz:** sin comisiones, sin slippage, sin impuestos. Para entender mecánicas sin ruido.
- **Nivel 2 — Realista (por defecto):** comisiones + spread + slippage.
- **Nivel 3 — Crudo:** todo lo anterior + impuestos España + gaps en stops + restricción de liquidez (no puedes comprar más del X% del volumen diario del activo — relevante solo si algún día se simulan small caps).

### 5.6 Posiciones cortas (short)
- Soportadas SOLO en nivel conceptual/educativo y marcadas como tales: la simulación de cortos reales requiere modelar coste de préstamo de acciones y margin calls. **Fase 2+, no MVP.** El glosario debe explicarlo aunque no se opere.

### 5.7 Validaciones del motor (anti-trampas)
- Imposible operar con cash que no se tiene.
- Imposible modificar operaciones pasadas (el historial es inmutable; las correcciones son nuevos registros).
- Toda ejecución guarda: timestamp, precio teórico, precio ejecutado, desglose de costes, y la versión de la estrategia que la generó (ver §6.5).
- **Test suite del motor obligatoria:** casos con resultados calculados a mano (compra→dividendo→split→venta con todos los costes) que deben cuadrar al céntimo. El motor de contabilidad no se toca sin que pasen estos tests.

---

## 6. Estrategias preconfiguradas (lanzables en paralelo)

Cada estrategia es un módulo con: parámetros configurables, valores por defecto razonables, descripción clásica + traducción llana, mercados compatibles, y nivel de actividad.

### 6.1 Pasivas / largo plazo (el listón a batir)
1. **Buy & Hold** — "Compra y olvídate". Compra inicial total, nunca vende. ETFs. *Es el benchmark obligatorio.*
2. **DCA mensual** — "La hormiguita": compra X € el día 1 de cada mes, pase lo que pase. ETFs/crypto.
3. **DCA con refuerzo en caídas** — DCA + compra extra si el activo cae >X% desde máximos. Parámetros: aporte base, % caída gatillo, multiplicador.
4. **Rebalanceo de cartera** — Cartera objetivo (ej. 60% SPY / 30% TLT / 10% GLD); cuando un peso se desvía >X%, vende lo sobrante y compra lo que falta. "Vender caro y comprar barato automáticamente".

### 6.2 End-of-day activas (núcleo del proyecto, §conversación previa)
5. **Cruce de medias móviles (SMA crossover)** — Compra cuando la media de 50 días cruza por encima de la de 200 (golden cross), vende al cruce inverso (death cross). "Subirse a la ola cuando la tendencia cambia". Parámetros: periodos rápido/lento, SMA vs EMA.
6. **Reversión a la media con RSI** — Compra cuando RSI < 30 (sobrevendido), vende cuando RSI > 70 o tras N días. "Comprar el pánico, vender la euforia". Parámetros: umbrales, periodo RSI, salida por tiempo.
7. **Momentum / Rotación mensual** — Cada mes, invierte en los N activos del universo con mejor rendimiento en los últimos 3-6 meses. "Apostar por el caballo que va ganando". Parámetros: ventana de momentum, nº de activos, frecuencia.
8. **Breakout de máximos (Donchian)** — Compra al superar el máximo de N días; vende al perder el mínimo de M días. "Comprar fuerza, soltar debilidad". Parámetros: N, M, stop ATR opcional.
9. **Bandas de Bollinger** — Compra al tocar banda inferior con confirmación, vende en banda media/superior. Parámetros: periodo, desviaciones.

### 6.3 Específicas crypto
10. **Grid trading** — Rejilla de órdenes compra/venta cada X% en un rango. "Cobrar peajes mientras el precio rebota". Parámetros: rango, nº de niveles, € por nivel. Aviso integrado: pierde si el precio sale del rango por abajo.
11. **DCA crypto semanal con take profit escalonado** — Aporte semanal + ventas parciales en hitos (+50%, +100%...).

### 6.4 Gestión de riesgo transversal (aplicable a CUALQUIER estrategia)
- **Position sizing:** nunca más del X% de la cartera en una posición (defecto: 10%) y/o riesgo máximo por operación del Y% del capital (defecto: 1-2% — "regla del 1%": si el stop salta, solo pierdes el 1% del total).
- **Stop loss global de cartera (kill switch):** si el drawdown de la cartera supera X% (defecto 20%), la estrategia se pausa y se notifica. "El botón de '¡para, que nos arruinamos!'".
- **Límite de operaciones simultáneas** y **exposición máxima** (% invertido vs. cash).
- Estos parámetros viven a nivel de cartera y se aplican como filtro final sobre cualquier orden generada.

### 6.5 Versionado de estrategias (imprescindible)
- Cambiar un parámetro crea una **nueva versión** (v1, v2...). Las operaciones registran con qué versión se hicieron. Sin esto, las métricas históricas se vuelven ininterpretables ("¿este win rate es de antes o después de cambiar el RSI a 25?").
- Comparador integrado: misma estrategia, distintas versiones, lado a lado.

### 6.6 Sistema de sugerencias de cierre diario (SIN IA — determinista por reglas)

**Aclaración de alcance (importante para agentes implementadores):** el sistema NO incluye ningún agente de IA, LLM ni modelo de machine learning para analizar el mercado o generar sugerencias. Todas las sugerencias provienen **exclusivamente de las reglas matemáticas de las estrategias** (§6.1–6.3): deterministas, reproducibles y auditables. La misma fecha + los mismos datos + la misma versión de estrategia producen SIEMPRE la misma sugerencia.

**Funcionamiento — la "bandeja de señales del día":**
1. Al completarse el ciclo de cierre diario (§5.2), cada estrategia evalúa sus reglas sobre los datos del día.
2. El resultado por cartera es una lista de **señales**: cada una con acción propuesta (comprar/vender/mantener/ajustar stop), activo, cantidad calculada según las reglas de riesgo (§6.4), y **explicación legible de la regla que la disparó** en doble capa (clásica + llana). Ejemplo: *"Señal de compra QQQ — el RSI(14) cerró en 27,3, por debajo de tu umbral de 30. Traducción: el activo lleva días castigado y la estrategia considera que está 'en rebajas'."*
3. Según el modo de la cartera (§4.2):
   - **Manual:** no se generan señales (tú decides todo).
   - **Asistida:** las señales quedan en la bandeja con caducidad (válidas hasta la apertura siguiente). Tú las apruebas, rechazas o modificas. Toda decisión queda registrada en el diario (§9) — incluidas las señales rechazadas, que son material de aprendizaje de primer orden ("¿qué habría pasado si hubiera hecho caso?": el sistema calcula el resultado hipotético de las señales rechazadas y lo muestra en el informe semanal).
   - **Automática:** las señales se convierten en órdenes para la apertura siguiente sin intervención, siempre filtradas por la gestión de riesgo (§6.4) y el kill switch.
4. Cada señal persiste en BD (tabla `signals`) con su estado final: aprobada / rechazada / expirada / auto-ejecutada, y referencia a la orden resultante si la hubo.

**Regla de transparencia:** ninguna señal puede mostrarse sin su explicación. Un sistema que dice "compra" sin decir por qué entrena la obediencia, no el criterio — y el criterio es el objetivo del proyecto.

---

## 7. Backtesting (el laboratorio del laboratorio)

- Motor que ejecuta cualquier estrategia sobre el **histórico almacenado** (mínimo 5-10 años para ETFs, lo disponible para crypto) en segundos.
- **Comparte el mismo código de ejecución que el paper trading en vivo** (regla de oro: un solo motor, dos modos — histórico y forward). Si hay dos motores, divergen y los resultados no son comparables.
- Salidas: curva de capital, métricas completas (§8), listado de operaciones simuladas.
- **Protecciones anti-autoengaño integradas (con explicación llana en el informe):**
  - *Look-ahead bias:* el motor jamás usa datos del futuro (garantizado por diseño en §5.2).
  - *Overfitting:* si pruebas 50 combinaciones de parámetros y eliges la mejor, esa cifra está inflada. El sistema debe ofrecer **validación train/test** (optimizar en 2015-2021, validar en 2022-2025) y avisar cuando una configuración solo se ha visto en datos de optimización.
  - *Survivorship bias:* nota informativa al usar solo activos que "siguen vivos".
- **Walk-forward simple** en fase 2: re-optimización periódica simulada.

### 7.1 Simulador "¿Y si...?" (máquina del tiempo)

Modo simplificado de backtesting pensado para preguntas en lenguaje de persona normal, sin necesidad de definir una estrategia:

> *"¿Qué habría pasado si hubiera puesto 100 € en NVDA el año pasado?"*
> *"¿Y 50 €/mes en SPY desde 2020?"*
> *"¿Y 300 € repartidos entre BTC, ETH y QQQ hace 18 meses?"*

**Entradas del escenario:**
- Importe (único o aportación periódica con frecuencia).
- Uno o varios activos con reparto en % (presets: los universos del §3.1 o cestas personalizadas guardables).
- Fecha de inicio (y fin opcional; por defecto, hoy).
- Nivel de realismo (§5.5) — por defecto nivel 2, para que el resultado incluya el peaje de costes.

**Salidas:**
- Valor final, P&L en € y %, CAGR, max drawdown del periodo ("habrías llegado a estar un -34% en marzo de 2020: ¿habrías aguantado sin vender?").
- Curva de capital del escenario superpuesta con el benchmark (SPY) y, opcionalmente, con "dejarlo en el banco al 0%" e inflación española acumulada (la comparación más honesta para un novato).
- Desglose por activo si la cesta es múltiple.
- Con realismo nivel 3: estimación de impuestos si vendieras hoy ("ganas 412 €, pero netos serían ~334 €").

**Implementación:** internamente es el MISMO motor del §7 ejecutando una pseudo-estrategia trivial (compra inicial o DCA). Cero código de simulación nuevo: solo una capa de entrada simplificada. Los escenarios se guardan en BD (tabla `whatif_scenarios`) y son re-ejecutables ("este escenario, actualizado a hoy") y comparables entre sí.

**Valor educativo añadido:** este modo es la puerta de entrada perfecta para el usuario novato — permite jugar con la máquina del tiempo antes de entender qué es una estrategia, y descubre de forma natural conceptos como drawdown, costes e impuestos viendo sus propios "¿y si...?".

### 7.2 Modo Replay (simulación histórica interactiva)

La herramienta de aprendizaje más potente del sistema: **revivir un periodo pasado del mercado día a día, operando a ciegas**, sin saber qué viene después. Comprime meses o años de experiencia de mercado en una sola sesión, eliminando la limitación principal del paper trading en vivo (que acumular experiencia requiere meses de calendario real).

**Funcionamiento:**
1. Se crea una **sesión de replay** eligiendo: activo(s) o universo, capital inicial, nivel de realismo, y periodo histórico. Modos de selección del periodo:
   - **Manual:** el usuario elige fechas (ej.: "2022 completo, el año bajista").
   - **Aleatorio ciego (recomendado para aprendizaje):** el sistema elige activo y periodo al azar y **los oculta** — el usuario ve velas y precios normalizados (base 100) sin saber qué activo es ni en qué año está. Esto elimina por completo el sesgo de retrospectiva ("sé que esto es Bitcoin en 2021, así que compro"). El activo y periodo reales se revelan al terminar.
2. El motor avanza **día a día bajo control del usuario**: en cada paso solo se muestran los datos disponibles hasta ese día (garantía estructural anti look-ahead, reutilizando el diseño del §5.2). El usuario puede operar con todos los tipos de órdenes del §5.1, dejar pasar el día, o avanzar N días de golpe.
3. Las reglas del motor son EXACTAMENTE las mismas que en vivo: costes, slippage, gaps en stops, gestión de riesgo. Mismo motor, tercera modalidad de ejecución (vivo / backtest / replay).
4. El diario (§9) funciona dentro del replay: tesis y emoción por operación. Las sesiones de replay alimentan las estadísticas del diario con una etiqueta propia (separadas de las de "en vivo", pero comparables).

**Al finalizar la sesión:**
- Revelación del activo/periodo (si era ciego) y resultados completos con las métricas del §8.
- Triple comparación: tu resultado vs. buy & hold del mismo periodo vs. la mejor estrategia automática del catálogo en ese mismo periodo ("lo hiciste mejor que el RSI, peor que no tocar nada").
- Momentos clave señalados: tus mejores/peores decisiones, y qué pasó en el mercado real esos días (contexto: "ese -12% fue el inicio del COVID").

**Persistencia:** tabla `replay_sessions` con estado guardable/reanudable (una sesión puede durar varios días reales), historial completo de la sesión, y ranking personal de sesiones.

**Regla para agentes IA:** el replay NO es un módulo nuevo de simulación — es el motor único (§12.3) alimentado con un cursor de fecha controlado por el usuario en lugar de por el cron. Cualquier implementación que duplique lógica de ejecución para el replay viola la arquitectura.

---

## 8. Estadísticas y métricas (con doble capa: clásica + llana)

### 8.1 Métricas por operación
Precio entrada/salida real vs. teórico, costes desglosados, P&L bruto/neto en € y %, duración, motivo de cierre (señal / stop / take profit / manual / kill switch), R-múltiplo ("¿cuántas veces lo que arriesgaste ganaste?" — P&L ÷ riesgo asumido al entrar).

### 8.2 Métricas por cartera/estrategia
| Métrica | Traducción llana mostrada junto al valor |
|---|---|
| Rentabilidad total y CAGR | Cuánto has ganado en total y "a cuánto sale al año" |
| P&L realizado vs. no realizado | Lo cobrado vs. lo que aún flota |
| Max drawdown (y duración) | La peor racha: cuánto caíste desde máximos y cuánto tardaste en recuperarte |
| Win rate | De cada 100 operaciones, cuántas ganan |
| Profit factor | Por cada € perdido, cuántos € ganados |
| Expectancy | Lo que ganas "de media" cada vez que aprietas el gatillo |
| Sharpe ratio (anualizado) | Ganancia por unidad de sustos. >1 decente, >2 muy bueno |
| Sortino ratio | Como Sharpe pero solo cuenta los sustos malos (caídas) |
| Volatilidad anualizada | Cuánto se zarandea tu cartera |
| Exposición media | % del tiempo/dinero que estuviste invertido |
| Racha máx. ganadora/perdedora | Para calibrar tu estómago: ¿aguantarías 7 pérdidas seguidas? |
| Coste total de fricción | Total pagado en comisiones+spread+slippage: "el peaje acumulado" |
| Alpha vs. benchmark | Lo que ganas POR ENCIMA de no hacer nada (SPY). Si es negativo, la estrategia sobra |

### 8.3 Métricas comparativas (la funcionalidad estrella)
- Tabla y ranking de TODAS las carteras activas: misma ventana temporal, mismas métricas, normalizadas a base 100.
- Comparación obligatoria contra Universo D (benchmark).
- "Torneo de estrategias": vista de eliminación a N meses vista.

### 8.4 Snapshots e informes
- **Snapshot diario** (automático, silencioso): valor de cada cartera, posiciones, métricas. Es la materia prima de todo gráfico histórico — sin snapshots diarios no hay curva de capital fiable.
- **Informe semanal** (el principal, según lo acordado): resumen por cartera, operaciones de la semana, "qué habría pasado en dinero real" (incluyendo costes e impuestos del nivel de realismo), comparativa vs. benchmark, y una sección "lecciones" que cruza resultados con el diario (§9).
- **Informe mensual:** agregado + evolución de métricas lentas (Sharpe, drawdown).
- Exportables (JSON/CSV) — los datos son tuyos.

---

## 9. Diario de trading (journaling) — el diferencial del proyecto

- Toda operación **manual o asistida** exige (configurable a "recomienda") registrar ANTES de ejecutar: tesis ("¿por qué entro?"), emoción dominante (selector simple: confiado/dudoso/FOMO/aburrido/revancha), escenario de salida previsto.
- Al cerrar la operación, el sistema confronta: tesis vs. resultado. "¿Acertaste por tu razón o por suerte?"
- **Estadísticas del diario:** rendimiento por emoción (la cifra más reveladora para un novato: las operaciones por "revancha" o FOMO suelen ser las peores), por tipo de tesis, por día de la semana.
- Las estrategias automáticas auto-rellenan su tesis (la señal que dispararon), de modo que todo el historial es auditable con el mismo formato.

---

## 10. Sistema de alertas y notificaciones

- Alertas de precio (cruce de nivel), de señal de estrategia (en modo asistido), de riesgo (drawdown acercándose al kill switch, posición >X%), y operativas (fallo del fetch de datos, proveedor caído).
- Canales: in-app (centro de notificaciones persistido en BD) + email (Netlify Function + servicio tipo Resend) opcional.
- Anti-ruido: agrupación diaria configurable.

---

## 11. Modelo de datos (esquema conceptual para Neon/Postgres)

Tablas principales (nombres orientativos; el agente que implemente definirá detalles con Drizzle):

- `instruments` — activos: símbolo, tipo (etf/stock/crypto), mercado, divisa, metadatos (fraccionable, calendario).
- `price_bars` — OHLCV diario por instrumento. **Particionada/indexada por (instrument_id, date). Inmutable. Es la tabla que más crece y más se lee.**
- `corporate_actions` — dividendos y splits.
- `fx_rates` — USD/EUR diario (las carteras se contabilizan en €; los activos cotizan en USD: la divisa es una fuente de P&L real que debe modelarse, no ignorarse).
- `portfolios` — carteras: capital inicial, configuración de costes, nivel de realismo, modo (manual/asistida/auto), estado.
- `strategies` y `strategy_versions` — definición + parámetros versionados (JSONB).
- `orders` — órdenes con estado (pendiente/ejecutada/cancelada/expirada), tipo, condiciones.
- `executions` — ejecuciones: precio teórico, precio final, desglose de costes. Inmutable.
- `positions` — posiciones abiertas (derivable de executions, pero materializada por rendimiento).
- `portfolio_snapshots` — foto diaria por cartera (valor, cash, exposición, métricas). Inmutable.
- `journal_entries` — diario: tesis, emoción, plan de salida, post-mortem.
- `glossary` — el diccionario del §2.
- `signals` — señales diarias generadas por estrategias (§6.6): regla disparada, explicación, estado (aprobada/rechazada/expirada/auto-ejecutada), resultado hipotético de las rechazadas.
- `whatif_scenarios` — escenarios guardados del simulador "¿Y si...?" (§7.1).
- `replay_sessions` — sesiones del Modo Replay (§7.2): configuración, cursor de fecha, estado reanudable, resultados.
- `system_settings` — configuración global del sistema editable desde el panel de administración (§11.bis), versionada (cada cambio guarda quién/cuándo/valor anterior).
- `reports` — informes generados (persistidos, no recalculados).
- `data_provider_log` — salud de proveedores, fetches, errores.
- `tax_lots` — lotes fiscales FIFO para el cálculo de impuestos España (la normativa española obliga a FIFO: lo primero que compras es lo primero que "vendes" fiscalmente).

Reglas: tablas contables inmutables (sin UPDATE/DELETE; correcciones = nuevos registros), todo timestamp en UTC con timezone explícita (los errores de zona horaria entre NYSE, UTC crypto y hora española son la fuente nº1 de bugs en este dominio).

---

## 11.bis Panel de administración del sistema

Panel completo de configuración (protegido con PIN, siguiendo la convención de proyectos previos del propietario). Todo lo configurable del sistema debe ser editable desde aquí **sin tocar código**, persistido en `system_settings` con historial de cambios. Secciones:

**Datos de mercado:**
- Gestión de instrumentos: añadir/desactivar activos y universos, editar metadatos.
- Gestión de proveedores: orden de prioridad, API keys (solo escritura, nunca se muestran completas), estado de salud, contadores de cuota consumida, botón de fetch manual y de re-descarga de histórico por activo/rango.
- Visor/editor de huecos de datos: días sin vela detectados y herramienta de relleno desde proveedor alternativo.

**Motor de simulación:**
- Valores por defecto globales de comisiones, spread y slippage por tipo de activo (los presets del §5.3 deben ser editables, no hardcodeados).
- Parámetros fiscales España: tramos IRPF y retenciones editables (cambian con los años; no pueden vivir en el código).
- Calendario de mercado: festivos NYSE editables/importables por año.
- Hora de ejecución del ciclo EOD y reejecuciones manuales ("relanzar el cierre del día X") con idempotencia garantizada (§14.4).

**Estrategias:**
- Catálogo: activar/desactivar estrategias disponibles, editar parámetros por defecto y rangos válidos de cada parámetro (validados con Zod).
- Gestión de versiones: ver el historial de versiones de cada estrategia y qué carteras usan cuál.

**Carteras y operativa:**
- Vista global de todas las carteras (incluidas archivadas), kill switches activados, posiciones agregadas.
- Acciones administrativas auditadas: pausar todas las estrategias automáticas (botón de pánico global), archivar carteras, forzar recálculo de snapshots/métricas de una cartera.

**Glosario y contenidos:**
- CRUD completo del diccionario del §2 (términos, traducciones, ejemplos, niveles).
- Edición de las explicaciones llanas de señales e informes (plantillas de texto).

**Sistema:**
- Configuración de notificaciones y email.
- Exportaciones (JSON/CSV por tabla o completas) y disparo de backup manual.
- Logs: ciclo EOD (últimas ejecuciones, duración, errores), proveedor de datos, cambios de configuración.
- Panel de estado: tamaño de BD, nº de velas almacenadas, última ejecución correcta de cada job.

**Regla para agentes IA:** cualquier valor que pueda querer cambiarse sin redesplegar (umbral, coste, texto, calendario, cuota) nace como `system_setting` editable desde este panel, nunca como constante en código.

---

## 12. Stack técnico

### 12.1 Confirmado por el propietario
- **Frontend:** React (+ Vite + TypeScript, siguiendo convención de proyectos previos del propietario).
- **Base de datos:** Neon (Postgres serverless).
- **Hosting:** Netlify (desarrollo y pruebas 100% en local primero).

### 12.2 Recomendaciones que completan el stack

**Gráficos — decisión principal:**
- **TradingView Lightweight Charts v5** (`lightweight-charts`, actualmente v5.x) — el estándar de facto para gráficos financieros web: velas, líneas, áreas, volumen, marcadores de operaciones sobre el gráfico, rendimiento canvas excelente con años de datos diarios, ~190 KB, licencia Apache 2.0 (requiere atribución visible a TradingView). Integración en React mediante wrapper propio ligero con hooks (los wrappers de terceros van por detrás de las versiones; el patrón `useRef` + ciclo de vida es sencillo y es la recomendación oficial).
- **Complemento para gráficos NO financieros** (comparativas de métricas, barras de win rate, distribución de R-múltiplos): **Recharts** o **ECharts** — Lightweight Charts solo hace series temporales financieras; los dashboards de métricas necesitan otra librería. Recomendación: ECharts si se quieren heatmaps/distribuciones avanzadas; Recharts si se prioriza simplicidad React.
- **Cálculo de indicadores** (SMA, EMA, RSI, Bollinger, ATR): librería `indicatorts` o implementación propia testeada (los indicadores son matemática simple; tener tests propios > dependencia). Decisión del agente implementador, con tests obligatorios contra valores de referencia conocidos.

**Backend / jobs:**
- **Netlify Functions** para API + **Netlify Scheduled Functions** (cron) para el ciclo de cierre diario (§5.2) — **solo en el despliegue final** (ver §12.4: todo el desarrollo es local-first). Atención al límite de ejecución (10 s estándar, 15 min en background functions): el ciclo de cierre debe ser una *background function* o trocearse por mercado.
- En local: handlers servidos con un mini-servidor (Hono/Express) o `netlify dev`, y un script `npm run eod` para disparar el ciclo manualmente.
- **Drizzle ORM** sobre Neon (TypeScript end-to-end, migraciones versionadas).
- **Zod** para validar payloads y parámetros de estrategias (los JSONB de `strategy_versions` necesitan esquema).

**Estado y datos en el frontend:**
- **TanStack Query** para todo dato del servidor (precios, carteras, informes) — caché, revalidación, estados de carga.
- **Zustand** solo para estado puramente de cliente (coherente con proyectos previos del propietario).

**Calidad:**
- **Vitest** para la test suite del motor (§5.7) y de indicadores. El motor de contabilidad y el de ejecución son los dos módulos con cobertura obligatoria.

### 12.3 Decisión arquitectónica clave
El **motor de simulación es un paquete TypeScript puro, sin dependencias de React ni de Netlify** (`/packages/engine` o `/src/engine` aislado): recibe datos, devuelve resultados. Así corre idéntico en sus **tres modalidades** — en vivo (cron diario), backtesting/"¿Y si...?" (histórico de golpe) y Modo Replay (histórico con cursor controlado por el usuario) — además de en los tests. Esta separación es innegociable para la regla "un solo motor" del §7.

### 12.4 Estrategia local-first (Netlify se configura AL FINAL)

**Regla:** todo el desarrollo y las pruebas (Fases 0–6 completas) ocurren en local. Netlify no se toca hasta que el sistema está terminado y validado. El despliegue debe ser un paso trivial, no un hito de proyecto. Para que eso sea cierto:

- **API:** los handlers se escriben como funciones TypeScript puras (request → response) sin imports de Netlify. En local se sirven con un mini-servidor (Hono o Express) o con `netlify dev` si se prefiere emular; en producción se envuelven como Netlify Functions. El envoltorio es la única pieza específica de Netlify del proyecto y se escribe en la fase final.
- **Ciclo EOD / cron:** en local es un script `npm run eod` ejecutable manualmente (y opcionalmente programable con node-cron o el programador de tareas del SO). Solo al desplegar se convierte en Netlify Scheduled Function. Como el ciclo es idempotente (§14.4), correrlo a mano sin horario fijo durante el desarrollo es seguro.
- **Base de datos — decisión a tomar en Fase 0 (ambas válidas):**
  - **Opción A (recomendada): Neon desde el día 1.** Neon es Postgres en la nube; usarlo no implica desplegar nada — es solo una connection string en el `.env` local. Beneficios: cero fricción en la migración final, y el branching de Neon permite una rama de BD de desarrollo separada de la rama con el histórico y operativa "reales".
  - **Opción B: Postgres local (Docker) durante todo el desarrollo**, migrando a Neon al final. 100% offline. Viable porque ambos son Postgres estándar y las migraciones viven en Drizzle; la migración final es exportar/importar datos + cambiar la connection string. Requiere disciplina: no usar ninguna extensión o configuración no disponible en Neon.
- **Variables de entorno:** un único `.env` local (con `.env.example` versionado y sin secretos) cuyas claves se replican en Netlify solo al final.
- **Checklist de despliegue final (única tarea Netlify del proyecto):** crear sitio, conectar repo, variables de entorno, envolver handlers como Functions, convertir `npm run eod` en Scheduled (background) Function, verificar límites de ejecución, y smoke test del ciclo EOD en producción.

---

## 13. Fases de desarrollo

**Filosofía de fases:** las primeras fases entregan un **proyecto funcional y usable de verdad** (se puede hacer paper trading real desde la Fase 0); las posteriores añaden complejidad y profundidad. El propietario debe **operar manualmente desde la primera semana**, en paralelo al desarrollo — la plataforma crece alrededor de una práctica real, nunca como prerequisito de ella.

**Fase 0 — MVP funcional (solo crypto):**
Se empieza por crypto deliberadamente: elimina de golpe el ~40% de la complejidad del dominio (sin calendario de festivos, sin horarios de mercado, sin divisa USD/EUR para BTC/EUR vía CoinGecko, sin dividendos ni splits, datos 24/7 gratuitos).
Alcance: esquema mínimo de BD + ingesta y caché de BTC/ETH/SOL + motor contable básico (órdenes market, cash, P&L realizado/no realizado) + 1 cartera manual + snapshot diario + gráfico de velas con marcadores de operaciones + test suite contable inicial.
*Criterio de salida: puedes comprar y vender manualmente, el P&L cuadra al céntimo con cálculo a mano, y llevas operando al menos una semana.*

**Fase 1 — Realismo y órdenes completas (sigue solo crypto):**
Costes nivel 2 (comisión + spread + slippage) + órdenes limit/stop/TP/trailing/OCO + ciclo de cierre diario automatizado (cron) + modelado de gaps en stops + carteras múltiples paralelas con comparativa básica.
*Criterio de salida: el ciclo EOD corre solo cada noche de forma idempotente y las órdenes condicionadas se ejecutan correctamente contra el rango del día.*

**Fase 2 — ETFs y acciones (entra la complejidad de mercado tradicional):**
Calendario NYSE y festivos + zona horaria anclada a Nueva York + divisa USD/EUR (`fx_rates`) + dividendos y splits + universos A y B + ingesta de 10 años de histórico de ETFs.
*Criterio de salida: una cartera de SPY con un dividendo y los tests contables multi-divisa cuadran.*

**Fase 3 — Estrategias y señales:**
Framework de estrategias + versionado + las 4 pasivas (§6.1) + benchmark automático (Universo D) + 2 activas (cruce de medias, RSI) + **bandeja de señales diarias (§6.6) en modos asistido y automático** + estimación fiscal simple informativa (~19-21% sobre ganancias realizadas, sin FIFO aún).
*Criterio de salida: dos estrategias corriendo solas en paralelo durante 2 semanas sin intervención, comparadas contra el benchmark.*

**Fase 4 — Las máquinas del tiempo:**
Backtesting (§7) sobre el mismo motor + protecciones anti-autoengaño + simulador "¿Y si...?" (§7.1) + **Modo Replay (§7.2) incluido el modo aleatorio ciego**.
*Criterio de salida: una sesión de replay ciego completada de principio a fin con el mismo motor que opera en vivo.*

**Fase 5 — Capa de aprendizaje:**
Glosario completo integrado en todas las métricas e informes, diario con emociones (en vivo y en replay), informes semanales completos, estadísticas del diario, seguimiento de señales rechazadas con resultado hipotético.

**Fase 6 — Profundidad y refinamiento:**
Resto de estrategias (momentum, breakout, Bollinger, grid, DCA crypto con TP escalonado) + impuestos España rigurosos (FIFO con `tax_lots`, tramos editables) + dial de realismo nivel 3 + alertas email + cálculo de "capital necesario para tu objetivo de ingreso" (§15.3).

**Fase 7 — Despliegue a Netlify (la última, y la más corta):**
Ejecutar la checklist del §12.4. Si el desarrollo respetó la arquitectura local-first, esta fase es cuestión de horas, no de semanas. *Criterio de salida: el ciclo EOD corre solo en producción durante una semana sin intervención.*

**Panel de administración (§11.bis):** transversal — cada fase entrega la parte del panel que gestiona lo que esa fase construye (Fase 0: proveedores y datos; Fase 1: parámetros del motor; Fase 2: calendario y divisas; Fase 3: estrategias; etc.). Nunca se deja "para el final".

**Reglas de fases:**
1. No se empieza una fase sin que los tests de la anterior pasen.
2. Cada fase deja el sistema usable por sí misma.
3. El esquema de BD se diseña desde la Fase 0 contemplando el plan completo (las tablas del §11 existen aunque vacías o parciales), para que añadir complejidad nunca exija migraciones destructivas del histórico acumulado.

---

## 14. Elementos imprescindibles que suelen olvidarse (checklist)

1. **Zona horaria y calendario:** NYSE cierra a las 22:00 española (21:00 en horario de invierno USA distinto al europeo — ¡hay 2-3 semanas al año desincronizadas!). El cron debe anclarse a hora de Nueva York, no a hora española.
2. **Divisa:** activos en USD, contabilidad en EUR. Sin `fx_rates`, todo el P&L está mal.
3. **Datos faltantes:** días sin vela (festivo, fallo del proveedor) no pueden romper estrategias ni métricas. Política explícita de huecos.
4. **Idempotencia del cron:** si el ciclo diario corre dos veces (reintento de Netlify), no puede duplicar ejecuciones. Clave de idempotencia por (fecha, cartera).
5. **Reproducibilidad:** misma estrategia + mismos datos = mismo resultado, siempre. Nada de `Math.random()` ni de depender de la hora de ejecución.
6. **Backup/export:** Neon tiene branching y restore, pero un export periódico a JSON/CSV descargable da soberanía sobre años de histórico personal.
7. **Presupuesto de API:** contador de requests por proveedor visible; las cuotas gratuitas se agotan en silencio.
8. **Semilla de datos para desarrollo:** dataset sintético/fixture para desarrollar sin quemar cuota de APIs.
9. **Aviso permanente anti-extrapolación:** los informes deben recordar que rentabilidades pasadas (incluso simuladas con rigor) no garantizan nada, y que el paper trading no simula el factor psicológico del dinero real — la razón por la que el diario de emociones (§9) existe.
10. **Sin secretos en el frontend:** las API keys de proveedores viven solo en variables de entorno de Netlify Functions.

---

## 15. Criterio de éxito del proyecto (recordatorio del objetivo real)

El éxito NO es "la plataforma funciona". El éxito es poder responder, tras 6-12 meses de simulación, con datos y no con sensaciones:

1. ¿Alguna estrategia bate consistentemente al benchmark (SPY buy & hold) después de costes e impuestos?
2. ¿Con qué drawdown, y lo habría soportado emocionalmente (según el diario)?
3. ¿Qué capital real haría falta para que esa rentabilidad genere el ingreso objetivo? (la plataforma debe calcular esto explícitamente: "con la rentabilidad demostrada de X% anual, para 1.000 €/mes necesitarías ~Y € de capital").

Si la respuesta a (1) es "ninguna", el proyecto también ha tenido éxito: habrá evitado pérdidas reales y habrá señalado la inversión pasiva como camino racional.

---

## 16. Fuera de alcance (explícito, para que ningún agente lo añada por iniciativa)

- **Agentes de IA, LLMs o machine learning para analizar el mercado o generar sugerencias.** Las sugerencias del sistema (§6.6) son SIEMPRE reglas matemáticas deterministas de las estrategias. La IA participa en la construcción del proyecto, nunca en su funcionamiento.
- Dinero real, conexión con brókers reales, ejecución real de órdenes.
- Apalancamiento, derivados (opciones, futuros, CFDs), forex.
- Scalping / intradía con datos tick (incompatible con fuentes gratuitas).
- Multi-usuario, autenticación pública, monetización (proyecto personal; un PIN local como en proyectos previos del propietario es suficiente).
- Consejo financiero de ningún tipo: el sistema describe, mide y educa; no recomienda invertir.
