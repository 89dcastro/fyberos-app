import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { updateCustomerInvoice } from './actions'

export default async function EditCustomerInvoicePage({
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

  async function updateInvoiceAction(formData: FormData) {
    'use server'
    await updateCustomerInvoice({
      projectId: id,
      invoiceId,
      formData,
    })
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href={`/projects/${id}/invoices/${invoiceId}`}
            className="text-sm text-cyan-200 hover:text-cyan-100"
          >
            ← Back to Invoice
          </Link>
          <h1 className="fyber-page-title mt-2">Edit Invoice</h1>
          <p className="fyber-page-subtitle">
            Update invoice items, quantities, totals, and status.
          </p>
        </div>
      </section>

      <section className="fyber-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-white/45">Invoice Number</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {invoice.invoice_number}
            </p>
          </div>

          <div>
            <p className="text-sm text-white/45">Client</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {invoice.client?.company_name || 'N/A'}
            </p>
          </div>
        </div>
      </section>

      <form action={updateInvoiceAction} className="space-y-6">
        <section className="fyber-card p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Invoice Date
              </label>
              <input
                type="date"
                name="invoice_date"
                defaultValue={invoice.invoice_date}
                className="fyber-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Status
              </label>
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
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-white/80">
              Notes
            </label>
            <textarea
              name="notes"
              rows={4}
              defaultValue={invoice.notes || ''}
              className="fyber-input"
            />
          </div>
        </section>

        <section className="fyber-card p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-white">Invoice Items</h2>
            <p className="mt-1 text-sm text-white/45">
              Adjust quantities and line values before issuing the invoice.
            </p>
          </div>

          {!items || items.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/60">
              No invoice items found.
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item: any) => (
                <div
                  key={item.id}
                  className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1.5fr_0.8fr_0.8fr_0.9fr]"
                >
                  <div>
                    <p className="font-medium text-white">{item.item_name}</p>

                    <input
                      type="hidden"
                      name="project_billing_item_id[]"
                      value={item.project_billing_item_id || ''}
                    />
                    <input
                      type="hidden"
                      name="item_name[]"
                      value={item.item_name}
                    />
                    <input
                      type="hidden"
                      name="unit_label[]"
                      value={item.unit_label}
                    />
                    <input
                      type="hidden"
                      name="unit_price[]"
                      value={item.unit_price}
                    />
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
                    <p className="text-white/45">Unit</p>
                    <p className="mt-1">{item.unit_label}</p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
                    <p className="text-white/45">Unit Price</p>
                    <p className="mt-1">${Number(item.unit_price || 0).toFixed(2)}</p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/80">
                      Quantity
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="quantity[]"
                      defaultValue={item.quantity}
                      className="fyber-input"
                    />
                    <p className="mt-2 text-xs text-white/45">
                      Current total: ${Number(item.line_total || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="fyber-button-primary">
            Save Invoice Changes
          </button>

          <Link
            href={`/projects/${id}/invoices/${invoiceId}`}
            className="fyber-button-secondary"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}