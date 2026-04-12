'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function updateInvoiceStatus(formData: FormData) {
  const supabase = await createSupabaseServerClient()

  const invoiceId = formData.get('invoice_id') as string
  const projectId = formData.get('project_id') as string
  const status = formData.get('status') as string

  const { error } = await supabase
    .from('customer_invoices')
    .update({ status })
    .eq('id', invoiceId)

  if (error) {
    console.error('Error updating invoice status:', error.message)
    return
  }

  revalidatePath(`/projects/${projectId}`)
  revalidatePath(`/projects/${projectId}/invoices/${invoiceId}`)
  redirect(`/projects/${projectId}/invoices/${invoiceId}`)
}