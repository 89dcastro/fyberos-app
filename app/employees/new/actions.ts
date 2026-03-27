'use server'

import { supabase } from '../../../lib/supabase'
import { redirect } from 'next/navigation'

export async function createEmployee(formData: FormData) {
  const full_name = String(formData.get('full_name') || '').trim()
  const email = String(formData.get('email') || '').trim()
  const phone = String(formData.get('phone') || '').trim()
  const position = String(formData.get('position') || '').trim()

  const branch_id_raw = String(formData.get('branch_id') || '')
  const branch_id = branch_id_raw || null

  const crew_id_raw = String(formData.get('crew_id') || '')
  const crew_id = crew_id_raw || null

  const pay_type = String(formData.get('pay_type') || 'hourly').trim()

  const hourly_rate = Number(formData.get('hourly_rate') || 0)
  const daily_rate = Number(formData.get('daily_rate') || 0)
  const weekly_salary = Number(formData.get('weekly_salary') || 0)

  const overtime_threshold_hours = Number(formData.get('overtime_threshold_hours') || 40)
  const overtime_rate = Number(formData.get('overtime_rate') || 0)

  const organizationId = '6cd0a407-cde7-49d7-b57a-d4c8c9b58d0b'

  if (!full_name) {
    throw new Error('Employee name is required')
  }

  if (!['hourly', 'daily', 'weekly_salary'].includes(pay_type)) {
    throw new Error('Invalid pay type')
  }

  const { error } = await supabase.from('employees').insert({
    organization_id: organizationId,
    full_name,
    email,
    phone,
    position,
    branch_id,
    crew_id,
    pay_type,
    hourly_rate,
    daily_rate,
    weekly_salary,
    overtime_threshold_hours,
    overtime_rate,
    status: 'active',
  })

  if (error) {
    throw new Error(error.message)
  }

  redirect('/employees')
}