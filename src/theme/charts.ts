export const chartTheme = {
  layout: {
    background: { color: '#07090D' },
    textColor: '#9AA3B5',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
  },
  grid: {
    vertLines: { color: '#1C212C' },
    horzLines: { color: '#1C212C' },
  },
  crosshair: {
    vertLine: { color: '#3DD6F5', width: 1, style: 3, labelBackgroundColor: '#19B8DB' },
    horzLine: { color: '#3DD6F5', width: 1, style: 3, labelBackgroundColor: '#19B8DB' },
  },
  timeScale: { borderColor: '#2A3142' },
  rightPriceScale: { borderColor: '#2A3142' },
} as const

export const candleColors = {
  upColor: '#2FBF71',
  downColor: '#F23645',
  borderUpColor: '#2FBF71',
  borderDownColor: '#F23645',
  wickUpColor: '#2FBF71',
  wickDownColor: '#F23645',
} as const

export const equityCurveColors = {
  portfolio: '#3DD6F5',
  benchmark: '#8B7CF6',
  areaTopOpacity: 0.12,
  areaBottomOpacity: 0,
} as const
