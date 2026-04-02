'use server'

import { supabase } from '../../../lib/supabase'
import { redirect } from 'next/navigation'

export async function createCrew(formData: FormData) {
  const name = String(formData.get('name') || '').trim()
  const type = String(formData.get('type') || '').trim()

  const branch_id_raw = String(formData.get('branch_id') || '')
  const branch_id = branch_id_raw || null

  const organizationId = '6cd0a407-cde7-49d7-b57a-d4c8c9b58d0b'

  if (!name) {
    throw new Error('Crew name is required.')
  }

  const { error } = await supabase.from('crews').insert({
    organization_id: organizationId,
    branch_id,
    name,
    type: type || null,
    status: 'active',
  })

  if (error) {
    throw new Error(error.message)
  }

  redirect('/crews')
}