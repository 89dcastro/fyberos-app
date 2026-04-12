import { createSupabaseServerClient } from '@/lib/supabase-server'
import InvoicesDashboard from './InvoicesDashboard'

function monthKey(dateValue: string) {
  const date = new Date(dateValue)
  const year = date.getFullYear()
  const month = date.toLocaleString('en-US', { month: 'short' })
  return `${month} ${year}`
}

export default async function InvoicesPage() {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('customer_invoices')
    .select(`
      id,
      project_id,
      invoice_number,
      invoice_date,
      status,
      total,
      client:client_id (
        company_name
      ),
      project:project_id (
        name
      )
    `)
    .order('invoice_date', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  const invoices =
    (data || []).map((invoice: any) => ({
      id: invoice.id,
      project_id: invoice.project_id,
      invoice_number: invoice.invoice_number,
      invoice_date: invoice.invoice_date,
      status: invoice.status,
      total: Number(invoice.total || 0),
      client_name: invoice.client?.company_name || 'N/A',
      project_name: invoice.project?.name || 'N/A',
    })) || []

  const revenueMap = new Map<
    string,
    { label: string; invoiced: number; paid: number; outstanding: number }
  >()

  for (const invoice of invoices) {
    const key = monthKey(invoice.invoice_date)
    const current = revenueMap.get(key) || {
      label: key,
      invoiced: 0,
      paid: 0,
      outstanding: 0,
    }

    current.invoiced += invoice.total

    if (invoice.status === 'paid') {
      current.paid += invoice.total
    }

    if (invoice.status === 'issued') {
      current.outstanding += invoice.total
    }

    revenueMap.set(key, current)
  }

  const revenueData = Array.from(revenueMap.values())

  const statusCounts = {
    paid: invoices.filter((item) => item.status === 'paid').length,
    issued: invoices.filter((item) => item.status === 'issued').length,
    draft: invoices.filter((item) => item.status === 'draft').length,
    void: invoices.filter((item) => item.status === 'void').length,
  }

  const statusData = [
    { name: 'Paid', value: statusCounts.paid },
    { name: 'Issued', value: statusCounts.issued },
    { name: 'Draft', value: statusCounts.draft },
    { name: 'Void', value: statusCounts.void },
  ]

  const totalInvoiced = invoices.reduce((sum, item) => sum + item.total, 0)
  const totalPaid = invoices
    .filter((item) => item.status === 'paid')
    .reduce((sum, item) => sum + item.total, 0)
  const totalOutstanding = invoices
    .filter((item) => item.status === 'issued')
    .reduce((sum, item) => sum + item.total, 0)
  const totalDraft = invoices
    .filter((item) => item.status === 'draft')
    .reduce((sum, item) => sum + item.total, 0)

  return (
    <InvoicesDashboard
      invoices={[...invoices].reverse()}
      revenueData={revenueData}
      statusData={statusData}
      totalInvoiced={totalInvoiced}
      totalPaid={totalPaid}
      totalOutstanding={totalOutstanding}
      totalDraft={totalDraft}
    />
  )
}