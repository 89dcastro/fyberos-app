'use server'

import { supabase } from '../../../lib/supabase'
import { redirect } from 'next/navigation'

export async function createSubcontractor(formData: FormData) {
  const company_name = String(formData.get('company_name') || '').trim()
  const contact_name = String(formData.get('contact_name') || '').trim()
  const email = String(formData.get('email') || '').trim()
  const phone = String(formData.get('phone') || '').trim()
  const address = String(formData.get('address') || '').trim()
  const notes = String(formData.get('notes') || '').trim()
  const status = String(formData.get('status') || 'active')

  const organizationId = '6cd0a407-cde7-49d7-b57a-d4c8c9b58d0b'

  if (!company_name) {
    throw new Error('Company name is required')
  }

  const { error } = await supabase.from('subcontractors').insert({
    organization_id: organizationId,
    company_name,
    contact_name: contact_name || null,
    email: email || null,
    phone: phone || null,
    address: address || null,
    notes: notes || null,
    status,
  })

  if (error) {
    throw new Error(error.message)
  }

  redirect('/subcontractors')
}