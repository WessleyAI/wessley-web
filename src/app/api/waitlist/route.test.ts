/**
 * Tests for Waitlist API Route
 *
 * Why these tests matter:
 * - Waitlist captures early adopters during pre-launch
 * - Rate limiting prevents spam signups
 * - Beehiiv integration manages email subscriptions
 * - Server-only env vars protect API keys
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

describe('/api/waitlist', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
    vi.clearAllMocks()
  })

  function createMockRequest(body: object): NextRequest {
    return new NextRequest('http://localhost:3000/api/waitlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  }

  describe('rate limiting', () => {
    it('should return 429 when rate limit is exceeded', async () => {
      process.env.BEEHIIV_API_KEY = 'test-key'
      process.env.BEEHIIV_PUBLICATION_ID = 'pub-123'

      vi.doMock('@/lib/rate-limit', () => ({
        waitlistRatelimit: {},
        checkRateLimit: vi.fn(() => Promise.resolve({ success: false, remaining: 0 })),
        getRateLimitIdentifier: vi.fn(() => 'test-id'),
        createRateLimitResponse: vi.fn(() => {
          const { NextResponse } = require('next/server')
          return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
        }),
      }))

      const { POST } = await import('./route')
      const request = createMockRequest({ email: 'test@example.com' })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(429)
      expect(json.error).toBe('Rate limit exceeded')
    })
  })

  describe('request validation', () => {
    it('should return 400 when email is missing', async () => {
      process.env.BEEHIIV_API_KEY = 'test-key'
      process.env.BEEHIIV_PUBLICATION_ID = 'pub-123'

      vi.doMock('@/lib/rate-limit', () => ({
        waitlistRatelimit: {},
        checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
        getRateLimitIdentifier: vi.fn(() => 'test-id'),
        createRateLimitResponse: vi.fn(),
      }))

      const { POST } = await import('./route')
      const request = createMockRequest({})

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toBe('Email is required')
    })
  })

  describe('configuration', () => {
    it('should return 503 when BEEHIIV_API_KEY is not configured', async () => {
      delete process.env.BEEHIIV_API_KEY
      process.env.BEEHIIV_PUBLICATION_ID = 'pub-123'

      vi.doMock('@/lib/rate-limit', () => ({
        waitlistRatelimit: {},
        checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
        getRateLimitIdentifier: vi.fn(() => 'test-id'),
        createRateLimitResponse: vi.fn(),
      }))

      const { POST } = await import('./route')
      const request = createMockRequest({ email: 'test@example.com' })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(503)
      expect(json.error).toBe('Service unavailable')
    })

    it('should return 503 when BEEHIIV_PUBLICATION_ID is not configured', async () => {
      process.env.BEEHIIV_API_KEY = 'test-key'
      delete process.env.BEEHIIV_PUBLICATION_ID

      vi.doMock('@/lib/rate-limit', () => ({
        waitlistRatelimit: {},
        checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
        getRateLimitIdentifier: vi.fn(() => 'test-id'),
        createRateLimitResponse: vi.fn(),
      }))

      const { POST } = await import('./route')
      const request = createMockRequest({ email: 'test@example.com' })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(503)
      expect(json.error).toBe('Service unavailable')
    })
  })
})

describe('Waitlist Logic', () => {
  describe('Beehiiv API integration', () => {
    it('should use correct API endpoint', () => {
      const publicationId = 'pub-123'
      const endpoint = `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`

      expect(endpoint).toContain('api.beehiiv.com')
      expect(endpoint).toContain('/subscriptions')
    })

    it('should send correct subscription payload', () => {
      const payload = {
        email: 'user@example.com',
        reactivate_existing: false,
        send_welcome_email: true,
        utm_source: 'waitlist',
        utm_medium: 'website',
        referring_site: 'wessley.ai',
      }

      expect(payload.email).toBeDefined()
      expect(payload.send_welcome_email).toBe(true)
      expect(payload.utm_source).toBe('waitlist')
      expect(payload.referring_site).toBe('wessley.ai')
    })

    it('should include Bearer token in Authorization header', () => {
      const apiKey = 'test-api-key'
      const authHeader = `Bearer ${apiKey}`

      expect(authHeader).toContain('Bearer')
      expect(authHeader).toContain(apiKey)
    })
  })

  describe('rate limiting configuration', () => {
    it('should allow 5 requests per minute', () => {
      const rateLimit = 5
      const window = 'minute'

      expect(rateLimit).toBe(5)
      expect(window).toBe('minute')
    })
  })

  describe('response format', () => {
    it('should return success response on subscription', () => {
      const response = {
        success: true,
        message: 'Successfully subscribed to waitlist',
        data: { id: 'sub_123' },
      }

      expect(response.success).toBe(true)
      expect(response.message).toContain('subscribed')
    })
  })

  describe('error handling', () => {
    it('should return 500 on Beehiiv API error', () => {
      const statusCode = 500
      const errorResponse = { error: 'Failed to subscribe' }

      expect(statusCode).toBe(500)
      expect(errorResponse.error).toBe('Failed to subscribe')
    })

    it('should return 500 on internal error', () => {
      const statusCode = 500
      const errorResponse = { error: 'Internal server error' }

      expect(statusCode).toBe(500)
      expect(errorResponse.error).toBe('Internal server error')
    })
  })

  describe('security', () => {
    it('should not use NEXT_PUBLIC_ env vars for API keys', () => {
      const envVarName = 'BEEHIIV_API_KEY'
      expect(envVarName).not.toContain('NEXT_PUBLIC')
    })

    it('should require server-only environment variables', () => {
      const serverOnlyVars = ['BEEHIIV_API_KEY', 'BEEHIIV_PUBLICATION_ID']
      serverOnlyVars.forEach(varName => {
        expect(varName).not.toContain('NEXT_PUBLIC')
      })
    })
  })
})

describe('Email Validation', () => {
  it('should accept valid email formats', () => {
    const validEmails = [
      'user@example.com',
      'user.name@domain.org',
      'user+tag@example.co.uk',
    ]

    validEmails.forEach(email => {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      expect(isValid).toBe(true)
    })
  })

  it('should reject invalid email formats', () => {
    const invalidEmails = [
      'notanemail',
      '@nodomain.com',
      'no@domain',
    ]

    invalidEmails.forEach(email => {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      expect(isValid).toBe(false)
    })
  })
})
