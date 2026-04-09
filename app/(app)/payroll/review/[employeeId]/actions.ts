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

if (existingEntry.payroll_run_id) {
  throw new Error('This entry already belongs to a payroll run and cannot be edited from Review Days')
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

export async function createManualTimeEntry(formData: FormData) {
  const employeeId = String(formData.get('employee_id') || '')
  const dateFrom = String(formData.get('date_from') || '')
  const dateTo = String(formData.get('date_to') || '')
  const entryDate = String(formData.get('entry_date') || '')
  const clockInRaw = String(formData.get('clock_in') || '')
  const clockOutRaw = String(formData.get('clock_out') || '')

  if (!employeeId) {
    throw new Error('Employee ID is required')
  }

  if (!entryDate) {
    throw new Error('Entry date is required')
  }

  if (!clockInRaw) {
    throw new Error('Clock in is required')
  }

  const { data: employee, error: employeeError } = await supabaseAdmin
    .from('employees')
    .select('id, organization_id, user_id')
    .eq('id', employeeId)
    .maybeSingle()

  if (employeeError || !employee) {
    throw new Error('Employee not found')
  }

  const clockIn = new Date(clockInRaw).toISOString()
  const clockOut = clockOutRaw ? new Date(clockOutRaw).toISOString() : null

  let totalHours: number | null = null

  if (clockOut) {
    totalHours =
      (new Date(clockOut).getTime() - new Date(clockIn).getTime()) / 1000 / 60 / 60
  }

  const { error } = await supabaseAdmin
    .from('time_entries')
    .insert({
      organization_id: employee.organization_id,
      user_id: employee.user_id,
      employee_id: employee.id,
      entry_date: entryDate,
      clock_in: clockIn,
      clock_out: clockOut,
      total_hours: totalHours,
    })

  if (error) {
    throw new Error(error.message)
  }

  redirect(`/payroll/review/${employeeId}?date_from=${dateFrom}&date_to=${dateTo}`)
}