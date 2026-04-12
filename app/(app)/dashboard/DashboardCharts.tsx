'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts'

type ProductionPoint = {
  date: string
  value: number
}

type RevenuePoint = {
  label: string
  invoiced: number
}

type Props = {
  productionData: ProductionPoint[]
  revenueData: RevenuePoint[]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function shortDate(value: string) {
  const d = new Date(value)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function DashboardCharts({
  productionData,
  revenueData,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="fyber-card p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Production Trend
            </h2>
            <p className="mt-1 text-sm text-white/45">
              Real logged footage for the last 7 days.
            </p>
          </div>

          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
            Live Data
          </span>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={productionData}>
              <defs>
                <linearGradient id="prodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={shortDate}
                stroke="rgba(255,255,255,0.45)"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="rgba(255,255,255,0.45)"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(7,16,34,0.96)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: '16px',
                  color: 'white',
                }}
                formatter={(value) => [`${Number(value ?? 0).toLocaleString()} ft`, 'Production']}
                labelFormatter={(label) => shortDate(String(label))}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#22d3ee"
                strokeWidth={3}
                fill="url(#prodGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="fyber-card p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Invoice Revenue
            </h2>
            <p className="mt-1 text-sm text-white/45">
              Real invoiced totals grouped by month.
            </p>
          </div>

          <span className="rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-lime-200">
            Finance
          </span>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="rgba(255,255,255,0.45)"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="rgba(255,255,255,0.45)"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(Number(value))}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(7,16,34,0.96)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: '16px',
                  color: 'white',
                }}
                formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Invoiced']}
              />
              <Bar dataKey="invoiced" radius={[8, 8, 0, 0]} fill="#4ade80" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}