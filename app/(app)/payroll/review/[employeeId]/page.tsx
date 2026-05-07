import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { updateTimeEntry, createManualTimeEntry } from './actions'
import LocalDateTimeInput from '@/components/local-date-time-input'

export const dynamic = 'force-dynamic'

export default async function PayrollReviewEmployeePage({
  params,
  searchParams,
}: {
  params: Promise<{ employeeId: string }>
  searchParams: Promise<{ date_from?: string; date_to?: string }>
}) {
  const { employeeId } = await params
  const resolvedSearchParams = await searchParams

  const dateFrom = resolvedSearchParams.date_from || ''
  const dateTo = resolvedSearchParams.date_to || ''

  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="fyber-card p-6 text-white/60">
        Not authenticated.
      </div>
    )
  }

  const { data: currentUser } = await supabase
    .from('users')
    .select('organization_id, role')
    .eq('id', user.id)
    .maybeSingle()

  if (currentUser?.role !== 'admin' && currentUser?.role !== 'office') {
    return (
      <div className="fyber-card p-6 text-white/60">
        Only admin or office can review payroll entries.
      </div>
    )
  }

  const { data: employee } = await supabase
    .from('employees')
    .select('id, full_name, pay_type')
    .eq('id', employeeId)
    .maybeSingle()

  const query = supabase
    .from('time_entries')
    .select(`
      *,
      employee_payroll_runs (
        id,
        status
      )
    `)
    .eq('employee_id', employeeId)
    .eq('organization_id', currentUser?.organization_id)
      .is('payroll_run_id', null)
    .order('entry_date', { ascending: true })
    .order('clock_in', { ascending: true })

  if (dateFrom) query.gte('entry_date', dateFrom)
  if (dateTo) query.lte('entry_date', dateTo)

  const { data: entries, error } = await query

  if (error) {
    return (
      <div className="fyber-card p-6 text-red-300">
        {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Link href={`/payroll?date_from=${dateFrom}&date_to=${dateTo}`} className="fyber-button-secondary">
            Back to Payroll
          </Link>

          <h1 className="fyber-page-title mt-4">
            Review Days
          </h1>
          <p className="fyber-page-subtitle">
            {employee?.full_name || 'Employee'} · {dateFrom} → {dateTo}
          </p>
        </div>
      </section>

      <section className="fyber-card p-6">
  <div className="mb-5">
    <h2 className="text-xl font-semibold text-white">Add Manual Day</h2>
    <p className="mt-1 text-sm text-white/45">
      Create a manual time entry if the employee forgot to clock in or lost access.
    </p>
  </div>

  <form action={createManualTimeEntry} className="grid gap-4 md:grid-cols-4">
    <input type="hidden" name="employee_id" value={employeeId} />
    <input type="hidden" name="date_from" value={dateFrom} />
    <input type="hidden" name="date_to" value={dateTo} />

    <div>
      <label className="mb-2 block text-xs text-white/45">Date</label>
      <input
        type="date"
        name="entry_date"
        defaultValue={dateFrom || ''}
        className="fyber-input"
        required
      />
    </div>

    <div>
      <label className="mb-2 block text-xs text-white/45">Clock In</label>
      <input
        type="datetime-local"
        name="clock_in"
        className="fyber-input"
        required
      />
    </div>

    <div>
      <label className="mb-2 block text-xs text-white/45">Clock Out</label>
      <input
        type="datetime-local"
        name="clock_out"
        className="fyber-input"
      />
    </div>

    <div className="flex items-end">
      <button className="fyber-button-primary w-full">
        Add Manual Entry
      </button>
    </div>
  </form>
</section>

      <section className="fyber-card overflow-hidden">
        <div className="border-b border-white/10 px-6 py-5">
          <h2 className="text-xl font-semibold text-white">Daily Time Entries</h2>
          <p className="mt-1 text-sm text-white/45">
            Edit clock in and clock out per day before generating payroll.
          </p>
        </div>

        {!entries || entries.length === 0 ? (
          <div className="p-6 text-white/60">
            No time entries found in this range.
          </div>
        ) : (
          <div className="space-y-4 p-6">
            {entries.map((entry: any) => {
              const payrollRun = Array.isArray(entry.employee_payroll_runs)
  ? entry.employee_payroll_runs[0]
  : entry.employee_payroll_runs

const isPaidLocked = payrollRun?.status === 'paid'
              return (
              <form
                key={entry.id}
                action={updateTimeEntry}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <input type="hidden" name="id" value={entry.id} />
                <input type="hidden" name="employee_id" value={employeeId} />
                <input type="hidden" name="date_from" value={dateFrom} />
                <input type="hidden" name="date_to" value={dateTo} />
                {isPaidLocked && (
                  <div className="mb-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-300">
                    This entry belongs to a paid payroll run and can no longer be edited.
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-5">
                  <div>
                    <label className="mb-2 block text-xs text-white/45">Date</label>
                    <input
                      type="date"
                      name="entry_date"
                      defaultValue={entry.entry_date || ''}
                      className="fyber-input"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs text-white/45">Clock In</label>
                    <LocalDateTimeInput
                      name="clock_in"
                      value={entry.clock_in}
                      className="fyber-input"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs text-white/45">Clock Out</label>
                    <LocalDateTimeInput
                      name="clock_out"
                      value={entry.clock_out}
                      className="fyber-input"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs text-white/45">Total Hours</label>
                    <div className="fyber-input flex items-center">
                      {entry.total_hours ? Number(entry.total_hours).toFixed(2) : 'Open'}
                    </div>
                  </div>

                  <div className="flex items-end">
                    <button
                    disabled={isPaidLocked}
                    className="fyber-button-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPaidLocked ? 'Locked' : 'Save Day'}
                  </button>
                  </div>
                </div>
              </form>
              )})}
          </div>
        )}
      </section>
    </div>
  )
}

