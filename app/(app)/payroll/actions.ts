'use server'

import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getPayrollPreview } from './lib'

export async function generatePayrollRun(formData: FormData) {
  const dateFrom = String(formData.get('date_from') || '')
  const dateTo = String(formData.get('date_to') || '')

  if (!dateFrom || !dateTo) {
    throw new Error('Date range is required')
  }

  const preview = await getPayrollPreview(dateFrom, dateTo)

  if (!preview.organizationId || !preview.currentUserId) {
    throw new Error('User organization not found')
  }

  if (preview.currentUserRole !== 'admin' && preview.currentUserRole !== 'office') {
    throw new Error('Only admin or office can generate payroll')
  }

  if (preview.rows.length === 0) {
    throw new Error('No unpaid time entries found in selected range')
  }

  const { data: payrollRun, error: payrollRunError } = await supabaseAdmin
    .from('employee_payroll_runs')
    .insert({
      organization_id: preview.organizationId,
      created_by: preview.currentUserId,
      date_from: dateFrom,
      date_to: dateTo,
      total_amount: preview.totalAmount,
      status: 'draft',
    })
    .select('id')
    .maybeSingle()

  if (payrollRunError || !payrollRun) {
    throw new Error(payrollRunError?.message || 'Could not create payroll run')
  }

  const items = preview.rows.map((row) => ({
    payroll_run_id: payrollRun.id,
    employee_id: row.employee_id,
    employee_name: row.employee_name,
    pay_type: row.pay_type,
    regular_hours: row.regular_hours,
    overtime_hours: row.overtime_hours,
    days_worked: row.days_worked,
    weeks_worked: row.weeks_worked,
    hourly_rate: row.hourly_rate,
    overtime_rate: row.overtime_rate,
    daily_rate: row.daily_rate,
    weekly_salary: row.weekly_salary,
    gross_pay: row.gross_pay,
  }))

  const { error: itemsError } = await supabaseAdmin
    .from('employee_payroll_run_items')
    .insert(items)

  if (itemsError) {
    throw new Error(itemsError.message)
  }

  const allEntryIds = preview.rows.flatMap((row) => row.entry_ids)

  const { error: timeEntriesError } = await supabaseAdmin
    .from('time_entries')
    .update({
      payroll_run_id: payrollRun.id,
    })
    .in('id', allEntryIds)

  if (timeEntriesError) {
    throw new Error(timeEntriesError.message)
  }

  redirect(`/payroll?date_from=${dateFrom}&date_to=${dateTo}`)
}