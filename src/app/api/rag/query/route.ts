import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { semanticService, graphService, type SemanticSearchResult } from "@/lib/services-client"
import {
  chatRatelimit,
  checkRateLimit,
  getRateLimitIdentifier,
  createRateLimitResponse,
  addRateLimitHeaders,
} from "@/lib/rate-limit"

/**
 * RAG Query Proxy Route
 *
 * Proxies requests to the semantic-service and optionally enriches with graph data.
 * Combines vector search with knowledge graph traversal for comprehensive results.
 *
 * Rate limit: 60 requests/minute (same as chat endpoints per spec)
 *
 * Request body:
 * {
 *   query: string           - The user's question or search query
 *   vehicleId?: string      - Optional vehicle ID for context
 *   systemName?: string     - Optional system name to focus search
 *   includeGraph?: boolean  - Whether to include graph relationships
 *   limit?: number          - Max results (default 5)
 * }
 *
 * Response:
 * {
 *   results: SemanticSearchResult[]    - Semantic search results
 *   graphContext?: {                   - Optional graph context
 *     components: GraphComponent[]
 *     connections: GraphConnection[]
 *   }
 *   processingTimeMs: number
 * }
 */

export interface RAGQueryRequest {
  query: string
  vehicleId?: string
  systemName?: string
  includeGraph?: boolean
  limit?: number
}

export interface RAGQueryResponse {
  results: SemanticSearchResult[]
  graphContext?: {
    components: Array<{
      id: string
      type: string
      name: string
      position?: { x: number; y: number; z: number }
    }>
    connections: Array<{
      from_component: string
      to_component: string
      wire: {
        id: string
        color: string
        gauge: string
      }
    }>
  }
  processingTimeMs: number
}

const DEMO_WORKSPACE_ID = "cde0ea8e-07aa-4c59-a72b-ba0d56020484"

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Parse request body first to check for demo mode
    const body = await request.json() as RAGQueryRequest & { workspaceId?: string }
    const isDemoWorkspace = body.workspaceId === DEMO_WORKSPACE_ID

    // Require auth except for demo workspace
    if (!user && !isDemoWorkspace) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check subscription status for authenticated non-demo users
    // Demo workspace bypasses subscription check to allow free trial experience
    if (user && !isDemoWorkspace) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("id", user.id)
        .single()

      if (profile?.subscription_status !== "active") {
        return NextResponse.json(
          {
            error: "Subscription required",
            message: "RAG query features require an active subscription.",
            upgrade_url: "/pricing",
          },
          { status: 402 }
        )
      }
    }

    // Rate limiting
    const identifier = getRateLimitIdentifier(user?.id, request)
    const rateLimitResult = await checkRateLimit(chatRatelimit, identifier)

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult)
    }

    // Validate required fields
    if (!body.query || typeof body.query !== "string") {
      return NextResponse.json(
        { error: "Query is required and must be a string" },
        { status: 400 }
      )
    }

    if (body.query.length > 2000) {
      return NextResponse.json(
        { error: "Query too long. Maximum 2000 characters." },
        { status: 400 }
      )
    }

    // Perform semantic search
    const semanticResults = await semanticService.search({
      query: body.query,
      vehicleId: body.vehicleId,
      limit: body.limit || 5,
    })

    const response: RAGQueryResponse = {
      results: semanticResults.results,
      processingTimeMs: Date.now() - startTime,
    }

    // Optionally include graph context
    if (body.includeGraph && body.vehicleId && body.systemName) {
      try {
        const components = await graphService.getSystemComponents(
          body.vehicleId,
          body.systemName
        )

        // Get connections for first few components
        const connectionPromises = components.slice(0, 3).map(async (comp) => {
          try {
            const related = await graphService.getRelatedComponents(
              body.vehicleId!,
              comp.id,
              1
            )
            return related.connections
          } catch {
            return []
          }
        })

        const connectionResults = await Promise.all(connectionPromises)
        const connections = connectionResults.flat()

        response.graphContext = {
          components: components.map((c) => ({
            id: c.id,
            type: c.type,
            name: c.name,
            position: c.position,
          })),
          connections: connections.map((conn) => ({
            from_component: conn.from_component,
            to_component: conn.to_component,
            wire: {
              id: conn.wire.id,
              color: conn.wire.color,
              gauge: conn.wire.gauge,
            },
          })),
        }
      } catch (graphError) {
        // Graph service might not be available, continue without graph context
        console.error("[RAG Query] Graph service error:", graphError)
      }
    }

    response.processingTimeMs = Date.now() - startTime

    const jsonResponse = NextResponse.json(response)
    return addRateLimitHeaders(jsonResponse, rateLimitResult)
  } catch (error) {
    console.error("[RAG Query] Error:", error)

    if (error instanceof Error && error.name === "ServiceError") {
      const serviceError = error as Error & { statusCode: number; service: string }
      return NextResponse.json(
        {
          error: serviceError.message,
          service: serviceError.service,
        },
        { status: serviceError.statusCode }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST." },
    { status: 405 }
  )
}
