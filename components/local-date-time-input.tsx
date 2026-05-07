'use client'

type Props = {
  name: string
  value?: string | null
  className?: string
  required?: boolean
}

function toBrowserDateTimeLocal(value?: string | null) {
  if (!value) return ''

  const date = new Date(value)
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60 * 1000)

  return localDate.toISOString().slice(0, 16)
}

export default function LocalDateTimeInput({
  name,
  value,
  className,
  required,
}: Props) {
  return (
    <input
      type="datetime-local"
      name={name}
      defaultValue={toBrowserDateTimeLocal(value)}
      className={className}
      required={required}
    />
  )
}