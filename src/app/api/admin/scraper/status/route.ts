import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/admin/scraper/status - Check scraper status (Admin only)
 *
 * Spec-compliant admin endpoint per api-contracts.md.
 * Returns the current status of the knowledge scraper.
 *
 * Requires: subscription_tier = 'admin'
 *
 * Response (200):
 * {
 *   phase: "reddit" | "forums" | "youtube" | "parts" | "idle";
 *   progress: {
 *     documents_scraped: number;
 *     vectors_indexed: number;
 *     errors: number;
 *   };
 *   current_source?: string;
 *   eta_hours?: number;
 *   last_error?: {
 *     source: string;
 *     message: string;
 *     timestamp: string;
 *   };
 * }
 */

// Scraper status is stored in memory for now
// In production, this would come from Redis or a database
interface ScraperStatus {
  phase: "reddit" | "forums" | "youtube" | "parts" | "idle"
  progress: {
    documents_scraped: number
    vectors_indexed: number
    errors: number
  }
  current_source?: string
  eta_hours?: number
  last_error?: {
    source: string
    message: string
    timestamp: string
  }
  started_at?: string
  last_updated: string
}

// Default idle status - scraper not yet implemented
const DEFAULT_STATUS: ScraperStatus = {
  phase: "idle",
  progress: {
    documents_scraped: 0,
    vectors_indexed: 0,
    errors: 0,
  },
  last_updated: new Date().toISOString(),
}

// In-memory status (would be Redis/DB in production)
let scraperStatus: ScraperStatus = { ...DEFAULT_STATUS }

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Require authentication
    if (!user || authError) {
      return NextResponse.json(
        { error: "unauthorized", message: "Authentication required" },
        { status: 401 }
      )
    }

    // Check admin subscription tier
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single()

    if (profile?.subscription_tier !== "admin") {
      return NextResponse.json(
        {
          error: "forbidden",
          message: "Admin access required. subscription_tier must be 'admin'.",
        },
        { status: 403 }
      )
    }

    // Return current scraper status
    return NextResponse.json({
      phase: scraperStatus.phase,
      progress: scraperStatus.progress,
      current_source: scraperStatus.current_source,
      eta_hours: scraperStatus.eta_hours,
      last_error: scraperStatus.last_error,
      // Additional info not in spec but useful for admin
      _meta: {
        started_at: scraperStatus.started_at,
        last_updated: scraperStatus.last_updated,
        implementation_status: "not_started",
        note: "Knowledge scraper not yet implemented. See IMPLEMENTATION_PLAN.md P0 - Knowledge Scraper (6 weeks effort)",
      },
    })
  } catch (error) {
    console.error("[Admin Scraper Status] Error:", error)

    return NextResponse.json(
      { error: "internal_error", message: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/scraper/status - Update scraper status (Internal use)
 *
 * Used by the scraper service to update its status.
 * This is an internal endpoint not exposed in the public API spec.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Require authentication
    if (!user || authError) {
      return NextResponse.json(
        { error: "unauthorized", message: "Authentication required" },
        { status: 401 }
      )
    }

    // Check admin subscription tier
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single()

    if (profile?.subscription_tier !== "admin") {
      return NextResponse.json(
        { error: "forbidden", message: "Admin access required" },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Update scraper status
    scraperStatus = {
      phase: body.phase || scraperStatus.phase,
      progress: body.progress || scraperStatus.progress,
      current_source: body.current_source,
      eta_hours: body.eta_hours,
      last_error: body.last_error,
      started_at: body.started_at || scraperStatus.started_at,
      last_updated: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      status: scraperStatus,
    })
  } catch (error) {
    console.error("[Admin Scraper Status Update] Error:", error)

    return NextResponse.json(
      { error: "internal_error", message: "Internal server error" },
      { status: 500 }
    )
  }
}
