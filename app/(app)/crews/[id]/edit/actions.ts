'use server'

import { supabase } from '../../../../lib/supabase'
import { redirect } from 'next/navigation'

export async function updateCrew(crewId: string, formData: FormData) {
  const name = String(formData.get('name') || '').trim()
  const type = String(formData.get('type') || '').trim()
  const status = String(formData.get('status') || 'active').trim()

  const branch_id_raw = String(formData.get('branch_id') || '')
  const branch_id = branch_id_raw || null

  if (!name) {
    throw new Error('Crew name is required.')
  }

  const { error } = await supabase
    .from('crews')
    .update({
      name,
      type: type || null,
      status,
      branch_id,
    })
    .eq('id', crewId)

  if (error) {
    throw new Error(error.message)
  }

  redirect(`/crews/${crewId}`)
}