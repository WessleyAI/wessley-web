import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { getPostHogClient } from "@/lib/posthog-server"

// Allowed redirect paths after OAuth authentication
const ALLOWED_REDIRECTS = ['/chat', '/demo/bench', '/g/', '/c/', '/dashboard', '/projects']

function isAllowedRedirect(path: string): boolean {
  // Must start with / to be a relative path
  if (!path.startsWith('/')) return false
  // Check if it starts with any allowed path
  return ALLOWED_REDIRECTS.some(allowed => path.startsWith(allowed))
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const requestedNext = searchParams.get("next") ?? "/chat"
  // Validate redirect path to prevent open redirect attacks
  const next = isAllowedRedirect(requestedNext) ? requestedNext : "/chat"


  if (code) {

    // Create Supabase client inline with proper cookie handling for Route Handlers
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set(name, value, options)
            } catch (error) {
              // Cookie setting handled by Next.js - error expected in some contexts
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set(name, '', options)
            } catch (error) {
              // Cookie removal handled by Next.js - error expected in some contexts
            }
          },
        },
      }
    )

    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      // Track successful login with PostHog (server-side)
      const posthog = getPostHogClient()
      const user = data.session.user

      posthog.capture({
        distinctId: user.id,
        event: 'auth_login_completed',
        properties: {
          auth_provider: user.app_metadata?.provider || 'unknown',
          email_domain: user.email?.split('@')[1],
          is_new_user: user.created_at === user.last_sign_in_at,
        }
      })

      // Identify user in PostHog
      posthog.identify({
        distinctId: user.id,
        properties: {
          email: user.email,
          auth_provider: user.app_metadata?.provider,
          created_at: user.created_at,
        }
      })

      // Cookies are now properly set via the inline cookie handlers above
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error('[Auth Callback] ❌ Session exchange failed:', error)
    }
  } else {
    console.error('[Auth Callback] ❌ No code provided')
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}