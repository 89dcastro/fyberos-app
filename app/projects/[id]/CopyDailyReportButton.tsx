'use client'

import { useState } from 'react'

type ReportEntry = {
  id: string
  footageInstalled: number
  notes: string
}

type CopyDailyReportButtonProps = {
  projectName: string
  projectNumber: string
  reportDate: string
  totalEntries: number
  totalFootage: number
  entries: ReportEntry[]
}

export default function CopyDailyReportButton({
  projectName,
  projectNumber,
  reportDate,
  totalEntries,
  totalFootage,
  entries,
}: CopyDailyReportButtonProps) {
  const [message, setMessage] = useState('')

  async function handleCopy() {
    // Unimos todas las notas con contenido para crear una sección simple
    const notesList = entries
      .map((entry) => entry.notes?.trim())
      .filter((note) => note && note !== 'No notes')

    const combinedNotes =
      notesList.length > 0 ? notesList.join(' | ') : 'No notes'

    const reportText = `
DAILY REPORT
Project: ${projectName}
Project Number: ${projectNumber}
Date: ${reportDate}

Total Entries: ${totalEntries}
Total Footage: ${totalFootage} ft

Notes:
${combinedNotes}
`.trim()

    try {
      await navigator.clipboard.writeText(reportText)
      setMessage('Daily report copied to clipboard.')
    } catch (error) {
      console.error(error)
      setMessage('Failed to copy report.')
    }
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      <button
        type="button"
        onClick={handleCopy}
        style={{
          padding: '10px 14px',
          background: '#111827',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        Copy Daily Report
      </button>

      {message && (
        <p style={{ marginTop: '10px', fontSize: '14px', color: '#444' }}>
          {message}
        </p>
      )}
    </div>
  )
}