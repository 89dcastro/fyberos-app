import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default async function PaymentsPage() {
  // ================================
  // GET ALL OPEN PRODUCTION
  // ================================
  const { data: entries } = await supabase
    .from('subcontractor_daily_entries')
    .select(`
      id,
      subcontractor_id,
      segment_id,
      footage_installed,
      projects (
        id,
        name,
        project_number
      ),
      subcontractors (
        id,
        company_name
      )
    `)
    .is('payment_id', null)

  // ================================
  // GET ALL ASSIGNMENTS (FOR RATES)
  // ================================
  const { data: assignments } = await supabase
    .from('segment_subcontractors')
    .select(`
      subcontractor_id,
      segment_id,
      rate,
      unit
    `)

  // ================================
  // CREATE RATE MAP
  // ================================
  const rateMap = new Map()

  for (const a of assignments || []) {
    rateMap.set(
      `${a.subcontractor_id}-${a.segment_id}`,
      Number(a.rate || 0)
    )
  }

  // ================================
  // GROUP BY SUBCONTRACTOR
  // ================================
  const map = new Map()

  for (const entry of entries || []) {
    const key = entry.subcontractor_id

    const rate =
      rateMap.get(`${entry.subcontractor_id}-${entry.segment_id}`) || 0

    const footage = Number(entry.footage_installed || 0)
    const amount = footage * rate

    const subcontractorName =
  Array.isArray(entry.subcontractors)
    ? entry.subcontractors[0]?.company_name
    : (entry.subcontractors as any)?.company_name

const name = subcontractorName || 'Unknown'

const current = map.get(key) || {
  subcontractorId: entry.subcontractor_id,
  name: name,
  entries: 0,
  footage: 0,
  amount: 0,
  projects: new Set(),
}

    current.entries += 1
    current.footage += footage
    current.amount += amount

    if (entry.projects?.name) {
      current.projects.add(entry.projects.name)
    }

    map.set(key, current)
  }

  const rows = Array.from(map.values()).sort(
    (a, b) => b.amount - a.amount
  )

  // ================================
  // UI
  // ================================
  return (
    <div className="space-y-6">
      <h1 className="fyber-page-title">Payments</h1>
      <p className="fyber-page-subtitle">
        View all subcontractors with open (unpaid) balances.
      </p>

      {rows.length === 0 ? (
        <div className="fyber-card p-6 text-white/60">
          No open payables.
        </div>
      ) : (
        <div className="grid gap-4">
          {rows.map((row: any) => (
            <div key={row.subcontractorId} className="fyber-card p-5">
              <div className="grid md:grid-cols-5 gap-4 text-sm text-white/75">
                <div>
                  <p className="text-white/45">Subcontractor</p>
                  <p className="text-white font-semibold">{row.name}</p>
                </div>

                <div>
                  <p className="text-white/45">Open Entries</p>
                  <p>{row.entries}</p>
                </div>

                <div>
                  <p className="text-white/45">Footage</p>
                  <p>{row.footage.toLocaleString()} ft</p>
                </div>

                <div>
                  <p className="text-white/45">Amount Owed</p>
                  <p className="text-white font-semibold">
                    $
                    {row.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <div className="flex items-center justify-end">
                  <Link
                    href={`/subcontractors/${row.subcontractorId}`}
                    className="fyber-button-secondary"
                  >
                    View
                  </Link>
                </div>
              </div>

              <div className="mt-3 text-xs text-white/45">
                Projects: {[...row.projects].join(', ') || 'N/A'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}