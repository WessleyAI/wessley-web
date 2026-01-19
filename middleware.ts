import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

/**
 * Middleware handles:
 * 1. Session refresh for Supabase auth
 * 2. Pre-launch waitlist redirect (when enabled)
 * 3. Subscription enforcement for paid routes
 */

// Routes that bypass all checks (always accessible)
const PUBLIC_ROUTES = [
  '/api/',
  '/auth/',
  '/ingest',
  '/pricing',
  '/checkout/',
]

// Routes accessible without subscription (free tier)
const FREE_ROUTES = [
  '/',
  '/waitlist',
  '/demo/',
  '/g/',
  '/c/',
  '/pricing',
  '/checkout/',
  '/setup',
]

// Routes that require active subscription
const PAID_ROUTES = [
  '/dashboard',
  '/projects',
  '/vehicles',
  '/chat',
]

// Enable/disable waitlist mode (pre-launch)
const WAITLIST_MODE = true

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Create Supabase client and refresh session
  const { supabase, response } = createClient(request)

  // Refresh session if expired - required for RLS policies
  const { data: { user } } = await supabase.auth.getUser()

  // Allow public routes without any checks
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return response
  }

  // In waitlist mode, only allow specific routes
  if (WAITLIST_MODE) {
    const allowedInWaitlist = [
      ...FREE_ROUTES,
    ]

    if (allowedInWaitlist.some(route => pathname === route || pathname.startsWith(route))) {
      return response
    }

    // Redirect everything else to waitlist
    const redirectResponse = NextResponse.redirect(new URL('/waitlist', request.url))
    response.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  // Post-launch: Check subscription for paid routes
  const isPaidRoute = PAID_ROUTES.some(route => pathname.startsWith(route))

  if (isPaidRoute && user) {
    // Fetch user's subscription status
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_tier')
      .eq('id', user.id)
      .single()

    // Redirect to pricing if not active subscriber
    if (!profile || profile.subscription_status !== 'active') {
      const redirectResponse = NextResponse.redirect(new URL('/pricing', request.url))
      response.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set(cookie.name, cookie.value)
      })
      return redirectResponse
    }
  }

  // For paid routes without user, redirect to login
  if (isPaidRoute && !user) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    const redirectResponse = NextResponse.redirect(loginUrl)
    response.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, other icons
     * - public folder files (images, videos, svgs)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm)$).*)',
  ],
}
