'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import SubcontractorGeneratePayment from './SubcontractorGeneratePayment'

type Props = {
  subcontractorId: string
  initialFrom: string
  initialTo: string
}

export default function SubcontractorProductionSummary({
  subcontractorId,
  initialFrom,
  initialTo,
}: Props) {
  const [fromDate, setFromDate] = useState(initialFrom)
  const [toDate, setToDate] = useState(initialTo)
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<any[]>([])
  const [totals, setTotals] = useState({
    entries: 0,
    footage: 0,
    amount: 0,
  })

  async function loadData() {
    setLoading(true)

    const { data: assignments } = await supabase
        .from('segment_subcontractors')
        .select(`
            segment_id,
            rate,
            unit,
            pay_type
        `)
        .eq('subcontractor_id', subcontractorId)

    const rateMap = new Map()

        for (const a of assignments || []) {
        rateMap.set(a.segment_id, {
            rate: Number(a.rate || 0),
            unit: a.unit || 'ft',
            payType: a.pay_type || 'per foot',
        })
        }

    const { data } = await supabase
      .from('subcontractor_daily_entries')
      .select(`
        *,
        project_segments ( id, name ),
        projects ( id, name, project_number )
      `)
      .eq('subcontractor_id', subcontractorId)
      .is('payment_id', null)
      .gte('work_date', fromDate)
      .lte('work_date', toDate)

    if (!data) {
      setRows([])
      setTotals({ entries: 0, footage: 0, amount: 0 })
      setLoading(false)
      return
    }

    // ⚠️ Aquí luego conectamos rates reales
    let footage = 0
    let amount = 0

    const processed = data.map((row: any) => {
      const ft = Number(row.footage_installed || 0)
      const assignment = rateMap.get(row.segment_id)
      const rate = assignment?.rate || 0
      const unit = assignment?.unit || 'ft'
      const payType = assignment?.payType || 'per foot'
      const owed = ft * rate

      footage += ft
      amount += owed

      return {
        ...row,
        amountOwed: owed,
        rate,
        unit,
        payType,
        }
    })

    setRows(processed)
    setTotals({
      entries: processed.length,
      footage,
      amount,
    })

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <section className="fyber-card p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Production Summary
          </h2>
          <p className="text-sm text-white/45">
            Dynamic unpaid production (no refresh)
          </p>
        </div>

        <div className="flex gap-3">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="fyber-input"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="fyber-input"
          />

          <button
            onClick={loadData}
            className="fyber-button-primary"
          >
            Apply
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-white/50">Loading...</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3 mb-5">
            <Summary label="Entries" value={totals.entries} />
            <Summary label="Footage" value={`${totals.footage} ft`} />
            <Summary
              label="Amount"
              value={`$${totals.amount.toLocaleString()}`}
            />
          </div>

          <div className="mb-5 flex justify-end">
            <SubcontractorGeneratePayment
                subcontractorId={subcontractorId}
                fromDate={fromDate}
                toDate={toDate}
                entries={totals.entries}
                footage={totals.footage}
                amount={totals.amount}
            />
            </div>

          {rows.map((row) => (
            <div key={row.id} className="fyber-card p-4 mb-3">
              <div className="grid md:grid-cols-4 text-sm text-white/75">
                <p>{row.work_date}</p>
                <p>{row.projects?.name}</p>
                <p>{row.footage_installed} ft</p>
                <p>${row.amountOwed}</p>
              </div>
            </div>
          ))}
        </>
      )}
    </section>
  )
}

function Summary({ label, value }: any) {
  return (
    <div className="fyber-card p-4">
      <p className="text-white/50 text-sm">{label}</p>
      <p className="text-white text-xl">{value}</p>
    </div>
  )
}