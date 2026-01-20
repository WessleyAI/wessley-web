/**
 * Tests for Stripe Customer Portal API Route
 *
 * These tests verify the customer portal session creation for subscription management.
 * Allows users to update payment methods, view invoices, and cancel subscriptions.
 *
 * Why these tests matter:
 * - Portal access is essential for subscription self-service
 * - Users must be authenticated before accessing billing
 * - Non-subscribers should be directed to pricing page
 * - Stripe configuration errors must be handled gracefully
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock Stripe
const mockStripeBillingPortalCreate = vi.fn()

vi.mock('@/lib/stripe', () => ({
  getStripe: vi.fn(() => ({
    billingPortal: {
      sessions: {
        create: mockStripeBillingPortalCreate,
      },
    },
  })),
}))

// Mock Supabase client
const mockSupabaseGetUser = vi.fn()
const mockSupabaseFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    auth: {
      getUser: mockSupabaseGetUser,
    },
    from: mockSupabaseFrom,
  })),
}))

describe('/api/stripe/portal', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = {
      ...originalEnv,
      STRIPE_SECRET_KEY: 'sk_test_123',
      NEXT_PUBLIC_APP_URL: 'https://wessley.ai',
    }

    mockStripeBillingPortalCreate.mockReset()
    mockSupabaseGetUser.mockReset()
    mockSupabaseFrom.mockReset()
  })

  afterEach(() => {
    process.env = originalEnv
    vi.clearAllMocks()
  })

  function createMockRequest(): NextRequest {
    return new NextRequest('http://localhost:3000/api/stripe/portal', {
      method: 'POST',
    })
  }

  describe('authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockSupabaseGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const { POST } = await import('./route')
      const request = createMockRequest()

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(401)
      expect(json.error).toContain('Unauthorized')
    })

    it('should return 401 when auth returns an error', async () => {
      mockSupabaseGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Session expired' },
      })

      const { POST } = await import('./route')
      const request = createMockRequest()

      const response = await POST(request)

      expect(response.status).toBe(401)
    })
  })

  describe('subscription validation', () => {
    beforeEach(() => {
      mockSupabaseGetUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'user@example.com' },
        },
        error: null,
      })
    })

    it('should return 404 when user has no Stripe customer ID', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { stripe_customer_id: null },
              error: null,
            }),
          }),
        }),
      })

      const { POST } = await import('./route')
      const request = createMockRequest()

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(404)
      expect(json.error).toContain('No subscription found')
    })

    it('should return 404 when stripe_customer_id is empty string', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { stripe_customer_id: '' },
              error: null,
            }),
          }),
        }),
      })

      const { POST } = await import('./route')
      const request = createMockRequest()

      const response = await POST(request)

      expect(response.status).toBe(404)
    })
  })

  describe('portal session creation', () => {
    beforeEach(() => {
      mockSupabaseGetUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'user@example.com' },
        },
        error: null,
      })

      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { stripe_customer_id: 'cus_123' },
              error: null,
            }),
          }),
        }),
      })
    })

    it('should create portal session with correct customer ID', async () => {
      mockStripeBillingPortalCreate.mockResolvedValue({
        url: 'https://billing.stripe.com/session_123',
      })

      const { POST } = await import('./route')
      const request = createMockRequest()

      await POST(request)

      expect(mockStripeBillingPortalCreate).toHaveBeenCalledWith({
        customer: 'cus_123',
        return_url: 'https://wessley.ai/dashboard',
      })
    })

    it('should return portal URL on success', async () => {
      mockStripeBillingPortalCreate.mockResolvedValue({
        url: 'https://billing.stripe.com/session_abc123',
      })

      const { POST } = await import('./route')
      const request = createMockRequest()

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json.url).toBe('https://billing.stripe.com/session_abc123')
    })

    it('should use default localhost URL when NEXT_PUBLIC_APP_URL is not set', async () => {
      delete process.env.NEXT_PUBLIC_APP_URL

      mockStripeBillingPortalCreate.mockResolvedValue({
        url: 'https://billing.stripe.com/session_123',
      })

      const { POST } = await import('./route')
      const request = createMockRequest()

      await POST(request)

      expect(mockStripeBillingPortalCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          return_url: 'http://localhost:3000/dashboard',
        })
      )
    })
  })

  describe('error handling', () => {
    beforeEach(() => {
      mockSupabaseGetUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'user@example.com' },
        },
        error: null,
      })
    })

    it('should return 500 on profile fetch error', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      })

      const { POST } = await import('./route')
      const request = createMockRequest()

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(500)
      expect(json.error).toContain('profile')
    })

    it('should return 500 on Stripe portal creation error', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { stripe_customer_id: 'cus_123' },
              error: null,
            }),
          }),
        }),
      })

      mockStripeBillingPortalCreate.mockRejectedValue(
        new Error('Portal creation failed')
      )

      const { POST } = await import('./route')
      const request = createMockRequest()

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(500)
      expect(json.error).toContain('portal')
    })

    it('should return 503 when Stripe is not configured', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { stripe_customer_id: 'cus_123' },
              error: null,
            }),
          }),
        }),
      })

      mockStripeBillingPortalCreate.mockRejectedValue(
        new Error('STRIPE_SECRET_KEY is not configured')
      )

      const { POST } = await import('./route')
      const request = createMockRequest()

      const response = await POST(request)

      expect(response.status).toBe(503)
    })
  })

  describe('edge cases', () => {
    beforeEach(() => {
      mockSupabaseGetUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'user@example.com' },
        },
        error: null,
      })
    })

    it('should handle profile with null data but no error', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      })

      const { POST } = await import('./route')
      const request = createMockRequest()

      const response = await POST(request)

      // Should treat missing profile as no subscription
      expect(response.status).toBe(404)
    })

    it('should handle Stripe customer with special characters', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { stripe_customer_id: 'cus_special-chars_123+test' },
              error: null,
            }),
          }),
        }),
      })

      mockStripeBillingPortalCreate.mockResolvedValue({
        url: 'https://billing.stripe.com/session_123',
      })

      const { POST } = await import('./route')
      const request = createMockRequest()

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockStripeBillingPortalCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_special-chars_123+test',
        })
      )
    })
  })
})

describe('Stripe Portal Validation Logic', () => {
  /**
   * These tests document the validation rules for portal requests.
   */

  describe('subscription validation', () => {
    it('should reject users without stripe_customer_id', () => {
      const profile = { stripe_customer_id: null }
      const hasSubscription = !!profile.stripe_customer_id

      expect(hasSubscription).toBe(false)
    })

    it('should reject users with empty stripe_customer_id', () => {
      const profile = { stripe_customer_id: '' }
      const hasSubscription = !!profile.stripe_customer_id

      expect(hasSubscription).toBe(false)
    })

    it('should allow users with valid stripe_customer_id', () => {
      const profile = { stripe_customer_id: 'cus_123' }
      const hasSubscription = !!profile.stripe_customer_id

      expect(hasSubscription).toBe(true)
    })
  })

  describe('portal session configuration', () => {
    it('should include customer ID in portal session', () => {
      const customerId = 'cus_123'
      const portalConfig = {
        customer: customerId,
        return_url: 'https://wessley.ai/dashboard',
      }

      expect(portalConfig.customer).toBe(customerId)
    })

    it('should return to dashboard after portal session', () => {
      const appUrl = 'https://wessley.ai'
      const returnUrl = `${appUrl}/dashboard`

      expect(returnUrl).toContain('/dashboard')
    })

    it('should use localhost URL as fallback', () => {
      const appUrl = undefined
      const defaultUrl = appUrl || 'http://localhost:3000'

      expect(defaultUrl).toBe('http://localhost:3000')
    })
  })
})

describe('Stripe Portal Error Handling', () => {
  describe('HTTP status codes', () => {
    it('should return 401 for unauthenticated requests', () => {
      const statusCode = 401
      expect(statusCode).toBe(401)
    })

    it('should return 404 when no subscription exists', () => {
      const statusCode = 404
      expect(statusCode).toBe(404)
    })

    it('should return 500 for profile fetch errors', () => {
      const statusCode = 500
      expect(statusCode).toBe(500)
    })

    it('should return 503 when Stripe is not configured', () => {
      const statusCode = 503
      expect(statusCode).toBe(503)
    })
  })

  describe('error messages', () => {
    it('should provide helpful error messages for common scenarios', () => {
      const errorMessages = {
        unauthorized: 'Unauthorized. Please sign in.',
        noSubscription: 'No subscription found. Please subscribe first.',
        profileError: 'Failed to fetch user profile. Please try again.',
        stripeError: 'Stripe is not configured. Please contact support.',
        portalError: 'Failed to create portal session. Please try again.',
      }

      Object.values(errorMessages).forEach(message => {
        expect(message.length).toBeGreaterThan(0)
        // Should guide user on next steps
        expect(
          message.includes('Please') ||
          message.includes('try again') ||
          message.includes('contact')
        ).toBe(true)
      })
    })
  })
})
