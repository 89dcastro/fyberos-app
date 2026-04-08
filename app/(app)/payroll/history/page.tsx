import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import PayrollStatusBadge from '@/components/ui/PayrollStatusBadge'

export default async function PayrollHistoryPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: currentUser } = await supabase
    .from('users')
    .select('organization_id, role')
    .eq('id', user.id)
    .maybeSingle()

  if (currentUser?.role !== 'admin' && currentUser?.role !== 'office') {
    return <div className="p-6 text-white/70">Unauthorized</div>
  }

  const { data: runs } = await supabase
    .from('employee_payroll_runs')
    .select('*')
    .eq('organization_id', currentUser.organization_id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="fyber-page-title">Payroll History</h1>

      {runs?.length === 0 ? (
        <div className="fyber-card p-6 text-white/60">
          No payroll runs yet.
        </div>
      ) : (
        <div className="space-y-4">
          {runs?.map((run) => (
            <div key={run.id} className="fyber-card p-5">
              <div className="grid md:grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="text-white/45">Date Range</p>
                  <p className="text-white">
                    {run.date_from} → {run.date_to}
                  </p>
                </div>

                <div>
                  <p className="text-white/45">Total</p>
                  <p className="text-white font-semibold">
                    ${run.total_amount.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-white/45">Status</p>
                  <PayrollStatusBadge status={run.status} />
                </div>

                <div>
                  <p className="text-white/45">Created</p>
                  <p>{new Date(run.created_at).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center justify-end">
                  <Link
                    href={`/payroll/${run.id}`}
                    className="fyber-button-secondary"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}