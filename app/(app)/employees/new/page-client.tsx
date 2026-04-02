'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createEmployee } from './actions'

type Crew = {
  id: string
  name: string
}

type Branch = {
  id: string
  name: string
}

export default function NewEmployeeForm({
  crews,
  branches,
}: {
  crews: Crew[]
  branches: Branch[]
}) {
  const [payType, setPayType] = useState('hourly')

  return (
    <div className="space-y-6">
      <section className="flex justify-between">
        <div>
          <h1 className="fyber-page-title">Create Employee</h1>
          <p className="fyber-page-subtitle">
            Add a new employee for payroll and labor tracking.
          </p>
        </div>

        <Link href="/employees" className="fyber-button-secondary">
          Back to Employees
        </Link>
      </section>

      <section className="fyber-card max-w-4xl p-6">
        <form action={createEmployee} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <input
              name="full_name"
              placeholder="Full Name"
              required
              className="fyber-input"
            />

            <input
              name="position"
              placeholder="Position (Foreman, Office, Supervisor)"
              className="fyber-input"
            />

            <input
              name="email"
              placeholder="Email"
              className="fyber-input"
            />

            <input
              name="phone"
              placeholder="Phone"
              className="fyber-input"
            />

            <select name="branch_id" className="fyber-input" required>
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>

            <select name="crew_id" className="fyber-input">
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
          </div>

          {payType === 'hourly' && (
            <div className="grid gap-5 md:grid-cols-3">
              <input
                name="hourly_rate"
                type="text"
                inputMode="decimal"
                placeholder="Hourly Rate ($)"
                className="fyber-input"
              />

              <input
                name="overtime_threshold_hours"
                type="text"
                inputMode="decimal"
                defaultValue={40}
                placeholder="OT Threshold Hours"
                className="fyber-input"
              />

              <input
                name="overtime_rate"
                type="text"
                inputMode="decimal"
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
                placeholder="Weekly Salary ($)"
                className="fyber-input"
              />
            </div>
          )}

          <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4">
            <p className="text-sm font-semibold text-cyan-100">Payroll Note</p>
            <p className="mt-2 text-sm text-white/65">
              Employees may be paid hourly, daily, or by weekly salary. Crew assignment
              is optional so office staff and supervisors can also be tracked in FyberOS.
            </p>
          </div>

          <button className="fyber-button-primary">Create Employee</button>
        </form>
      </section>
    </div>
  )
}