'use client'

import { useState } from 'react'

type BillingItem = {
  id?: string
  item_name: string
  unit_label: string
  unit_price: string
}

type Props = {
  initialItems: BillingItem[]
}

export default function ProjectBillingItemsEditor({ initialItems }: Props) {
  const [items, setItems] = useState<BillingItem[]>(
    initialItems.length > 0
      ? initialItems
      : [{ item_name: '', unit_label: '', unit_price: '' }]
  )

  function addItem() {
    setItems((current) => [
      ...current,
      { item_name: '', unit_label: '', unit_price: '' },
    ])
  }

  function removeItem(index: number) {
    setItems((current) => {
      const next = current.filter((_, i) => i !== index)
      return next.length > 0
        ? next
        : [{ item_name: '', unit_label: '', unit_price: '' }]
    })
  }

  function updateItem(
    index: number,
    field: keyof BillingItem,
    value: string
  ) {
    setItems((current) =>
      current.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    )
  }

  return (
    <section className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">Project Billing Items</h3>
        <p className="mt-1 text-sm text-white/45">
          Add the line items you bill to the client for this project.
        </p>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1.4fr_1fr_1fr_auto]"
          >
            <input
              type="text"
              name="billing_item_name[]"
              value={item.item_name}
              onChange={(e) => updateItem(index, 'item_name', e.target.value)}
              placeholder="Line item name"
              className="fyber-input"
            />

            <input
              type="text"
              name="billing_item_unit[]"
              value={item.unit_label}
              onChange={(e) => updateItem(index, 'unit_label', e.target.value)}
              placeholder="Unit label"
              className="fyber-input"
            />

            <input
              type="number"
              step="0.01"
              min="0"
              name="billing_item_price[]"
              value={item.unit_price}
              onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
              placeholder="Unit price"
              className="fyber-input"
            />

            <button
              type="button"
              onClick={() => removeItem(index)}
              className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-medium text-red-200 transition hover:bg-red-400/15"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={addItem}
          className="fyber-button-secondary"
        >
          Add Another
        </button>
      </div>
    </section>
  )
}