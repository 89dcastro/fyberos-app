import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function HomePage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const role = currentUser?.role

  if (role === 'admin' || role === 'office') {
    redirect('/dashboard')
  } else {
    redirect('/time-tracking')
  }
}

  redirect('/login')
}