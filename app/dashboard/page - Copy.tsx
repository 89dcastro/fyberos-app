import Link from 'next/link'

const kpis = [
  {
    title: "Today's Production",
    value: '1,200 ft',
    subtitle: 'Installed across active projects',
  },
  {
    title: 'Active Projects',
    value: '5',
    subtitle: 'Projects currently running',
  },
  {
    title: 'Crews Active',
    value: '12',
    subtitle: 'Foremen and field crews',
  },
  {
    title: 'Revenue This Week',
    value: '$45,200',
    subtitle: 'Estimated from project progress',
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <section className="fyber-page-header">
        <h1 className="fyber-page-title">Dashboard</h1>
        <p className="fyber-page-subtitle">
          Monitor projects, production, crews, reports, and operational activity.
        </p>
      </section>

      {/* KPI GRID */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => (
          <div key={item.title} className="fyber-card p-5">
            <p className="fyber-kpi-label">{item.title}</p>
            <h2 className="fyber-kpi-value mt-3">{item.value}</h2>
            <p className="mt-2 text-sm text-white/45">{item.subtitle}</p>
          </div>
        ))}
      </section>

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
              {[
                {
                  name: 'Pauli Phase 2',
                  footage: '12,200 ft',
                  progress: '71%',
                  width: '71%',
                },
                {
                  name: 'Majestic Build',
                  footage: '8,200 ft',
                  progress: '54%',
                  width: '54%',
                },
                {
                  name: 'Breakwater Area',
                  footage: '5,900 ft',
                  progress: '39%',
                  width: '39%',
                },
              ].map((project) => (
                <div
                  key={project.name}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{project.name}</p>
                      <p className="text-sm text-white/45">{project.footage}</p>
                    </div>

                    <span className="rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 text-xs font-semibold text-lime-200">
                      {project.progress}
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-lime-400"
                      style={{ width: project.width }}
                    />
                  </div>
                </div>
              ))}
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
              <Link href="/projects/new" className="fyber-button-secondary">
                Create Project
              </Link>
              <Link href="/crews" className="fyber-button-secondary">
                View Crews
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