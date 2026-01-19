import { Database } from "@/supabase/types"
import { createClient } from "@supabase/supabase-js"

/**
 * Create a Supabase admin client with service role access.
 *
 * This client bypasses Row Level Security (RLS) and should only be used
 * for server-side operations like webhook handlers where there's no user context.
 *
 * NEVER expose or use this client in client-side code.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables'
    )
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
