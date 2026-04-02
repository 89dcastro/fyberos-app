'use server'

import { supabase } from '../../../lib/supabase'
import { redirect } from 'next/navigation'

export async function createProject(formData: FormData) {
  const name = String(formData.get('name') || '').trim()
  const projectNumber = String(formData.get('project_number') || '').trim()
  const client = String(formData.get('client') || '').trim()
  const location = String(formData.get('location') || '').trim()
  const totalFootageRaw = String(formData.get('total_footage') || '').trim()
  const status = String(formData.get('status') || 'active').trim()

  const branch_id_raw = String(formData.get('branch_id') || '')
  const branch_id = branch_id_raw || null

  const organizationId = '6cd0a407-cde7-49d7-b57a-d4c8c9b58d0b'

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

  const { error } = await supabase.from('projects').insert({
    organization_id: organizationId,
    branch_id,
    name,
    project_number: projectNumber,
    client: client || null,
    location: location || null,
    total_footage: totalFootage,
    status: status || 'active',
  })

  if (error) {
    throw new Error(error.message)
  }

  redirect('/projects')
}