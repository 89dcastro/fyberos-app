import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import StatusBadge from '@/components/ui/StatusBadge'

export default async function ClientDetailPage({
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

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-3">
            <Link href="/clients" className="text-sm text-cyan-200 hover:text-cyan-100">
              ← Back to Clients
            </Link>
          </div>

          <h1 className="fyber-page-title">{client.company_name}</h1>
          <p className="fyber-page-subtitle">
            View client information and main contact details.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href={`/clients/${id}/edit`} className="fyber-button-secondary">
            Edit Client
          </Link>
        </div>
      </section>

      <section className="fyber-card p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-white/40">
          Client Overview
        </p>

        <div className="mt-4 grid gap-4 text-sm text-white/75 sm:grid-cols-2">
          <p>
            <span className="text-white/45">Company:</span> {client.company_name}
          </p>
          <p>
            <span className="text-white/45">Contact:</span> {client.contact_name || 'N/A'}
          </p>
          <p>
            <span className="text-white/45">Email:</span> {client.contact_email || 'N/A'}
          </p>
          <p>
            <span className="text-white/45">Phone:</span> {client.contact_phone || 'N/A'}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-white/45">Status:</span>
            <StatusBadge status={client.status || 'active'} />
          </div>
        </div>
      </section>
    </div>
  )
}