import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import StatusBadge from '@/components/ui/StatusBadge'

export default async function ClientsPage() {
  const supabase = await createSupabaseServerClient()

  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="fyber-page-title">Clients</h1>
          <p className="fyber-page-subtitle">
            Manage customer companies and their main contact information.
          </p>
        </div>

        <Link href="/clients/new" className="fyber-button-primary">
          Create Client
        </Link>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          Error loading clients: {error.message}
        </div>
      )}

      {!clients || clients.length === 0 ? (
        <div className="fyber-card p-6">
          <h2 className="text-xl font-semibold text-white">No clients yet</h2>
          <p className="mt-2 text-sm text-white/55">
            You have not created any clients yet. Use “Create Client” to add your
            first one.
          </p>
        </div>
      ) : (
        <div className="fyber-card overflow-hidden">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="text-xl font-semibold text-white">Client List</h2>
            <p className="mt-1 text-sm text-white/45">
              Company records with contact information and status.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="fyber-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Edit</th>
                </tr>
              </thead>

              <tbody>
                {clients.map((client: any) => (
                  <tr key={client.id}>
                    <td>
                      <Link
                        href={`/clients/${client.id}`}
                        className="font-semibold text-white transition hover:text-cyan-200"
                      >
                        {client.company_name}
                      </Link>
                    </td>
                    <td>{client.contact_name || 'N/A'}</td>
                    <td>{client.contact_email || 'N/A'}</td>
                    <td>{client.contact_phone || 'N/A'}</td>
                    <td>
                      <StatusBadge status={client.status || 'active'} />
                    </td>
                    <td>
                      <Link
                        href={`/clients/${client.id}/edit`}
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