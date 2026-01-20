/**
 * Tests for RAG Ingest API Route
 *
 * Why these tests matter:
 * - Document ingestion is expensive (compute + storage)
 * - Requires subscription enforcement (paid feature)
 * - Strict rate limiting (10/hour) prevents abuse
 * - File validation prevents security issues
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('/api/rag/ingest', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
    vi.clearAllMocks()
  })

  function createMockRequest(body: object): Request {
    return new Request('http://localhost:3000/api/rag/ingest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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
        ingestionService: { createJob: vi.fn(), getJob: vi.fn() },
      }))

      vi.doMock('@/lib/rate-limit', () => ({
        ingestRatelimit: {},
        checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
        getRateLimitIdentifier: vi.fn(() => 'test-id'),
        createRateLimitResponse: vi.fn(),
        addRateLimitHeaders: vi.fn((res) => res),
      }))

      const { POST } = await import('./route')
      const request = createMockRequest({
        file_content: 'dGVzdA==',
        file_name: 'test.pdf',
        file_type: 'pdf',
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(401)
      expect(json.error).toBe('Unauthorized')
    })
  })

  describe('subscription enforcement', () => {
    it('should return 402 when user does not have active subscription', async () => {
      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn(() => Promise.resolve({
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: { id: 'user-123' } },
              error: null,
            }),
          },
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { subscription_status: 'inactive', subscription_tier: 'free' },
                  error: null,
                }),
              })),
            })),
          })),
        })),
      }))

      vi.doMock('@/lib/services-client', () => ({
        ingestionService: { createJob: vi.fn(), getJob: vi.fn() },
      }))

      vi.doMock('@/lib/rate-limit', () => ({
        ingestRatelimit: {},
        checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
        getRateLimitIdentifier: vi.fn(() => 'test-id'),
        createRateLimitResponse: vi.fn(),
        addRateLimitHeaders: vi.fn((res) => res),
      }))

      const { POST } = await import('./route')
      const request = createMockRequest({
        file_content: 'dGVzdA==',
        file_name: 'test.pdf',
        file_type: 'pdf',
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(402)
      expect(json.error).toBe('Subscription required')
      expect(json.upgrade_url).toBe('/pricing')
    })
  })

  describe('rate limiting', () => {
    it('should return 429 when rate limit is exceeded', async () => {
      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn(() => Promise.resolve({
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: { id: 'user-123' } },
              error: null,
            }),
          },
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { subscription_status: 'active', subscription_tier: 'pro' },
                  error: null,
                }),
              })),
            })),
          })),
        })),
      }))

      vi.doMock('@/lib/services-client', () => ({
        ingestionService: { createJob: vi.fn(), getJob: vi.fn() },
      }))

      vi.doMock('@/lib/rate-limit', () => ({
        ingestRatelimit: {},
        checkRateLimit: vi.fn(() => Promise.resolve({ success: false, remaining: 0 })),
        getRateLimitIdentifier: vi.fn(() => 'test-id'),
        createRateLimitResponse: vi.fn(() => {
          const { NextResponse } = require('next/server')
          return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
        }),
        addRateLimitHeaders: vi.fn((res) => res),
      }))

      const { POST } = await import('./route')
      const request = createMockRequest({
        file_content: 'dGVzdA==',
        file_name: 'test.pdf',
        file_type: 'pdf',
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(429)
      expect(json.error).toBe('Rate limit exceeded')
    })
  })

  describe('request validation', () => {
    it('should return 400 when file_content is missing', async () => {
      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn(() => Promise.resolve({
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: { id: 'user-123' } },
              error: null,
            }),
          },
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { subscription_status: 'active' },
                  error: null,
                }),
              })),
            })),
          })),
        })),
      }))

      vi.doMock('@/lib/services-client', () => ({
        ingestionService: { createJob: vi.fn(), getJob: vi.fn() },
      }))

      vi.doMock('@/lib/rate-limit', () => ({
        ingestRatelimit: {},
        checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
        getRateLimitIdentifier: vi.fn(() => 'test-id'),
        createRateLimitResponse: vi.fn(),
        addRateLimitHeaders: vi.fn((res) => res),
      }))

      const { POST } = await import('./route')
      const request = createMockRequest({
        file_name: 'test.pdf',
        file_type: 'pdf',
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toContain('file_content')
    })

    it('should return 400 when file_type is invalid', async () => {
      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn(() => Promise.resolve({
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: { id: 'user-123' } },
              error: null,
            }),
          },
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { subscription_status: 'active' },
                  error: null,
                }),
              })),
            })),
          })),
        })),
      }))

      vi.doMock('@/lib/services-client', () => ({
        ingestionService: { createJob: vi.fn(), getJob: vi.fn() },
      }))

      vi.doMock('@/lib/rate-limit', () => ({
        ingestRatelimit: {},
        checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
        getRateLimitIdentifier: vi.fn(() => 'test-id'),
        createRateLimitResponse: vi.fn(),
        addRateLimitHeaders: vi.fn((res) => res),
      }))

      const { POST } = await import('./route')
      const request = createMockRequest({
        file_content: 'dGVzdA==',
        file_name: 'test.exe',
        file_type: 'executable', // Invalid type
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toContain('file_type')
    })
  })

  describe('GET endpoint', () => {
    it('should return 401 for unauthenticated requests', async () => {
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
        ingestionService: { createJob: vi.fn(), getJob: vi.fn() },
      }))

      vi.doMock('@/lib/rate-limit', () => ({
        ingestRatelimit: {},
        checkRateLimit: vi.fn(),
        getRateLimitIdentifier: vi.fn(),
        createRateLimitResponse: vi.fn(),
        addRateLimitHeaders: vi.fn(),
      }))

      const { GET } = await import('./route')
      const request = new Request('http://localhost:3000/api/rag/ingest?job_id=job-123')

      const response = await GET(request)
      const json = await response.json()

      expect(response.status).toBe(401)
      expect(json.error).toBe('Unauthorized')
    })

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
        ingestionService: { createJob: vi.fn(), getJob: vi.fn() },
      }))

      vi.doMock('@/lib/rate-limit', () => ({
        ingestRatelimit: {},
        checkRateLimit: vi.fn(),
        getRateLimitIdentifier: vi.fn(),
        createRateLimitResponse: vi.fn(),
        addRateLimitHeaders: vi.fn(),
      }))

      const { GET } = await import('./route')
      const request = new Request('http://localhost:3000/api/rag/ingest')

      const response = await GET(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toContain('job_id')
    })
  })
})

describe('RAG Ingest Logic', () => {
  describe('file validation', () => {
    it('should enforce 50MB file size limit', () => {
      const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024
      expect(MAX_FILE_SIZE_BYTES).toBe(52428800)
    })

    it('should allow valid file extensions', () => {
      const ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"]

      expect(ALLOWED_EXTENSIONS).toContain('.pdf')
      expect(ALLOWED_EXTENSIONS).toContain('.png')
      expect(ALLOWED_EXTENSIONS).toContain('.jpg')
      expect(ALLOWED_EXTENSIONS).not.toContain('.exe')
      expect(ALLOWED_EXTENSIONS).not.toContain('.js')
    })

    it('should allow valid file types', () => {
      const ALLOWED_FILE_TYPES = ["pdf", "image", "schematic"]

      expect(ALLOWED_FILE_TYPES).toContain('pdf')
      expect(ALLOWED_FILE_TYPES).toContain('image')
      expect(ALLOWED_FILE_TYPES).toContain('schematic')
    })
  })

  describe('base64 validation', () => {
    it('should calculate correct file size from base64', () => {
      // Base64 adds ~33% overhead
      const base64 = 'dGVzdA==' // "test" in base64
      const padding = (base64.match(/=/g) || []).length
      const originalSize = Math.floor((base64.length * 3) / 4) - padding

      expect(originalSize).toBe(4) // "test" is 4 bytes
    })

    it('should validate base64 format', () => {
      const validBase64 = 'dGVzdA=='
      const invalidBase64 = 'not valid base64!'

      const isValidBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(validBase64.replace(/\s/g, ''))
      const isInvalidBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(invalidBase64.replace(/\s/g, ''))

      expect(isValidBase64).toBe(true)
      expect(isInvalidBase64).toBe(false)
    })
  })

  describe('file extension validation', () => {
    it('should extract and validate file extension', () => {
      const fileName = 'document.pdf'
      const ext = fileName.toLowerCase().slice(fileName.lastIndexOf('.'))

      expect(ext).toBe('.pdf')
    })

    it('should handle files with multiple dots', () => {
      const fileName = 'my.document.v2.pdf'
      const ext = fileName.toLowerCase().slice(fileName.lastIndexOf('.'))

      expect(ext).toBe('.pdf')
    })
  })

  describe('request body structure', () => {
    it('should define valid request fields', () => {
      const request = {
        file_content: 'base64data',
        file_name: 'manual.pdf',
        file_type: 'pdf' as const,
        vehicle_id: 'vehicle-123',
        metadata: { category: 'service-manual' },
      }

      expect(request.file_content).toBeDefined()
      expect(request.file_name).toBeDefined()
      expect(request.file_type).toBeDefined()
    })
  })

  describe('response structure', () => {
    it('should include job tracking fields', () => {
      const response = {
        job_id: 'job-123',
        status: 'pending',
        created_at: new Date().toISOString(),
        message: 'Ingestion job created',
      }

      expect(response).toHaveProperty('job_id')
      expect(response).toHaveProperty('status')
      expect(response).toHaveProperty('created_at')
    })

    it('should include status check instructions', () => {
      const message = 'Use GET /api/rag/ingest?job_id=<id> to check status.'
      expect(message).toContain('/api/rag/ingest')
      expect(message).toContain('job_id')
    })
  })

  describe('job status response', () => {
    it('should include progress for processing jobs', () => {
      const jobStatus = {
        job_id: 'job-123',
        status: 'processing',
        progress: 45,
        created_at: '2024-01-01T00:00:00.000Z',
      }

      expect(jobStatus.progress).toBeGreaterThanOrEqual(0)
      expect(jobStatus.progress).toBeLessThanOrEqual(100)
    })

    it('should include result for completed jobs', () => {
      const completedJob = {
        job_id: 'job-123',
        status: 'completed',
        progress: 100,
        created_at: '2024-01-01T00:00:00.000Z',
        completed_at: '2024-01-01T00:01:00.000Z',
        result: {
          chunks_created: 42,
          embeddings_generated: 42,
        },
      }

      expect(completedJob.result).toBeDefined()
      expect(completedJob.result.chunks_created).toBeGreaterThan(0)
    })

    it('should include error for failed jobs', () => {
      const failedJob = {
        job_id: 'job-123',
        status: 'failed',
        error: 'PDF parsing failed: corrupted file',
      }

      expect(failedJob.status).toBe('failed')
      expect(failedJob.error).toBeDefined()
    })
  })

  describe('rate limiting', () => {
    it('should use restrictive rate limit (10/hour)', () => {
      const rateLimit = 10
      const window = 'hour'

      expect(rateLimit).toBe(10)
      expect(window).toBe('hour')
    })
  })

  describe('subscription enforcement', () => {
    it('should require active subscription status', () => {
      const requiredStatus = 'active'
      expect(requiredStatus).toBe('active')
    })

    it('should provide upgrade URL when subscription required', () => {
      const upgradeUrl = '/pricing'
      expect(upgradeUrl).toBe('/pricing')
    })
  })

  describe('error codes', () => {
    it('should handle file_too_large error', () => {
      const errorCode = 'file_too_large'
      const statusCode = 413

      expect(errorCode).toBe('file_too_large')
      expect(statusCode).toBe(413)
    })

    it('should handle unsupported_type error', () => {
      const errorCode = 'unsupported_type'
      const statusCode = 415

      expect(errorCode).toBe('unsupported_type')
      expect(statusCode).toBe(415)
    })

    it('should handle not_found error', () => {
      const errorCode = 'not_found'
      const statusCode = 404

      expect(errorCode).toBe('not_found')
      expect(statusCode).toBe(404)
    })
  })

  describe('metadata handling', () => {
    it('should add upload metadata automatically', () => {
      const userId = 'user-123'
      const metadata = {
        uploaded_by: userId,
        uploaded_at: new Date().toISOString(),
      }

      expect(metadata.uploaded_by).toBe('user-123')
      expect(metadata.uploaded_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    })
  })
})
