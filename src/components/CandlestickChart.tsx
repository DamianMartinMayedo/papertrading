import { useEffect, useRef } from 'react'
import { createChart, CandlestickSeries, type IChartApi } from 'lightweight-charts'
import { chartTheme, candleColors } from '../theme/charts'

interface CandleData {
  date: string
  open: number
  high: number
  low: number
  close: number
}

interface CandlestickChartProps {
  data: CandleData[]
  height?: number
}

export function CandlestickChart({ data, height = 400 }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      layout: chartTheme.layout,
      grid: chartTheme.grid,
      crosshair: chartTheme.crosshair,
      timeScale: chartTheme.timeScale,
      rightPriceScale: chartTheme.rightPriceScale,
      width: containerRef.current.clientWidth,
      height,
    })

    const series = chart.addSeries(CandlestickSeries, {
      upColor: candleColors.upColor,
      downColor: candleColors.downColor,
      borderUpColor: candleColors.borderUpColor,
      borderDownColor: candleColors.borderDownColor,
      wickUpColor: candleColors.wickUpColor,
      wickDownColor: candleColors.wickDownColor,
    })

    const formattedData = data.map((d) => ({
      time: d.date,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }))

    series.setData(formattedData)
    chart.timeScale().fitContent()
    chartRef.current = chart

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [data, height])

  return <div ref={containerRef} className="chart-container" />
}
