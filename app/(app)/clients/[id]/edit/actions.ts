'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function updateClient(clientId: string, formData: FormData) {
  const supabase = await createSupabaseServerClient()

  const companyName = String(formData.get('company_name') || '').trim()
  const contactName = String(formData.get('contact_name') || '').trim()
  const contactPhone = String(formData.get('contact_phone') || '').trim()
  const contactEmail = String(formData.get('contact_email') || '').trim()
  const status = String(formData.get('status') || 'active').trim()

  if (!companyName) {
    throw new Error('Company name is required.')
  }

  const { error } = await supabase
    .from('clients')
    .update({
      company_name: companyName,
      contact_name: contactName || null,
      contact_phone: contactPhone || null,
      contact_email: contactEmail || null,
      status: status || 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', clientId)

  if (error) {
    throw new Error(error.message)
  }

  redirect(`/clients/${clientId}`)
}