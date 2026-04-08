import { createSupabaseServerClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { updatePayrollRunStatus } from './actions'
import PayrollStatusBadge from '@/components/ui/PayrollStatusBadge'

export default async function PayrollDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
    const { id } = await params
  const supabase = await createSupabaseServerClient()
  

  const { data: run } = await supabase
    .from('employee_payroll_runs')
    .select('*')
    .eq('id', id)
    .maybeSingle()

    if (!run) {
  return (
    <div className="space-y-6">
      <Link href="/payroll/history" className="fyber-button-secondary">
        Back to Payroll History
      </Link>

      <div className="fyber-card p-6 text-white/60">
        Payroll run not found.
      </div>
    </div>
  )
}

  const { data: items } = await supabase
    .from('employee_payroll_run_items')
    .select('*')
    .eq('payroll_run_id', id)

  return (
  <div className="space-y-6">
    <Link href="/payroll/history" className="fyber-button-secondary">
      Back to Payroll History
    </Link>

    <h1 className="fyber-page-title">Payroll Detail</h1>
      <div className="fyber-card p-5 space-y-4">
          <div className="space-y-1">
            <p>Date Range: {run?.date_from} → {run?.date_to}</p>
            <p>Total: ${run?.total_amount?.toFixed(2)}</p>
            <div className="flex items-center gap-2">
              <span>Status:</span>
              <PayrollStatusBadge status={run?.status || 'draft'} />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {run?.status === 'draft' && (
              <form action={updatePayrollRunStatus}>
                <input type="hidden" name="id" value={run.id} />
                <input type="hidden" name="status" value="finalized" />
                <button className="fyber-button-secondary">
                  Mark as Finalized
                </button>
              </form>
            )}

            {run?.status === 'finalized' && (
              <form action={updatePayrollRunStatus}>
                <input type="hidden" name="id" value={run.id} />
                <input type="hidden" name="status" value="paid" />
                <button className="fyber-button-primary">
                  Mark as Paid
                </button>
              </form>
            )}

            {run?.status === 'paid' && (
              <div className="text-sm text-emerald-300">
                This payroll run has been marked as paid and is now locked.
              </div>
            )}

          </div>
        </div>

      <div className="fyber-card overflow-hidden">
        <table className="fyber-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Regular</th>
              <th>OT</th>
              <th>Days</th>
              <th>Gross</th>
            </tr>
          </thead>

          <tbody>
            {items?.map((item) => (
              <tr key={item.id}>
                <td>{item.employee_name}</td>
                <td>{item.regular_hours}</td>
                <td>{item.overtime_hours}</td>
                <td>{item.days_worked}</td>
                <td>${item.gross_pay.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}