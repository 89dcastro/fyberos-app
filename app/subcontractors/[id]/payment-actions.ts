'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function generateSubcontractorPayment({
  subcontractorId,
  fromDate,
  toDate,
}: {
  subcontractorId: string
  fromDate: string
  toDate: string
}) {
  // 1. get unpaid entries
  const { data: entries, error: entriesError } = await supabase
    .from('subcontractor_daily_entries')
    .select('*')
    .eq('subcontractor_id', subcontractorId)
    .is('payment_id', null)
    .gte('work_date', fromDate)
    .lte('work_date', toDate)

  if (entriesError) {
    console.error('Error fetching entries:', entriesError)
    throw new Error('Failed to fetch entries')
  }

  if (!entries || entries.length === 0) {
    console.log('No unpaid entries found')
    return
  }

  // 2. get rates
  const { data: assignments, error: assignmentsError } = await supabase
    .from('segment_subcontractors')
    .select('segment_id, rate')
    .eq('subcontractor_id', subcontractorId)

  if (assignmentsError) {
    console.error('Error fetching assignments:', assignmentsError)
    throw new Error('Failed to fetch rates')
  }

  const rateMap = new Map()
  for (const a of assignments || []) {
    rateMap.set(a.segment_id, Number(a.rate || 0))
  }

  let totalFootage = 0
  let totalAmount = 0

  for (const e of entries) {
    const ft = Number(e.footage_installed || 0)
    const rate = rateMap.get(e.segment_id) || 0

    totalFootage += ft
    totalAmount += ft * rate
  }

  // 3. create payment
  const { data: payment, error: paymentError } = await supabase
    .from('subcontractor_payments')
    .insert({
      subcontractor_id: subcontractorId,
      from_date: fromDate,
      to_date: toDate,
      total_entries: entries.length,
      total_footage: totalFootage,
      total_amount: totalAmount,
      status: 'draft',
    })
    .select()
    .single()

  if (paymentError || !payment) {
    console.error('Error creating payment:', paymentError)
    throw new Error('Failed to create payment')
  }

  // 4. update entries with payment_id
  const ids = entries.map((e) => e.id)

  const { error: updateError } = await supabase
    .from('subcontractor_daily_entries')
    .update({ payment_id: payment.id })
    .in('id', ids)

  if (updateError) {
    console.error('Error updating entries:', updateError)

    // ⚠️ opcional: rollback (delete payment if update fails)
    await supabase
      .from('subcontractor_payments')
      .delete()
      .eq('id', payment.id)

    throw new Error('Failed to assign payment to entries')
  }

  // 5. refresh UI
  revalidatePath(`/subcontractors/${subcontractorId}`)
}