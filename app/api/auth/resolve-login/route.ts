import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const identifier = String(body.identifier || '').trim().toLowerCase()

    if (!identifier) {
      return NextResponse.json(
        { error: 'Username or email is required' },
        { status: 400 }
      )
    }

    // Si ya es email, no hay que resolver nada
    if (identifier.includes('@')) {
      return NextResponse.json({ email: identifier })
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('username', identifier)
      .maybeSingle()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!data?.email) {
      return NextResponse.json(
        { error: 'Username not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ email: data.email })
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}