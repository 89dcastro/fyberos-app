'use server'

import { supabase } from '../../../../lib/supabase'
import { redirect } from 'next/navigation'

export async function updateSubcontractor(
  subcontractorId: string,
  formData: FormData
) {
  const company_name = String(formData.get('company_name') || '').trim()
  const contact_name = String(formData.get('contact_name') || '').trim()
  const email = String(formData.get('email') || '').trim()
  const phone = String(formData.get('phone') || '').trim()
  const address = String(formData.get('address') || '').trim()
  const notes = String(formData.get('notes') || '').trim()
  const status = String(formData.get('status') || 'active').trim()

  const branchIds = formData.getAll('branch_ids').map(String)

  if (!company_name) {
    throw new Error('Company name is required.')
  }

  const { error } = await supabase
    .from('subcontractors')
    .update({
      company_name,
      contact_name: contact_name || null,
      email: email || null,
      phone: phone || null,
      address: address || null,
      notes: notes || null,
      status,
    })
    .eq('id', subcontractorId)

  if (error) {
    throw new Error(error.message)
  }

  const { error: deleteError } = await supabase
    .from('subcontractor_branches')
    .delete()
    .eq('subcontractor_id', subcontractorId)

  if (deleteError) {
    throw new Error(deleteError.message)
  }

  if (branchIds.length > 0) {
    const rows = branchIds.map((branchId) => ({
      subcontractor_id: subcontractorId,
      branch_id: branchId,
    }))

    const { error: insertError } = await supabase
      .from('subcontractor_branches')
      .insert(rows)

    if (insertError) {
      throw new Error(insertError.message)
    }
  }

  redirect(`/subcontractors/${subcontractorId}`)
}