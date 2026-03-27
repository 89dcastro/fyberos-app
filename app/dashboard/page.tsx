import Link from 'next/link'
import { supabase } from '../../lib/supabase'



export default async function DashboardPage() {
    const today = new Date().toISOString().split('T')[0]

  const { data: todayCrewEntries } = await supabase
    .from('daily_entries')
    .select('footage_installed')
    .eq('work_date', today)

  const { data: todaySubEntries } = await supabase
    .from('subcontractor_daily_entries')
    .select('footage_installed')
    .eq('work_date', today)

  const { data: openSubEntries } = await supabase
    .from('subcontractor_daily_entries')
    .select('segment_id, footage_installed')
    .is('payment_id', null)

  const { data: segmentRates } = await supabase
    .from('segment_subcontractors')
    .select('subcontractor_id, segment_id, rate')

  const { count: activeProjectsCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .neq('status', 'completed')

    const { data: assignedCrews } = await supabase
  .from('segment_crews')
  .select('crew_id')

    const { data: activeProjects } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      total_footage,
      status
    `)
    .neq('status', 'completed')
    .order('created_at', { ascending: false })

  const activeProjectIds = (activeProjects || []).map((project: any) => project.id)

  let activeProjectSegments: any[] = []
  let activeCrewEntries: any[] = []
  let activeSubEntries: any[] = []

  if (activeProjectIds.length > 0) {
    const { data: segmentsData } = await supabase
      .from('project_segments')
      .select('id, project_id')
      .in('project_id', activeProjectIds)

    activeProjectSegments = segmentsData || []

    const { data: crewEntriesData } = await supabase
      .from('daily_entries')
      .select('project_id, footage_installed')
      .in('project_id', activeProjectIds)

    activeCrewEntries = crewEntriesData || []

    const { data: subEntriesData } = await supabase
      .from('subcontractor_daily_entries')
      .select('project_id, footage_installed')
      .in('project_id', activeProjectIds)

    activeSubEntries = subEntriesData || []
  }

      const todayCrewFootage =
    todayCrewEntries?.reduce((sum: number, entry: any) => {
      return sum + Number(entry.footage_installed || 0)
    }, 0) || 0

  const todaySubFootage =
    todaySubEntries?.reduce((sum: number, entry: any) => {
      return sum + Number(entry.footage_installed || 0)
    }, 0) || 0

  const todayProduction = todayCrewFootage + todaySubFootage

  const rateMap = new Map<string, number>()

  for (const item of segmentRates || []) {
    rateMap.set(item.segment_id, Number(item.rate || 0))
  }

  const { data: openEntriesDetailed } = await supabase
    .from('subcontractor_daily_entries')
    .select(`
      subcontractor_id,
      segment_id,
      footage_installed,
      subcontractors (
        id,
        company_name
      )
    `)
    .is('payment_id', null)
  const openPayables =

    openSubEntries?.reduce((sum: number, entry: any) => {
      const rate = rateMap.get(entry.segment_id) || 0
      const footage = Number(entry.footage_installed || 0)
      return sum + footage * rate
    }, 0) || 0

      const payablesMap = new Map()

  for (const entry of openEntriesDetailed || []) {
    const key = entry.subcontractor_id

    const rate = rateMap.get(entry.segment_id) || 0
    const footage = Number(entry.footage_installed || 0)
    const amount = footage * rate

    const current = payablesMap.get(key) || {
      id: entry.subcontractor_id,
      name: entry.subcontractors?.company_name || 'Unknown',
      entries: 0,
      footage: 0,
      amount: 0,
    }

    current.entries += 1
    current.footage += footage
    current.amount += amount

    payablesMap.set(key, current)
  }

  const topPayables = Array.from(payablesMap.values())
    .sort((a: any, b: any) => b.amount - a.amount)
    .slice(0, 5)

  const uniqueCrewIds = new Set((assignedCrews || []).map((row: any) => row.crew_id))
  const crewsActive = uniqueCrewIds.size
    const activeProjectsWithProgress = (activeProjects || []).map((project: any) => {
    const totalFootage = Number(project.total_footage || 0)

    const crewFootage = activeCrewEntries.reduce((sum: number, entry: any) => {
      if (entry.project_id === project.id) {
        return sum + Number(entry.footage_installed || 0)
      }
      return sum
    }, 0)

    const subFootage = activeSubEntries.reduce((sum: number, entry: any) => {
      if (entry.project_id === project.id) {
        return sum + Number(entry.footage_installed || 0)
      }
      return sum
    }, 0)

    const loggedFootage = crewFootage + subFootage

    const progress =
      totalFootage > 0
        ? Math.min(Math.round((loggedFootage / totalFootage) * 100), 100)
        : 0

    return {
      id: project.id,
      name: project.name,
      totalFootage,
      loggedFootage,
      progress,
      width: `${progress}%`,
    }
  })
  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      {/* HERO DASHBOARD */}
<section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#07111f]">
  <div
    className="absolute inset-0 bg-no-repeat bg-center opacity-90 bg-[length:100%]"
  style={{ backgroundImage: "url('/dashboard-network-bg.png')" }}
  />
  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(4,10,24,0.55),rgba(4,10,24,0.25))]" />
  <div className="relative p-6 md:p-8 xl:p-10">
    <div className="max-w-2xl">
      <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">
        FyberOS
      </p>
      <h1 className="mt-3 text-3xl font-semibold leading-tight text-white md:text-4xl xl:text-5xl">
        Network Operations Dashboard
      </h1>
      <p className="mt-4 max-w-xl text-sm text-white/60 md:text-base">
        Monitor production, crews, projects, payables, and field activity from a
        single operational view.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/projects" className="fyber-button-primary">
          View Projects
        </Link>
        <Link href="/payments" className="fyber-button-secondary">
          Open Payables
        </Link>
      </div>
    </div>

    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
  <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(10,22,40,0.72),rgba(10,22,40,0.5))] p-5 backdrop-blur-md">
    <p className="text-xs uppercase tracking-[0.14em] text-white/45">
      Today’s Production
    </p>
    <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">
      {todayProduction.toLocaleString()} ft
    </h2>
    <p className="mt-2 text-sm text-white/50">
      Crew and subcontractor footage logged today
    </p>
  </div>

  <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(10,22,40,0.72),rgba(10,22,40,0.5))] p-5 backdrop-blur-md">
    <p className="text-xs uppercase tracking-[0.14em] text-white/45">
      Open Payables
    </p>
    <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">
      ${openPayables.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </h2>
    <p className="mt-2 text-sm text-white/50">
      Unpaid subcontractor production
    </p>
  </div>

  <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(10,22,40,0.72),rgba(10,22,40,0.5))] p-5 backdrop-blur-md">
    <p className="text-xs uppercase tracking-[0.14em] text-white/45">
      Active Projects
    </p>
    <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">
      {activeProjectsCount || 0}
    </h2>
    <p className="mt-2 text-sm text-white/50">
      Projects currently running
    </p>
  </div>

  <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(10,22,40,0.72),rgba(10,22,40,0.5))] p-5 backdrop-blur-md">
    <p className="text-xs uppercase tracking-[0.14em] text-white/45">
      Crews Active
    </p>
    <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">
      {crewsActive}
    </h2>
    <p className="mt-2 text-sm text-white/50">
      Crews assigned to active segment work
    </p>
  </div>
</div>
  </div>
</section>

<div className="fyber-card p-6">
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-xl font-semibold text-white">
        Open Payables
      </h2>
      <p className="mt-1 text-sm text-white/45">
        Subcontractors with outstanding balances.
      </p>
    </div>

    <Link href="/payments" className="fyber-button-secondary">
      View All
    </Link>
  </div>

  <div className="mt-5 space-y-3">
    {topPayables.length === 0 ? (
      <div className="text-sm text-white/60">
        No open payables.
      </div>
    ) : (
      topPayables.map((item: any) => (
        <div
          key={item.id}
          className="rounded-xl border border-white/10 bg-white/5 p-3"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">
                {item.name}
              </p>
              <p className="text-xs text-white/45">
                {item.entries} entries • {item.footage.toLocaleString()} ft
              </p>
            </div>

            <p className="text-sm font-semibold text-white">
              $
              {item.amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      ))
    )}
  </div>
</div>
      

      {/* MAIN DASHBOARD GRID */}
      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <div className="fyber-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Production Overview
                </h2>
                <p className="mt-1 text-sm text-white/45">
                  High-level production activity for the current week.
                </p>
              </div>

              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
                Weekly
              </span>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="fyber-card-soft p-4">
                <div className="grid h-56 grid-cols-7 items-end gap-3">
                  {[45, 70, 90, 130, 160, 110, 145].map((height, index) => (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <div
                        className="w-full rounded-t-xl bg-gradient-to-t from-cyan-500 to-cyan-300 shadow-[0_0_18px_rgba(56,189,248,0.35)]"
                        style={{ height: `${height}px` }}
                      />
                      <span className="text-xs text-white/40">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="fyber-card-soft relative overflow-hidden p-4">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.18),transparent_45%)]" />
                <div className="relative h-56 rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(8,19,39,0.96),rgba(5,12,28,0.92))]">
                  <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(34,211,238,0.1)_35%,rgba(74,222,128,0.08)_60%,transparent_100%)]" />
                  <div className="absolute left-[12%] top-[62%] h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.95)]" />
                  <div className="absolute left-[38%] top-[44%] h-2.5 w-2.5 rounded-full bg-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.95)]" />
                  <div className="absolute left-[64%] top-[28%] h-3 w-3 rounded-full bg-lime-300 shadow-[0_0_18px_rgba(132,255,179,0.95)]" />
                  <div className="absolute left-[73%] top-[20%] h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.95)]" />

                  <svg
                    viewBox="0 0 100 100"
                    className="absolute inset-0 h-full w-full"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M8 78 C 20 62, 28 60, 38 48 S 55 38, 68 30 S 82 22, 94 14"
                      fill="none"
                      stroke="rgba(94,234,212,0.85)"
                      strokeWidth="2.2"
                    />
                    <path
                      d="M6 84 C 18 70, 26 68, 36 56 S 54 42, 64 36 S 80 30, 96 22"
                      fill="none"
                      stroke="rgba(59,130,246,0.8)"
                      strokeWidth="1.8"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="fyber-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Active Projects</h2>
                <p className="mt-1 text-sm text-white/45">
                  Current production and project progress.
                </p>
              </div>

              <Link href="/projects" className="fyber-button-secondary">
                View Projects
              </Link>
            </div>

            <div className="space-y-4">
  {activeProjectsWithProgress.length === 0 ? (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
      No active projects found.
    </div>
  ) : (
    activeProjectsWithProgress.map((project: any) => (
      <div
        key={project.id}
        className="rounded-2xl border border-white/10 bg-white/5 p-4"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-white">{project.name}</p>
            <p className="text-sm text-white/45">
              {project.loggedFootage.toLocaleString()} / {project.totalFootage.toLocaleString()} ft
            </p>
          </div>

          <span className="rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 text-xs font-semibold text-lime-200">
            {project.progress}%
          </span>
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-lime-400"
            style={{ width: project.width }}
          />
        </div>
      </div>
    ))
  )}
</div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="fyber-card p-6">
            
            <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
            <p className="mt-1 text-sm text-white/45">
              Access your most important workflows.
            </p>

            <div className="mt-5 grid gap-3">
  <Link href="/projects" className="fyber-button-primary">
    View Projects
  </Link>
  <Link href="/payments" className="fyber-button-secondary">
    View Payments
  </Link>
  <Link href="/projects/new" className="fyber-button-secondary">
    Create Project
  </Link>
  <Link href="/crews" className="fyber-button-secondary">
    View Crews
  </Link>
  <Link href="/subcontractors" className="fyber-button-secondary">
    View Subcontractors
  </Link>
</div>
          </div>

          <div className="fyber-card p-6">
            <h2 className="text-xl font-semibold text-white">System Status</h2>
            <p className="mt-1 text-sm text-white/45">
              Current core modules already working in FyberOS.
            </p>

            <ul className="mt-5 space-y-3 text-sm text-white/75">
              <li>• Project detail engine</li>
              <li>• Internal segments and crew assignment</li>
              <li>• Daily production logging</li>
              <li>• Photo uploads for field documentation</li>
              <li>• Project production summary</li>
              <li>• Daily report preview and copy report</li>
            </ul>
          </div>

          <div className="fyber-card p-6">
            <h2 className="text-xl font-semibold text-white">Workspace Branding</h2>
            <p className="mt-1 text-sm text-white/45">
              Later each client organization will be able to upload its own logo.
            </p>

            <div className="mt-5 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4">
              <p className="text-sm font-semibold text-cyan-100">Next Branding Goal</p>
              <p className="mt-2 text-sm text-white/65">
                Show Fyber as the product brand and the customer’s company logo as
                the active organization brand inside the workspace.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}