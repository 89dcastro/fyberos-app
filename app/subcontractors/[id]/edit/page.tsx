import Link from 'next/link'
import { supabase } from '../../../../lib/supabase'
import { updateSubcontractor } from './actions'

export default async function EditSubcontractorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: subcontractor, error } = await supabase
    .from('subcontractors')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  const { data: branches } = await supabase
    .from('branches')
    .select('id, name')
    .order('name')

  const { data: assignedBranches } = await supabase
    .from('subcontractor_branches')
    .select('branch_id')
    .eq('subcontractor_id', id)

  if (error) {
    return (
      <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-6 text-red-200">
        <h1 className="text-xl font-semibold">Error loading subcontractor</h1>
        <p className="mt-2 text-sm">{error.message}</p>
      </div>
    )
  }

  if (!subcontractor) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-semibold text-white">Subcontractor not found</h1>
        <p className="mt-2 text-sm text-white/55">
          No subcontractor was found with this ID.
        </p>
      </div>
    )
  }

  const selectedBranchIds = assignedBranches?.map((item: any) => item.branch_id) || []

  async function updateSubcontractorWithId(formData: FormData) {
    'use server'
    await updateSubcontractor(id, formData)
  }

  return (
    <div className="space-y-6">
      <section className="flex justify-between">
        <div>
          <h1 className="fyber-page-title">Edit Subcontractor</h1>
          <p className="fyber-page-subtitle">
            Update subcontractor company information, status, and branches.
          </p>
        </div>

        <Link href={`/subcontractors/${id}`} className="fyber-button-secondary">
          Back to Subcontractor
        </Link>
      </section>

      <section className="fyber-card max-w-5xl p-6">
        <form action={updateSubcontractorWithId} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <input
              name="company_name"
              defaultValue={subcontractor.company_name || ''}
              placeholder="Company Name"
              required
              className="fyber-input"
            />

            <input
              name="contact_name"
              defaultValue={subcontractor.contact_name || ''}
              placeholder="Contact Name"
              className="fyber-input"
            />

            <input
              name="email"
              defaultValue={subcontractor.email || ''}
              placeholder="Email"
              className="fyber-input"
            />

            <input
              name="phone"
              defaultValue={subcontractor.phone || ''}
              placeholder="Phone"
              className="fyber-input"
            />

            <input
              name="address"
              defaultValue={subcontractor.address || ''}
              placeholder="Address"
              className="fyber-input"
            />

            <select
              name="status"
              defaultValue={subcontractor.status || 'active'}
              className="fyber-input"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">
              Available Branches
            </label>

            <div className="grid gap-3 md:grid-cols-2">
              {branches?.map((branch: any) => (
                <label
                  key={branch.id}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
                >
                  <input
                    type="checkbox"
                    name="branch_ids"
                    value={branch.id}
                    defaultChecked={selectedBranchIds.includes(branch.id)}
                  />
                  <span>{branch.name}</span>
                </label>
              ))}
            </div>
          </div>

          <textarea
            name="notes"
            defaultValue={subcontractor.notes || ''}
            placeholder="Notes"
            rows={5}
            className="fyber-input"
          />

          <div className="flex flex-wrap items-center gap-3">
            <button className="fyber-button-primary">Save Changes</button>

            <Link href={`/subcontractors/${id}`} className="fyber-button-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </div>
  )
}