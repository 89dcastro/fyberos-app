'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getOpenTimeEntry() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('time_entries')
    .select('*')
    .eq('user_id', user.id)
    .is('clock_out', null)
    .maybeSingle()

  return data
}
export async function clockIn() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

    const { data: currentUser } = await supabase
  .from('users')
  .select('organization_id')
  .eq('id', user.id)
  .maybeSingle()

  // evitar doble clock in
  const { data: existing } = await supabase
    .from('time_entries')
    .select('id')
    .eq('user_id', user.id)
    .is('clock_out', null)
    .maybeSingle()

  if (existing) {
    throw new Error('Already clocked in')
  }

  const { data: employee } = await supabase
  .from('employees')
  .select('id')
  .eq('user_id', user.id)
  .maybeSingle()

  const { error } = await supabase.from('time_entries').insert({
    user_id: user.id,
    clock_in: new Date().toISOString(),
    entry_date: new Date().toISOString().split('T')[0],
    organization_id: currentUser?.organization_id || null,
    employee_id: employee?.id || null,
  })
  if (error) {
  throw new Error(error.message)
}
  redirect('/time-tracking')
}
export async function clockOut() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data: entry } = await supabase
    .from('time_entries')
    .select('*')
    .eq('user_id', user.id)
    .is('clock_out', null)
    .maybeSingle()

  if (!entry) {
    throw new Error('No active time entry')
  }

  const clockOutTime = new Date()
  const clockInTime = new Date(entry.clock_in)

  const totalHours =
    (clockOutTime.getTime() - clockInTime.getTime()) / 1000 / 60 / 60


    const { data: employee } = await supabase
  .from('employees')
  .select('id')
  .eq('user_id', user.id)
  .maybeSingle()
  
  const { error } = await supabase
    .from('time_entries')
    .update({
      clock_out: clockOutTime.toISOString(),
      employee_id: employee?.id || null,
      total_hours: totalHours,
    })
    
    .eq('id', entry.id)
    if (error) {
  throw new Error(error.message)
}
    redirect('/time-tracking')
}

export async function getRecentEntries() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('time_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('clock_in', { ascending: false })
    .limit(5)

  return data || []
}

export async function getUnpaidDailySummary() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
  return {
    days: [],
    totalUnpaidHours: 0,
  }
}

  const { data, error } = await supabase
    .from('time_entries')
    .select('id, entry_date, total_hours, clock_out, payroll_run_id')
    .eq('user_id', user.id)
    .is('payroll_run_id', null)
    .order('entry_date', { ascending: false })
    .order('clock_in', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const map = new Map<string, { date: string; hours: number; hasOpen: boolean }>()

  for (const entry of data || []) {
    const date = entry.entry_date || 'No date'
    const current = map.get(date) || {
      date,
      hours: 0,
      hasOpen: false,
    }
    current.hours += Number(entry.total_hours || 0)

    if (!entry.clock_out) {
      current.hasOpen = true
    }

    map.set(date, current)
  }
const totalUnpaidHours = Array.from(map.values()).reduce((sum, day) => sum + day.hours, 0)

  return {
  days: Array.from(map.values()),
  totalUnpaidHours,
}
}