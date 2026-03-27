// ================================
// IMPORTS
// ================================
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import StatusBadge from '../../../components/ui/StatusBadge'
import SubcontractorProductionSummary from './SubcontractorProductionSummary'


// ================================
// PAGE
// ================================
export default async function SubcontractorDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ from?: string; to?: string }>
}) {
  const { id } = await params
  const resolvedSearchParams = (await searchParams) || {}

  // ================================
  // DATE RANGE DEFAULTS
  // ================================
  const today = new Date().toISOString().split('T')[0]
  const defaultFrom = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  const fromDate = resolvedSearchParams.from || defaultFrom
  const toDate = resolvedSearchParams.to || today

  // ================================
  // MAIN SUBCONTRACTOR QUERY
  // ================================
  const { data: subcontractor, error } = await supabase
    .from('subcontractors')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  // ================================
  // BRANCHES ASSIGNED TO THIS SUBCONTRACTOR
  // ================================
  const { data: assignedBranches } = await supabase
    .from('subcontractor_branches')
    .select(`
      id,
      branches (
        id,
        name,
        city,
        state
      )
    `)
    .eq('subcontractor_id', id)

  // ================================
  // SEGMENT ASSIGNMENTS + RATES
  // ================================
  const { data: segmentAssignments } = await supabase
    .from('segment_subcontractors')
    .select(`
      id,
      pay_type,
      rate,
      unit,
      notes,
      segment_id,
      project_segments (
        id,
        name,
        project_id,
        projects (
          id,
          name,
          project_number
        )
      )
    `)
    .eq('subcontractor_id', id)

  // ================================
  // OPEN / UNPAID PRODUCTION ENTRIES
  // Only production entries not yet attached to a payment
  // ================================
  const { data: openProductionEntries } = await supabase
    .from('subcontractor_daily_entries')
    .select(`
      id,
      organization_id,
      project_id,
      segment_id,
      subcontractor_id,
      work_date,
      footage_installed,
      notes,
      created_at,
      payment_id,
      project_segments (
        id,
        name
      ),
      projects (
        id,
        name,
        project_number
      )
    `)
    .eq('subcontractor_id', id)
    .is('payment_id', null)
    .order('work_date', { ascending: false })
    .order('created_at', { ascending: false })

  // ================================
  // OPEN / UNPAID PRODUCTION ENTRIES IN SELECTED RANGE
  // ================================
  const { data: openRangeProductionEntries } = await supabase
    .from('subcontractor_daily_entries')
    .select(`
      id,
      organization_id,
      project_id,
      segment_id,
      subcontractor_id,
      work_date,
      footage_installed,
      notes,
      created_at,
      payment_id,
      project_segments (
        id,
        name
      ),
      projects (
        id,
        name,
        project_number
      )
    `)
    .eq('subcontractor_id', id)
    .is('payment_id', null)
    .gte('work_date', fromDate)
    .lte('work_date', toDate)
    .order('work_date', { ascending: false })
    .order('created_at', { ascending: false })

  // ================================
  // ERROR / EMPTY STATES
  // ================================
  if (error) {
    return (
      <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-6 text-red-200">
        <h1 className="text-xl font-semibold">Error loading subcontractor</h1>
        <p className="mt-2 text-sm">{error.message}</p>
      </div>
    )
  }

  if (!subcontractor) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-semibold text-white">Subcontractor not found</h1>
        <p className="mt-2 text-sm text-white/55">
          No subcontractor was found with this ID.
        </p>
      </div>
    )
  }

  // ================================
  // BASE COUNTS
  // ================================
  const totalAssignments = segmentAssignments?.length || 0
  const totalBranches = assignedBranches?.length || 0

  // ================================
  // MAP SEGMENT -> RATE / UNIT / PAY TYPE
  // This is the key for turning production into money
  // ================================
  const assignmentRateMap = new Map<
    string,
    { rate: number; unit: string; payType: string }
  >()

  for (const assignment of segmentAssignments || []) {
    if (!assignment.segment_id) continue

    assignmentRateMap.set(assignment.segment_id, {
      rate: Number(assignment.rate || 0),
      unit: assignment.unit || 'ft',
      payType: assignment.pay_type || 'per foot',
    })
  }

  // ================================
  // OPEN / UNPAID PRODUCTION ROWS
  // ================================
  const openProductionRows =
    openProductionEntries?.map((entry: any) => {
      const assignment = assignmentRateMap.get(entry.segment_id)
      const rate = assignment?.rate || 0
      const unit = assignment?.unit || 'ft'
      const payType = assignment?.payType || 'per foot'
      const footage = Number(entry.footage_installed || 0)
      const amountOwed = footage * rate

      return {
        ...entry,
        rate,
        unit,
        payType,
        amountOwed,
      }
    }) || []

  // ================================
  // OPEN / UNPAID PRODUCTION ROWS IN SELECTED RANGE
  // ================================
  const openRangeRows =
    openRangeProductionEntries?.map((entry: any) => {
      const assignment = assignmentRateMap.get(entry.segment_id)
      const rate = assignment?.rate || 0
      const unit = assignment?.unit || 'ft'
      const payType = assignment?.payType || 'per foot'
      const footage = Number(entry.footage_installed || 0)
      const amountOwed = footage * rate

      return {
        ...entry,
        rate,
        unit,
        payType,
        amountOwed,
      }
    }) || []

  // ================================
  // OPEN / UNPAID OVERVIEW TOTALS
  // ================================
  const totalOpenEntries = openProductionRows.length

  const totalOpenFootage = openProductionRows.reduce((sum: number, row: any) => {
    return sum + Number(row.footage_installed || 0)
  }, 0)

  const totalOpenAmountOwed = openProductionRows.reduce((sum: number, row: any) => {
    return sum + Number(row.amountOwed || 0)
  }, 0)

  // ================================
  // RANGE TOTALS
  // ================================
  const totalRangeEntries = openRangeRows.length

  const totalRangeFootage = openRangeRows.reduce((sum: number, row: any) => {
    return sum + Number(row.footage_installed || 0)
  }, 0)

  const totalRangeAmountOwed = openRangeRows.reduce((sum: number, row: any) => {
    return sum + Number(row.amountOwed || 0)
  }, 0)

  // ================================
  // GROUP OPEN / UNPAID BY PROJECT
  // ================================
  const openProjectMap = new Map<
    string,
    {
      projectId: string
      projectName: string
      projectNumber: string
      entries: number
      footage: number
      amount: number
    }
  >()

  for (const row of openProductionRows) {
    const projectId = row.project_id || row.projects?.id || 'unknown'
    const projectName = row.projects?.name || 'Unknown Project'
    const projectNumber = row.projects?.project_number || 'N/A'

    const current = openProjectMap.get(projectId) || {
      projectId,
      projectName,
      projectNumber,
      entries: 0,
      footage: 0,
      amount: 0,
    }

    current.entries += 1
    current.footage += Number(row.footage_installed || 0)
    current.amount += Number(row.amountOwed || 0)

    openProjectMap.set(projectId, current)
  }

  const openProjects = Array.from(openProjectMap.values()).sort(
    (a, b) => b.amount - a.amount
  )

  // ================================
  // UI
  // ================================
  return (
    <div className="space-y-6">
      {/* ================================
          HEADER
      ================================ */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-3">
            <Link
              href="/subcontractors"
              className="text-sm text-cyan-200 hover:text-cyan-100"
            >
              ← Back to Subcontractors
            </Link>
          </div>

          <h1 className="fyber-page-title">{subcontractor.company_name}</h1>
          <p className="fyber-page-subtitle">
            View company details, open production, assigned branches, segment work,
            and unpaid amount owed.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/subcontractors/${id}/edit`}
            className="fyber-button-secondary"
          >
            Edit Subcontractor
          </Link>
        </div>
      </section>

      {/* ================================
          TOP OVERVIEW
      ================================ */}
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        {/* COMPANY OVERVIEW */}
        <div className="fyber-card p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">
            Company Overview
          </p>

          <div className="mt-4 grid gap-4 text-sm text-white/75 sm:grid-cols-2">
            <p>
              <span className="text-white/45">Company:</span>{' '}
              {subcontractor.company_name}
            </p>
            <p>
              <span className="text-white/45">Contact:</span>{' '}
              {subcontractor.contact_name || 'N/A'}
            </p>
            <p>
              <span className="text-white/45">Email:</span>{' '}
              {subcontractor.email || 'N/A'}
            </p>
            <p>
              <span className="text-white/45">Phone:</span>{' '}
              {subcontractor.phone || 'N/A'}
            </p>
            <p>
              <span className="text-white/45">Address:</span>{' '}
              {subcontractor.address || 'N/A'}
            </p>

            <div className="flex items-center gap-2">
              <span className="text-white/45">Status:</span>
              <StatusBadge status={subcontractor.status || 'active'} />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-medium text-white/80">Notes</p>
            <p className="mt-2 text-sm text-white/60">
              {subcontractor.notes || 'No notes'}
            </p>
          </div>
        </div>

        {/* ASSIGNMENT + OPEN SUMMARY */}
        <div className="fyber-card p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">
            Assignment Summary
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <SubSummaryCard label="Branches" value={`${totalBranches}`} />
            <SubSummaryCard label="Segment Assignments" value={`${totalAssignments}`} />
            <SubSummaryCard label="Open Entries" value={`${totalOpenEntries}`} />
            <SubSummaryCard
              label="Open Amount Owed"
              value={`$${totalOpenAmountOwed.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
            />
          </div>
        </div>
      </section>

      {/* ================================
          OPEN PRODUCTION OVERVIEW
      ================================ */}
      <section className="fyber-card p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-white">Open Production Overview</h2>
          <p className="mt-1 text-sm text-white/45">
            Unpaid production currently open across all active projects.
          </p>
        </div>

        <div className="mb-5 grid gap-4 md:grid-cols-4">
          <SubSummaryCard label="Open Entries" value={`${totalOpenEntries}`} />
          <SubSummaryCard label="Open Footage" value={`${totalOpenFootage} ft`} />
          <SubSummaryCard
            label="Open Amount Owed"
            value={`$${totalOpenAmountOwed.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
          />
          <SubSummaryCard label="Open Projects" value={`${openProjects.length}`} />
        </div>

        {openProjects.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/60">
            No open production is currently pending payment.
          </div>
        ) : (
          <div className="grid gap-4">
            {openProjects.map((project) => (
              <div
                key={project.projectId}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm text-white/75">
                  <p>
                    <span className="text-white/45">Project:</span>{' '}
                    {project.projectName}
                  </p>
                  <p>
                    <span className="text-white/45">Project #:</span>{' '}
                    {project.projectNumber}
                  </p>
                  <p>
                    <span className="text-white/45">Open Footage:</span>{' '}
                    {project.footage.toLocaleString()} ft
                  </p>
                  <p>
                    <span className="text-white/45">Open Owed:</span>{' '}
                    ${project.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm text-white/75">
                  <p>
                    <span className="text-white/45">Open Entries:</span>{' '}
                    {project.entries}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ================================
          PRODUCTION SUMMARY BY RANGE
      ================================ */}
      <SubcontractorProductionSummary
        subcontractorId={id}
        initialFrom={fromDate}
        initialTo={toDate}
      />

      {/* ================================
          AVAILABLE BRANCHES
      ================================ */}
      <section className="fyber-card p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-white">Available Branches</h2>
          <p className="mt-1 text-sm text-white/45">
            Branches where this subcontractor is allowed to operate.
          </p>
        </div>

        {!assignedBranches || assignedBranches.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/60">
            No branches assigned yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {assignedBranches.map((item: any) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <p className="text-base font-semibold text-white">
                  {item.branches?.name || 'Unnamed Branch'}
                </p>
                <p className="mt-2 text-sm text-white/55">
                  {item.branches?.city || 'N/A'}
                  {item.branches?.state ? `, ${item.branches.state}` : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ================================
          ASSIGNED SEGMENTS
      ================================ */}
      <section className="fyber-card p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-white">Assigned Segments</h2>
          <p className="mt-1 text-sm text-white/45">
            Segment assignments and rates currently linked to this subcontractor.
          </p>
        </div>

        {!segmentAssignments || segmentAssignments.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/60">
            No segment assignments yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {segmentAssignments.map((assignment: any) => (
              <div
                key={assignment.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="grid gap-3 text-sm text-white/75 md:grid-cols-2 xl:grid-cols-6">
                  <p>
                    <span className="text-white/45">Project:</span>{' '}
                    {assignment.project_segments?.projects?.name || 'Unknown'}
                  </p>
                  <p>
                    <span className="text-white/45">Project #:</span>{' '}
                    {assignment.project_segments?.projects?.project_number || 'N/A'}
                  </p>
                  <p>
                    <span className="text-white/45">Segment:</span>{' '}
                    {assignment.project_segments?.name || 'Unnamed Segment'}
                  </p>
                  <p>
                    <span className="text-white/45">Rate:</span> $
                    {Number(assignment.rate || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    /{assignment.unit || 'ft'}
                  </p>
                  <p>
                    <span className="text-white/45">Pay Type:</span>{' '}
                    {formatPayType(assignment.pay_type || 'per foot')}
                  </p>
                  <p>
                    <span className="text-white/45">Notes:</span>{' '}
                    {assignment.notes || 'No notes'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ================================
          DOCUMENTS / COMPLIANCE PLACEHOLDER
      ================================ */}
      <section className="fyber-card p-6">
        <div className="mb-3">
          <h2 className="text-xl font-semibold text-white">Documents</h2>
          <p className="mt-1 text-sm text-white/45">
            Insurance, company registration, licenses, W-9, and other compliance
            files will live here.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/60">
          Coming Soon
        </div>
      </section>
    </div>
  )
}

// ================================
// SMALL SUMMARY CARD
// ================================
function SubSummaryCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm text-white/45">{label}</p>
      <h3 className="mt-3 text-2xl font-semibold text-white">{value}</h3>
    </div>
  )
}

// ================================
// HELPERS
// ================================
function formatPayType(value: string) {
  switch (value) {
    case 'production':
      return 'Production'
    case 'per foot':
      return 'Per Foot'
    case 'daily':
      return 'Daily'
    case 'fixed':
      return 'Fixed'
    default:
      return value
  }
}