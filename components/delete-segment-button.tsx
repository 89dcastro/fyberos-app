'use client'

import { useTransition } from 'react'

export default function DeleteSegmentButton({
  segmentId,
  projectId,
  action,
}: {
  segmentId: string
  projectId: string
  action: (formData: FormData) => void
}) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this segment? This cannot be undone.'
    )

    if (!confirmDelete) return

    const formData = new FormData()
    formData.append('segmentId', segmentId)
    formData.append('projectId', projectId)

    startTransition(() => {
      action(formData)
    })
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="text-xs px-3 py-1 rounded bg-red-500/20 hover:bg-red-500/40 text-red-300"
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  )
}