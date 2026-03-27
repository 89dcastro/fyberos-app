'use client'

import { useState } from 'react'

type Crew = {
  id: string
  name: string
}

type Branch = {
  id: string
  name: string
}

type Employee = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  position: string | null
  branch_id: string | null
  crew_id: string | null
  pay_type: string | null
  hourly_rate: number | null
  daily_rate: number | null
  weekly_salary: number | null
  overtime_threshold_hours: number | null
  overtime_rate: number | null
  status: string | null
}

export default function EditEmployeeForm({
  employee,
  crews,
  branches,
  action,
}: {
  employee: Employee
  crews: Crew[]
  branches: Branch[]
  action: (formData: FormData) => void | Promise<void>
}) {
  const [payType, setPayType] = useState(employee.pay_type || 'hourly')

  return (
    <section className="fyber-card max-w-4xl p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Employee Details</h2>
        <p className="mt-1 text-sm text-white/45">
          Edit all payroll and assignment settings for this employee.
        </p>
      </div>

      <form action={action} className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <input
            name="full_name"
            defaultValue={employee.full_name || ''}
            placeholder="Full Name"
            required
            className="fyber-input"
          />

          <input
            name="position"
            defaultValue={employee.position || ''}
            placeholder="Position (Foreman, Office, Supervisor)"
            className="fyber-input"
          />

          <input
            name="email"
            defaultValue={employee.email || ''}
            placeholder="Email"
            className="fyber-input"
          />

          <input
            name="phone"
            defaultValue={employee.phone || ''}
            placeholder="Phone"
            className="fyber-input"
          />

          <select
            name="branch_id"
            defaultValue={employee.branch_id || ''}
            className="fyber-input"
            required
          >
            <option value="">Select Branch</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>

          <select
            name="crew_id"
            defaultValue={employee.crew_id || ''}
            className="fyber-input"
          >
            <option value="">No Crew (Office / Supervisor)</option>
            {crews.map((crew) => (
              <option key={crew.id} value={crew.id}>
                {crew.name}
              </option>
            ))}
          </select>

          <select
            name="pay_type"
            value={payType}
            onChange={(e) => setPayType(e.target.value)}
            className="fyber-input"
          >
            <option value="hourly">Hourly Rate</option>
            <option value="daily">Daily Rate</option>
            <option value="weekly_salary">Weekly Salary</option>
          </select>

          <select
            name="status"
            defaultValue={employee.status || 'active'}
            className="fyber-input"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {payType === 'hourly' && (
          <div className="grid gap-5 md:grid-cols-3">
            <input
              name="hourly_rate"
              type="text"
              inputMode="decimal"
              defaultValue={employee.hourly_rate || 0}
              placeholder="Hourly Rate ($)"
              className="fyber-input"
            />

            <input
              name="overtime_threshold_hours"
              type="text"
              inputMode="decimal"
              defaultValue={employee.overtime_threshold_hours || 40}
              placeholder="OT Threshold Hours"
              className="fyber-input"
            />

            <input
              name="overtime_rate"
              type="text"
              inputMode="decimal"
              defaultValue={employee.overtime_rate || 0}
              placeholder="Overtime Rate ($)"
              className="fyber-input"
            />
          </div>
        )}

        {payType === 'daily' && (
          <div className="grid gap-5 md:grid-cols-1">
            <input
              name="daily_rate"
              type="text"
              inputMode="decimal"
              defaultValue={employee.daily_rate || 0}
              placeholder="Daily Rate ($)"
              className="fyber-input"
            />
          </div>
        )}

        {payType === 'weekly_salary' && (
          <div className="grid gap-5 md:grid-cols-1">
            <input
              name="weekly_salary"
              type="text"
              inputMode="decimal"
              defaultValue={employee.weekly_salary || 0}
              placeholder="Weekly Salary ($)"
              className="fyber-input"
            />
          </div>
        )}

        <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4">
          <p className="text-sm font-semibold text-cyan-100">Payroll Note</p>
          <p className="mt-2 text-sm text-white/65">
            Employees may be paid hourly, daily, or by weekly salary. Branch is required
            for enterprise organization and crew assignment is optional.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="fyber-button-primary">Save Changes</button>
        </div>
      </form>
    </section>
  )
}