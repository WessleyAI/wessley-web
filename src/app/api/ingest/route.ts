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
 * POST /api/ingest - Upload PDF for processing
 *
 * Spec-compliant ingestion endpoint per api-contracts.md.
 * Accepts PDF uploads and returns a job ID for status tracking.
 *
 * Rate limit: 10 requests/hour
 * Max file size: 50MB
 *
 * Request:
 * {
 *   pdf_url: string;              // URL or base64 data URI
 *   vehicle: {
 *     make: string;
 *     model: string;
 *     year: number;
 *   };
 * }
 *
 * Response (202 Accepted):
 * {
 *   job_id: string;
 *   status: "queued";
 *   estimated_time: number;       // Seconds
 * }
 */

export interface IngestRequest {
  pdf_url: string  // URL or base64 data URI
  vehicle: {
    make: string
    model: string
    year: number
  }
}

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  // 50MB

function validateBase64Size(base64: string): number {
  // Remove data URI prefix if present
  const base64Content = base64.includes(",") ? base64.split(",")[1] : base64
  const padding = (base64Content.match(/=/g) || []).length
  return Math.floor((base64Content.length * 3) / 4) - padding
}

function isBase64DataUri(url: string): boolean {
  return url.startsWith("data:")
}

function extractBase64Content(dataUri: string): string {
  if (!dataUri.startsWith("data:")) return dataUri
  const commaIndex = dataUri.indexOf(",")
  return commaIndex !== -1 ? dataUri.substring(commaIndex + 1) : dataUri
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Require authentication for ingestion (expensive operation)
    if (!user || authError) {
      return NextResponse.json(
        { error: "unauthorized", message: "Authentication required" },
        { status: 401 }
      )
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
          error: "subscription_required",
          message: "Document ingestion requires an active subscription.",
          upgrade_url: "/pricing",
        },
        { status: 402 }
      )
    }

    // Rate limiting (10 req/hour)
    const identifier = getRateLimitIdentifier(user.id, request)
    const rateLimitResult = await checkRateLimit(ingestRatelimit, identifier)

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult)
    }

    // Parse and validate request body
    const body = await request.json() as IngestRequest

    // Validate required fields
    if (!body.pdf_url || typeof body.pdf_url !== "string") {
      return NextResponse.json(
        { error: "invalid_input", message: "pdf_url is required" },
        { status: 400 }
      )
    }

    if (!body.vehicle || typeof body.vehicle !== "object") {
      return NextResponse.json(
        { error: "invalid_input", message: "vehicle object is required" },
        { status: 400 }
      )
    }

    if (!body.vehicle.make || !body.vehicle.model || !body.vehicle.year) {
      return NextResponse.json(
        {
          error: "invalid_input",
          message: "vehicle.make, vehicle.model, and vehicle.year are required",
        },
        { status: 400 }
      )
    }

    // Validate file size for base64 data URIs
    if (isBase64DataUri(body.pdf_url)) {
      const base64Content = extractBase64Content(body.pdf_url)
      const fileSize = validateBase64Size(base64Content)

      if (fileSize > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          {
            error: "file_too_large",
            message: `Max file size is 50MB. Your file is ${Math.round(fileSize / 1024 / 1024)}MB.`,
          },
          { status: 413 }
        )
      }
    }

    // Determine file name from vehicle info
    const fileName = `${body.vehicle.year}_${body.vehicle.make}_${body.vehicle.model}.pdf`
      .replace(/\s+/g, "_")
      .toLowerCase()

    // Create ingestion job
    const job = await ingestionService.createJob({
      file_url: isBase64DataUri(body.pdf_url) ? undefined : body.pdf_url,
      file_content: isBase64DataUri(body.pdf_url)
        ? extractBase64Content(body.pdf_url)
        : undefined,
      file_name: fileName,
      file_type: "pdf",
      metadata: {
        vehicle: body.vehicle,
        uploaded_by: user.id,
        uploaded_at: new Date().toISOString(),
      },
    })

    // Return spec-compliant response
    const response = NextResponse.json(
      {
        job_id: job.job_id,
        status: "queued",
        estimated_time: 60, // Estimated seconds for PDF processing
      },
      { status: 202 }
    )

    return addRateLimitHeaders(response, rateLimitResult)
  } catch (error) {
    console.error("[Ingest] Error:", error)

    if (error instanceof Error && error.name === "ServiceError") {
      const serviceError = error as Error & { statusCode: number; errorCode?: string }

      if (serviceError.errorCode === "file_too_large") {
        return NextResponse.json(
          { error: "file_too_large", message: "Max file size is 50MB" },
          { status: 413 }
        )
      }

      if (serviceError.errorCode === "invalid_pdf") {
        return NextResponse.json(
          { error: "invalid_pdf", message: "File is not a valid PDF" },
          { status: 400 }
        )
      }

      if (serviceError.errorCode === "corrupt_file") {
        return NextResponse.json(
          { error: "corrupt_file", message: "File appears corrupted" },
          { status: 400 }
        )
      }

      if (serviceError.statusCode === 503) {
        return NextResponse.json(
          { error: "queue_full", message: "Processing queue is full, try again later" },
          { status: 503 }
        )
      }

      return NextResponse.json(
        { error: "service_error", message: serviceError.message },
        { status: serviceError.statusCode }
      )
    }

    return NextResponse.json(
      { error: "internal_error", message: "Internal server error" },
      { status: 500 }
    )
  }
}
