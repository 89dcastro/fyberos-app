import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { updateInvoiceStatus } from './actions'

export default async function CustomerInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string; invoiceId: string }>
}) {
  const { id, invoiceId } = await params
  const supabase = await createSupabaseServerClient()

  const { data: invoice, error: invoiceError } = await supabase
    .from('customer_invoices')
    .select(`
      *,
      client:client_id (
        company_name
      )
    `)
    .eq('id', invoiceId)
    .eq('project_id', id)
    .maybeSingle()

  if (invoiceError) {
    throw new Error(invoiceError.message)
  }

  if (!invoice) {
    throw new Error('Invoice not found.')
  }

  const { data: items, error: itemsError } = await supabase
    .from('customer_invoice_items')
    .select('*')
    .eq('customer_invoice_id', invoiceId)
    .order('sort_order', { ascending: true })

  if (itemsError) {
    throw new Error(itemsError.message)
  }

  return (
    
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href={`/projects/${id}`} className="text-sm text-cyan-200 hover:text-cyan-100">
            ← Back to Project
          </Link>
          <h1 className="fyber-page-title mt-2">{invoice.invoice_number}</h1>
          <p className="fyber-page-subtitle">
            Customer invoice detail and saved line items.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/projects/${id}/invoices/${invoiceId}/edit`}
            className="fyber-button-secondary"
          >
            Edit Invoice
          </Link>
        </div>
      </section>

      <section className="fyber-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-white/45">Client</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {invoice.client?.company_name || 'N/A'}
            </p>
          </div>

          <div>
            <p className="text-sm text-white/45">Invoice Date</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {invoice.invoice_date}
            </p>
          </div>

          <div>
            <p className="text-sm text-white/45">Status</p>
            <form action={updateInvoiceStatus} className="mt-2 flex items-center gap-2">
              <input type="hidden" name="invoice_id" value={invoice.id} />
              <input type="hidden" name="project_id" value={id} />

              <select
                name="status"
                defaultValue={invoice.status}
                className="fyber-input"
              >
                <option value="draft">Draft</option>
                <option value="issued">Issued</option>
                <option value="paid">Paid</option>
                <option value="void">Void</option>
              </select>

              <button type="submit" className="fyber-button-secondary">
                Save
              </button>
            </form>
          </div>

          <div>
            <p className="text-sm text-white/45">Total</p>
            <p className="mt-1 text-lg font-semibold text-white">
              ${Number(invoice.total || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-medium text-white">Notes</p>
            <p className="mt-2 text-sm text-white/65">{invoice.notes}</p>
          </div>
        )}
      </section>

      <section className="fyber-card p-6">
        <h2 className="text-xl font-semibold text-white mb-5">Invoice Items</h2>

        {!items || items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/60">
            No invoice items found.
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((item: any) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="grid gap-3 text-sm text-white/75 md:grid-cols-5">
                  <p><span className="text-white/45">Item:</span> {item.item_name}</p>
                  <p><span className="text-white/45">Unit:</span> {item.unit_label}</p>
                  <p><span className="text-white/45">Price:</span> ${Number(item.unit_price || 0).toFixed(2)}</p>
                  <p><span className="text-white/45">Qty:</span> {Number(item.quantity || 0)}</p>
                  <p><span className="text-white/45">Line Total:</span> ${Number(item.line_total || 0).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}