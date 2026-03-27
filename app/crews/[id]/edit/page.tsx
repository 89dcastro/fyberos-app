import Link from 'next/link'
import { supabase } from '../../../../lib/supabase'
import { updateCrew } from './actions'

export default async function EditCrewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: crew, error } = await supabase
    .from('crews')
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
        <h1 className="text-xl font-semibold">Error loading crew</h1>
        <p className="mt-2 text-sm">{error.message}</p>
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

  async function updateCrewWithId(formData: FormData) {
    'use server'
    await updateCrew(id, formData)
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="fyber-page-title">Edit Crew</h1>
          <p className="fyber-page-subtitle">
            Update an internal crew for project assignment and daily production tracking.
          </p>
        </div>

        <Link href={`/crews/${id}`} className="fyber-button-secondary">
          Back to Crew
        </Link>
      </section>

      <section className="fyber-card max-w-3xl p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">Crew Details</h2>
          <p className="mt-1 text-sm text-white/45">
            Edit this internal crew and keep the workspace organized.
          </p>
        </div>

        <form action={updateCrewWithId} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-white/80"
              >
                Crew Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={crew.name || ''}
                required
                className="fyber-input"
              />
            </div>

            <div>
              <label
                htmlFor="branch_id"
                className="mb-2 block text-sm font-medium text-white/80"
              >
                Branch
              </label>
              <select
                id="branch_id"
                name="branch_id"
                defaultValue={crew.branch_id || ''}
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
              <label
                htmlFor="type"
                className="mb-2 block text-sm font-medium text-white/80"
              >
                Crew Type
              </label>
              <select
                id="type"
                name="type"
                defaultValue={crew.type || ''}
                className="fyber-input"
              >
                <option value="">Select type</option>
                <option value="trenching">Trenching</option>
                <option value="bore">Directional Bore</option>
                <option value="missile">Missile Bore</option>
                <option value="splicing">Splicing</option>
                <option value="drop_bury">Drop Bury</option>
                <option value="general">General</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-medium text-white/80"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={crew.status || 'active'}
                className="fyber-input"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4">
            <p className="text-sm font-semibold text-cyan-100">Internal Crew Note</p>
            <p className="mt-2 text-sm text-white/65">
              Crews in FyberOS are internal labor groups. Branch assignment helps
              enterprise organizations keep crews organized by office, region, or division.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="fyber-button-primary">
              Save Changes
            </button>

            <Link href={`/crews/${id}`} className="fyber-button-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </div>
  )
}