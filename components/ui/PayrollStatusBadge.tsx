type Props = {
  status: string
}

export default function PayrollStatusBadge({ status }: Props) {
  const normalized = (status || '').toLowerCase()

  const styles =
    normalized === 'paid'
      ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
      : normalized === 'finalized'
      ? 'border-amber-400/20 bg-amber-400/10 text-amber-300'
      : 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300'

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${styles}`}
    >
      {normalized || 'draft'}
    </span>
  )
}