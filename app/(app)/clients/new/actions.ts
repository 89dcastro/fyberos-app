'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'

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

export async function createClient(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const organizationId = await getCurrentOrganizationId()

  const companyName = String(formData.get('company_name') || '').trim()
  const contactName = String(formData.get('contact_name') || '').trim()
  const contactPhone = String(formData.get('contact_phone') || '').trim()
  const contactEmail = String(formData.get('contact_email') || '').trim()
  const status = String(formData.get('status') || 'active').trim()

  if (!companyName) {
    throw new Error('Company name is required.')
  }

  const { error } = await supabase.from('clients').insert({
    organization_id: organizationId,
    company_name: companyName,
    contact_name: contactName || null,
    contact_phone: contactPhone || null,
    contact_email: contactEmail || null,
    status: status || 'active',
  })

  if (error) {
    throw new Error(error.message)
  }

  redirect('/clients')
}