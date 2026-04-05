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
  user_id?: string | null
  
}

type LinkedUser = {
  id: string
  email: string | null
  full_name: string | null
  role: string | null
  username: string | null
} | null

export default function EditEmployeeForm({
  employee,
  linkedUser,
  crews,
  branches,
  action,
  createAccessAction,
  updateUsernameAction,
  resetPasswordAction,
  updateRoleAction,
  currentUserRole,
}: {
  employee: Employee
  linkedUser: LinkedUser
  crews: Crew[]
  branches: Branch[]
  action: (formData: FormData) => void | Promise<void>
  createAccessAction: (formData: FormData) => void | Promise<void>
  updateUsernameAction: (formData: FormData) => void | Promise<void>
  resetPasswordAction: (formData: FormData) => void | Promise<void>
  updateRoleAction: (formData: FormData) => void | Promise<void>
  currentUserRole: string | null
}) {
  const [payType, setPayType] = useState(employee.pay_type || 'hourly')

  return (
    <div className="space-y-6">
      <section className="fyber-card max-w-4xl p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">Employee Details</h2>
          <p className="mt-1 text-sm text-white/45">
            Edit all payroll and assignment settings for this employee.
          </p>
        </div>

        <form action={action} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-white/50">Full Name</span>
              <input
                name="full_name"
                defaultValue={employee.full_name || ''}
                placeholder="Full Name"
                required
                className="fyber-input"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-white/50">Job Title</span>
              <input
                name="position"
                defaultValue={employee.position || ''}
                placeholder="e.g. Splicer, Locator, Supervisor"
                className="fyber-input"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-white/50">Email</span>
              <input
                name="email"
                type="email"
                defaultValue={employee.email || ''}
                placeholder="Email"
                className="fyber-input"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-white/50">Phone</span>
              <input
                name="phone"
                defaultValue={employee.phone || ''}
                placeholder="Phone"
                className="fyber-input"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-white/50">Branch</span>
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
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-white/50">Crew</span>
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
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-white/50">Pay Type</span>
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
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-white/50">Status</span>
              <select
                name="status"
                defaultValue={employee.status || 'active'}
                className="fyber-input"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
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
              and crew assignment is optional.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button className="fyber-button-primary">Save Changes</button>
          </div>
        </form>
      </section>

      <section className="fyber-card max-w-4xl p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">Login Access</h2>
          <p className="mt-1 text-sm text-white/45">
            Create and manage login credentials for this employee.
          </p>
        </div>

        {currentUserRole === 'admin' ? (
  linkedUser ? (
    <div className="space-y-6">
      <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4">
        <p className="text-sm font-semibold text-cyan-100">Access Already Linked</p>
        <div className="mt-3 grid gap-3 text-sm text-white/75 md:grid-cols-2">
          <p>
            <span className="text-white/45">Username:</span> {linkedUser.username || 'N/A'}
          </p>
          <p>
            <span className="text-white/45">System Role:</span> {linkedUser.role || 'N/A'}
          </p>
          <p>
            <span className="text-white/45">Email:</span> {linkedUser.email || 'N/A'}
          </p>
          <p>
            <span className="text-white/45">User ID:</span> {linkedUser.id}
          </p>
        </div>
      </div>

      <form action={updateUsernameAction} className="space-y-4">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-white/50">Update Username</span>
            <input
              name="username"
              defaultValue={linkedUser.username || ''}
              placeholder="Username"
              required
              className="fyber-input"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="fyber-button-secondary">Save Username</button>
        </div>
      </form>

      <form action={updateRoleAction} className="space-y-4">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-white/50">System Role</span>
            <select
              name="role"
              defaultValue={linkedUser.role || 'employee'}
              className="fyber-input"
              required
            >
              <option value="employee">Employee</option>
              <option value="foreman">Foreman</option>
              <option value="office">Office</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="fyber-button-secondary">Save Role</button>
        </div>
      </form>

      <form action={resetPasswordAction} className="space-y-4">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-white/50">Reset Password</span>
            <input
              name="new_password"
              type="text"
              placeholder="New Temporary Password"
              required
              className="fyber-input"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="fyber-button-secondary">Reset Password</button>
        </div>
      </form>
    </div>
  ) : (
    <form action={createAccessAction} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-white/50">Username</span>
          <input
            name="username"
            placeholder="Username"
            required
            className="fyber-input"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-white/50">Temporary Password</span>
          <input
            name="temporary_password"
            type="text"
            placeholder="Temporary Password"
            required
            className="fyber-input"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-white/50">System Role</span>
          <select
            name="role"
            className="fyber-input"
            defaultValue="employee"
            required
          >
            <option value="employee">Employee</option>
            <option value="foreman">Foreman</option>
            <option value="office">Office</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4">
        <p className="text-sm font-semibold text-cyan-100">Access Note</p>
        <p className="mt-2 text-sm text-white/65">
          This will create a real login in Supabase Auth, a linked record in public.users,
          and connect this employee through employees.user_id.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button className="fyber-button-primary">Create Login Access</button>
      </div>
    </form>
  )
) : (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
    Only admins can manage employee login access.
  </div>
)}
      </section>
    </div>
  )
}