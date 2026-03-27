import Link from 'next/link'
import { supabase } from '../../../../lib/supabase'
import { updateEmployee } from './actions'
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

  return (
    <div className="space-y-6">
      <section className="flex justify-between">
        <div>
          <h1 className="fyber-page-title">Edit Employee</h1>
          <p className="fyber-page-subtitle">
            Update employee information, pay settings, branch, and crew assignment.
          </p>
        </div>

        <Link href={`/employees/${id}`} className="fyber-button-secondary">
          Back to Employee
        </Link>
      </section>

      <EditEmployeeForm
        employee={employee}
        crews={crews || []}
        branches={branches || []}
        action={updateEmployeeWithId}
      />
    </div>
  )
}