import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  const isApiRoute = pathname.startsWith('/api')
  const isLoginPage = pathname === '/login'
  const isPublicAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/icon.png') ||
    pathname.startsWith('/apple-icon.png')

  if (isApiRoute || isPublicAsset) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && !isLoginPage) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isLoginPage) {
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const role = userData?.role

  const url = req.nextUrl.clone()

  if (role === 'admin' || role === 'office') {
    url.pathname = '/dashboard'
  } else {
    url.pathname = '/time-tracking'
  }

  return NextResponse.redirect(url)
}

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png).*)'],
}