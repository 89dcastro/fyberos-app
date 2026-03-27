import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { createBranch } from './actions'

export default async function NewBranchPage() {
  const { data: branches } = await supabase
    .from('branches')
    .select('id, name')
    .order('name')

  return (
    <div className="space-y-6">
      <section className="flex justify-between">
        <div>
          <h1 className="fyber-page-title">Create Branch</h1>
          <p className="fyber-page-subtitle">
            Add a branch, office, or regional division to the organization.
          </p>
        </div>

        <Link href="/branches" className="fyber-button-secondary">
          Back
        </Link>
      </section>

      <section className="fyber-card max-w-5xl p-6">
        <form action={createBranch} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <input
              name="name"
              placeholder="Branch Name (Texas - San Antonio)"
              required
              className="fyber-input"
            />

            <input
              name="code"
              placeholder="Code (SATX, COS, HOU)"
              className="fyber-input"
            />

            <input
              name="state"
              placeholder="State"
              className="fyber-input"
            />

            <input
              name="city"
              placeholder="City"
              className="fyber-input"
            />

            <input
              name="address"
              placeholder="Address"
              className="fyber-input"
            />

            <select name="status" defaultValue="active" className="fyber-input">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select name="parent_branch_id" defaultValue="" className="fyber-input">
              <option value="">No Parent Branch</option>
              {branches?.map((branch: any) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4">
            <p className="text-sm font-semibold text-cyan-100">Branch Note</p>
            <p className="mt-2 text-sm text-white/65">
              Branches let FyberOS scale for organizations with multiple offices,
              regions, or operating divisions. Projects, crews, employees, and
              subcontractors can later be filtered by branch.
            </p>
          </div>

          <button className="fyber-button-primary">
            Create Branch
          </button>
        </form>
      </section>
    </div>
  )
}