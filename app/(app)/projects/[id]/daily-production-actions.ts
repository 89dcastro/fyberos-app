'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function createCrewDailyEntry(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const projectId = formData.get('project_id') as string
  const segmentId = formData.get('segment_id') as string
  const crewId = formData.get('crew_id') as string
  const workDate = formData.get('work_date') as string
  const footageInstalled = formData.get('footage_installed') as string
  const notes = formData.get('notes') as string
  const organizationId = formData.get('organization_id') as string

  const { data: insertedEntry, error } = await supabase
    .from('daily_entries')
    .insert({
      organization_id: organizationId,
      project_id: projectId,
      segment_id: segmentId,
      crew_id: crewId,
      work_date: workDate,
      footage_installed: footageInstalled ? Number(footageInstalled) : 0,
      notes,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating crew daily entry:', error.message)
    return
  }

  const billingItemIds = formData.getAll('billing_item_id[]').map(String)
  const billingItemQuantities = formData.getAll('billing_item_quantity[]').map(String)

  const quantityRows = billingItemIds
    .map((itemId, index) => ({
      organization_id: organizationId,
      daily_entry_id: insertedEntry.id,
      project_billing_item_id: itemId,
      quantity: Number(billingItemQuantities[index] || 0),
    }))
    .filter((row) => !Number.isNaN(row.quantity) && row.quantity > 0)

  if (quantityRows.length > 0) {
    const { error: quantityError } = await supabase
      .from('daily_entry_billing_quantities')
      .insert(quantityRows)

    if (quantityError) {
      console.error('Error creating crew billing quantities:', quantityError.message)
      return
    }
  }

  revalidatePath(`/projects/${projectId}`)
}

export async function createSubcontractorDailyEntry(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const projectId = formData.get('project_id') as string
  const segmentId = formData.get('segment_id') as string
  const subcontractorId = formData.get('subcontractor_id') as string
  const workDate = formData.get('work_date') as string
  const footageInstalled = formData.get('footage_installed') as string
  const notes = formData.get('notes') as string
  const organizationId = formData.get('organization_id') as string

  const { data: insertedEntry, error } = await supabase
    .from('subcontractor_daily_entries')
    .insert({
      organization_id: organizationId,
      project_id: projectId,
      segment_id: segmentId,
      subcontractor_id: subcontractorId,
      work_date: workDate,
      footage_installed: footageInstalled ? Number(footageInstalled) : 0,
      notes,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating subcontractor daily entry:', error.message)
    return
  }

  const billingItemIds = formData.getAll('billing_item_id[]').map(String)
  const billingItemQuantities = formData.getAll('billing_item_quantity[]').map(String)

  const quantityRows = billingItemIds
    .map((itemId, index) => ({
      organization_id: organizationId,
      subcontractor_daily_entry_id: insertedEntry.id,
      project_billing_item_id: itemId,
      quantity: Number(billingItemQuantities[index] || 0),
    }))
    .filter((row) => !Number.isNaN(row.quantity) && row.quantity > 0)

  if (quantityRows.length > 0) {
    const { error: quantityError } = await supabase
      .from('subcontractor_daily_entry_billing_quantities')
      .insert(quantityRows)

    if (quantityError) {
      console.error('Error creating subcontractor billing quantities:', quantityError.message)
      return
    }
  }

  revalidatePath(`/projects/${projectId}`)
}