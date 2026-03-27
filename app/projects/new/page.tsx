import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { createProject } from './actions'

export default async function NewProjectPage() {
  const { data: branches } = await supabase
    .from('branches')
    .select('id, name')
    .order('name')

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="fyber-page-title">Create Project</h1>
          <p className="fyber-page-subtitle">
            Add a new fiber construction project to the FyberOS workspace.
          </p>
        </div>

        <Link href="/projects" className="fyber-button-secondary">
          Back to Projects
        </Link>
      </section>

      <section className="fyber-card max-w-4xl p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">Project Details</h2>
          <p className="mt-1 text-sm text-white/45">
            Enter the main information required to create a project.
          </p>
        </div>

        <form action={createProject} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-white/80">
                Project Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Pauli Phase 2"
                required
                className="fyber-input"
              />
            </div>

            <div>
              <label htmlFor="project_number" className="mb-2 block text-sm font-medium text-white/80">
                Project Number
              </label>
              <input
                id="project_number"
                name="project_number"
                type="text"
                placeholder="P3451"
                required
                className="fyber-input"
              />
            </div>

            <div>
              <label htmlFor="client" className="mb-2 block text-sm font-medium text-white/80">
                Client
              </label>
              <input
                id="client"
                name="client"
                type="text"
                placeholder="Pauley Construction"
                className="fyber-input"
              />
            </div>

            <div>
              <label htmlFor="location" className="mb-2 block text-sm font-medium text-white/80">
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                placeholder="Colorado Springs"
                className="fyber-input"
              />
            </div>

            <div>
              <label htmlFor="branch_id" className="mb-2 block text-sm font-medium text-white/80">
                Branch
              </label>
              <select
                id="branch_id"
                name="branch_id"
                defaultValue=""
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
            </div>

            <div>
              <label htmlFor="total_footage" className="mb-2 block text-sm font-medium text-white/80">
                Total Footage
              </label>
              <input
                id="total_footage"
                name="total_footage"
                type="text"
                inputMode="decimal"
                placeholder="17000"
                className="fyber-input"
              />
            </div>

            <div>
              <label htmlFor="status" className="mb-2 block text-sm font-medium text-white/80">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue="active"
                className="fyber-input"
              >
                <option value="active">Active</option>
                <option value="planning">Planning</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4">
            <p className="text-sm font-semibold text-cyan-100">Project Creation Note</p>
            <p className="mt-2 text-sm text-white/65">
              Projects belong to a specific branch so large organizations can filter operations
              by office, region, or division.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="fyber-button-primary">
              Create Project
            </button>

            <Link href="/projects" className="fyber-button-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </div>
  )
}