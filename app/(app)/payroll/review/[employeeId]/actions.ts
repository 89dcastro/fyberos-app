'use server'

import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function updateTimeEntry(formData: FormData) {
  const id = String(formData.get('id') || '')
  const employeeId = String(formData.get('employee_id') || '')
  const dateFrom = String(formData.get('date_from') || '')
  const dateTo = String(formData.get('date_to') || '')
  const entryDate = String(formData.get('entry_date') || '')
  const clockInRaw = String(formData.get('clock_in') || '')
  const clockOutRaw = String(formData.get('clock_out') || '')

  if (!id) {
    throw new Error('Time entry ID is required')
  }

  // 🔒 CHECK IF ENTRY BELONGS TO A PAID PAYROLL RUN
const { data: existingEntry, error: existingEntryError } = await supabaseAdmin
  .from('time_entries')
  .select(`
    id,
    payroll_run_id,
    employee_payroll_runs (
      id,
      status
    )
  `)
  .eq('id', id)
  .maybeSingle()

if (existingEntryError || !existingEntry) {
  throw new Error('Time entry not found')
}

const payrollRun = Array.isArray(existingEntry.employee_payroll_runs)
  ? existingEntry.employee_payroll_runs[0]
  : existingEntry.employee_payroll_runs

if (payrollRun?.status === 'paid') {
  throw new Error('This entry belongs to a paid payroll run and cannot be edited')
}

  const clockIn = clockInRaw ? new Date(clockInRaw).toISOString() : null
  const clockOut = clockOutRaw ? new Date(clockOutRaw).toISOString() : null

  let totalHours: number | null = null

  if (clockIn && clockOut) {
    totalHours =
      (new Date(clockOut).getTime() - new Date(clockIn).getTime()) / 1000 / 60 / 60
  }

  const { error } = await supabaseAdmin
    .from('time_entries')
    .update({
      entry_date: entryDate || null,
      clock_in: clockIn,
      clock_out: clockOut,
      total_hours: totalHours,
    })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  redirect(`/payroll/review/${employeeId}?date_from=${dateFrom}&date_to=${dateTo}`)
}