'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function createEmployee(formData: FormData) {
  const full_name = String(formData.get('full_name') || '').trim()
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const phone = String(formData.get('phone') || '').trim()
  const position = String(formData.get('position') || '').trim()
  const username = String(formData.get('username') || '').trim().toLowerCase()
  const temporary_password = String(formData.get('temporary_password') || '').trim()
  const role = String(formData.get('role') || 'employee').trim()

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

  if (!full_name) throw new Error('Employee name is required')
  if (!email) throw new Error('Email is required')
  if (!username) throw new Error('Username is required')
  if (!temporary_password) throw new Error('Temporary password is required')

  if (!['hourly', 'daily', 'weekly_salary'].includes(pay_type)) {
    throw new Error('Invalid pay type')
  }

  if (!['employee', 'foreman', 'office', 'admin'].includes(role)) {
    throw new Error('Invalid role')
  }

  const { data: existingUsername } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle()

  if (existingUsername) {
    throw new Error('That username is already in use')
  }

  const { data: existingEmail } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existingEmail) {
    throw new Error('That email is already in use')
  }

  const { data: authUserData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password: temporary_password,
      email_confirm: true,
      user_metadata: {
        full_name,
        role,
        organization_id: organizationId,
      },
    })

  if (authError) {
    throw new Error(authError.message)
  }

  const authUser = authUserData.user

  if (!authUser) {
    throw new Error('User could not be created')
  }

  const { error: publicUserError } = await supabaseAdmin.from('users').insert({
    id: authUser.id,
    organization_id: organizationId,
    email,
    full_name,
    role,
    username,
  })

  if (publicUserError) {
    await supabaseAdmin.auth.admin.deleteUser(authUser.id)
    throw new Error(publicUserError.message)
  }

  const { error: employeeError } = await supabaseAdmin.from('employees').insert({
    organization_id: organizationId,
    user_id: authUser.id,
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

  if (employeeError) {
    await supabaseAdmin.from('users').delete().eq('id', authUser.id)
    await supabaseAdmin.auth.admin.deleteUser(authUser.id)
    throw new Error(employeeError.message)
  }

  revalidatePath('/employees')
  redirect('/employees')
}