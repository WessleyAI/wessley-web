/**
 * Tests for Stripe billing utilities
 *
 * These tests verify the Stripe client configuration, pricing utilities,
 * and tier management functions that power Wessley.ai's subscription billing.
 *
 * Why these tests matter:
 * - Billing is critical infrastructure - errors mean lost revenue or user frustration
 * - Price ID validation prevents checkout failures
 * - Tier management affects feature access throughout the app
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Stripe as a constructor class before importing the module
vi.mock('stripe', () => {
  class MockStripe {
    _key: string
    _config: Record<string, unknown>
    customers = {
      create: vi.fn(),
      retrieve: vi.fn(),
    }
    checkout = {
      sessions: {
        create: vi.fn(),
      },
    }
    billingPortal = {
      sessions: {
        create: vi.fn(),
      },
    }
    webhooks = {
      constructEvent: vi.fn(),
    }

    constructor(key: string, config: Record<string, unknown>) {
      this._key = key
      this._config = config
    }
  }

  return {
    default: MockStripe,
  }
})

describe('stripe.ts', () => {
  // Store original env
  const originalEnv = process.env

  beforeEach(() => {
    // Reset modules to clear cached stripe instance
    vi.resetModules()
    // Reset env
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('getStripe()', () => {
    it('should throw error when STRIPE_SECRET_KEY is not set', async () => {
      delete process.env.STRIPE_SECRET_KEY

      const { getStripe } = await import('./stripe')

      expect(() => getStripe()).toThrow('STRIPE_SECRET_KEY is not set')
      expect(() => getStripe()).toThrow('Please add it to your environment variables')
    })

    it('should create Stripe client when key is configured', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'

      const { getStripe } = await import('./stripe')
      const stripe = getStripe()

      expect(stripe).toBeDefined()
      expect(stripe._key).toBe('sk_test_123')
    })

    it('should use correct API version', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'

      const { getStripe } = await import('./stripe')
      const stripe = getStripe()

      expect(stripe._config.apiVersion).toBe('2025-12-15.clover')
    })

    it('should enable TypeScript mode', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'

      const { getStripe } = await import('./stripe')
      const stripe = getStripe()

      expect(stripe._config.typescript).toBe(true)
    })

    it('should return the same instance on multiple calls (singleton)', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'

      const { getStripe } = await import('./stripe')
      const stripe1 = getStripe()
      const stripe2 = getStripe()

      expect(stripe1).toBe(stripe2)
    })
  })

  describe('stripe export', () => {
    it('should be null when STRIPE_SECRET_KEY is not set', async () => {
      delete process.env.STRIPE_SECRET_KEY

      const { stripe } = await import('./stripe')

      expect(stripe).toBeNull()
    })

    it('should be a Stripe instance when key is configured', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_456'

      const { stripe } = await import('./stripe')

      expect(stripe).toBeDefined()
      expect(stripe._key).toBe('sk_test_456')
    })
  })

  describe('SubscriptionTier type', () => {
    it('should include all expected tier values', async () => {
      const { PRICING_INFO } = await import('./stripe')

      // Verify all tiers are represented in PRICING_INFO
      expect(PRICING_INFO).toHaveProperty('free')
      expect(PRICING_INFO).toHaveProperty('insiders')
      expect(PRICING_INFO).toHaveProperty('pro')
      expect(PRICING_INFO).toHaveProperty('enterprise')
    })
  })

  describe('STRIPE_PRICES', () => {
    it('should include insiders tier', async () => {
      process.env.STRIPE_PRICE_INSIDERS = 'price_insiders_123'

      const { STRIPE_PRICES } = await import('./stripe')

      expect(STRIPE_PRICES).toHaveProperty('insiders')
    })

    it('should include pro tier', async () => {
      process.env.STRIPE_PRICE_PRO = 'price_pro_123'

      const { STRIPE_PRICES } = await import('./stripe')

      expect(STRIPE_PRICES).toHaveProperty('pro')
    })

    it('should include enterprise tier', async () => {
      process.env.STRIPE_PRICE_ENTERPRISE = 'price_enterprise_123'

      const { STRIPE_PRICES } = await import('./stripe')

      expect(STRIPE_PRICES).toHaveProperty('enterprise')
    })

    it('should NOT include free tier', async () => {
      const { STRIPE_PRICES } = await import('./stripe')

      expect(STRIPE_PRICES).not.toHaveProperty('free')
    })

    it('should use empty string for unconfigured price IDs', async () => {
      delete process.env.STRIPE_PRICE_INSIDERS
      delete process.env.STRIPE_PRICE_PRO
      delete process.env.STRIPE_PRICE_ENTERPRISE

      const { STRIPE_PRICES } = await import('./stripe')

      expect(STRIPE_PRICES.insiders).toBe('')
      expect(STRIPE_PRICES.pro).toBe('')
      expect(STRIPE_PRICES.enterprise).toBe('')
    })

    it('should use environment variable values when set', async () => {
      process.env.STRIPE_PRICE_INSIDERS = 'price_insiders_test'
      process.env.STRIPE_PRICE_PRO = 'price_pro_test'
      process.env.STRIPE_PRICE_ENTERPRISE = 'price_enterprise_test'

      const { STRIPE_PRICES } = await import('./stripe')

      expect(STRIPE_PRICES.insiders).toBe('price_insiders_test')
      expect(STRIPE_PRICES.pro).toBe('price_pro_test')
      expect(STRIPE_PRICES.enterprise).toBe('price_enterprise_test')
    })
  })

  describe('SubscriptionStatus type', () => {
    it('should support all expected status values', async () => {
      // Type-level test - if this compiles, the types are correct
      const statuses: Array<'active' | 'inactive' | 'expired' | 'past_due' | 'trial'> = [
        'active',
        'inactive',
        'expired',
        'past_due',
        'trial',
      ]

      expect(statuses).toHaveLength(5)
    })
  })

  describe('hasPriceConfigured()', () => {
    it('should return true for free tier', async () => {
      const { hasPriceConfigured } = await import('./stripe')

      expect(hasPriceConfigured('free')).toBe(true)
    })

    it('should return false for unconfigured paid tier', async () => {
      delete process.env.STRIPE_PRICE_INSIDERS

      const { hasPriceConfigured } = await import('./stripe')

      expect(hasPriceConfigured('insiders')).toBe(false)
    })

    it('should return true for configured paid tier', async () => {
      process.env.STRIPE_PRICE_PRO = 'price_pro_configured'

      const { hasPriceConfigured } = await import('./stripe')

      expect(hasPriceConfigured('pro')).toBe(true)
    })

    it('should handle empty string as unconfigured', async () => {
      process.env.STRIPE_PRICE_ENTERPRISE = ''

      const { hasPriceConfigured } = await import('./stripe')

      expect(hasPriceConfigured('enterprise')).toBe(false)
    })
  })

  describe('getPriceId()', () => {
    it('should return null for free tier', async () => {
      const { getPriceId } = await import('./stripe')

      expect(getPriceId('free')).toBeNull()
    })

    it('should return null for unconfigured paid tier', async () => {
      delete process.env.STRIPE_PRICE_INSIDERS

      const { getPriceId } = await import('./stripe')

      expect(getPriceId('insiders')).toBeNull()
    })

    it('should return price ID for configured tier', async () => {
      process.env.STRIPE_PRICE_PRO = 'price_pro_test_id'

      const { getPriceId } = await import('./stripe')

      expect(getPriceId('pro')).toBe('price_pro_test_id')
    })

    it('should return null for empty string price ID', async () => {
      process.env.STRIPE_PRICE_ENTERPRISE = ''

      const { getPriceId } = await import('./stripe')

      expect(getPriceId('enterprise')).toBeNull()
    })
  })

  describe('PRICING_INFO', () => {
    it('should have correct structure for free tier', async () => {
      const { PRICING_INFO } = await import('./stripe')

      expect(PRICING_INFO.free).toEqual({
        name: 'Free',
        price: 0,
        interval: null,
        features: expect.any(Array),
      })
    })

    it('should have correct pricing for insiders tier', async () => {
      const { PRICING_INFO } = await import('./stripe')

      expect(PRICING_INFO.insiders.name).toBe('Insiders')
      expect(PRICING_INFO.insiders.price).toBe(9.99)
      expect(PRICING_INFO.insiders.interval).toBe('month')
    })

    it('should have correct pricing for pro tier', async () => {
      const { PRICING_INFO } = await import('./stripe')

      expect(PRICING_INFO.pro.name).toBe('Pro')
      expect(PRICING_INFO.pro.price).toBe(29.99)
      expect(PRICING_INFO.pro.interval).toBe('month')
    })

    it('should have null price for enterprise tier (contact sales)', async () => {
      const { PRICING_INFO } = await import('./stripe')

      expect(PRICING_INFO.enterprise.name).toBe('Enterprise')
      expect(PRICING_INFO.enterprise.price).toBeNull()
      expect(PRICING_INFO.enterprise.interval).toBeNull()
    })

    it('should include features array for each tier', async () => {
      const { PRICING_INFO } = await import('./stripe')

      expect(Array.isArray(PRICING_INFO.free.features)).toBe(true)
      expect(Array.isArray(PRICING_INFO.insiders.features)).toBe(true)
      expect(Array.isArray(PRICING_INFO.pro.features)).toBe(true)
      expect(Array.isArray(PRICING_INFO.enterprise.features)).toBe(true)
    })

    it('should have non-empty features for all tiers', async () => {
      const { PRICING_INFO } = await import('./stripe')

      expect(PRICING_INFO.free.features.length).toBeGreaterThan(0)
      expect(PRICING_INFO.insiders.features.length).toBeGreaterThan(0)
      expect(PRICING_INFO.pro.features.length).toBeGreaterThan(0)
      expect(PRICING_INFO.enterprise.features.length).toBeGreaterThan(0)
    })

    it('should have features that are strings', async () => {
      const { PRICING_INFO } = await import('./stripe')

      for (const tier of Object.values(PRICING_INFO)) {
        for (const feature of tier.features) {
          expect(typeof feature).toBe('string')
        }
      }
    })

    it('should show increasing value with higher tiers', async () => {
      const { PRICING_INFO } = await import('./stripe')

      // Pro should have more features than insiders
      expect(PRICING_INFO.pro.features.length).toBeGreaterThanOrEqual(
        PRICING_INFO.insiders.features.length
      )

      // Enterprise should have most features
      expect(PRICING_INFO.enterprise.features.length).toBeGreaterThanOrEqual(
        PRICING_INFO.pro.features.length
      )
    })

    it('should include "Everything in" reference for higher tiers', async () => {
      const { PRICING_INFO } = await import('./stripe')

      // Pro should reference Insiders
      expect(PRICING_INFO.pro.features.some(f =>
        f.toLowerCase().includes('everything in insiders')
      )).toBe(true)

      // Enterprise should reference Pro
      expect(PRICING_INFO.enterprise.features.some(f =>
        f.toLowerCase().includes('everything in pro')
      )).toBe(true)
    })
  })

  describe('DEMO_WORKSPACE_ID', () => {
    it('should be a valid UUID format', async () => {
      const { DEMO_WORKSPACE_ID } = await import('./stripe')

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      expect(DEMO_WORKSPACE_ID).toMatch(uuidRegex)
    })

    it('should be the expected demo workspace ID', async () => {
      const { DEMO_WORKSPACE_ID } = await import('./stripe')

      expect(DEMO_WORKSPACE_ID).toBe('cde0ea8e-07aa-4c59-a72b-ba0d56020484')
    })

    it('should be exported as a constant string', async () => {
      const { DEMO_WORKSPACE_ID } = await import('./stripe')

      expect(typeof DEMO_WORKSPACE_ID).toBe('string')
    })
  })

  describe('Feature consistency', () => {
    it('should mention key features for free tier', async () => {
      const { PRICING_INFO } = await import('./stripe')

      const freeFeatures = PRICING_INFO.free.features.join(' ').toLowerCase()

      // Free tier should mention limited/demo/basic
      expect(
        freeFeatures.includes('demo') ||
        freeFeatures.includes('limited') ||
        freeFeatures.includes('basic')
      ).toBe(true)
    })

    it('should mention unlimited for paid tiers', async () => {
      const { PRICING_INFO } = await import('./stripe')

      const insidersFeatures = PRICING_INFO.insiders.features.join(' ').toLowerCase()

      expect(insidersFeatures.includes('unlimited')).toBe(true)
    })

    it('should mention API access for pro tier', async () => {
      const { PRICING_INFO } = await import('./stripe')

      const proFeatures = PRICING_INFO.pro.features.join(' ').toLowerCase()

      expect(proFeatures.includes('api')).toBe(true)
    })

    it('should mention enterprise features like custom/dedicated/SLA', async () => {
      const { PRICING_INFO } = await import('./stripe')

      const enterpriseFeatures = PRICING_INFO.enterprise.features.join(' ').toLowerCase()

      expect(
        enterpriseFeatures.includes('custom') ||
        enterpriseFeatures.includes('dedicated') ||
        enterpriseFeatures.includes('sla')
      ).toBe(true)
    })
  })

  describe('Edge cases', () => {
    it('should handle getPriceId with all tier values', async () => {
      const { getPriceId } = await import('./stripe')

      // Should not throw for any valid tier
      expect(() => getPriceId('free')).not.toThrow()
      expect(() => getPriceId('insiders')).not.toThrow()
      expect(() => getPriceId('pro')).not.toThrow()
      expect(() => getPriceId('enterprise')).not.toThrow()
    })

    it('should handle hasPriceConfigured with all tier values', async () => {
      const { hasPriceConfigured } = await import('./stripe')

      // Should not throw for any valid tier
      expect(() => hasPriceConfigured('free')).not.toThrow()
      expect(() => hasPriceConfigured('insiders')).not.toThrow()
      expect(() => hasPriceConfigured('pro')).not.toThrow()
      expect(() => hasPriceConfigured('enterprise')).not.toThrow()
    })
  })
})
