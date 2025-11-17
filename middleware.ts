import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Create Supabase client and refresh session
  const { supabase, response } = createClient(request)

  // Refresh session if expired - required for RLS policies
  await supabase.auth.getUser()

  // Allow API routes and auth callbacks
  if (pathname.startsWith('/api/') || pathname.startsWith('/auth/callback')) {
    return response
  }

  // Allow access only to /waitlist
  if (pathname === '/waitlist') {
    return response
  }

  // Redirect everything else (including /) to /waitlist
  const redirectResponse = NextResponse.redirect(new URL('/waitlist', request.url))

  // Copy cookies from the Supabase response to the redirect response
  response.cookies.getAll().forEach(cookie => {
    redirectResponse.cookies.set(cookie.name, cookie.value)
  })

  return redirectResponse
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
