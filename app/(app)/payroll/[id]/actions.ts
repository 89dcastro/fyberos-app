'use server'

import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function updatePayrollRunStatus(formData: FormData) {
  const id = String(formData.get('id') || '')
  const status = String(formData.get('status') || '').trim()

  if (!id) {
    throw new Error('Payroll run ID is required')
  }

  if (!['draft', 'finalized', 'paid'].includes(status)) {
    throw new Error('Invalid payroll status')
  }

  const { error } = await supabaseAdmin
    .from('employee_payroll_runs')
    .update({ status })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  redirect(`/payroll/${id}`)
}