import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const isAuthPage = req.nextUrl.pathname.startsWith('/login')

  // Solo dejamos pasar todo por ahora
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
}