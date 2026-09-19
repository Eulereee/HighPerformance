import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { SUPABASE_KEY, SUPABASE_URL, isSupabaseConfigured } from './config'

/** Routes a signed-out visitor may open. Everything else redirects to /login. */
const PUBLIC_ROUTES = ['/', '/login', '/auth', '/topics', '/test-connection']

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
}

/**
 * Refreshes the auth session on every request and guards private routes.
 *
 * Two rules matter here:
 *  1. Always return `supabaseResponse` (or copy its cookies onto whatever you
 *     return), otherwise the refreshed session is silently dropped.
 *  2. Call `getUser()` — not `getSession()` — because it revalidates the token
 *     with Supabase rather than trusting the cookie.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Without credentials, pass traffic through untouched rather than crashing.
  if (!isSupabaseConfigured) return supabaseResponse

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options)
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && !isPublicRoute(request.nextUrl.pathname)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('next', request.nextUrl.pathname)

    const redirectResponse = NextResponse.redirect(redirectUrl)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie)
    })
    return redirectResponse
  }

  return supabaseResponse
}
