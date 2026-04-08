import { createSupabaseServerClient } from '@/lib/supabase-server'

function getWeekKey(dateValue: string) {
  const date = new Date(`${dateValue}T12:00:00`)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  return date.toISOString().split('T')[0]
}

export type PayrollPreviewRow = {
  employee_id: string
  employee_name: string
  pay_type: string
  regular_hours: number
  overtime_hours: number
  days_worked: number
  weeks_worked: number
  hourly_rate: number
  overtime_rate: number
  daily_rate: number
  weekly_salary: number
  gross_pay: number
  entry_ids: string[]
}

export async function getPayrollPreview(dateFrom: string, dateTo: string) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      currentUserRole: null,
      organizationId: null,
      rows: [] as PayrollPreviewRow[],
      totalAmount: 0,
    }
  }

  const { data: currentUser } = await supabase
    .from('users')
    .select('organization_id, role')
    .eq('id', user.id)
    .maybeSingle()

  if (!currentUser?.organization_id) {
    return {
      currentUserRole: currentUser?.role || null,
      organizationId: null,
      rows: [] as PayrollPreviewRow[],
      totalAmount: 0,
    }
  }

  const { data: entries, error } = await supabase
    .from('time_entries')
    .select(`
      id,
      employee_id,
      entry_date,
      total_hours,
      employees!inner (
        id,
        full_name,
        pay_type,
        hourly_rate,
        daily_rate,
        weekly_salary,
        overtime_threshold_hours,
        overtime_rate
      )
    `)
    .eq('organization_id', currentUser.organization_id)
    .is('payroll_run_id', null)
    .not('clock_out', 'is', null)
    .not('employee_id', 'is', null)
    .gte('entry_date', dateFrom)
    .lte('entry_date', dateTo)
    .order('entry_date', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  const map = new Map<string, any>()

  for (const entry of entries || []) {
    const employee = Array.isArray(entry.employees) ? entry.employees[0] : entry.employees
    if (!employee) continue

    const key = employee.id

    if (!map.has(key)) {
      map.set(key, {
        employee_id: employee.id,
        employee_name: employee.full_name || 'Unknown Employee',
        pay_type: employee.pay_type || 'hourly',
        regular_hours: 0,
        overtime_hours: 0,
        days_worked_set: new Set<string>(),
        weeks_worked_set: new Set<string>(),
        hourly_rate: Number(employee.hourly_rate || 0),
        overtime_rate: Number(employee.overtime_rate || 0),
        daily_rate: Number(employee.daily_rate || 0),
        weekly_salary: Number(employee.weekly_salary || 0),
        overtime_threshold_hours: Number(employee.overtime_threshold_hours || 40),
        week_hours: new Map<string, number>(),
        entry_ids: [] as string[],
      })
    }

    const current = map.get(key)
    current.entry_ids.push(entry.id)

    if (entry.entry_date) {
      current.days_worked_set.add(entry.entry_date)
      current.weeks_worked_set.add(getWeekKey(entry.entry_date))
    }

    if (current.pay_type === 'hourly') {
      const weekKey = getWeekKey(entry.entry_date)
      const previous = current.week_hours.get(weekKey) || 0
      current.week_hours.set(weekKey, previous + Number(entry.total_hours || 0))
    }
  }

  const rows: PayrollPreviewRow[] = []

  for (const item of map.values()) {
    if (item.pay_type === 'hourly') {
      for (const hours of item.week_hours.values()) {
        const regular = Math.min(hours, item.overtime_threshold_hours)
        const overtime = Math.max(0, hours - item.overtime_threshold_hours)
        item.regular_hours += regular
        item.overtime_hours += overtime
      }

      item.gross_pay =
        item.regular_hours * item.hourly_rate +
        item.overtime_hours * item.overtime_rate
    }

    if (item.pay_type === 'daily') {
      const daysWorked = item.days_worked_set.size
      item.gross_pay = daysWorked * item.daily_rate
    }

    if (item.pay_type === 'weekly_salary') {
      const weeksWorked = item.weeks_worked_set.size
      item.gross_pay = weeksWorked * item.weekly_salary
    }

    rows.push({
      employee_id: item.employee_id,
      employee_name: item.employee_name,
      pay_type: item.pay_type,
      regular_hours: Number(item.regular_hours || 0),
      overtime_hours: Number(item.overtime_hours || 0),
      days_worked: item.days_worked_set.size,
      weeks_worked: item.weeks_worked_set.size,
      hourly_rate: item.hourly_rate,
      overtime_rate: item.overtime_rate,
      daily_rate: item.daily_rate,
      weekly_salary: item.weekly_salary,
      gross_pay: Number(item.gross_pay || 0),
      entry_ids: item.entry_ids,
    })
  }

  rows.sort((a, b) => a.employee_name.localeCompare(b.employee_name))

  const totalAmount = rows.reduce((sum, row) => sum + row.gross_pay, 0)

  return {
    currentUserRole: currentUser.role || null,
    organizationId: currentUser.organization_id,
    currentUserId: user.id,
    rows,
    totalAmount,
  }
}