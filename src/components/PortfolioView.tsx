interface Position {
  id: string
  instrumentId: string
  quantity: string
  averagePrice: string
  totalCost: string
  isOpen: boolean
  realizedPnl: string | null
}

interface PortfolioViewProps {
  cash: string
  initialCapital: string
  positions: Position[]
  instruments: { id: string; symbol: string }[]
  currentPrices: Record<string, number>
}

export function PortfolioView({ cash, initialCapital, positions, instruments, currentPrices }: PortfolioViewProps) {
  const getSymbol = (id: string) => instruments.find((i) => i.id === id)?.symbol ?? id

  const positionsValue = positions
    .filter((p) => p.isOpen)
    .reduce((sum, p) => sum + Number(p.quantity) * (currentPrices[p.instrumentId] ?? 0), 0)

  const totalValue = Number(cash) + positionsValue
  const totalPnl = totalValue - Number(initialCapital)
  const totalPnlPercent = ((totalPnl / Number(initialCapital)) * 100).toFixed(2)

  return (
    <div className="portfolio-view">
      <div className="portfolio-summary">
        <div className="portfolio-stat">
          <span className="portfolio-stat-label">Cash</span>
          <span className="portfolio-stat-value">{Number(cash).toFixed(2)} $</span>
        </div>
        <div className="portfolio-stat">
          <span className="portfolio-stat-label">Posiciones</span>
          <span className="portfolio-stat-value">{positionsValue.toFixed(2)} $</span>
        </div>
        <div className="portfolio-stat">
          <span className="portfolio-stat-label">Valor total</span>
          <span className="portfolio-stat-value">{totalValue.toFixed(2)} $</span>
        </div>
        <div className="portfolio-stat">
          <span className="portfolio-stat-label">P&L Total</span>
          <span className={`portfolio-stat-value ${totalPnl >= 0 ? 'pnl-positive' : 'pnl-negative'}`}>
            {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)} $ ({totalPnlPercent}%)
          </span>
        </div>
      </div>

      <table className="positions-table">
        <thead>
          <tr>
            <th>Activo</th>
            <th>Cantidad</th>
            <th>Precio medio</th>
            <th>Valor actual</th>
            <th>P&L</th>
          </tr>
        </thead>
        <tbody>
          {positions.filter((p) => p.isOpen).map((pos) => {
            const currentPrice = currentPrices[pos.instrumentId] ?? 0
            const marketValue = Number(pos.quantity) * currentPrice
            const pnl = marketValue - Number(pos.totalCost)
            const pnlPercent = ((pnl / Number(pos.totalCost)) * 100).toFixed(2)

            return (
              <tr key={pos.id}>
                <td>{getSymbol(pos.instrumentId)}</td>
                <td>{Number(pos.quantity).toFixed(4)}</td>
                <td>{Number(pos.averagePrice).toFixed(2)}</td>
                <td>{marketValue.toFixed(2)}</td>
                <td className={pnl >= 0 ? 'pnl-positive' : 'pnl-negative'}>
                  {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} ({pnlPercent}%)
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
