import { getPayrollPreview } from './lib'
import { generatePayrollRun } from './actions'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function PayrollPage({
  searchParams,
}: {
  searchParams: Promise<{ date_from?: string; date_to?: string }>
}) {
  const params = await searchParams

  const today = new Date().toISOString().split('T')[0]
  const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  const dateFrom = params.date_from || sevenDaysAgo
  const dateTo = params.date_to || today

  const preview = await getPayrollPreview(dateFrom, dateTo)

  if (preview.currentUserRole !== 'admin' && preview.currentUserRole !== 'office') {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
        Only admin or office can access payroll.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="fyber-page-title">Payroll</h1>
          <p className="fyber-page-subtitle">
            Review unpaid employee hours by date range and generate payroll runs.
          </p>
          <Link href="/payroll/history" className="fyber-button-secondary">
          View Payroll History
        </Link>
        </div>

        <form method="GET" className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-2 block text-sm text-white/60">Date From</label>
            <input
              type="date"
              name="date_from"
              defaultValue={dateFrom}
              className="fyber-input"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/60">Date To</label>
            <input
              type="date"
              name="date_to"
              defaultValue={dateTo}
              className="fyber-input"
            />
          </div>

          <button type="submit" className="fyber-button-secondary">
            Apply Range
          </button>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="fyber-card p-5">
          <p className="text-sm text-white/45">Employees in Range</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {preview.rows.length}
          </p>
        </div>

        <div className="fyber-card p-5">
          <p className="text-sm text-white/45">Date Range</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {dateFrom} → {dateTo}
          </p>
        </div>

        <div className="fyber-card p-5">
          <p className="text-sm text-white/45">Total Gross Payroll</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            $
            {preview.totalAmount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </section>

      <section className="fyber-card overflow-hidden">
        <div className="border-b border-white/10 px-6 py-5">
          <h2 className="text-xl font-semibold text-white">Payroll Preview</h2>
          <p className="mt-1 text-sm text-white/45">
            Only unpaid and closed time entries are included.
          </p>
        </div>

        {preview.rows.length === 0 ? (
          <div className="p-6 text-white/60">
            No unpaid employee hours found for this date range.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="fyber-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Pay Type</th>
                    <th>Regular Hours</th>
                    <th>OT Hours</th>
                    <th>Days</th>
                    <th>Weeks</th>
                    <th>Gross Pay</th>
                    <th>Review</th>
                  </tr>
                </thead>

                <tbody>
                  {preview.rows.map((row) => (
                    <tr key={row.employee_id}>
                      <td>{row.employee_name}</td>
                      <td>{row.pay_type}</td>
                      <td>{row.regular_hours.toFixed(2)}</td>
                      <td>{row.overtime_hours.toFixed(2)}</td>
                      <td>{row.days_worked}</td>
                      <td>{row.weeks_worked}</td>
                      <td>
                        $
                        {row.gross_pay.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td>
                        <Link
                          href={`/payroll/review/${row.employee_id}?date_from=${dateFrom}&date_to=${dateTo}`}
                          className="fyber-button-secondary"
                        >
                          Review Days
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-white/10 px-6 py-5">
              <form action={generatePayrollRun} className="flex flex-wrap items-center justify-between gap-4">
                <input type="hidden" name="date_from" value={dateFrom} />
                <input type="hidden" name="date_to" value={dateTo} />

                <div className="text-sm text-white/50">
                  This will create a payroll run and mark the included time entries as assigned.
                </div>

                <button className="fyber-button-primary">
                  Generate Payroll Run
                </button>
              </form>
            </div>
          </>
        )}
      </section>
    </div>
  )
}