// ================================
// ROOT PAGE REDIRECT
// ================================
// Esta página redirige automáticamente al dashboard principal.

import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect('/dashboard')
}