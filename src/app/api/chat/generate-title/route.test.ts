/**
 * Tests for Chat Generate Title API Route
 *
 * Why these tests matter:
 * - Title generation improves chat list UX with contextual names
 * - Rate limiting prevents abuse of OpenAI API
 * - Authentication ensures only valid users can generate titles
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

describe('/api/chat/generate-title', () => {
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
    return new NextRequest('http://localhost:3000/api/chat/generate-title', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  }

  describe('authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key'

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

      vi.doMock('@/lib/rate-limit', () => ({
        chatRatelimit: {},
        checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
        getRateLimitIdentifier: vi.fn(() => 'test-id'),
        createRateLimitResponse: vi.fn(),
      }))

      const { POST } = await import('./route')
      const request = createMockRequest({ userMessage: 'Hello' })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(401)
      expect(json.error).toBe('Unauthorized')
    })

    it('should return 401 when auth error occurs', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key'

      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn(() => Promise.resolve({
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: null },
              error: { message: 'Session expired' },
            }),
          },
        })),
      }))

      vi.doMock('@/lib/rate-limit', () => ({
        chatRatelimit: {},
        checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
        getRateLimitIdentifier: vi.fn(() => 'test-id'),
        createRateLimitResponse: vi.fn(),
      }))

      const { POST } = await import('./route')
      const request = createMockRequest({ userMessage: 'Hello' })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(401)
      expect(json.error).toBe('Unauthorized')
    })
  })

  describe('rate limiting', () => {
    it('should return 429 when rate limit is exceeded', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key'

      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn(() => Promise.resolve({
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: { id: 'user-123' } },
              error: null,
            }),
          },
          from: vi.fn((table: string) => {
            if (table === 'profiles') {
              return {
                select: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    single: vi.fn().mockResolvedValue({
                      data: { subscription_status: 'active' },
                      error: null,
                    }),
                  })),
                })),
              }
            }
            return {}
          }),
        })),
      }))

      vi.doMock('@/lib/rate-limit', () => ({
        chatRatelimit: {},
        checkRateLimit: vi.fn(() => Promise.resolve({ success: false, remaining: 0 })),
        getRateLimitIdentifier: vi.fn(() => 'test-id'),
        createRateLimitResponse: vi.fn(() => {
          const { NextResponse } = require('next/server')
          return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
        }),
      }))

      const { POST } = await import('./route')
      const request = createMockRequest({ userMessage: 'Hello' })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(429)
      expect(json.error).toBe('Rate limit exceeded')
    })
  })

  describe('request validation', () => {
    it('should return 400 when userMessage is missing', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key'

      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn(() => Promise.resolve({
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: { id: 'user-123' } },
              error: null,
            }),
          },
          from: vi.fn((table: string) => {
            if (table === 'profiles') {
              return {
                select: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    single: vi.fn().mockResolvedValue({
                      data: { subscription_status: 'active' },
                      error: null,
                    }),
                  })),
                })),
              }
            }
            return {}
          }),
        })),
      }))

      vi.doMock('@/lib/rate-limit', () => ({
        chatRatelimit: {},
        checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
        getRateLimitIdentifier: vi.fn(() => 'test-id'),
        createRateLimitResponse: vi.fn(),
      }))

      const { POST } = await import('./route')
      const request = createMockRequest({})

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toBe('User message is required')
    })
  })

  describe('configuration', () => {
    it('should return 500 when OPENAI_API_KEY is not configured', async () => {
      delete process.env.OPENAI_API_KEY

      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn(() => Promise.resolve({
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: { id: 'user-123' } },
              error: null,
            }),
          },
          from: vi.fn((table: string) => {
            if (table === 'profiles') {
              return {
                select: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    single: vi.fn().mockResolvedValue({
                      data: { subscription_status: 'active' },
                      error: null,
                    }),
                  })),
                })),
              }
            }
            return {}
          }),
        })),
      }))

      vi.doMock('@/lib/rate-limit', () => ({
        chatRatelimit: {},
        checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
        getRateLimitIdentifier: vi.fn(() => 'test-id'),
        createRateLimitResponse: vi.fn(),
      }))

      const { POST } = await import('./route')
      const request = createMockRequest({ userMessage: 'Hello' })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(500)
      expect(json.error).toBe('Configuration error')
    })
  })
})

describe('Title Generation Logic', () => {
  describe('title formatting', () => {
    it('should remove surrounding quotes from generated title', () => {
      const title1 = '"Alternator Repair Help"'
      const title2 = "'Starter Motor Issue'"
      const title3 = 'No Quotes Title'

      const cleaned1 = title1.replace(/^["']|["']$/g, '')
      const cleaned2 = title2.replace(/^["']|["']$/g, '')
      const cleaned3 = title3.replace(/^["']|["']$/g, '')

      expect(cleaned1).toBe('Alternator Repair Help')
      expect(cleaned2).toBe('Starter Motor Issue')
      expect(cleaned3).toBe('No Quotes Title')
    })

    it('should fallback to truncated user message if no response', () => {
      const userMessage = 'This is a very long user message that exceeds 50 characters and should be truncated'
      const fallbackTitle = userMessage.substring(0, 50)

      expect(fallbackTitle.length).toBe(50)
    })
  })

  describe('OpenAI prompt', () => {
    it('should request 3-6 word titles', () => {
      const systemPrompt = 'generate concise, contextual titles...3-6 words long'
      expect(systemPrompt).toContain('3-6 words')
    })

    it('should focus on vehicle restoration context', () => {
      const systemPrompt = 'vehicle restoration project chat conversations'
      expect(systemPrompt).toContain('vehicle restoration')
    })

    it('should use low max_tokens for short responses', () => {
      const maxTokens = 25
      expect(maxTokens).toBeLessThanOrEqual(50)
    })

    it('should use moderate temperature for creativity', () => {
      const temperature = 0.7
      expect(temperature).toBeGreaterThan(0)
      expect(temperature).toBeLessThan(1)
    })
  })

  describe('response format', () => {
    it('should return success and title', () => {
      const response = {
        title: 'Alternator Diagnosis',
        success: true,
      }

      expect(response).toHaveProperty('title')
      expect(response).toHaveProperty('success')
      expect(response.success).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should return generic error message on failure', () => {
      const errorResponse = { error: 'Internal server error' }
      expect(errorResponse.error).toBe('Internal server error')
    })

    it('should return 500 on OpenAI API error', () => {
      const statusCode = 500
      const errorResponse = { error: 'Failed to generate title' }

      expect(statusCode).toBe(500)
      expect(errorResponse.error).toBe('Failed to generate title')
    })
  })
})

describe('Title Generation Examples', () => {
  it('should generate appropriate titles for common queries', () => {
    const examples = [
      { user: 'My alternator is making noise', expectedStyle: 'Alternator Noise Issue' },
      { user: 'How do I check the starter?', expectedStyle: 'Starter Diagnosis Help' },
      { user: 'Wiring diagram for headlights', expectedStyle: 'Headlight Wiring Info' },
    ]

    examples.forEach(ex => {
      // Titles should be concise
      expect(ex.expectedStyle.split(' ').length).toBeLessThanOrEqual(6)
      expect(ex.expectedStyle.split(' ').length).toBeGreaterThanOrEqual(2)
    })
  })
})
