'use server'

import { supabase } from '../../../lib/supabase'
import { redirect } from 'next/navigation'

export async function createBranch(formData: FormData) {
  const name = String(formData.get('name') || '').trim()
  const code = String(formData.get('code') || '').trim()
  const state = String(formData.get('state') || '').trim()
  const city = String(formData.get('city') || '').trim()
  const address = String(formData.get('address') || '').trim()
  const status = String(formData.get('status') || 'active').trim()

  const parent_branch_id_raw = String(formData.get('parent_branch_id') || '')
  const parent_branch_id = parent_branch_id_raw || null

  const organizationId = '6cd0a407-cde7-49d7-b57a-d4c8c9b58d0b'

  if (!name) {
    throw new Error('Branch name is required')
  }

  const { error } = await supabase.from('branches').insert({
    organization_id: organizationId,
    name,
    code: code || null,
    state: state || null,
    city: city || null,
    address: address || null,
    parent_branch_id,
    status,
  })

  if (error) {
    throw new Error(error.message)
  }

  redirect('/branches')
}