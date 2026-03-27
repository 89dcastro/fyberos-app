import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import StatusBadge from '../../components/ui/StatusBadge'

export default async function BranchesPage() {
  const { data: branches, error } = await supabase
    .from('branches')
    .select(`
      *,
      parent:parent_branch_id (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <section className="flex justify-between">
        <div>
          <h1 className="fyber-page-title">Branches</h1>
          <p className="fyber-page-subtitle">
            Manage branches, offices, and regional divisions.
          </p>
        </div>

        <Link href="/branches/new" className="fyber-button-primary">
          Add Branch
        </Link>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          Error loading branches: {error.message}
        </div>
      )}

      {!branches || branches.length === 0 ? (
        <div className="fyber-card p-6">
          <h2 className="text-xl font-semibold text-white">No branches yet</h2>
          <p className="mt-2 text-sm text-white/55">
            Create your first branch to organize projects, crews, employees,
            and subcontractors by location.
          </p>
        </div>
      ) : (
        <div className="fyber-card overflow-hidden">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="text-xl font-semibold text-white">Organization Branches</h2>
            <p className="mt-1 text-sm text-white/45">
              Regional and office structure for scalable operations.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="fyber-table">
              <thead>
                <tr>
                  <th>Branch</th>
                  <th>Code</th>
                  <th>State</th>
                  <th>City</th>
                  <th>Parent</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {branches.map((branch: any) => (
                  <tr key={branch.id}>
                    <td className="font-semibold text-white">{branch.name}</td>
                    <td>{branch.code || '-'}</td>
                    <td>{branch.state || '-'}</td>
                    <td>{branch.city || '-'}</td>
                    <td>{branch.parent?.name || '-'}</td>
                    <td>
                      <StatusBadge status={branch.status || 'active'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}