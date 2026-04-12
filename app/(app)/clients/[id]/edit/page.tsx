import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { updateClient } from './actions'

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    return (
      <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-6 text-red-200">
        <h1 className="text-xl font-semibold">Error loading client</h1>
        <p className="mt-2 text-sm">{error.message}</p>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-semibold text-white">Client not found</h1>
        <p className="mt-2 text-sm text-white/55">
          No client was found with this ID.
        </p>
      </div>
    )
  }

  async function updateClientWithId(formData: FormData) {
    'use server'
    await updateClient(id, formData)
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="fyber-page-title">Edit Client</h1>
          <p className="fyber-page-subtitle">
            Update client details and contact information.
          </p>
        </div>

        <Link href={`/clients/${id}`} className="fyber-button-secondary">
          Back to Client
        </Link>
      </section>

      <section className="fyber-card max-w-4xl p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">Client Details</h2>
          <p className="mt-1 text-sm text-white/45">
            Edit the main information for this client.
          </p>
        </div>

        <form action={updateClientWithId} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <input
              name="company_name"
              type="text"
              defaultValue={client.company_name || ''}
              placeholder="Company Name"
              required
              className="fyber-input"
            />

            <input
              name="contact_name"
              type="text"
              defaultValue={client.contact_name || ''}
              placeholder="Contact Name"
              className="fyber-input"
            />

            <input
              name="contact_email"
              type="email"
              defaultValue={client.contact_email || ''}
              placeholder="Contact Email"
              className="fyber-input"
            />

            <input
              name="contact_phone"
              type="text"
              defaultValue={client.contact_phone || ''}
              placeholder="Contact Phone"
              className="fyber-input"
            />

            <select
              name="status"
              defaultValue={client.status || 'active'}
              className="fyber-input"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="fyber-button-primary">
              Save Changes
            </button>

            <Link href={`/clients/${id}`} className="fyber-button-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </div>
  )
}