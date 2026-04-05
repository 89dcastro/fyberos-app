'use client'

import { supabase } from '@/lib/supabase'

export default function LogoutButton() {
  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs text-white/80 transition hover:bg-white/15"
    >
      Logout
    </button>
  )
}