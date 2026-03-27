import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import StatusBadge from '../../components/ui/StatusBadge'

export default async function EmployeesPage() {
  const { data: employees } = await supabase
    .from('employees')
    .select(`
      *,
      crews (
        name
      ),
      branch:branch_id (
        name
      )
    `)
    .order('created_at', { ascending: false })

  function getPayDisplay(employee: any) {
    if (employee.pay_type === 'hourly') return `$${employee.hourly_rate || 0}/hr`
    if (employee.pay_type === 'daily') return `$${employee.daily_rate || 0}/day`
    if (employee.pay_type === 'weekly_salary') return `$${employee.weekly_salary || 0}/week`
    return '-'
  }

  return (
    <div className="space-y-6">
      <section className="flex justify-between">
        <div>
          <h1 className="fyber-page-title">Employees</h1>
          <p className="fyber-page-subtitle">
            Manage internal workforce and payroll settings.
          </p>
        </div>

        <Link href="/employees/new" className="fyber-button-primary">
          Add Employee
        </Link>
      </section>

      <div className="fyber-card">
        <table className="fyber-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Position</th>
              <th>Branch</th>
              <th>Crew</th>
              <th>Pay Type</th>
              <th>Rate</th>
              <th>Status</th>
              <th>Edit</th>
            </tr>
          </thead>

          <tbody>
            {employees?.map((employee: any) => (
              <tr key={employee.id}>
                <td>
                  <Link
                    href={`/employees/${employee.id}`}
                    className="font-semibold text-white transition hover:text-cyan-200"
                  >
                    {employee.full_name}
                  </Link>
                </td>
                <td>{employee.position || '-'}</td>
                <td>{employee.branch?.name || '-'}</td>
                <td>{employee.crews?.name || 'No Crew'}</td>
                <td>{employee.pay_type}</td>
                <td>{getPayDisplay(employee)}</td>
                <td>
                  <StatusBadge status={employee.status || 'active'} />
                </td>
                <td>
                  <Link
                    href={`/employees/${employee.id}/edit`}
                    className="fyber-button-secondary"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}