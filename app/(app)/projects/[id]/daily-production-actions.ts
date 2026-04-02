'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '../../../lib/supabase'

export async function createCrewDailyEntry(formData: FormData) {
  const projectId = formData.get('project_id') as string
  const segmentId = formData.get('segment_id') as string
  const crewId = formData.get('crew_id') as string
  const workDate = formData.get('work_date') as string
  const footageInstalled = formData.get('footage_installed') as string
  const notes = formData.get('notes') as string
  const organizationId = formData.get('organization_id') as string

  const { error } = await supabase.from('daily_entries').insert({
    organization_id: organizationId,
    project_id: projectId,
    segment_id: segmentId,
    crew_id: crewId,
    work_date: workDate,
    footage_installed: footageInstalled ? Number(footageInstalled) : 0,
    notes,
  })

  if (error) {
    console.error('Error creating crew daily entry:', error.message)
    return
  }

  revalidatePath(`/projects/${projectId}`)
}

export async function createSubcontractorDailyEntry(formData: FormData) {
  const projectId = formData.get('project_id') as string
  const segmentId = formData.get('segment_id') as string
  const subcontractorId = formData.get('subcontractor_id') as string
  const workDate = formData.get('work_date') as string
  const footageInstalled = formData.get('footage_installed') as string
  const notes = formData.get('notes') as string
  const organizationId = formData.get('organization_id') as string

  const { error } = await supabase.from('subcontractor_daily_entries').insert({
    organization_id: organizationId,
    project_id: projectId,
    segment_id: segmentId,
    subcontractor_id: subcontractorId,
    work_date: workDate,
    footage_installed: footageInstalled ? Number(footageInstalled) : 0,
    notes,
  })

  if (error) {
    console.error('Error creating subcontractor daily entry:', error.message)
    return
  }

  revalidatePath(`/projects/${projectId}`)
}