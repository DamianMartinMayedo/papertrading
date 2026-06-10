import { useState } from 'react'

interface OrderFormProps {
  instruments: { id: string; symbol: string }[]
  onSubmit: (order: { instrumentId: string; side: 'buy' | 'sell'; quantity: number }) => void
}

export function OrderForm({ instruments, onSubmit }: OrderFormProps) {
  const [instrumentId, setInstrumentId] = useState(instruments[0]?.id ?? '')
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [quantity, setQuantity] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const qty = parseFloat(quantity)
    if (!instrumentId || !qty || qty <= 0) return
    onSubmit({ instrumentId, side, quantity: qty })
    setQuantity('')
  }

  return (
    <form className="order-form" onSubmit={handleSubmit}>
      <div className="order-form-row">
        <select
          className="order-select"
          value={instrumentId}
          onChange={(e) => setInstrumentId(e.target.value)}
        >
          {instruments.map((inst) => (
            <option key={inst.id} value={inst.id}>
              {inst.symbol}
            </option>
          ))}
        </select>
        <input
          className="order-input"
          type="number"
          step="0.0001"
          min="0"
          placeholder="Cantidad"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>
      <div className="order-form-row">
        <button type="submit" className="order-btn order-btn-buy" onClick={() => setSide('buy')}>
          Comprar
        </button>
        <button type="submit" className="order-btn order-btn-sell" onClick={() => setSide('sell')}>
          Vender
        </button>
      </div>
    </form>
  )
}
