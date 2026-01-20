import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  checkRateLimit,
  getRateLimitIdentifier,
  createRateLimitResponse,
  addRateLimitHeaders,
  RateLimitResult,
} from './rate-limit'

describe('checkRateLimit', () => {
  it('returns success with -1 values when rate limiter is null', async () => {
    const result = await checkRateLimit(null, 'test-identifier')

    expect(result).toEqual({
      success: true,
      limit: -1,
      remaining: -1,
      reset: -1,
    })
  })
})

describe('getRateLimitIdentifier', () => {
  it('returns user identifier when userId is provided', () => {
    const mockRequest = new Request('https://example.com')
    const result = getRateLimitIdentifier('user-123', mockRequest)

    expect(result).toBe('user:user-123')
  })

  it('returns IP identifier from x-forwarded-for header', () => {
    const mockRequest = new Request('https://example.com', {
      headers: {
        'x-forwarded-for': '192.168.1.1, 10.0.0.1',
      },
    })
    const result = getRateLimitIdentifier(undefined, mockRequest)

    expect(result).toBe('ip:192.168.1.1')
  })

  it('returns IP identifier from x-real-ip header when no x-forwarded-for', () => {
    const mockRequest = new Request('https://example.com', {
      headers: {
        'x-real-ip': '192.168.1.100',
      },
    })
    const result = getRateLimitIdentifier(undefined, mockRequest)

    expect(result).toBe('ip:192.168.1.100')
  })

  it('returns anonymous when no user or IP headers present', () => {
    const mockRequest = new Request('https://example.com')
    const result = getRateLimitIdentifier(undefined, mockRequest)

    expect(result).toBe('ip:anonymous')
  })

  it('prefers userId over IP headers', () => {
    const mockRequest = new Request('https://example.com', {
      headers: {
        'x-forwarded-for': '192.168.1.1',
        'x-real-ip': '192.168.1.100',
      },
    })
    const result = getRateLimitIdentifier('user-456', mockRequest)

    expect(result).toBe('user:user-456')
  })
})

describe('createRateLimitResponse', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'))
  })

  it('creates 429 response with proper status', async () => {
    const result: RateLimitResult = {
      success: false,
      limit: 60,
      remaining: 0,
      reset: Date.now() + 30000, // 30 seconds from now
    }

    const response = createRateLimitResponse(result)

    expect(response.status).toBe(429)
  })

  it('includes rate limit headers', async () => {
    const result: RateLimitResult = {
      success: false,
      limit: 60,
      remaining: 0,
      reset: Date.now() + 30000,
    }

    const response = createRateLimitResponse(result)

    expect(response.headers.get('X-RateLimit-Limit')).toBe('60')
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
    expect(response.headers.get('Content-Type')).toBe('application/json')
  })

  it('calculates correct retry-after value', async () => {
    const result: RateLimitResult = {
      success: false,
      limit: 60,
      remaining: 0,
      reset: Date.now() + 45000, // 45 seconds from now
    }

    const response = createRateLimitResponse(result)

    expect(response.headers.get('Retry-After')).toBe('45')
  })

  it('returns proper JSON body', async () => {
    const result: RateLimitResult = {
      success: false,
      limit: 60,
      remaining: 0,
      reset: Date.now() + 30000,
    }

    const response = createRateLimitResponse(result)
    const body = await response.json()

    expect(body.error).toBe('rate_limited')
    expect(body.message).toBe('Too many requests. Please try again later.')
    expect(body.retry_after).toBe(30)
  })
})

describe('addRateLimitHeaders', () => {
  it('returns original response when rate limiting not configured', () => {
    const originalResponse = new Response('test body', { status: 200 })
    const result: RateLimitResult = {
      success: true,
      limit: -1,
      remaining: -1,
      reset: -1,
    }

    const newResponse = addRateLimitHeaders(originalResponse, result)

    expect(newResponse).toBe(originalResponse)
  })

  it('adds rate limit headers to response', async () => {
    const originalResponse = new Response('test body', {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const result: RateLimitResult = {
      success: true,
      limit: 60,
      remaining: 55,
      reset: 1705323600000,
    }

    const newResponse = addRateLimitHeaders(originalResponse, result)

    expect(newResponse.headers.get('X-RateLimit-Limit')).toBe('60')
    expect(newResponse.headers.get('X-RateLimit-Remaining')).toBe('55')
    expect(newResponse.headers.get('X-RateLimit-Reset')).toBe('1705323600000')
    expect(newResponse.headers.get('Content-Type')).toBe('application/json')
  })

  it('preserves original response status', async () => {
    const originalResponse = new Response('created', { status: 201 })
    const result: RateLimitResult = {
      success: true,
      limit: 60,
      remaining: 59,
      reset: 1705323600000,
    }

    const newResponse = addRateLimitHeaders(originalResponse, result)

    expect(newResponse.status).toBe(201)
  })

  it('preserves response body', async () => {
    const originalResponse = new Response(JSON.stringify({ data: 'test' }), {
      status: 200,
    })
    const result: RateLimitResult = {
      success: true,
      limit: 60,
      remaining: 59,
      reset: 1705323600000,
    }

    const newResponse = addRateLimitHeaders(originalResponse, result)
    const body = await newResponse.json()

    expect(body).toEqual({ data: 'test' })
  })
})
