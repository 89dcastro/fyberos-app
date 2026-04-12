'use server'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export async function updateProject(projectId: string, formData: FormData) {
  const supabase = await createSupabaseServerClient()

  const name = String(formData.get('name') || '').trim()
  const projectNumber = String(formData.get('project_number') || '').trim()
  const client_id = String(formData.get('client_id') || '') || null
  const location = String(formData.get('location') || '').trim()
  const totalFootageRaw = String(formData.get('total_footage') || '').trim()
  const status = String(formData.get('status') || 'active').trim()

  const branch_id_raw = String(formData.get('branch_id') || '')
  const branch_id = branch_id_raw || null

  if (!name) {
    throw new Error('Project name is required.')
  }

  if (!projectNumber) {
    throw new Error('Project number is required.')
  }

  const totalFootage = totalFootageRaw ? Number(totalFootageRaw) : 0

  if (Number.isNaN(totalFootage) || totalFootage < 0) {
    throw new Error('Total footage must be a valid positive number.')
  }

  const { data: existingProject, error: existingProjectError } = await supabase
    .from('projects')
    .select('id, organization_id')
    .eq('id', projectId)
    .maybeSingle()

  if (existingProjectError) {
    throw new Error(existingProjectError.message)
  }

  if (!existingProject) {
    throw new Error('Project not found.')
  }

  const { error: updateError } = await supabase
    .from('projects')
    .update({
      branch_id,
      name,
      project_number: projectNumber,
      client_id,
      location: location || null,
      total_footage: totalFootage,
      status: status || 'active',
    })
    .eq('id', projectId)

  if (updateError) {
    throw new Error(updateError.message)
  }

  const itemNames = formData.getAll('billing_item_name[]').map(String)
  const itemUnits = formData.getAll('billing_item_unit[]').map(String)
  const itemPrices = formData.getAll('billing_item_price[]').map(String)

  const normalizedItems = itemNames
    .map((itemName, index) => ({
      item_name: itemName.trim(),
      unit_label: (itemUnits[index] || '').trim(),
      unit_price: Number(itemPrices[index] || 0),
      sort_order: index,
    }))
    .filter(
      (item) =>
        item.item_name &&
        item.unit_label &&
        !Number.isNaN(item.unit_price) &&
        item.unit_price >= 0
    )

  const { error: deleteItemsError } = await supabase
    .from('project_billing_items')
    .delete()
    .eq('project_id', projectId)

  if (deleteItemsError) {
    throw new Error(deleteItemsError.message)
  }

  if (normalizedItems.length > 0) {
    const rows = normalizedItems.map((item) => ({
      organization_id: existingProject.organization_id,
      project_id: projectId,
      item_name: item.item_name,
      unit_label: item.unit_label,
      unit_price: item.unit_price,
      sort_order: item.sort_order,
      is_active: true,
    }))

    const { error: insertItemsError } = await supabase
      .from('project_billing_items')
      .insert(rows)

    if (insertItemsError) {
      throw new Error(insertItemsError.message)
    }
  }

  redirect(`/projects/${projectId}`)
}