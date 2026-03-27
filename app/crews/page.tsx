import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import StatusBadge from '../../components/ui/StatusBadge'

export default async function CrewsPage() {
  const { data: crews, error } = await supabase
    .from('crews')
    .select(`
      *,
      branch:branch_id (
        name
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="fyber-page-title">Crews</h1>
          <p className="fyber-page-subtitle">
            Manage internal crews used for project assignment and daily production.
          </p>
        </div>

        <Link href="/crews/new" className="fyber-button-primary">
          Create Crew
        </Link>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          Error loading crews: {error.message}
        </div>
      )}

      {!crews || crews.length === 0 ? (
        <div className="fyber-card p-6">
          <h2 className="text-xl font-semibold text-white">No crews yet</h2>
          <p className="mt-2 text-sm text-white/55">
            You have not created any internal crews yet. Use “Create Crew” to add one.
          </p>
        </div>
      ) : (
        <div className="fyber-card overflow-hidden">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="text-xl font-semibold text-white">Internal Crews</h2>
            <p className="mt-1 text-sm text-white/45">
              Available crews that can be assigned to project segments.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="fyber-table">
              <thead>
                <tr>
                  <th>Crew Name</th>
                  <th>Branch</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Edit</th>
                </tr>
              </thead>

              <tbody>
                {crews.map((crew: any) => (
                  <tr key={crew.id}>
                    <td>
                      <Link
                        href={`/crews/${crew.id}`}
                        className="font-semibold text-white transition hover:text-cyan-200"
                      >
                        {crew.name}
                      </Link>
                    </td>
                    <td>{crew.branch?.name || '-'}</td>
                    <td>{crew.type || 'N/A'}</td>
                    <td>
                      <StatusBadge status={crew.status || 'active'} />
                    </td>
                    <td>
                      <Link
                        href={`/crews/${crew.id}/edit`}
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

      <div className="fyber-card p-6">
        <h2 className="text-xl font-semibold text-white">Next Crew Expansion</h2>
        <p className="mt-2 text-sm text-white/55">
          The next step after this module is deeper branch filtering, employee hours,
          payroll logic, and production analytics by crew.
        </p>
      </div>
    </div>
  )
}