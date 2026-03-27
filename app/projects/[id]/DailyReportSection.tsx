'use client'

import { useMemo, useState } from 'react'
import CopyDailyReportButton from './CopyDailyReportButton'

type DailyEntry = {
  id: string
  work_date: string
  footage_installed: number | null
  notes: string | null
  created_at?: string | null
  crews?: {
    id: string
    name: string
  } | null
  subcontractors?: {
    id: string
    company_name: string
  } | null
  project_segments?: {
    id: string
    name: string
  } | null
  daily_entry_photos?: {
    id: string
    photo_url: string
    photo_type: string | null
  }[]
  subcontractor_daily_entry_photos?: {
    id: string
    photo_url: string
    photo_type: string | null
  }[]
  entry_type?: 'crew' | 'subcontractor'
}

type DailyReportSectionProps = {
  projectName: string
  projectNumber: string
  dailyEntries: DailyEntry[]
  subcontractorDailyEntries: DailyEntry[]
}

export default function DailyReportSection({
  projectName,
  projectNumber,
  dailyEntries,
  subcontractorDailyEntries,
}: DailyReportSectionProps) {
  const [selectedReportDate, setSelectedReportDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  const combinedEntries = useMemo(() => {
    const crewEntries = (dailyEntries || []).map((entry) => ({
      ...entry,
      entry_type: 'crew' as const,
    }))

    const subEntries = (subcontractorDailyEntries || []).map((entry) => ({
      ...entry,
      entry_type: 'subcontractor' as const,
    }))

    return [...crewEntries, ...subEntries]
  }, [dailyEntries, subcontractorDailyEntries])

  const reportEntries = useMemo(() => {
    return combinedEntries
      .filter((entry) => entry.work_date === selectedReportDate)
      .sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
        return bTime - aTime
      })
  }, [combinedEntries, selectedReportDate])

  const reportTotalFootage = useMemo(() => {
    return reportEntries.reduce((sum, entry) => {
      return sum + (entry.footage_installed || 0)
    }, 0)
  }, [reportEntries])

  const reportEntryCount = reportEntries.length

  const reportEntriesForCopy = reportEntries.map((entry) => ({
    id: entry.id,
    footageInstalled: entry.footage_installed || 0,
    notes: entry.notes || 'No notes',
  }))

  return (
    <section className="space-y-6">
      <section className="fyber-card p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-white">Daily Report Preview</h2>
          <p className="mt-1 text-sm text-white/45">
            Preview the report output for a selected date and copy it for sharing.
          </p>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-white/80">Select Date:</label>

          <input
            type="date"
            value={selectedReportDate}
            onChange={(e) => setSelectedReportDate(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#091427] px-4 py-3 text-white outline-none transition focus:border-cyan-400/30"
          />
        </div>

        <CopyDailyReportButton
          projectName={projectName || 'N/A'}
          projectNumber={projectNumber || 'N/A'}
          reportDate={selectedReportDate}
          totalEntries={reportEntryCount}
          totalFootage={reportTotalFootage}
          entries={reportEntriesForCopy}
        />

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/75">
            <span className="text-white/45">Project:</span> {projectName}
          </p>
          <p className="mt-2 text-sm text-white/75">
            <span className="text-white/45">Project Number:</span> {projectNumber}
          </p>
          <p className="mt-2 text-sm text-white/75">
            <span className="text-white/45">Date:</span> {selectedReportDate}
          </p>
          <p className="mt-2 text-sm text-white/75">
            <span className="text-white/45">Total Entries:</span> {reportEntryCount}
          </p>
          <p className="mt-2 text-sm text-white/75">
            <span className="text-white/45">Total Footage Today:</span> {reportTotalFootage} ft
          </p>
        </div>
      </section>

      <section className="fyber-card p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-white">Daily Production History</h2>
          <p className="mt-1 text-sm text-white/45">
            Review only the entries for the selected date.
          </p>
        </div>

        {reportEntries.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/60">
            No daily entries for this date.
          </div>
        ) : (
          <div className="grid gap-5">
            {reportEntries.map((entry) => {
              const entryPhotos =
                entry.entry_type === 'crew'
                  ? entry.daily_entry_photos || []
                  : entry.subcontractor_daily_entry_photos || []

              return (
                <div
                  key={`${entry.entry_type}-${entry.id}`}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
                    <div>
                      <div className="grid gap-3 text-sm text-white/75 sm:grid-cols-2 xl:grid-cols-4">
                        <p>
                          <span className="text-white/45">Date:</span> {entry.work_date}
                        </p>
                        <p>
                          <span className="text-white/45">Segment:</span>{' '}
                          {entry.project_segments?.name || 'N/A'}
                        </p>
                        <p>
                          <span className="text-white/45">
                            {entry.entry_type === 'crew' ? 'Crew' : 'Subcontractor'}:
                          </span>{' '}
                          {entry.entry_type === 'crew'
                            ? entry.crews?.name || 'N/A'
                            : entry.subcontractors?.company_name || 'N/A'}
                        </p>
                        <p>
                          <span className="text-white/45">Footage:</span>{' '}
                          {entry.footage_installed || 0} ft
                        </p>
                      </div>

                      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-sm font-medium text-white/80">Notes</p>
                        <p className="mt-2 text-sm text-white/60">
                          {entry.notes || 'No notes'}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="mb-3 text-sm font-semibold text-white">Photos</p>

                      {entryPhotos.length === 0 ? (
                        <p className="text-sm text-white/45">No photos uploaded yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {entryPhotos.map((photo) => (
                            <div
                              key={photo.id}
                              className="rounded-2xl border border-white/10 bg-white/5 p-3"
                            >
                              <img
                                src={photo.photo_url}
                                alt={photo.photo_type || 'Daily entry photo'}
                                className="h-40 w-full rounded-xl object-cover"
                              />
                              <p className="mt-3 text-xs font-medium uppercase tracking-[0.12em] text-white/45">
                                {photo.photo_type || 'N/A'}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </section>
  )
}