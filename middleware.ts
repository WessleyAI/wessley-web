import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access only to /waitlist
  if (pathname === '/waitlist') {
    return NextResponse.next()
  }

  // Redirect root to /waitlist
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/waitlist', request.url))
  }

  // Redirect all other pages to /waitlist
  return NextResponse.redirect(new URL('/waitlist', request.url))
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
