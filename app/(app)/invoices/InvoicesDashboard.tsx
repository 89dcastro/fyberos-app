'use client'

import Link from 'next/link'
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
  PieChart,
  Pie,
  Cell,
} from 'recharts'

type InvoiceRow = {
  id: string
  invoice_number: string
  invoice_date: string
  status: string
  total: number
  project_id: string
  project_name: string
  client_name: string
}

type RevenuePoint = {
  label: string
  invoiced: number
  paid: number
  outstanding: number
}

type StatusPoint = {
  name: string
  value: number
}

type Props = {
  invoices: InvoiceRow[]
  revenueData: RevenuePoint[]
  statusData: StatusPoint[]
  totalInvoiced: number
  totalPaid: number
  totalOutstanding: number
  totalDraft: number
}

const PIE_COLORS = ['#22c55e', '#facc15', '#94a3b8', '#ef4444']

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value || 0)
}

export default function InvoicesDashboard({
  invoices,
  revenueData,
  statusData,
  totalInvoiced,
  totalPaid,
  totalOutstanding,
  totalDraft,
}: Props) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Invoiced" value={formatCurrency(totalInvoiced)} />
        <MetricCard label="Paid" value={formatCurrency(totalPaid)} />
        <MetricCard label="Outstanding" value={formatCurrency(totalOutstanding)} />
        <MetricCard label="Draft" value={formatCurrency(totalDraft)} />
      </section>

      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(7,16,34,0.98),rgba(4,10,25,0.96))] shadow-[0_0_60px_rgba(0,120,255,0.08)]">
        <div className="border-b border-white/10 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300/70">
            Financial Overview
          </p>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-white">Invoices Dashboard</h1>
              <p className="mt-2 text-sm text-white/55">
                Revenue visibility, payment status, and invoice tracking across all projects.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-white/40">Current Total</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {formatCurrency(totalInvoiced)}
              </p>
            </div>
          </div>
        </div>

        <div className="h-[360px] p-4 md:p-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="invoicedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="paidGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
              <YAxis
                stroke="rgba(255,255,255,0.45)"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(7,16,34,0.96)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: '16px',
                  color: 'white',
                }}
                formatter={(value) => formatCurrency(Number(value ?? 0))}
              />
              <Area
                type="monotone"
                dataKey="invoiced"
                stroke="#60a5fa"
                strokeWidth={3}
                fill="url(#invoicedGradient)"
              />
              <Area
                type="monotone"
                dataKey="paid"
                stroke="#4ade80"
                strokeWidth={2}
                fill="url(#paidGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="fyber-card p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-white">Invoices by Status</h2>
            <p className="mt-1 text-sm text-white/45">
              Fast visibility into open, draft, paid, and void invoices.
            </p>
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(7,16,34,0.96)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    borderRadius: '16px',
                    color: 'white',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid gap-2">
            {statusData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                  />
                  <span className="text-sm text-white/75">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="fyber-card p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-white">Collections Snapshot</h2>
            <p className="mt-1 text-sm text-white/45">
              Compare invoiced, paid, and outstanding totals over time.
            </p>
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                <YAxis
                  stroke="rgba(255,255,255,0.45)"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(7,16,34,0.96)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    borderRadius: '16px',
                    color: 'white',
                  }}
                  formatter={(value) => formatCurrency(Number(value ?? 0))}
                />
                <Bar dataKey="invoiced" radius={[8, 8, 0, 0]} fill="#3b82f6" />
                <Bar dataKey="outstanding" radius={[8, 8, 0, 0]} fill="#facc15" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="fyber-card overflow-hidden">
        <div className="border-b border-white/10 px-6 py-5">
          <h2 className="text-xl font-semibold text-white">All Invoices</h2>
          <p className="mt-1 text-sm text-white/45">
            Global invoice list across all projects and clients.
          </p>
        </div>

        {!invoices || invoices.length === 0 ? (
          <div className="p-6 text-sm text-white/60">
            No invoices found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="fyber-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Client</th>
                  <th>Project</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>
                      <Link
                        href={`/projects/${invoice.project_id}/invoices/${invoice.id}`}
                        className="font-semibold text-white transition hover:text-cyan-200"
                      >
                        {invoice.invoice_number}
                      </Link>
                    </td>
                    <td>{invoice.client_name || 'N/A'}</td>
                    <td>{invoice.project_name || 'N/A'}</td>
                    <td>{invoice.invoice_date}</td>
                    <td>
                      <StatusPill status={invoice.status} />
                    </td>
                    <td>{formatCurrency(invoice.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(7,16,34,0.96),rgba(5,12,28,0.92))] p-5 shadow-[0_0_30px_rgba(0,120,255,0.05)]">
      <p className="text-sm text-white/45">{label}</p>
      <h3 className="mt-3 text-2xl font-semibold text-white">{value}</h3>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'border-white/10 bg-white/5 text-white/75',
    issued: 'border-yellow-400/20 bg-yellow-400/10 text-yellow-200',
    paid: 'border-lime-400/20 bg-lime-400/10 text-lime-200',
    void: 'border-red-400/20 bg-red-400/10 text-red-200',
  }

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] ${styles[status] || styles.draft}`}>
      {status}
    </span>
  )
}