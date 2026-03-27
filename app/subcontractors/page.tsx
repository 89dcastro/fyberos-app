import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import StatusBadge from '../../components/ui/StatusBadge'

export default async function SubcontractorsPage() {
  const { data: subcontractors, error } = await supabase
    .from('subcontractors')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: subcontractorBranches } = await supabase
    .from('subcontractor_branches')
    .select(`
      subcontractor_id,
      branches (
        id,
        name
      )
    `)

  function getBranchNames(subcontractorId: string) {
    const matches =
      subcontractorBranches?.filter(
        (item: any) => item.subcontractor_id === subcontractorId
      ) || []

    if (matches.length === 0) return '-'

    return matches
      .map((item: any) => item.branches?.name)
      .filter(Boolean)
      .join(', ')
  }

  return (
    <div className="space-y-6">
      <section className="flex justify-between">
        <div>
          <h1 className="fyber-page-title">Subcontractors</h1>
          <p className="fyber-page-subtitle">
            External contractor companies.
          </p>
        </div>

        <Link href="/subcontractors/new" className="fyber-button-primary">
          Add Subcontractor
        </Link>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          Error loading subcontractors: {error.message}
        </div>
      )}

      {!subcontractors || subcontractors.length === 0 ? (
        <div className="fyber-card p-6">
          <h2 className="text-xl font-semibold text-white">No subcontractors yet</h2>
          <p className="mt-2 text-sm text-white/55">
            You have not added any subcontractor companies yet.
          </p>
        </div>
      ) : (
        <div className="fyber-card overflow-hidden">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="text-xl font-semibold text-white">Subcontractor Companies</h2>
            <p className="mt-1 text-sm text-white/45">
              External companies available for project and segment assignment.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="fyber-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Branches</th>
                  <th>Status</th>
                  <th>Edit</th>
                </tr>
              </thead>

              <tbody>
                {subcontractors.map((sub: any) => (
                  <tr key={sub.id}>
                    <td>
                      <Link
                        href={`/subcontractors/${sub.id}`}
                        className="font-semibold text-white transition hover:text-cyan-200"
                      >
                        {sub.company_name}
                      </Link>
                    </td>
                    <td>{sub.contact_name || '-'}</td>
                    <td>{sub.email || '-'}</td>
                    <td>{getBranchNames(sub.id)}</td>
                    <td>
                      <StatusBadge status={sub.status || 'active'} />
                    </td>
                    <td>
                      <Link
                        href={`/subcontractors/${sub.id}/edit`}
                        className="fyber-button-secondary"
                      >
                        Edit
                      </Link>
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