import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ingestionService } from "@/lib/services-client"
import {
  ingestRatelimit,
  checkRateLimit,
  getRateLimitIdentifier,
  createRateLimitResponse,
  addRateLimitHeaders,
} from "@/lib/rate-limit"

/**
 * RAG Ingest Proxy Route
 *
 * Proxies document ingestion requests to the ingestion-service.
 * Handles file uploads for PDF manuals, schematics, and images.
 *
 * Rate limit: 10 requests/hour (per spec - more restrictive due to compute cost)
 * Max file size: 50MB
 *
 * Request body:
 * {
 *   file_content: string    - Base64 encoded file content
 *   file_name: string       - Original filename
 *   file_type: string       - Type: 'pdf' | 'image' | 'schematic'
 *   vehicle_id?: string     - Optional vehicle to associate with
 *   metadata?: object       - Optional metadata
 * }
 *
 * Response:
 * {
 *   job_id: string          - Ingestion job ID for status tracking
 *   status: string          - Initial status ('pending')
 *   created_at: string      - Timestamp
 * }
 */

export interface IngestRequest {
  file_content: string  // base64 encoded
  file_name: string
  file_type: "pdf" | "image" | "schematic"
  vehicle_id?: string
  metadata?: Record<string, unknown>
}

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  // 50MB
const ALLOWED_FILE_TYPES = ["pdf", "image", "schematic"]
const ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"]

function validateBase64Size(base64: string): number {
  // Base64 adds ~33% overhead, calculate original size
  const padding = (base64.match(/=/g) || []).length
  return Math.floor((base64.length * 3) / 4) - padding
}

function validateFileExtension(fileName: string): boolean {
  const ext = fileName.toLowerCase().slice(fileName.lastIndexOf("."))
  return ALLOWED_EXTENSIONS.includes(ext)
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Require authentication for ingestion (no demo mode - expensive operation)
    if (!user || authError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check subscription status - only paid users can ingest
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status, subscription_tier")
      .eq("id", user.id)
      .single()

    if (profile?.subscription_status !== "active") {
      return NextResponse.json(
        {
          error: "Subscription required",
          message: "Document ingestion requires an active subscription.",
          upgrade_url: "/pricing",
        },
        { status: 402 }
      )
    }

    // Rate limiting (10 req/hour - very restrictive)
    const identifier = getRateLimitIdentifier(user.id, request)
    const rateLimitResult = await checkRateLimit(ingestRatelimit, identifier)

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult)
    }

    // Parse and validate request body
    const body = await request.json() as IngestRequest

    // Validate required fields
    if (!body.file_content || typeof body.file_content !== "string") {
      return NextResponse.json(
        { error: "file_content is required and must be a base64 string" },
        { status: 400 }
      )
    }

    if (!body.file_name || typeof body.file_name !== "string") {
      return NextResponse.json(
        { error: "file_name is required" },
        { status: 400 }
      )
    }

    if (!body.file_type || !ALLOWED_FILE_TYPES.includes(body.file_type)) {
      return NextResponse.json(
        {
          error: "file_type is required and must be one of: pdf, image, schematic",
        },
        { status: 400 }
      )
    }

    // Validate file extension
    if (!validateFileExtension(body.file_name)) {
      return NextResponse.json(
        {
          error: "Invalid file extension",
          allowed: ALLOWED_EXTENSIONS,
        },
        { status: 400 }
      )
    }

    // Validate file size
    const fileSize = validateBase64Size(body.file_content)
    if (fileSize > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: "File too large",
          message: `Maximum file size is 50MB. Your file is ${Math.round(fileSize / 1024 / 1024)}MB.`,
        },
        { status: 413 }
      )
    }

    // Validate base64 format (basic check)
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(body.file_content.replace(/\s/g, ""))) {
      return NextResponse.json(
        { error: "Invalid base64 encoding" },
        { status: 400 }
      )
    }

    // Create ingestion job
    const job = await ingestionService.createJob({
      file_content: body.file_content,
      file_name: body.file_name,
      file_type: body.file_type,
      vehicle_id: body.vehicle_id,
      metadata: {
        ...body.metadata,
        uploaded_by: user.id,
        uploaded_at: new Date().toISOString(),
      },
    })

    const response = NextResponse.json({
      job_id: job.job_id,
      status: job.status,
      created_at: job.created_at,
      message: "Ingestion job created. Use GET /api/rag/ingest?job_id=<id> to check status.",
    })

    return addRateLimitHeaders(response, rateLimitResult)
  } catch (error) {
    console.error("[RAG Ingest] Error:", error)

    if (error instanceof Error && error.name === "ServiceError") {
      const serviceError = error as Error & { statusCode: number; errorCode?: string }

      if (serviceError.errorCode === "file_too_large") {
        return NextResponse.json(
          { error: "File too large. Maximum size is 50MB." },
          { status: 413 }
        )
      }

      if (serviceError.errorCode === "unsupported_type") {
        return NextResponse.json(
          { error: "Unsupported file type." },
          { status: 415 }
        )
      }

      return NextResponse.json(
        { error: serviceError.message },
        { status: serviceError.statusCode }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to check ingestion job status
 *
 * Query params:
 *   job_id: string - The job ID to check
 *
 * Response:
 * {
 *   job_id: string
 *   status: 'pending' | 'processing' | 'completed' | 'failed'
 *   progress?: number (0-100)
 *   result?: { chunks_created, embeddings_generated }
 *   error?: string
 * }
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user || authError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get("job_id")

    if (!jobId) {
      return NextResponse.json(
        { error: "job_id query parameter is required" },
        { status: 400 }
      )
    }

    const job = await ingestionService.getJob(jobId)

    return NextResponse.json({
      job_id: job.job_id,
      status: job.status,
      progress: job.progress,
      created_at: job.created_at,
      completed_at: job.completed_at,
      result: job.result,
      error: job.error,
    })
  } catch (error) {
    console.error("[RAG Ingest Status] Error:", error)

    if (error instanceof Error && error.name === "ServiceError") {
      const serviceError = error as Error & { statusCode: number; errorCode?: string }

      if (serviceError.errorCode === "not_found") {
        return NextResponse.json(
          { error: "Ingestion job not found" },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: serviceError.message },
        { status: serviceError.statusCode }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
