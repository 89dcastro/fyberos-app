import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { revalidatePath } from 'next/cache'
import DailyPhotoUpload from './DailyPhotoUpload'
import CopyDailyReportButton from './CopyDailyReportButton'
import DailyReportSection from './DailyReportSection'
import StatusBadge from '../../../components/ui/StatusBadge'
import { assignSubcontractorToSegment } from './assign-subcontractor/actions'
import DailyProductionEntryCard from './DailyProductionEntryCard'

async function createSegment(formData: FormData) {
  'use server'

  const projectId = formData.get('project_id') as string
  const name = formData.get('name') as string
  const color = formData.get('color') as string
  const estimatedFootage = formData.get('estimated_footage') as string

  const { error } = await supabase.from('project_segments').insert({
    project_id: projectId,
    name,
    color,
    estimated_footage: estimatedFootage ? Number(estimatedFootage) : null,
    status: 'active',
  })

  if (error) {
    console.error('Error creating segment:', error.message)
    return
  }

  revalidatePath(`/projects/${projectId}`)
}

async function assignCrewToSegment(formData: FormData) {
  'use server'

  const projectId = formData.get('project_id') as string
  const segmentId = formData.get('segment_id') as string
  const crewId = formData.get('crew_id') as string

  const { error } = await supabase.from('segment_crews').insert({
    segment_id: segmentId,
    crew_id: crewId,
  })

  if (error) {
    console.error('Error assigning crew:', error.message)
    return
  }

  revalidatePath(`/projects/${projectId}`)
}

async function createDailyEntry(formData: FormData) {
  'use server'

  const projectId = formData.get('project_id') as string
  const segmentId = formData.get('segment_id') as string
  const crewId = formData.get('crew_id') as string
  const workDate = formData.get('work_date') as string
  const footageInstalled = formData.get('footage_installed') as string
  const notes = formData.get('notes') as string

  const organizationId = '6cd0a407-cde7-49d7-b57a-d4c8c9b58d0b'

  const { error } = await supabase.from('daily_entries').insert({
    organization_id: organizationId,
    project_id: projectId,
    segment_id: segmentId,
    crew_id: crewId,
    work_date: workDate,
    footage_installed: footageInstalled ? Number(footageInstalled) : 0,
    notes,
  })

  if (error) {
    console.error('Error creating daily entry:', error.message)
    return
  }

  revalidatePath(`/projects/${projectId}`)
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // ================================
  // QUERIES
  // ================================
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select(`
      *,
      branch:branch_id (
        id,
        name
      )
    `)
    .eq('id', id)
    .maybeSingle()

  if (projectError) {
    return (
      <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-6 text-red-200">
        <h1 className="text-xl font-semibold">Error loading project</h1>
        <p className="mt-2 text-sm">{projectError.message}</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-semibold text-white">Project not found</h1>
        <p className="mt-2 text-sm text-white/55">
          No project was found with this ID.
        </p>
      </div>
    )
  }

  const { data: segments, error: segmentsError } = await supabase
    .from('project_segments')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: true })

  const { data: crews } = await supabase
    .from('crews')
    .select('*')
    .order('name')

  const { data: segmentCrews } = await supabase
    .from('segment_crews')
    .select(`
      id,
      segment_id,
      crew_id,
      crews (
        id,
        name
      )
    `)

  const { data: dailyEntries } = await supabase
    .from('daily_entries')
    .select(`
      *,
      crews (
        id,
        name
      ),
      project_segments (
        id,
        name
      ),
      daily_entry_photos (
        id,
        photo_url,
        photo_type
      )
    `)
    .eq('project_id', id)
    .order('work_date', { ascending: false })
    .order('created_at', { ascending: false })

    const { data: subcontractorDailyEntries } = await supabase
  .from('subcontractor_daily_entries')
  .select(`
    *,
    subcontractors (
      id,
      company_name
    ),
    project_segments (
      id,
      name
    ),
    subcontractor_daily_entry_photos (
      id,
      photo_url,
      photo_type
    )
  `)
  .eq('project_id', id)
  .order('work_date', { ascending: false })
  .order('created_at', { ascending: false })

  const { data: subcontractors, error: subcontractorsError } = await supabase
    .from('subcontractors')
    .select(`
      id,
      company_name,
      status
    `)
    .eq('organization_id', project.organization_id)
    .order('company_name', { ascending: true })

  if (subcontractorsError) {
    throw new Error(subcontractorsError.message)
  }

  const segmentIds = (segments ?? []).map((segment: any) => segment.id)

  let segmentSubcontractorAssignments: any[] = []

  if (segmentIds.length > 0) {
    const { data, error } = await supabase
      .from('segment_subcontractors')
      .select(`
        id,
        segment_id,
        subcontractor_id,
        pay_type,
        rate,
        unit,
        subcontractors (
          id,
          company_name,
          status
        )
      `)
      .in('segment_id', segmentIds)

    if (error) {
      throw new Error(error.message)
    }

    segmentSubcontractorAssignments = data ?? []
  }

  const assignmentsBySegmentId = new Map<string, any[]>()

  for (const assignment of segmentSubcontractorAssignments) {
    const current = assignmentsBySegmentId.get(assignment.segment_id) ?? []
    current.push(assignment)
    assignmentsBySegmentId.set(assignment.segment_id, current)
  }

  // ================================
  // PROJECT SUMMARY CALCULATIONS
  // ================================
  const totalCrewEntries = dailyEntries?.length || 0
  const totalSubcontractorEntries = subcontractorDailyEntries?.length || 0
  const totalDailyEntries = totalCrewEntries + totalSubcontractorEntries
  const projectTotalFootage = project?.total_footage || 0

  const crewLoggedFootage =
  dailyEntries?.reduce((sum: number, entry: any) => {
    return sum + (entry.footage_installed || 0)
  }, 0) || 0

const subcontractorLoggedFootage =
  subcontractorDailyEntries?.reduce((sum: number, entry: any) => {
    return sum + (entry.footage_installed || 0)
  }, 0) || 0

const totalLoggedFootage = crewLoggedFootage + subcontractorLoggedFootage
  const remainingFootage =
    projectTotalFootage > totalLoggedFootage
      ? projectTotalFootage - totalLoggedFootage
      : 0

  const percentComplete =
    projectTotalFootage > 0
      ? Math.round((totalLoggedFootage / projectTotalFootage) * 100)
      : 0

  const averageFootagePerEntry =
    totalDailyEntries > 0 ? Math.round(totalLoggedFootage / totalDailyEntries) : 0

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-3">
            <Link href="/projects" className="text-sm text-cyan-200 hover:text-cyan-100">
              ← Back to Projects
            </Link>
          </div>

          <h1 className="fyber-page-title">{project.name}</h1>
          <p className="fyber-page-subtitle">
            View project status, internal segments, crew activity, daily production,
            field photos, and daily report output.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href={`/projects/${id}/edit`} className="fyber-button-secondary">
            Edit Project
          </Link>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="fyber-card p-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-white/40">
                Project Overview
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {project.name}
              </h2>

              <div className="mt-5 grid gap-3 text-sm text-white/75">
                <p><span className="text-white/45">Project Number:</span> {project.project_number || 'N/A'}</p>
                <p><span className="text-white/45">Client:</span> {project.client || 'N/A'}</p>
                <p><span className="text-white/45">Branch:</span> {project.branch?.name || 'N/A'}</p>
                <p><span className="text-white/45">Location:</span> {project.location || 'N/A'}</p>
                <div className="flex items-center gap-2 text-sm text-white/75">
                  <span className="text-white/45">Status:</span>
                  <StatusBadge status={project.status || 'active'} />
                </div>
              </div>
            </div>

            <div className="fyber-card-soft relative min-h-[220px] overflow-hidden p-4">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.18),transparent_45%)]" />
              <div className="relative h-full rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(8,19,39,0.96),rgba(5,12,28,0.92))]">
                <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(34,211,238,0.1)_35%,rgba(74,222,128,0.08)_60%,transparent_100%)]" />
                <div className="absolute left-[10%] top-[72%] h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.95)]" />
                <div className="absolute left-[34%] top-[54%] h-2.5 w-2.5 rounded-full bg-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.95)]" />
                <div className="absolute left-[62%] top-[36%] h-3 w-3 rounded-full bg-lime-300 shadow-[0_0_18px_rgba(132,255,179,0.95)]" />
                <div className="absolute left-[76%] top-[22%] h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.95)]" />
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
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">
            Project Summary
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <SummaryMiniCard label="Total Footage" value={`${projectTotalFootage} ft`} />
            <SummaryMiniCard label="Logged So Far" value={`${totalLoggedFootage} ft`} />
            <SummaryMiniCard label="Remaining Footage" value={`${remainingFootage} ft`} />
            <SummaryMiniCard label="Percent Complete" value={`${percentComplete}%`} />
          </div>
        </div>
      </section>

      <section className="fyber-card p-6">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Internal Segments</h2>
            <p className="mt-1 text-sm text-white/45">
              Internal production breakdown and crew assignment by segment.
            </p>
          </div>
        </div>

        {segmentsError && (
          <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
            Error loading segments: {segmentsError.message}
          </div>
        )}

        {!segments || segments.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/60">
            No segments yet.
          </div>
        ) : (
          <div className="grid gap-5">
            {segments.map((segment: any) => {
              const assignedCrews =
                segmentCrews?.filter((sc: any) => sc.segment_id === segment.id) || []

              const assignedSubcontractors =
                assignmentsBySegmentId.get(segment.id) ?? []

              const segmentLoggedFootage =
                dailyEntries?.reduce((sum: number, entry: any) => {
                  if (entry.segment_id === segment.id) {
                    return sum + (entry.footage_installed || 0)
                  }
                  return sum
                }, 0) || 0

              const segmentEstimatedFootage = segment.estimated_footage || 0

              const segmentRemainingFootage =
                segmentEstimatedFootage > segmentLoggedFootage
                  ? segmentEstimatedFootage - segmentLoggedFootage
                  : 0

              const segmentPercentComplete =
                segmentEstimatedFootage > 0
                  ? Math.round((segmentLoggedFootage / segmentEstimatedFootage) * 100)
                  : 0

              return (
                <div
                  key={segment.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                    <div>
                      <div className="mb-4 flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">{segment.name}</h3>
                        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                          {segment.color || 'No Color'}
                        </span>
                      </div>

                      <div className="grid gap-3 text-sm text-white/75 sm:grid-cols-2 xl:grid-cols-4">
                        <p><span className="text-white/45">Estimated:</span> {segmentEstimatedFootage} ft</p>
                        <p><span className="text-white/45">Installed:</span> {segmentLoggedFootage} ft</p>
                        <p><span className="text-white/45">Remaining:</span> {segmentRemainingFootage} ft</p>
                        <p><span className="text-white/45">Progress:</span> {segmentPercentComplete}%</p>
                      </div>

                      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-lime-400"
                          style={{ width: `${Math.min(segmentPercentComplete, 100)}%` }}
                        />
                      </div>

                      <div className="mt-5">
                        <p className="mb-2 text-sm font-medium text-white/70">Assigned Crews</p>

                        {assignedCrews.length === 0 ? (
                          <p className="text-sm text-white/45">No crews assigned yet.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {assignedCrews.map((sc: any) => (
                              <span
                                key={sc.id}
                                className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-medium text-white/80"
                              >
                                {sc.crews?.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div>
                          <p className="text-sm font-semibold text-white">Assigned Subcontractors</p>
                          <p className="mt-1 text-xs text-white/45">
                            External subcontractors assigned to this segment with segment-specific rates.
                          </p>
                        </div>

                        <div className="mt-4 space-y-3">
                          {assignedSubcontractors.length === 0 ? (
                            <p className="text-sm text-white/45">
                              No subcontractors assigned yet.
                            </p>
                          ) : (
                            assignedSubcontractors.map((assignment: any) => {
                              const subcontractor = Array.isArray(assignment.subcontractors)
                                ? assignment.subcontractors[0]
                                : assignment.subcontractors

                              return (
                                <div
                                  key={assignment.id}
                                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                                >
                                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                      <p className="text-sm font-semibold text-white">
                                        {subcontractor?.company_name || 'Unnamed subcontractor'}
                                      </p>
                                      <p className="mt-1 text-xs text-white/45">
                                        {assignment.pay_type} · {assignment.rate} / {assignment.unit}
                                      </p>
                                    </div>

                                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                                      External Cost
                                    </span>
                                  </div>
                                </div>
                              )
                            })
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="mb-3 text-sm font-semibold text-white">Assign Crew</p>

                        <form action={assignCrewToSegment} className="space-y-3">
                          <input type="hidden" name="project_id" value={id} />
                          <input type="hidden" name="segment_id" value={segment.id} />

                          <select
                            name="crew_id"
                            required
                            className="w-full rounded-xl border border-white/10 bg-[#091427] px-4 py-3 text-white outline-none transition focus:border-cyan-400/30"
                          >
                            <option value="">Select crew</option>
                            {crews?.map((crew: any) => (
                              <option key={crew.id} value={crew.id}>
                                {crew.name}
                              </option>
                            ))}
                          </select>

                          <button type="submit" className="fyber-button-primary w-full">
                            Assign Crew
                          </button>
                        </form>
                      </div>

                      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="mb-3 text-sm font-semibold text-white">Assign Subcontractor</p>

                        <form action={assignSubcontractorToSegment} className="space-y-3">
                          <input type="hidden" name="project_id" value={id} />
                          <input type="hidden" name="segment_id" value={segment.id} />

                          <select
                            name="subcontractor_id"
                            required
                            className="w-full rounded-xl border border-white/10 bg-[#091427] px-4 py-3 text-white outline-none transition focus:border-cyan-400/30"
                          >
                            <option value="">Select subcontractor</option>
                            {subcontractors?.map((sub: any) => (
                              <option key={sub.id} value={sub.id}>
                                {sub.company_name}
                              </option>
                            ))}
                          </select>

                          <select
                            name="pay_type"
                            required
                            defaultValue="production"
                            className="w-full rounded-xl border border-white/10 bg-[#091427] px-4 py-3 text-white outline-none transition focus:border-cyan-400/30"
                          >
                            <option value="production">Production</option>
                            <option value="daily">Daily</option>
                            <option value="fixed">Fixed</option>
                          </select>

                          <input
                            type="number"
                            name="rate"
                            step="0.01"
                            min="0"
                            placeholder="Rate"
                            required
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-cyan-400/30"
                          />

                          <input
                            type="text"
                            name="unit"
                            placeholder="Unit (ft, each, day)"
                            required
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-cyan-400/30"
                          />

                          <button type="submit" className="fyber-button-primary w-full">
                            Assign Subcontractor
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-5">
          <h3 className="text-lg font-semibold text-white">Create New Segment</h3>
          <p className="mt-1 text-sm text-white/45">
            Add a segment for internal production tracking.
          </p>

          <form action={createSegment} className="mt-5 grid gap-4 md:grid-cols-4">
            <input type="hidden" name="project_id" value={id} />

            <input
              name="name"
              placeholder="Segment name"
              required
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-cyan-400/30"
            />

            <input
              name="color"
              placeholder="Color"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-cyan-400/30"
            />

            <input
              name="estimated_footage"
              placeholder="Estimated footage"
              type="number"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-cyan-400/30"
            />

            <button type="submit" className="fyber-button-primary">
              Add Segment
            </button>
          </form>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <DailyProductionEntryCard
            projectId={id}
            organizationId={project.organization_id}
            segments={segments || []}
            crews={crews || []}
            subcontractors={subcontractors || []}
            segmentCrews={(segmentCrews || []).map((item: any) => ({
              segment_id: item.segment_id,
              crew_id: item.crew_id,
            }))}
            segmentSubcontractors={(segmentSubcontractorAssignments || []).map((item: any) => ({
              segment_id: item.segment_id,
              subcontractor_id: item.subcontractor_id,
            }))}
          />

        <div className="fyber-card p-6">
          <h2 className="text-xl font-semibold text-white">Project Production Summary</h2>
          <p className="mt-1 text-sm text-white/45">
            High-level metrics for daily entries and overall project progress.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SummaryCard label="Project Total Footage" value={`${projectTotalFootage} ft`} />
            <SummaryCard label="Logged So Far" value={`${totalLoggedFootage} ft`} />
            <SummaryCard label="Remaining Footage" value={`${remainingFootage} ft`} />
            <SummaryCard label="Percent Complete" value={`${percentComplete}%`} />
            <SummaryCard label="Total Entries" value={`${totalDailyEntries}`} />
            <SummaryCard label="Average Per Entry" value={`${averageFootagePerEntry} ft`} />
          </div>
        </div>
      </section>

      <DailyReportSection
      projectName={project.name || 'N/A'}
      projectNumber={project.project_number || 'N/A'}
      dailyEntries={dailyEntries || []}
      subcontractorDailyEntries={subcontractorDailyEntries || []}
    />

    </div>
  )
}

function SummaryCard({
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

function SummaryMiniCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-white/45">{label}</p>
      <h3 className="mt-2 text-xl font-semibold text-white">{value}</h3>
    </div>
  )
}