'use server'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

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

export async function createProject(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const organizationId = await getCurrentOrganizationId()

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

  const { data: insertedProject, error } = await supabase
  .from('projects')
  .insert({
    organization_id: organizationId,
    branch_id,
    name,
    project_number: projectNumber,
    client_id,
    location: location || null,
    total_footage: totalFootage,
    status: status || 'active',
  })
  .select('id')
  .single()

  if (error) {
    throw new Error(error.message)
  }
  const projectId = insertedProject.id
  

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

  if (normalizedItems.length > 0) {
  const rows = normalizedItems.map((item) => ({
    organization_id: organizationId,
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
redirect('/projects')
}