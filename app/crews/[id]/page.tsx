import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import StatusBadge from '../../../components/ui/StatusBadge'

export default async function CrewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: crew, error: crewError } = await supabase
    .from('crews')
    .select(`
      *,
      branch:branch_id (
        id,
        name
      )
    `)
    .eq('id', id)
    .maybeSingle()

  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .eq('crew_id', id)
    .order('full_name')

  const { data: segmentAssignments } = await supabase
    .from('segment_crews')
    .select(`
      id,
      segment_id,
      project_segments (
        id,
        name,
        project_id,
        projects (
          id,
          name,
          project_number
        )
      )
    `)
    .eq('crew_id', id)

  const { data: dailyEntries } = await supabase
    .from('daily_entries')
    .select('id, footage_installed, work_date')
    .eq('crew_id', id)
    .order('work_date', { ascending: false })

  if (crewError) {
    return (
      <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-6 text-red-200">
        <h1 className="text-xl font-semibold">Error loading crew</h1>
        <p className="mt-2 text-sm">{crewError.message}</p>
      </div>
    )
  }

  if (!crew) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-semibold text-white">Crew not found</h1>
        <p className="mt-2 text-sm text-white/55">
          No crew was found with this ID.
        </p>
      </div>
    )
  }

  const totalEmployees = employees?.length || 0
  const totalAssignments = segmentAssignments?.length || 0
  const totalEntries = dailyEntries?.length || 0
  const totalFootage =
    dailyEntries?.reduce((sum: number, entry: any) => {
      return sum + (entry.footage_installed || 0)
    }, 0) || 0

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-3">
            <Link href="/crews" className="text-sm text-cyan-200 hover:text-cyan-100">
              ← Back to Crews
            </Link>
          </div>

          <h1 className="fyber-page-title">{crew.name}</h1>
          <p className="fyber-page-subtitle">
            View crew details, assigned employees, branch, segment assignments, and production activity.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href={`/crews/${id}/edit`} className="fyber-button-secondary">
            Edit Crew
          </Link>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="fyber-card p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">
            Crew Overview
          </p>

          <div className="mt-4 grid gap-4 text-sm text-white/75 sm:grid-cols-2">
            <p>
              <span className="text-white/45">Crew Name:</span> {crew.name}
            </p>
            <p>
              <span className="text-white/45">Branch:</span> {crew.branch?.name || 'N/A'}
            </p>
            <p>
              <span className="text-white/45">Crew Type:</span> {crew.type || 'N/A'}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-white/45">Status:</span>
              <StatusBadge status={crew.status || 'active'} />
            </div>
          </div>
        </div>

        <div className="fyber-card p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">
            Crew Summary
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <CrewSummaryCard label="Employees" value={`${totalEmployees}`} />
            <CrewSummaryCard label="Segment Assignments" value={`${totalAssignments}`} />
            <CrewSummaryCard label="Daily Entries" value={`${totalEntries}`} />
            <CrewSummaryCard label="Logged Footage" value={`${totalFootage} ft`} />
          </div>
        </div>
      </section>

      <section className="fyber-card p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-white">Assigned Employees</h2>
          <p className="mt-1 text-sm text-white/45">
            Employees currently assigned to this crew.
          </p>
        </div>

        {!employees || employees.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/60">
            No employees assigned to this crew yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="fyber-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Email</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee: any) => (
                  <tr key={employee.id}>
                    <td>{employee.full_name}</td>
                    <td>{employee.position || '-'}</td>
                    <td>{employee.email || '-'}</td>
                    <td>{employee.phone || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="fyber-card p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-white">Segment Assignments</h2>
          <p className="mt-1 text-sm text-white/45">
            Project segments where this crew has been assigned.
          </p>
        </div>

        {!segmentAssignments || segmentAssignments.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/60">
            This crew has not been assigned to any project segments yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {segmentAssignments.map((assignment: any) => (
              <div
                key={assignment.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <p className="font-semibold text-white">
                  {assignment.project_segments?.name || 'Unnamed Segment'}
                </p>
                <p className="mt-1 text-sm text-white/50">
                  Project: {assignment.project_segments?.projects?.name || 'Unknown Project'}
                </p>
                <p className="mt-1 text-sm text-white/50">
                  Project #: {assignment.project_segments?.projects?.project_number || 'N/A'}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="fyber-card p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-white">Recent Production Activity</h2>
          <p className="mt-1 text-sm text-white/45">
            Latest daily production entries logged under this crew.
          </p>
        </div>

        {!dailyEntries || dailyEntries.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/60">
            No daily production has been logged for this crew yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="fyber-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Footage Installed</th>
                </tr>
              </thead>
              <tbody>
                {dailyEntries.map((entry: any) => (
                  <tr key={entry.id}>
                    <td>{entry.work_date}</td>
                    <td>{entry.footage_installed || 0} ft</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function CrewSummaryCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-white/45">{label}</p>
      <h3 className="mt-2 text-xl font-semibold text-white">{value}</h3>
    </div>
  )
}