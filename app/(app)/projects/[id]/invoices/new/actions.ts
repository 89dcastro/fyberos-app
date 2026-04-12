'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'

type SaveInvoiceInput = {
  projectId: string
  formData: FormData
}

async function getCurrentOrganizationId() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unable to identify the current user.')
  }

  const { data: userRow, error: userError } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .maybeSingle()

  if (userError) {
    throw new Error(userError.message)
  }

  if (!userRow?.organization_id) {
    throw new Error('No organization was found for the current user.')
  }

  return userRow.organization_id as string
}

async function getNextInvoiceNumber(organizationId: string) {
  const supabase = await createSupabaseServerClient()

  const { data: invoices, error } = await supabase
    .from('customer_invoices')
    .select('invoice_number')
    .eq('organization_id', organizationId)

  if (error) {
    throw new Error(error.message)
  }

  let maxNumber = 0

  for (const invoice of invoices || []) {
    const match = /^INV-(\d+)$/.exec(invoice.invoice_number || '')
    if (!match) continue
    const parsed = Number(match[1])
    if (!Number.isNaN(parsed) && parsed > maxNumber) {
      maxNumber = parsed
    }
  }

  const next = maxNumber + 1
  return `INV-${String(next).padStart(4, '0')}`
}

export async function saveCustomerInvoice({ projectId, formData }: SaveInvoiceInput) {
  const supabase = await createSupabaseServerClient()
  const organizationId = await getCurrentOrganizationId()

  const invoiceDate = String(formData.get('invoice_date') || '')
  const notes = String(formData.get('notes') || '').trim()
  const status = String(formData.get('status') || 'draft').trim()

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, client_id')
    .eq('id', projectId)
    .maybeSingle()

  if (projectError) {
    throw new Error(projectError.message)
  }

  if (!project) {
    throw new Error('Project not found.')
  }

  const invoiceNumber = await getNextInvoiceNumber(organizationId)

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
        project_billing_item_id: itemId,
        item_name: (itemNames[index] || '').trim(),
        unit_label: (unitLabels[index] || '').trim(),
        unit_price: Number.isNaN(unitPrice) ? 0 : unitPrice,
        quantity: Number.isNaN(quantity) ? 0 : quantity,
        line_total: (Number.isNaN(unitPrice) ? 0 : unitPrice) * (Number.isNaN(quantity) ? 0 : quantity),
        sort_order: index,
      }
    })
    .filter((item) => item.item_name && item.unit_label)

  const subtotal = normalizedItems.reduce((sum, item) => sum + item.line_total, 0)
  const total = subtotal

  const { data: insertedInvoice, error: invoiceError } = await supabase
    .from('customer_invoices')
    .insert({
      organization_id: organizationId,
      project_id: projectId,
      client_id: project.client_id || null,
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate || new Date().toISOString().split('T')[0],
      status: status || 'draft',
      subtotal,
      total,
      notes: notes || null,
    })
    .select('id')
    .single()

  if (invoiceError) {
    throw new Error(invoiceError.message)
  }

    
  if (normalizedItems.length > 0) {
    const { error: itemsError } = await supabase
      .from('customer_invoice_items')
      .insert(
        normalizedItems.map((item) => ({
          organization_id: organizationId,
          customer_invoice_id: insertedInvoice.id,
          project_billing_item_id: item.project_billing_item_id || null,
          item_name: item.item_name,
          unit_label: item.unit_label,
          unit_price: item.unit_price,
          quantity: item.quantity,
          line_total: item.line_total,
          sort_order: item.sort_order,
        }))
      )

    if (itemsError) {
      throw new Error(itemsError.message)
    }
  }

  const { error: markCrewQuantitiesError } = await supabase
    .from('daily_entry_billing_quantities')
    .update({ customer_invoice_id: insertedInvoice.id })
    .in(
      'daily_entry_id',
      (
        await supabase
          .from('daily_entries')
          .select('id')
          .eq('project_id', projectId)
      ).data?.map((row: any) => row.id) || []
    )
    .is('customer_invoice_id', null)

  if (markCrewQuantitiesError) {
    throw new Error(markCrewQuantitiesError.message)
  }

  const { error: markSubQuantitiesError } = await supabase
    .from('subcontractor_daily_entry_billing_quantities')
    .update({ customer_invoice_id: insertedInvoice.id })
    .in(
      'subcontractor_daily_entry_id',
      (
        await supabase
          .from('subcontractor_daily_entries')
          .select('id')
          .eq('project_id', projectId)
      ).data?.map((row: any) => row.id) || []
    )
    .is('customer_invoice_id', null)

  if (markSubQuantitiesError) {
    throw new Error(markSubQuantitiesError.message)
  }


  redirect(`/projects/${projectId}/invoices/${insertedInvoice.id}`)
}