type StatusBadgeProps = {
  status?: string | null
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = (status || '').toLowerCase()

  const baseClass =
    'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold'

  if (normalized === 'active') {
    return (
      <span
        className={`${baseClass} border-lime-400/20 bg-lime-400/10 text-lime-300`}
      >
        Active
      </span>
    )
  }

  if (normalized === 'inactive') {
    return (
      <span
        className={`${baseClass} border-red-400/20 bg-red-400/10 text-red-300`}
      >
        Inactive
      </span>
    )
  }

  if (normalized === 'planning') {
    return (
      <span
        className={`${baseClass} border-cyan-400/20 bg-cyan-400/10 text-cyan-200`}
      >
        Planning
      </span>
    )
  }

  if (normalized === 'on_hold') {
    return (
      <span
        className={`${baseClass} border-yellow-400/20 bg-yellow-400/10 text-yellow-300`}
      >
        On Hold
      </span>
    )
  }

  if (normalized === 'completed') {
    return (
      <span
        className={`${baseClass} border-blue-400/20 bg-blue-400/10 text-blue-300`}
      >
        Completed
      </span>
    )
  }

  return (
    <span className={`${baseClass} border-white/10 bg-white/10 text-white/60`}>
      {status || 'Unknown'}
    </span>
  )
}