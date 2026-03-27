import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import StatusBadge from '../../../components/ui/StatusBadge'

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: employee, error } = await supabase
    .from('employees')
    .select(`
      *,
      crews (
        id,
        name
      ),
      branch:branch_id (
        id,
        name
      )
    `)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    return (
      <div className="fyber-card p-6 text-red-300">
        Error loading employee: {error.message}
      </div>
    )
  }

  if (!employee) {
    return <div className="fyber-card p-6 text-white">Employee not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/employees" className="text-cyan-200 text-sm">
            ← Back to Employees
          </Link>

          <h1 className="fyber-page-title mt-2">{employee.full_name}</h1>

          <p className="fyber-page-subtitle">
            Employee profile, pay settings, branch, and crew assignment.
          </p>
        </div>

        <Link
          href={`/employees/${id}/edit`}
          className="fyber-button-secondary"
        >
          Edit Employee
        </Link>
      </div>

      <div className="fyber-card p-6 grid md:grid-cols-2 gap-4 text-sm text-white/80">
        <p>
          <span className="text-white/50">Position:</span>{' '}
          {employee.position || 'N/A'}
        </p>

        <p>
          <span className="text-white/50">Branch:</span>{' '}
          {employee.branch?.name || 'N/A'}
        </p>

        <p>
          <span className="text-white/50">Crew:</span>{' '}
          {employee.crews?.name || 'No crew'}
        </p>

        <p>
          <span className="text-white/50">Pay Type:</span>{' '}
          {employee.pay_type}
        </p>

        <p>
          <span className="text-white/50">Email:</span>{' '}
          {employee.email || 'N/A'}
        </p>

        <p>
          <span className="text-white/50">Phone:</span>{' '}
          {employee.phone || 'N/A'}
        </p>

        <p className="flex items-center gap-2">
          <span className="text-white/50">Status:</span>
          <StatusBadge status={employee.status || 'active'} />
        </p>
      </div>

      <div className="fyber-card p-6">
        <h2 className="text-white text-lg font-semibold mb-4">Pay Details</h2>

        <div className="grid md:grid-cols-2 gap-4 text-sm text-white/80">
          {employee.pay_type === 'hourly' && (
            <>
              <p>Hourly Rate: ${employee.hourly_rate || 0}</p>
              <p>OT After: {employee.overtime_threshold_hours || 40} hrs</p>
              <p>OT Rate: ${employee.overtime_rate || 0}</p>
            </>
          )}

          {employee.pay_type === 'daily' && (
            <p>Daily Rate: ${employee.daily_rate || 0}</p>
          )}

          {employee.pay_type === 'weekly_salary' && (
            <p>Weekly Salary: ${employee.weekly_salary || 0}</p>
          )}
        </div>
      </div>

      <div className="fyber-card p-6 text-white/50 text-sm">
        Time tracking, hours worked, and payroll calculations will appear here.
      </div>
    </div>
  )
}