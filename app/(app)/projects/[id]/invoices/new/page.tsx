import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { saveCustomerInvoice } from './actions'

function sumNumeric(values: Array<number | string | null | undefined>) {
  return values.reduce<number>((sum, value) => sum + Number(value ?? 0), 0)
}

export default async function NewInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      project_number,
      client_id,
      client:client_id (
        company_name
      )
    `)
    .eq('id', id)
    .maybeSingle()

  if (projectError) {
    throw new Error(projectError.message)
  }

  if (!project) {
    throw new Error('Project not found.')
  }
  const clientName =
  Array.isArray(project.client)
    ? project.client[0]?.company_name
    : (project.client as any)?.company_name

  const { data: billingItems, error: billingItemsError } = await supabase
    .from('project_billing_items')
    .select('id, item_name, unit_label, unit_price, sort_order')
    .eq('project_id', id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (billingItemsError) {
    throw new Error(billingItemsError.message)
  }

  const { data: crewQuantityRows, error: crewQuantityError } = await supabase
    .from('daily_entry_billing_quantities')
    .select(`
      project_billing_item_id,
      quantity,
      daily_entries!inner (
        project_id
      )
    `)
    .eq('daily_entries.project_id', id)
    .is('customer_invoice_id', null)

  if (crewQuantityError) {
    throw new Error(crewQuantityError.message)
  }

  const { data: subQuantityRows, error: subQuantityError } = await supabase
    .from('subcontractor_daily_entry_billing_quantities')
    .select(`
      project_billing_item_id,
      quantity,
      subcontractor_daily_entries!inner (
        project_id
      )
    `)
    .eq('subcontractor_daily_entries.project_id', id)
    .is('customer_invoice_id', null)

  if (subQuantityError) {
    throw new Error(subQuantityError.message)
  }

  const quantityMap = new Map<string, number>()

  for (const row of crewQuantityRows || []) {
    const current = quantityMap.get(row.project_billing_item_id) || 0
    quantityMap.set(row.project_billing_item_id, current + Number(row.quantity || 0))
  }

  for (const row of subQuantityRows || []) {
    const current = quantityMap.get(row.project_billing_item_id) || 0
    quantityMap.set(row.project_billing_item_id, current + Number(row.quantity || 0))
  }

  async function saveInvoiceAction(formData: FormData) {
    'use server'
    await saveCustomerInvoice({ projectId: id, formData })
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href={`/projects/${id}`} className="text-sm text-cyan-200 hover:text-cyan-100">
            ← Back to Project
          </Link>
          <h1 className="fyber-page-title mt-2">Generate Invoice</h1>
          <p className="fyber-page-subtitle">
            Create a customer invoice draft from this project’s billing items and reported production.
          </p>
        </div>
      </section>

      <section className="fyber-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-white/45">Project</p>
            <p className="mt-1 text-lg font-semibold text-white">{project.name}</p>
            <p className="mt-1 text-sm text-white/55">Project #: {project.project_number || 'N/A'}</p>
          </div>

          <div>
            <p className="text-sm text-white/45">Client</p>
            <p className="mt-1 text-lg font-semibold text-white">
  {clientName || 'No client assigned'}
</p>
          </div>
        </div>
      </section>

      <form action={saveInvoiceAction} className="space-y-6">
        <section className="fyber-card p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Invoice Date
              </label>
              <input
                type="date"
                name="invoice_date"
                defaultValue={today}
                className="fyber-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Status
              </label>
              <select name="status" defaultValue="draft" className="fyber-input">
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
              placeholder="Optional invoice notes"
              className="fyber-input"
            />
          </div>
        </section>

        <section className="fyber-card p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-white">Invoice Items</h2>
            <p className="mt-1 text-sm text-white/45">
              Suggested quantities are pulled from reported production quantities by billing item. You can adjust them before saving.
            </p>
          </div>

          {!billingItems || billingItems.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/60">
              No billing items found for this project.
            </div>
          ) : (
            <div className="space-y-4">
              {billingItems.map((item: any) => {
                const suggestedQuantity = quantityMap.get(item.id) || 0
                const unitPrice = Number(item.unit_price || 0)
                const suggestedLineTotal = suggestedQuantity * unitPrice

                return (
                  <div
                    key={item.id}
                    className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1.5fr_0.8fr_0.8fr_0.9fr]"
                  >
                    <div>
                      <p className="font-medium text-white">{item.item_name}</p>
                      <p className="mt-1 text-xs text-white/45">
                        Suggested from production: {suggestedQuantity} {item.unit_label}
                      </p>

                      <input type="hidden" name="project_billing_item_id[]" value={item.id} />
                      <input type="hidden" name="item_name[]" value={item.item_name} />
                      <input type="hidden" name="unit_label[]" value={item.unit_label} />
                      <input type="hidden" name="unit_price[]" value={unitPrice} />
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
                      <p className="text-white/45">Unit</p>
                      <p className="mt-1">{item.unit_label}</p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
                      <p className="text-white/45">Unit Price</p>
                      <p className="mt-1">${unitPrice.toFixed(2)}</p>
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
                        defaultValue={suggestedQuantity}
                        className="fyber-input"
                      />
                      <p className="mt-2 text-xs text-white/45">
                        Suggested total: ${suggestedLineTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="fyber-button-primary">
            Save Invoice Draft
          </button>

          <Link href={`/projects/${id}`} className="fyber-button-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}