import Link from 'next/link'
import { supabase } from '../../../../lib/supabase'
import { updateProject } from './actions'

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  const { data: branches } = await supabase
    .from('branches')
    .select('id, name')
    .order('name')

  if (error) {
    return (
      <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-6 text-red-200">
        <h1 className="text-xl font-semibold">Error loading project</h1>
        <p className="mt-2 text-sm">{error.message}</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-semibold text-white">Project not found</h1>
        <p className="mt-2 text-sm text-white/55">
          No project was found with this ID.
        </p>
      </div>
    )
  }

  async function updateProjectWithId(formData: FormData) {
    'use server'
    await updateProject(id, formData)
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="fyber-page-title">Edit Project</h1>
          <p className="fyber-page-subtitle">
            Update project details and correct any data entered earlier.
          </p>
        </div>

        <Link href={`/projects/${id}`} className="fyber-button-secondary">
          Back to Project
        </Link>
      </section>

      <section className="fyber-card max-w-4xl p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">Project Details</h2>
          <p className="mt-1 text-sm text-white/45">
            Edit the main information for this project.
          </p>
        </div>

        <form action={updateProjectWithId} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <input
              name="name"
              type="text"
              defaultValue={project.name || ''}
              placeholder="Project Name"
              required
              className="fyber-input"
            />

            <input
              name="project_number"
              type="text"
              defaultValue={project.project_number || ''}
              placeholder="Project Number"
              required
              className="fyber-input"
            />

            <input
              name="client"
              type="text"
              defaultValue={project.client || ''}
              placeholder="Client"
              className="fyber-input"
            />

            <input
              name="location"
              type="text"
              defaultValue={project.location || ''}
              placeholder="Location"
              className="fyber-input"
            />

            <select
              name="branch_id"
              defaultValue={project.branch_id || ''}
              className="fyber-input"
              required
            >
              <option value="">Select branch</option>
              {branches?.map((branch: any) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>

            <input
              name="total_footage"
              type="text"
              inputMode="decimal"
              defaultValue={project.total_footage || 0}
              placeholder="Total Footage"
              className="fyber-input"
            />

            <select
              name="status"
              defaultValue={project.status || 'active'}
              className="fyber-input"
            >
              <option value="active">Active</option>
              <option value="planning">Planning</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="fyber-button-primary">
              Save Changes
            </button>

            <Link href={`/projects/${id}`} className="fyber-button-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </div>
  )
}