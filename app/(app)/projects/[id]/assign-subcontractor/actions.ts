'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '../../../../lib/supabase'

export async function assignSubcontractorToSegment(formData: FormData) {
  const projectId = formData.get('project_id') as string
  const segmentId = formData.get('segment_id') as string
  const subcontractorId = formData.get('subcontractor_id') as string
  const payType = formData.get('pay_type') as string
  const unit = formData.get('unit') as string
  const rateValue = formData.get('rate') as string

  const rate = rateValue ? Number(rateValue) : null

  if (!projectId || !segmentId || !subcontractorId || !payType || !unit || rate === null) {
    console.error('Missing required subcontractor assignment fields')
    return
  }

  if (rate < 0) {
    console.error('Rate cannot be negative')
    return
  }

  const { data: existing, error: existingError } = await supabase
    .from('segment_subcontractors')
    .select('id')
    .eq('segment_id', segmentId)
    .eq('subcontractor_id', subcontractorId)
    .maybeSingle()

  if (existingError) {
    console.error('Error checking subcontractor assignment:', existingError.message)
    return
  }

  if (existing) {
    console.error('Subcontractor already assigned to this segment')
    return
  }

  const { error } = await supabase.from('segment_subcontractors').insert({
    segment_id: segmentId,
    subcontractor_id: subcontractorId,
    pay_type: payType,
    rate,
    unit,
  })

  if (error) {
    console.error('Error assigning subcontractor:', error.message)
    return
  }

  revalidatePath(`/projects/${projectId}`)
}