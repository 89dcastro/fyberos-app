'use client'

import { useMemo, useState } from 'react'
import {
  createCrewDailyEntry,
  createSubcontractorDailyEntry,
} from './daily-production-actions'

type Segment = {
  id: string
  name: string
}

type Crew = {
  id: string
  name: string
}

type Subcontractor = {
  id: string
  company_name: string
}

type SegmentCrew = {
  segment_id: string
  crew_id: string
}

type SegmentSubcontractor = {
  segment_id: string
  subcontractor_id: string
}

type Props = {
  projectId: string
  organizationId: string
  segments: Segment[]
  crews: Crew[]
  subcontractors: Subcontractor[]
  segmentCrews: SegmentCrew[]
  segmentSubcontractors: SegmentSubcontractor[]
}

export default function DailyProductionEntryCard({
  projectId,
  organizationId,
  segments,
  crews,
  subcontractors,
  segmentCrews,
  segmentSubcontractors,
}: Props) {
  const [entryType, setEntryType] = useState<'crew' | 'subcontractor'>('crew')
  const [selectedCrewId, setSelectedCrewId] = useState('')
  const [selectedSubcontractorId, setSelectedSubcontractorId] = useState('')

  const availableSegments = useMemo(() => {
    if (entryType === 'crew') {
      const allowedSegmentIds = segmentCrews
        .filter((item) => item.crew_id === selectedCrewId)
        .map((item) => item.segment_id)

      return segments.filter((segment) => allowedSegmentIds.includes(segment.id))
    }

    const allowedSegmentIds = segmentSubcontractors
      .filter((item) => item.subcontractor_id === selectedSubcontractorId)
      .map((item) => item.segment_id)

    return segments.filter((segment) => allowedSegmentIds.includes(segment.id))
  }, [
    entryType,
    selectedCrewId,
    selectedSubcontractorId,
    segmentCrews,
    segmentSubcontractors,
    segments,
  ])

  const selectedAction =
    entryType === 'crew' ? createCrewDailyEntry : createSubcontractorDailyEntry

  return (
    <div className="fyber-card p-6">
      <h2 className="text-xl font-semibold text-white">Log Daily Production</h2>
      <p className="mt-1 text-sm text-white/45">
        Log production for either an internal crew or a subcontractor.
      </p>

      <form action={selectedAction} className="mt-5 space-y-4">
        <input type="hidden" name="project_id" value={projectId} />
        <input type="hidden" name="organization_id" value={organizationId} />

        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">
            Entry Type
          </label>
          <select
            name="entry_type"
            value={entryType}
            onChange={(e) => {
              const nextType = e.target.value as 'crew' | 'subcontractor'
              setEntryType(nextType)
              setSelectedCrewId('')
              setSelectedSubcontractorId('')
            }}
            className="w-full rounded-xl border border-white/10 bg-[#091427] px-4 py-3 text-white outline-none transition focus:border-cyan-400/30"
          >
            <option value="crew">Crew</option>
            <option value="subcontractor">Subcontractor</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">
            Work Date
          </label>
          <input
            type="date"
            name="work_date"
            required
            defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full rounded-xl border border-white/10 bg-[#091427] px-4 py-3 text-white outline-none transition focus:border-cyan-400/30"
          />
        </div>

        {entryType === 'crew' ? (
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">
              Crew
            </label>
            <select
              name="crew_id"
              required
              value={selectedCrewId}
              onChange={(e) => setSelectedCrewId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#091427] px-4 py-3 text-white outline-none transition focus:border-cyan-400/30"
            >
              <option value="">Select crew</option>
              {crews.map((crew) => (
                <option key={crew.id} value={crew.id}>
                  {crew.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">
              Subcontractor
            </label>
            <select
              name="subcontractor_id"
              required
              value={selectedSubcontractorId}
              onChange={(e) => setSelectedSubcontractorId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#091427] px-4 py-3 text-white outline-none transition focus:border-cyan-400/30"
            >
              <option value="">Select subcontractor</option>
              {subcontractors.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.company_name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">
            Segment
          </label>
          <select
            name="segment_id"
            required
            disabled={
              entryType === 'crew' ? !selectedCrewId : !selectedSubcontractorId
            }
            className="w-full rounded-xl border border-white/10 bg-[#091427] px-4 py-3 text-white outline-none transition focus:border-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              {entryType === 'crew'
                ? selectedCrewId
                  ? 'Select segment'
                  : 'Select crew first'
                : selectedSubcontractorId
                ? 'Select segment'
                : 'Select subcontractor first'}
            </option>
            {availableSegments.map((segment) => (
              <option key={segment.id} value={segment.id}>
                {segment.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">
            Footage Installed
          </label>
          <input
            type="number"
            name="footage_installed"
            placeholder="Enter footage installed"
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-cyan-400/30"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">
            Notes
          </label>
          <textarea
            name="notes"
            placeholder="Add notes"
            rows={5}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-cyan-400/30"
          />
        </div>

        <button type="submit" className="fyber-button-primary w-full">
          Save Daily Entry
        </button>
      </form>
    </div>
  )
}