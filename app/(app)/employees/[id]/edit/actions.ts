'use server'

import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function requireAdminAccess() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: userData, error } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (error || !userData) {
    throw new Error('User not found')
  }

  if (userData.role !== 'admin') {
    throw new Error('Unauthorized: admin access required')
  }
}

export async function updateEmployee(id: string, formData: FormData) {
  await requireAdminAccess()

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

  const status = String(formData.get('status') || 'active').trim()

  if (!full_name) {
    throw new Error('Employee name is required')
  }

  if (!['hourly', 'daily', 'weekly_salary'].includes(pay_type)) {
    throw new Error('Invalid pay type')
  }

  const { error } = await supabaseAdmin
    .from('employees')
    .update({
      full_name,
      email: email || null,
      phone: phone || null,
      position: position || null,
      branch_id,
      crew_id,
      pay_type,
      hourly_rate,
      daily_rate,
      weekly_salary,
      overtime_threshold_hours,
      overtime_rate,
      status,
    })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  redirect(`/employees/${id}`)
}

export async function createEmployeeAccess(id: string, formData: FormData) {
  await requireAdminAccess()

  const username = String(formData.get('username') || '').trim().toLowerCase()
  const temporary_password = String(formData.get('temporary_password') || '').trim()
  const role = String(formData.get('role') || 'employee').trim()

  if (!username) {
    throw new Error('Username is required')
  }

  if (!temporary_password) {
    throw new Error('Temporary password is required')
  }

  if (!['employee', 'foreman', 'office', 'admin'].includes(role)) {
    throw new Error('Invalid role')
  }

  const { data: employee, error: employeeError } = await supabaseAdmin
    .from('employees')
    .select('id, organization_id, full_name, email, user_id')
    .eq('id', id)
    .maybeSingle()

  if (employeeError || !employee) {
    throw new Error('Employee not found')
  }

  if (employee.user_id) {
    throw new Error('This employee already has linked access')
  }

  const email = (employee.email || '').trim().toLowerCase()

  if (!email) {
    throw new Error('Employee must have an email before creating login access')
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
    throw new Error('That email is already linked to an existing user')
  }

  const { data: authUserData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password: temporary_password,
      email_confirm: true,
      user_metadata: {
        full_name: employee.full_name,
        role,
        organization_id: employee.organization_id,
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
    organization_id: employee.organization_id,
    email,
    full_name: employee.full_name,
    role,
    username,
  })

  if (publicUserError) {
    await supabaseAdmin.auth.admin.deleteUser(authUser.id)
    throw new Error(publicUserError.message)
  }

  const { error: linkError } = await supabaseAdmin
    .from('employees')
    .update({
      user_id: authUser.id,
    })
    .eq('id', id)

  if (linkError) {
    await supabaseAdmin.from('users').delete().eq('id', authUser.id)
    await supabaseAdmin.auth.admin.deleteUser(authUser.id)
    throw new Error(linkError.message)
  }

  redirect(`/employees/${id}/edit`)
}

export async function updateEmployeeUsername(id: string, formData: FormData) {
  await requireAdminAccess()

  const username = String(formData.get('username') || '').trim().toLowerCase()

  if (!username) {
    throw new Error('Username is required')
  }

  const { data: employee, error: employeeError } = await supabaseAdmin
    .from('employees')
    .select('id, user_id')
    .eq('id', id)
    .maybeSingle()

  if (employeeError || !employee) {
    throw new Error('Employee not found')
  }

  if (!employee.user_id) {
    throw new Error('This employee does not have linked access')
  }

  const { data: existingUsername } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle()

  if (existingUsername && existingUsername.id !== employee.user_id) {
    throw new Error('That username is already in use')
  }

  const { error } = await supabaseAdmin
    .from('users')
    .update({ username })
    .eq('id', employee.user_id)

  if (error) {
    throw new Error(error.message)
  }

  redirect(`/employees/${id}/edit`)
}

export async function updateEmployeeRole(id: string, formData: FormData) {
  await requireAdminAccess()

  const role = String(formData.get('role') || '').trim()

  if (!['employee', 'foreman', 'office', 'admin'].includes(role)) {
    throw new Error('Invalid role')
  }

  const { data: employee, error: employeeError } = await supabaseAdmin
    .from('employees')
    .select('id, user_id, organization_id')
    .eq('id', id)
    .maybeSingle()

  if (employeeError || !employee) {
    throw new Error('Employee not found')
  }

  if (!employee.user_id) {
    throw new Error('This employee does not have linked access')
  }

  const cookieStore = await cookies()

const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
    },
  }
)

const {
  data: { user: currentUser },
} = await supabase.auth.getUser()

if (currentUser?.id === employee.user_id && role !== 'admin') {
  const { count, error: adminCountError } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', employee.organization_id)
    .eq('role', 'admin')

  if (adminCountError) {
    throw new Error(adminCountError.message)
  }

  if ((count || 0) <= 1) {
    throw new Error('You cannot remove the last admin from the organization')
  }
}

  const { error: publicUserError } = await supabaseAdmin
    .from('users')
    .update({ role })
    .eq('id', employee.user_id)

  if (publicUserError) {
    throw new Error(publicUserError.message)
  }

  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
    employee.user_id,
    {
      user_metadata: {
        role,
      },
    }
  )

  if (authError) {
    throw new Error(authError.message)
  }

  redirect(`/employees/${id}/edit`)
}

export async function resetEmployeePassword(id: string, formData: FormData) {
  await requireAdminAccess()

  const new_password = String(formData.get('new_password') || '').trim()

  if (!new_password) {
    throw new Error('New password is required')
  }

  const { data: employee, error: employeeError } = await supabaseAdmin
    .from('employees')
    .select('id, user_id')
    .eq('id', id)
    .maybeSingle()

  if (employeeError || !employee) {
    throw new Error('Employee not found')
  }

  if (!employee.user_id) {
    throw new Error('This employee does not have linked access')
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(
    employee.user_id,
    {
      password: new_password,
    }
  )

  if (error) {
    throw new Error(error.message)
  }

  redirect(`/employees/${id}/edit`)
}