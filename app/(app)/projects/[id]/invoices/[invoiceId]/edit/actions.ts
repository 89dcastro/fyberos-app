'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'

type UpdateInvoiceInput = {
  projectId: string
  invoiceId: string
  formData: FormData
}

export async function updateCustomerInvoice({
  projectId,
  invoiceId,
  formData,
}: UpdateInvoiceInput) {
  const supabase = await createSupabaseServerClient()

  const invoiceDate = String(formData.get('invoice_date') || '')
  const notes = String(formData.get('notes') || '').trim()
  const status = String(formData.get('status') || 'draft').trim()

  const itemIds = formData.getAll('project_billing_item_id[]').map(String)
  const itemNames = formData.getAll('item_name[]').map(String)
  const unitLabels = formData.getAll('unit_label[]').map(String)
  const unitPrices = formData.getAll('unit_price[]').map(String)
  const quantities = formData.getAll('quantity[]').map(String)

  const normalizedItems = itemIds
    .map((itemId, index) => {
      const unitPrice = Number(unitPrices[index] || 0)
      const quantity = Number(quantities[index] || 0)

      return {
        project_billing_item_id: itemId || null,
        item_name: (itemNames[index] || '').trim(),
        unit_label: (unitLabels[index] || '').trim(),
        unit_price: Number.isNaN(unitPrice) ? 0 : unitPrice,
        quantity: Number.isNaN(quantity) ? 0 : quantity,
        line_total:
          (Number.isNaN(unitPrice) ? 0 : unitPrice) *
          (Number.isNaN(quantity) ? 0 : quantity),
        sort_order: index,
      }
    })
    .filter((item) => item.item_name && item.unit_label)

  const subtotal = normalizedItems.reduce((sum, item) => sum + item.line_total, 0)
  const total = subtotal

  const { data: existingInvoice, error: existingInvoiceError } = await supabase
    .from('customer_invoices')
    .select('id, organization_id')
    .eq('id', invoiceId)
    .eq('project_id', projectId)
    .maybeSingle()

  if (existingInvoiceError) {
    throw new Error(existingInvoiceError.message)
  }

  if (!existingInvoice) {
    throw new Error('Invoice not found.')
  }

  const { error: updateInvoiceError } = await supabase
    .from('customer_invoices')
    .update({
      invoice_date: invoiceDate || new Date().toISOString().split('T')[0],
      status: status || 'draft',
      subtotal,
      total,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', invoiceId)

  if (updateInvoiceError) {
    throw new Error(updateInvoiceError.message)
  }

  const { error: deleteItemsError } = await supabase
    .from('customer_invoice_items')
    .delete()
    .eq('customer_invoice_id', invoiceId)

  if (deleteItemsError) {
    throw new Error(deleteItemsError.message)
  }

  if (normalizedItems.length > 0) {
    const { error: insertItemsError } = await supabase
      .from('customer_invoice_items')
      .insert(
        normalizedItems.map((item) => ({
          organization_id: existingInvoice.organization_id,
          customer_invoice_id: invoiceId,
          project_billing_item_id: item.project_billing_item_id,
          item_name: item.item_name,
          unit_label: item.unit_label,
          unit_price: item.unit_price,
          quantity: item.quantity,
          line_total: item.line_total,
          sort_order: item.sort_order,
        }))
      )

    if (insertItemsError) {
      throw new Error(insertItemsError.message)
    }
  }

  redirect(`/projects/${projectId}/invoices/${invoiceId}`)
}