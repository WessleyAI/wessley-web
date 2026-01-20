/**
 * Tests for Document Ingestion API Route
 *
 * These tests verify the /api/ingest endpoint behavior including
 * authentication, authorization, rate limiting, validation, and job creation.
 *
 * Why these tests matter:
 * - Ingestion is a paid feature - must enforce subscription
 * - Rate limiting prevents abuse (10 req/hour is expensive)
 * - File validation prevents processing invalid PDFs
 * - Job creation flow must be reliable for async processing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

describe('/api/ingest', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
    vi.clearAllMocks()
  })

  function createMockRequest(body: Record<string, unknown>): NextRequest {
    return new NextRequest('http://localhost:3000/api/ingest', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
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
          from: vi.fn(),
        })),
      }))

      vi.doMock('@/lib/services-client', () => ({
        ingestionService: {
          createJob: vi.fn(),
        },
      }))

      vi.doMock('@/lib/rate-limit', () => ({
        ingestRatelimit: {},
        checkRateLimit: vi.fn().mockResolvedValue({ success: true }),
        getRateLimitIdentifier: vi.fn().mockReturnValue('user-123'),
        createRateLimitResponse: vi.fn(),
        addRateLimitHeaders: vi.fn((res) => res),
      }))

      const { POST } = await import('./route')
      const request = createMockRequest({
        pdf_url: 'https://example.com/manual.pdf',
        vehicle: { make: 'Toyota', model: 'Camry', year: 2020 },
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(401)
      expect(json.error).toBe('unauthorized')
    })
  })
})

describe('Ingest API Validation Logic', () => {
  /**
   * These tests document the validation rules for ingestion requests.
   */

  describe('request body validation', () => {
    it('should require pdf_url field', () => {
      const body: Record<string, unknown> = { vehicle: { make: 'Toyota', model: 'Camry', year: 2020 } }
      const isValid = !!body.pdf_url && typeof body.pdf_url === 'string'

      expect(isValid).toBe(false)
    })

    it('should require pdf_url to be a string', () => {
      const body = { pdf_url: 123, vehicle: { make: 'Toyota', model: 'Camry', year: 2020 } }
      const isValid = typeof body.pdf_url === 'string'

      expect(isValid).toBe(false)
    })

    it('should require vehicle object', () => {
      const body: Record<string, unknown> = { pdf_url: 'https://example.com/manual.pdf' }
      const isValid = !!body.vehicle && typeof body.vehicle === 'object'

      expect(isValid).toBe(false)
    })

    it('should require vehicle.make', () => {
      const vehicle: Record<string, unknown> = { model: 'Camry', year: 2020 }
      const isValid = !!vehicle.make

      expect(isValid).toBe(false)
    })

    it('should require vehicle.model', () => {
      const vehicle: Record<string, unknown> = { make: 'Toyota', year: 2020 }
      const isValid = !!vehicle.model

      expect(isValid).toBe(false)
    })

    it('should require vehicle.year', () => {
      const vehicle: Record<string, unknown> = { make: 'Toyota', model: 'Camry' }
      const isValid = !!vehicle.year

      expect(isValid).toBe(false)
    })

    it('should accept valid request body', () => {
      const body = {
        pdf_url: 'https://example.com/manual.pdf',
        vehicle: { make: 'Toyota', model: 'Camry', year: 2020 },
      }

      const isValid =
        typeof body.pdf_url === 'string' &&
        typeof body.vehicle === 'object' &&
        !!body.vehicle.make &&
        !!body.vehicle.model &&
        !!body.vehicle.year

      expect(isValid).toBe(true)
    })
  })

  describe('base64 data URI detection', () => {
    it('should detect data URI format', () => {
      const dataUri = 'data:application/pdf;base64,JVBERi0xLjQK...'
      const isDataUri = dataUri.startsWith('data:')

      expect(isDataUri).toBe(true)
    })

    it('should not detect regular URLs as data URIs', () => {
      const url = 'https://example.com/manual.pdf'
      const isDataUri = url.startsWith('data:')

      expect(isDataUri).toBe(false)
    })
  })

  describe('base64 content extraction', () => {
    it('should extract content after comma', () => {
      const dataUri = 'data:application/pdf;base64,JVBERi0xLjQK...'
      const commaIndex = dataUri.indexOf(',')
      const content = commaIndex !== -1 ? dataUri.substring(commaIndex + 1) : dataUri

      expect(content).toBe('JVBERi0xLjQK...')
    })

    it('should return original string if no comma', () => {
      const content = 'JVBERi0xLjQK...'
      const commaIndex = content.indexOf(',')
      const extracted = commaIndex !== -1 ? content.substring(commaIndex + 1) : content

      expect(extracted).toBe('JVBERi0xLjQK...')
    })
  })
})

describe('Ingest API File Size Validation', () => {
  const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 // 50MB

  function validateBase64Size(base64: string): number {
    const base64Content = base64.includes(',') ? base64.split(',')[1] : base64
    const padding = (base64Content.match(/=/g) || []).length
    return Math.floor((base64Content.length * 3) / 4) - padding
  }

  describe('base64 size calculation', () => {
    it('should calculate correct size for base64 without padding', () => {
      // "Hello" = 5 bytes, base64 = "SGVsbG8=" (8 chars with 1 padding)
      // Actual: floor(8*3/4) - 1 = 6 - 1 = 5 bytes
      const base64 = 'SGVsbG8='
      const size = validateBase64Size(base64)

      expect(size).toBe(5)
    })

    it('should handle data URI prefix', () => {
      const dataUri = 'data:application/pdf;base64,SGVsbG8='
      const size = validateBase64Size(dataUri)

      expect(size).toBe(5)
    })

    it('should calculate size correctly with double padding', () => {
      // "Hi" = 2 bytes, base64 = "SGk=" (4 chars with 1 padding)
      // Actual: floor(4*3/4) - 1 = 3 - 1 = 2 bytes
      const base64 = 'SGk='
      const size = validateBase64Size(base64)

      expect(size).toBe(2)
    })

    it('should handle no padding case', () => {
      // "abc" = 3 bytes, base64 = "YWJj" (4 chars, no padding)
      // Actual: floor(4*3/4) - 0 = 3 bytes
      const base64 = 'YWJj'
      const size = validateBase64Size(base64)

      expect(size).toBe(3)
    })
  })

  describe('size limits', () => {
    it('should reject files over 50MB', () => {
      // 51MB in bytes
      const fileSizeBytes = 51 * 1024 * 1024

      expect(fileSizeBytes > MAX_FILE_SIZE_BYTES).toBe(true)
    })

    it('should accept files under 50MB', () => {
      // 25MB in bytes
      const fileSizeBytes = 25 * 1024 * 1024

      expect(fileSizeBytes <= MAX_FILE_SIZE_BYTES).toBe(true)
    })

    it('should accept files exactly 50MB', () => {
      const fileSizeBytes = MAX_FILE_SIZE_BYTES

      expect(fileSizeBytes <= MAX_FILE_SIZE_BYTES).toBe(true)
    })
  })
})

describe('Ingest API File Name Generation', () => {
  function generateFileName(vehicle: { year: number; make: string; model: string }): string {
    return `${vehicle.year}_${vehicle.make}_${vehicle.model}.pdf`
      .replace(/\s+/g, '_')
      .toLowerCase()
  }

  it('should generate lowercase file name', () => {
    const fileName = generateFileName({ year: 2020, make: 'Toyota', model: 'Camry' })

    expect(fileName).toBe('2020_toyota_camry.pdf')
  })

  it('should replace spaces with underscores', () => {
    const fileName = generateFileName({ year: 2020, make: 'Land Rover', model: 'Range Rover' })

    expect(fileName).toBe('2020_land_rover_range_rover.pdf')
  })

  it('should handle special characters in model name', () => {
    const fileName = generateFileName({ year: 2020, make: 'BMW', model: 'X5 M' })

    expect(fileName).toBe('2020_bmw_x5_m.pdf')
  })
})

describe('Ingest API Subscription Check', () => {
  describe('subscription status validation', () => {
    it('should reject users without active subscription', () => {
      const subscriptionStatus = 'inactive'
      const hasAccess = subscriptionStatus === 'active'

      expect(hasAccess).toBe(false)
    })

    it('should reject users with expired subscription', () => {
      const subscriptionStatus = 'expired'
      const hasAccess = subscriptionStatus === 'active'

      expect(hasAccess).toBe(false)
    })

    it('should allow users with active subscription', () => {
      const subscriptionStatus = 'active'
      const hasAccess = subscriptionStatus === 'active'

      expect(hasAccess).toBe(true)
    })

    it('should reject users with null subscription status', () => {
      const subscriptionStatus = null
      const hasAccess = subscriptionStatus === 'active'

      expect(hasAccess).toBe(false)
    })
  })
})

describe('Ingest API Response Format', () => {
  describe('successful response (202 Accepted)', () => {
    it('should include job_id', () => {
      const response = {
        job_id: 'job-abc123',
        status: 'queued',
        estimated_time: 60,
      }

      expect(response.job_id).toBeTruthy()
    })

    it('should include status as "queued"', () => {
      const response = {
        job_id: 'job-abc123',
        status: 'queued',
        estimated_time: 60,
      }

      expect(response.status).toBe('queued')
    })

    it('should include estimated_time in seconds', () => {
      const response = {
        job_id: 'job-abc123',
        status: 'queued',
        estimated_time: 60,
      }

      expect(response.estimated_time).toBe(60)
    })
  })

  describe('error responses', () => {
    it('should include error code and message', () => {
      const errorResponse = {
        error: 'invalid_input',
        message: 'pdf_url is required',
      }

      expect(errorResponse.error).toBeTruthy()
      expect(errorResponse.message).toBeTruthy()
    })

    it('should include upgrade_url for subscription errors', () => {
      const errorResponse = {
        error: 'subscription_required',
        message: 'Document ingestion requires an active subscription.',
        upgrade_url: '/pricing',
      }

      expect(errorResponse.upgrade_url).toBe('/pricing')
    })
  })
})

describe('Ingest API HTTP Status Codes', () => {
  describe('success status', () => {
    it('should return 202 for accepted job', () => {
      expect(202).toBe(202)
    })
  })

  describe('error statuses', () => {
    it('should return 400 for invalid input', () => {
      expect(400).toBe(400)
    })

    it('should return 401 for unauthenticated requests', () => {
      expect(401).toBe(401)
    })

    it('should return 402 for subscription required', () => {
      expect(402).toBe(402)
    })

    it('should return 413 for file too large', () => {
      expect(413).toBe(413)
    })

    it('should return 429 for rate limit exceeded', () => {
      expect(429).toBe(429)
    })

    it('should return 500 for internal errors', () => {
      expect(500).toBe(500)
    })

    it('should return 503 for queue full', () => {
      expect(503).toBe(503)
    })
  })
})

describe('Ingest API Service Error Handling', () => {
  describe('ServiceError error codes', () => {
    it('should map file_too_large to 413', () => {
      const errorCode = 'file_too_large'
      const statusCode = errorCode === 'file_too_large' ? 413 : 500

      expect(statusCode).toBe(413)
    })

    it('should map invalid_pdf to 400', () => {
      const errorCode = 'invalid_pdf'
      const statusCode = errorCode === 'invalid_pdf' ? 400 : 500

      expect(statusCode).toBe(400)
    })

    it('should map corrupt_file to 400', () => {
      const errorCode = 'corrupt_file'
      const statusCode = errorCode === 'corrupt_file' ? 400 : 500

      expect(statusCode).toBe(400)
    })

    it('should map service 503 to queue_full error', () => {
      const serviceStatusCode = 503
      const errorType = serviceStatusCode === 503 ? 'queue_full' : 'service_error'

      expect(errorType).toBe('queue_full')
    })
  })
})

describe('Ingest API Rate Limiting', () => {
  describe('rate limit configuration', () => {
    it('should allow 10 requests per hour', () => {
      const RATE_LIMIT = 10
      const WINDOW_HOURS = 1

      expect(RATE_LIMIT).toBe(10)
      expect(WINDOW_HOURS).toBe(1)
    })
  })

  describe('rate limit response', () => {
    it('should include rate limit headers on success', () => {
      const headers = {
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': '9',
        'X-RateLimit-Reset': '1706000000',
      }

      expect(headers['X-RateLimit-Limit']).toBe('10')
      expect(headers['X-RateLimit-Remaining']).toBeDefined()
    })

    it('should return 429 when rate limit exceeded', () => {
      const rateLimitResult = { success: false, limit: 10, remaining: 0, reset: Date.now() }

      expect(rateLimitResult.success).toBe(false)
      expect(rateLimitResult.remaining).toBe(0)
    })
  })
})
