import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import StatusBadge from '../../components/ui/StatusBadge'

export default async function ProjectsPage() {
  const { data: projects, error } = await supabase
    .from('projects')
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
          <h1 className="fyber-page-title">Projects</h1>
          <p className="fyber-page-subtitle">
            View and manage all active fiber construction projects.
          </p>
        </div>

        <Link href="/projects/new" className="fyber-button-primary">
          Create Project
        </Link>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          Error loading projects: {error.message}
        </div>
      )}

      {!projects || projects.length === 0 ? (
        <div className="fyber-card p-6">
          <h2 className="text-xl font-semibold text-white">No projects yet</h2>
          <p className="mt-2 text-sm text-white/55">
            You have not created any projects yet. Use “Create Project” to add your
            first one.
          </p>
        </div>
      ) : (
        <div className="fyber-card overflow-hidden">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="text-xl font-semibold text-white">Active Projects</h2>
            <p className="mt-1 text-sm text-white/45">
              Project list with client, branch, location, footage, and status.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="fyber-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Branch</th>
                  <th>Location</th>
                  <th>Total Footage</th>
                  <th>Status</th>
                  <th>Edit</th>
                </tr>
              </thead>

              <tbody>
                {projects.map((project: any) => (
                  <tr key={project.id}>
                    <td>
                      <div>
                        <Link
                          href={`/projects/${project.id}`}
                          className="font-semibold text-white transition hover:text-cyan-200"
                        >
                          {project.name}
                        </Link>
                        <p className="mt-1 text-xs text-white/40">
                          Project #: {project.project_number || 'N/A'}
                        </p>
                      </div>
                    </td>

                    <td>{project.client || 'N/A'}</td>
                    <td>{project.branch?.name || '-'}</td>
                    <td>{project.location || 'N/A'}</td>
                    <td>{project.total_footage || 0} ft</td>
                    <td>
                      <StatusBadge status={project.status || 'active'} />
                    </td>
                    <td>
                      <Link
                        href={`/projects/${project.id}/edit`}
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