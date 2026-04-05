import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import {
  updateEmployee,
  createEmployeeAccess,
  updateEmployeeUsername,
  resetEmployeePassword,
  updateEmployeeRole,
} from './actions'
import EditEmployeeForm from './page-client'

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: employee, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  const { data: crews } = await supabase
    .from('crews')
    .select('id, name')
    .order('name')

  const { data: branches } = await supabase
    .from('branches')
    .select('id, name')
    .order('name')

let currentUserRole: string | null = null

const supabaseServer = await createSupabaseServerClient()
const {
  data: { user: currentAuthUser },
} = await supabaseServer.auth.getUser()

if (currentAuthUser) {
  const { data: currentUserData } = await supabase
    .from('users')
    .select('role')
    .eq('id', currentAuthUser.id)
    .maybeSingle()

  currentUserRole = currentUserData?.role || null
}

  let linkedUser: {
    id: string
    email: string | null
    full_name: string | null
    role: string | null
    username: string | null
  } | null = null

  if (employee?.user_id) {
    const { data: userData } = await supabase
      .from('users')
      .select('id, email, full_name, role, username')
      .eq('id', employee.user_id)
      .maybeSingle()

    linkedUser = userData || null
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-6 text-red-200">
        <h1 className="text-xl font-semibold">Error loading employee</h1>
        <p className="mt-2 text-sm">{error.message}</p>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-semibold text-white">Employee not found</h1>
        <p className="mt-2 text-sm text-white/55">
          No employee was found with this ID.
        </p>
      </div>
    )
  }

  async function updateEmployeeWithId(formData: FormData) {
    'use server'
    await updateEmployee(id, formData)
  }

  async function createEmployeeAccessWithId(formData: FormData) {
    'use server'
    await createEmployeeAccess(id, formData)
  }

  async function updateEmployeeUsernameWithId(formData: FormData) {
    'use server'
    await updateEmployeeUsername(id, formData)
  }

  async function resetEmployeePasswordWithId(formData: FormData) {
    'use server'
    await resetEmployeePassword(id, formData)
  }

  async function updateEmployeeRoleWithId(formData: FormData) {
  'use server'
  await updateEmployeeRole(id, formData)
}

  return (
    <div className="space-y-6">
      <section className="flex justify-between">
        <div>
          <h1 className="fyber-page-title">Edit Employee</h1>
          <p className="fyber-page-subtitle">
            Update employee information, payroll settings, branch, crew assignment, and login access.
          </p>
        </div>

        <Link href={`/employees/${id}`} className="fyber-button-secondary">
          Back to Employee
        </Link>
      </section>

      <EditEmployeeForm
        employee={employee}
        linkedUser={linkedUser}
        crews={crews || []}
        branches={branches || []}
        action={updateEmployeeWithId}
        createAccessAction={createEmployeeAccessWithId}
        updateUsernameAction={updateEmployeeUsernameWithId}
        resetPasswordAction={resetEmployeePasswordWithId}
        updateRoleAction={updateEmployeeRoleWithId}
        currentUserRole={currentUserRole}
      />
    </div>
  )
}