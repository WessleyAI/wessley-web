import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ingestionService } from "@/lib/services-client"

/**
 * GET /api/ingest/{job_id} - Check ingestion job status
 *
 * Spec-compliant status endpoint per api-contracts.md.
 * Returns the current status and progress of an ingestion job.
 *
 * Response (200):
 * {
 *   job_id: string;
 *   status: "queued" | "processing" | "completed" | "failed";
 *   progress: number;             // 0-1
 *   current_step?: string;        // "classifying_pages" | "extracting_schematics" | "indexing_text"
 *   result?: {
 *     pages_processed: number;
 *     schematics_found: number;
 *     components_extracted: number;
 *     text_chunks_indexed: number;
 *   };
 *   error?: {
 *     code: string;
 *     message: string;
 *     failed_page?: number;
 *   };
 * }
 */

interface RouteContext {
  params: Promise<{ job_id: string }>
}

// Map internal status to spec status
function mapStatus(status: string): "queued" | "processing" | "completed" | "failed" {
  switch (status) {
    case "pending":
      return "queued"
    case "processing":
      return "processing"
    case "completed":
      return "completed"
    case "failed":
      return "failed"
    default:
      return "queued"
  }
}

// Map progress (0-100) to spec format (0-1)
function mapProgress(progress: number | undefined): number {
  if (progress === undefined) return 0
  return Math.min(1, Math.max(0, progress / 100))
}

// Determine current step from progress
function getCurrentStep(progress: number | undefined, status: string): string | undefined {
  if (status === "completed" || status === "failed") return undefined

  const progressPercent = progress || 0
  if (progressPercent < 30) return "classifying_pages"
  if (progressPercent < 60) return "extracting_schematics"
  if (progressPercent < 90) return "indexing_text"
  return "finalizing"
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user || authError) {
      return NextResponse.json(
        { error: "unauthorized", message: "Authentication required" },
        { status: 401 }
      )
    }

    const { job_id } = await context.params

    if (!job_id) {
      return NextResponse.json(
        { error: "invalid_input", message: "job_id is required" },
        { status: 400 }
      )
    }

    const job = await ingestionService.getJob(job_id)

    // Build spec-compliant response
    const response: {
      job_id: string
      status: "queued" | "processing" | "completed" | "failed"
      progress: number
      current_step?: string
      result?: {
        pages_processed: number
        schematics_found: number
        components_extracted: number
        text_chunks_indexed: number
      }
      error?: {
        code: string
        message: string
        failed_page?: number
      }
    } = {
      job_id: job.job_id,
      status: mapStatus(job.status),
      progress: mapProgress(job.progress),
    }

    // Add current step for in-progress jobs
    const currentStep = getCurrentStep(job.progress, job.status)
    if (currentStep) {
      response.current_step = currentStep
    }

    // Add result for completed jobs
    if (job.status === "completed" && job.result) {
      response.result = {
        pages_processed: job.result.chunks_created || 0,
        schematics_found: 0, // Would need ML detection
        components_extracted: 0, // Would need netlistify processing
        text_chunks_indexed: job.result.embeddings_generated || 0,
      }
    }

    // Add error for failed jobs
    if (job.status === "failed" && job.error) {
      response.error = {
        code: "processing_failed",
        message: job.error,
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("[Ingest Status] Error:", error)

    if (error instanceof Error && error.name === "ServiceError") {
      const serviceError = error as Error & { statusCode: number; errorCode?: string }

      if (serviceError.errorCode === "not_found") {
        return NextResponse.json(
          { error: "not_found", message: "Ingestion job not found" },
          { status: 404 }
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
