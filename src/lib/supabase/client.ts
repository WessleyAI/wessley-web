import { Database } from "@/supabase/types"
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  // Use default storage (localStorage + cookies)
  // Server will set cookies, browser will read them automatically
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
