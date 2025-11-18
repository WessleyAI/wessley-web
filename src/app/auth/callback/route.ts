import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/chat"

  console.log('[Auth Callback] =====================================================')
  console.log('[Auth Callback] OAuth callback received')
  console.log('[Auth Callback] - Code present?', !!code)
  console.log('[Auth Callback] - Next URL:', next)
  console.log('[Auth Callback] - Origin:', origin)

  if (code) {
    console.log('[Auth Callback] 🔄 Exchanging code for session...')

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
              console.log('[Auth Callback] 🍪 Set cookie:', name)
            } catch (error) {
              console.error('[Auth Callback] ❌ Failed to set cookie:', name, error)
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set(name, '', options)
            } catch (error) {
              console.error('[Auth Callback] ❌ Failed to remove cookie:', name, error)
            }
          },
        },
      }
    )

    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      console.log('[Auth Callback] ✅ Session created successfully!')
      console.log('[Auth Callback] - User ID:', data.user?.id)
      console.log('[Auth Callback] - User Email:', data.user?.email)
      console.log('[Auth Callback] - Access token:', data.session?.access_token?.substring(0, 20) + '...')
      console.log('[Auth Callback] - Refresh token:', data.session?.refresh_token?.substring(0, 20) + '...')
      console.log('[Auth Callback] 🚀 Redirecting to:', next)
      console.log('[Auth Callback] =====================================================')

      // Cookies are now properly set via the inline cookie handlers above
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error('[Auth Callback] ❌ Session exchange failed:', error)
    }
  } else {
    console.error('[Auth Callback] ❌ No code provided')
  }

  // Return the user to an error page with instructions
  console.log('[Auth Callback] 🚨 Redirecting to error page')
  console.log('[Auth Callback] =====================================================')
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}