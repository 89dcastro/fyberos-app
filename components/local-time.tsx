'use client'

export default function LocalTime({ value }: { value: string }) {
  return <>{new Date(value).toLocaleTimeString()}</>
}