import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/chat"


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