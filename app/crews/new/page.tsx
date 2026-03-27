import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { createCrew } from './actions'

export default async function NewCrewPage() {
  const { data: branches } = await supabase
    .from('branches')
    .select('id, name')
    .order('name')

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="fyber-page-title">Create Crew</h1>
          <p className="fyber-page-subtitle">
            Add a new internal crew to the FyberOS workspace.
          </p>
        </div>

        <Link href="/crews" className="fyber-button-secondary">
          Back to Crews
        </Link>
      </section>

      <section className="fyber-card max-w-3xl p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">Crew Details</h2>
          <p className="mt-1 text-sm text-white/45">
            Create an internal crew for project assignment and daily production tracking.
          </p>
        </div>

        <form action={createCrew} className="space-y-6">
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
                placeholder="Ajalax Crew 2"
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
              <label
                htmlFor="type"
                className="mb-2 block text-sm font-medium text-white/80"
              >
                Crew Type
              </label>
              <select
                id="type"
                name="type"
                defaultValue=""
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
              Create Crew
            </button>

            <Link href="/crews" className="fyber-button-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </div>
  )
}