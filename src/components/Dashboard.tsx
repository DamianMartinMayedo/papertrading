import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CandlestickChart } from './CandlestickChart'
import { OrderForm } from './OrderForm'
import { PortfolioView } from './PortfolioView'

interface Instrument {
  id: string
  symbol: string
}

interface PriceBar {
  date: string
  open: string
  high: string
  low: string
  close: string
}

interface Portfolio {
  id: string
  name: string
  cash: string
  initialCapital: string
  positions: {
    id: string
    instrumentId: string
    quantity: string
    averagePrice: string
    totalCost: string
    isOpen: boolean
    realizedPnl: string | null
  }[]
}

export function Dashboard() {
  const queryClient = useQueryClient()

  const { data: instruments = [] } = useQuery<Instrument[]>({
    queryKey: ['instruments'],
    queryFn: () => fetch('/api/instruments').then((r) => r.json()),
  })

  const { data: portfolios = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ['portfolios'],
    queryFn: () => fetch('/api/portfolios').then((r) => r.json()),
  })

  const [selectedInstrument, setSelectedInstrument] = useState<string>('')
  const [portfolioId, setPortfolioId] = useState<string>('')

  useEffect(() => {
    if (instruments.length > 0 && !selectedInstrument) {
      setSelectedInstrument(instruments[0].id)
    }
  }, [instruments, selectedInstrument])

  useEffect(() => {
    if (portfolios.length > 0 && !portfolioId) {
      setPortfolioId(portfolios[0].id)
    }
  }, [portfolios, portfolioId])

  const { data: portfolio, isLoading: portfolioLoading } = useQuery<Portfolio>({
    queryKey: ['portfolio', portfolioId],
    queryFn: () => fetch(`/api/portfolios/${portfolioId}`).then((r) => r.json()),
    enabled: !!portfolioId,
  })

  const { data: priceBars = [] } = useQuery<PriceBar[]>({
    queryKey: ['price-bars', selectedInstrument],
    queryFn: () =>
      fetch(`/api/instruments/${selectedInstrument}/price-bars?limit=100`).then((r) => r.json()),
    enabled: !!selectedInstrument,
  })

  const orderMutation = useMutation({
    mutationFn: (order: { instrumentId: string; side: 'buy' | 'sell'; quantity: number }) =>
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...order, portfolioId }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
    },
  })

  const currentPrices: Record<string, number> = {}
  for (const inst of instruments) {
    const bars = priceBars
    if (inst.id === selectedInstrument && bars.length > 0) {
      currentPrices[inst.id] = Number(bars[bars.length - 1].close)
    }
  }

  const chartData = priceBars.map((bar) => ({
    date: new Date(bar.date).toISOString().split('T')[0],
    open: Number(bar.open),
    high: Number(bar.high),
    low: Number(bar.low),
    close: Number(bar.close),
  }))

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">PaperTrading</h1>
        <div className="dashboard-controls">
          <select
            className="dashboard-select"
            value={selectedInstrument}
            onChange={(e) => setSelectedInstrument(e.target.value)}
          >
            <option value="">Seleccionar activo</option>
            {instruments.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.symbol}
              </option>
            ))}
          </select>
          <select
            className="dashboard-select"
            value={portfolioId}
            onChange={(e) => setPortfolioId(e.target.value)}
          >
            <option value="">Seleccionar cartera</option>
            {portfolios.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {selectedInstrument && chartData.length > 0 && (
        <section className="dashboard-section">
          <h2 className="section-title">
            {instruments.find((i) => i.id === selectedInstrument)?.symbol}
          </h2>
          <CandlestickChart data={chartData} />
        </section>
      )}

      {portfolioId && !portfolioLoading && portfolio && (
        <section className="dashboard-section">
          <h2 className="section-title">{portfolio.name}</h2>
          <OrderForm
            instruments={instruments}
            onSubmit={(order) => orderMutation.mutate(order)}
          />
          <PortfolioView
            cash={portfolio.cash}
            initialCapital={portfolio.initialCapital}
            positions={portfolio.positions}
            instruments={instruments}
            currentPrices={currentPrices}
          />
        </section>
      )}
    </div>
  )
}
