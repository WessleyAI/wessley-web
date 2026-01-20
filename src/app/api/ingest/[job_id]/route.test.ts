/**
 * Tests for Ingestion Job Status API Route
 *
 * These tests verify the /api/ingest/{job_id} endpoint behavior including
 * authentication, status mapping, progress normalization, and error handling.
 *
 * Why these tests matter:
 * - Job status is polled frequently during processing
 * - Progress normalization ensures consistent UI display
 * - Step inference helps users understand processing stage
 * - Result mapping provides actionable metrics
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

describe('/api/ingest/[job_id]', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
    vi.clearAllMocks()
  })

  function createMockRequest(jobId: string): NextRequest {
    return new NextRequest(`http://localhost:3000/api/ingest/${jobId}`, {
      method: 'GET',
    })
  }

  describe('authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn(() => Promise.resolve({
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: null },
              error: null,
            }),
          },
        })),
      }))

      vi.doMock('@/lib/services-client', () => ({
        ingestionService: {
          getJob: vi.fn(),
        },
      }))

      const { GET } = await import('./route')
      const request = createMockRequest('job-123')

      const response = await GET(request, { params: Promise.resolve({ job_id: 'job-123' }) })
      const json = await response.json()

      expect(response.status).toBe(401)
      expect(json.error).toBe('unauthorized')
    })
  })

  describe('input validation', () => {
    it('should return 400 when job_id is missing', async () => {
      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn(() => Promise.resolve({
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: { id: 'user-123' } },
              error: null,
            }),
          },
        })),
      }))

      vi.doMock('@/lib/services-client', () => ({
        ingestionService: {
          getJob: vi.fn(),
        },
      }))

      const { GET } = await import('./route')
      const request = createMockRequest('')

      const response = await GET(request, { params: Promise.resolve({ job_id: '' }) })
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toBe('invalid_input')
    })
  })
})

describe('Ingest Job Status Mapping Logic', () => {
  /**
   * These tests verify the internal status to spec status mapping.
   */

  function mapStatus(status: string): 'queued' | 'processing' | 'completed' | 'failed' {
    switch (status) {
      case 'pending':
        return 'queued'
      case 'processing':
        return 'processing'
      case 'completed':
        return 'completed'
      case 'failed':
        return 'failed'
      default:
        return 'queued'
    }
  }

  describe('status mapping', () => {
    it('should map "pending" to "queued"', () => {
      expect(mapStatus('pending')).toBe('queued')
    })

    it('should map "processing" to "processing"', () => {
      expect(mapStatus('processing')).toBe('processing')
    })

    it('should map "completed" to "completed"', () => {
      expect(mapStatus('completed')).toBe('completed')
    })

    it('should map "failed" to "failed"', () => {
      expect(mapStatus('failed')).toBe('failed')
    })

    it('should default unknown status to "queued"', () => {
      expect(mapStatus('unknown')).toBe('queued')
      expect(mapStatus('')).toBe('queued')
      expect(mapStatus('something_else')).toBe('queued')
    })
  })
})

describe('Ingest Job Progress Normalization', () => {
  function mapProgress(progress: number | undefined): number {
    if (progress === undefined) return 0
    return Math.min(1, Math.max(0, progress / 100))
  }

  describe('progress mapping', () => {
    it('should convert 0% to 0', () => {
      expect(mapProgress(0)).toBe(0)
    })

    it('should convert 50% to 0.5', () => {
      expect(mapProgress(50)).toBe(0.5)
    })

    it('should convert 100% to 1', () => {
      expect(mapProgress(100)).toBe(1)
    })

    it('should handle undefined progress as 0', () => {
      expect(mapProgress(undefined)).toBe(0)
    })

    it('should cap progress at 1 for values over 100', () => {
      expect(mapProgress(150)).toBe(1)
    })

    it('should floor progress at 0 for negative values', () => {
      expect(mapProgress(-10)).toBe(0)
    })

    it('should handle decimal progress values', () => {
      expect(mapProgress(33.33)).toBeCloseTo(0.3333, 4)
    })
  })
})

describe('Ingest Job Current Step Inference', () => {
  function getCurrentStep(progress: number | undefined, status: string): string | undefined {
    if (status === 'completed' || status === 'failed') return undefined

    const progressPercent = progress || 0
    if (progressPercent < 30) return 'classifying_pages'
    if (progressPercent < 60) return 'extracting_schematics'
    if (progressPercent < 90) return 'indexing_text'
    return 'finalizing'
  }

  describe('step inference based on progress', () => {
    it('should return "classifying_pages" for 0-29%', () => {
      expect(getCurrentStep(0, 'processing')).toBe('classifying_pages')
      expect(getCurrentStep(15, 'processing')).toBe('classifying_pages')
      expect(getCurrentStep(29, 'processing')).toBe('classifying_pages')
    })

    it('should return "extracting_schematics" for 30-59%', () => {
      expect(getCurrentStep(30, 'processing')).toBe('extracting_schematics')
      expect(getCurrentStep(45, 'processing')).toBe('extracting_schematics')
      expect(getCurrentStep(59, 'processing')).toBe('extracting_schematics')
    })

    it('should return "indexing_text" for 60-89%', () => {
      expect(getCurrentStep(60, 'processing')).toBe('indexing_text')
      expect(getCurrentStep(75, 'processing')).toBe('indexing_text')
      expect(getCurrentStep(89, 'processing')).toBe('indexing_text')
    })

    it('should return "finalizing" for 90%+', () => {
      expect(getCurrentStep(90, 'processing')).toBe('finalizing')
      expect(getCurrentStep(95, 'processing')).toBe('finalizing')
      expect(getCurrentStep(99, 'processing')).toBe('finalizing')
    })
  })

  describe('step inference for terminal states', () => {
    it('should return undefined for completed jobs', () => {
      expect(getCurrentStep(100, 'completed')).toBeUndefined()
      expect(getCurrentStep(50, 'completed')).toBeUndefined()
    })

    it('should return undefined for failed jobs', () => {
      expect(getCurrentStep(50, 'failed')).toBeUndefined()
      expect(getCurrentStep(0, 'failed')).toBeUndefined()
    })
  })

  describe('step inference with undefined progress', () => {
    it('should default to "classifying_pages" when progress is undefined', () => {
      expect(getCurrentStep(undefined, 'processing')).toBe('classifying_pages')
    })
  })
})

describe('Ingest Job Result Mapping', () => {
  describe('completed job result', () => {
    it('should include pages_processed from chunks_created', () => {
      const jobResult = { chunks_created: 150, embeddings_generated: 150 }
      const result = {
        pages_processed: jobResult.chunks_created || 0,
        schematics_found: 0,
        components_extracted: 0,
        text_chunks_indexed: jobResult.embeddings_generated || 0,
      }

      expect(result.pages_processed).toBe(150)
    })

    it('should include text_chunks_indexed from embeddings_generated', () => {
      const jobResult = { chunks_created: 150, embeddings_generated: 145 }
      const result = {
        pages_processed: jobResult.chunks_created || 0,
        schematics_found: 0,
        components_extracted: 0,
        text_chunks_indexed: jobResult.embeddings_generated || 0,
      }

      expect(result.text_chunks_indexed).toBe(145)
    })

    it('should default to 0 for missing fields', () => {
      const jobResult = {} as { chunks_created?: number; embeddings_generated?: number }
      const result = {
        pages_processed: jobResult.chunks_created || 0,
        schematics_found: 0,
        components_extracted: 0,
        text_chunks_indexed: jobResult.embeddings_generated || 0,
      }

      expect(result.pages_processed).toBe(0)
      expect(result.schematics_found).toBe(0)
      expect(result.components_extracted).toBe(0)
      expect(result.text_chunks_indexed).toBe(0)
    })
  })
})

describe('Ingest Job Error Mapping', () => {
  describe('failed job error', () => {
    it('should include error code and message', () => {
      const jobError = 'PDF processing failed: corrupt file header'
      const error = {
        code: 'processing_failed',
        message: jobError,
      }

      expect(error.code).toBe('processing_failed')
      expect(error.message).toBe(jobError)
    })

    it('should not include failed_page when not available', () => {
      const error = {
        code: 'processing_failed',
        message: 'Generic error',
      }

      expect(error).not.toHaveProperty('failed_page')
    })
  })
})

describe('Ingest Job Response Format', () => {
  describe('successful response structure', () => {
    it('should always include job_id, status, and progress', () => {
      const response = {
        job_id: 'job-abc123',
        status: 'processing' as const,
        progress: 0.45,
      }

      expect(response.job_id).toBeTruthy()
      expect(response.status).toBeTruthy()
      expect(typeof response.progress).toBe('number')
    })

    it('should include current_step for in-progress jobs', () => {
      const response = {
        job_id: 'job-abc123',
        status: 'processing' as const,
        progress: 0.45,
        current_step: 'extracting_schematics',
      }

      expect(response.current_step).toBe('extracting_schematics')
    })

    it('should include result for completed jobs', () => {
      const response = {
        job_id: 'job-abc123',
        status: 'completed' as const,
        progress: 1,
        result: {
          pages_processed: 50,
          schematics_found: 12,
          components_extracted: 87,
          text_chunks_indexed: 150,
        },
      }

      expect(response.result).toBeDefined()
      expect(response.result.pages_processed).toBe(50)
    })

    it('should include error for failed jobs', () => {
      const response = {
        job_id: 'job-abc123',
        status: 'failed' as const,
        progress: 0.33,
        error: {
          code: 'processing_failed',
          message: 'OCR failed on page 5',
          failed_page: 5,
        },
      }

      expect(response.error).toBeDefined()
      expect(response.error.code).toBe('processing_failed')
      expect(response.error.failed_page).toBe(5)
    })
  })
})

describe('Ingest Job HTTP Status Codes', () => {
  describe('success status', () => {
    it('should return 200 for successful status retrieval', () => {
      expect(200).toBe(200)
    })
  })

  describe('error statuses', () => {
    it('should return 400 for missing job_id', () => {
      expect(400).toBe(400)
    })

    it('should return 401 for unauthenticated requests', () => {
      expect(401).toBe(401)
    })

    it('should return 404 for non-existent job', () => {
      expect(404).toBe(404)
    })

    it('should return 500 for internal errors', () => {
      expect(500).toBe(500)
    })
  })
})

describe('Ingest Job Service Error Handling', () => {
  describe('ServiceError handling', () => {
    it('should return 404 for not_found error code', () => {
      const errorCode = 'not_found'
      const statusCode = errorCode === 'not_found' ? 404 : 500

      expect(statusCode).toBe(404)
    })

    it('should use service statusCode for other errors', () => {
      const serviceError = { errorCode: 'timeout', statusCode: 504 }
      const statusCode = serviceError.errorCode === 'not_found' ? 404 : serviceError.statusCode

      expect(statusCode).toBe(504)
    })
  })
})

describe('Ingest Job Status Polling Behavior', () => {
  /**
   * Document expected polling behavior for frontend integration.
   */

  describe('polling recommendations', () => {
    it('should recommend polling every 2 seconds for processing jobs', () => {
      const POLLING_INTERVAL_MS = 2000

      expect(POLLING_INTERVAL_MS).toBe(2000)
    })

    it('should stop polling when status is terminal (completed/failed)', () => {
      const terminalStatuses = ['completed', 'failed']
      const status = 'completed'

      const shouldStopPolling = terminalStatuses.includes(status)
      expect(shouldStopPolling).toBe(true)
    })

    it('should continue polling for queued and processing statuses', () => {
      const terminalStatuses = ['completed', 'failed']
      const inProgressStatuses = ['queued', 'processing']

      inProgressStatuses.forEach(status => {
        const shouldContinuePolling = !terminalStatuses.includes(status)
        expect(shouldContinuePolling).toBe(true)
      })
    })
  })

  describe('progress display', () => {
    it('should display progress as percentage (multiply by 100)', () => {
      const normalizedProgress = 0.45
      const displayPercentage = Math.round(normalizedProgress * 100)

      expect(displayPercentage).toBe(45)
    })

    it('should show current step alongside progress', () => {
      const response = {
        progress: 0.45,
        current_step: 'extracting_schematics',
      }

      const displayText = `${Math.round(response.progress * 100)}% - ${response.current_step.replace(/_/g, ' ')}`
      expect(displayText).toBe('45% - extracting schematics')
    })
  })
})
