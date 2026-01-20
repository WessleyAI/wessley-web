import Stripe from 'stripe'

/**
 * Stripe client configuration for Wessley.ai billing.
 *
 * Server-side only - never import this in client components.
 * Uses environment variables for secure key management.
 */

// Initialize Stripe client lazily to avoid build errors when env vars aren't set
let _stripe: Stripe | null = null

/**
 * Get the Stripe client instance.
 * Throws an error if STRIPE_SECRET_KEY is not configured.
 * Use this function instead of direct `stripe` access for better error handling.
 */
export function getStripe(): Stripe {
  if (!_stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error(
        'STRIPE_SECRET_KEY is not set. Please add it to your environment variables.'
      )
    }
    _stripe = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  }
  return _stripe
}

/**
 * Direct access to stripe instance.
 * Returns null during build when STRIPE_SECRET_KEY is not set.
 * Runtime code should use getStripe() which throws a helpful error.
 */
export const stripe: Stripe = (process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  : null) as Stripe

/**
 * Subscription tiers available in Wessley.ai
 *
 * Based on specs/billing.md:
 * - free: No access to paid features
 * - insiders: $9.99/mo - Early adopter tier
 * - pro: $29.99/mo - Professional mechanics
 * - enterprise: Custom pricing - Fleet/dealer
 */
export type SubscriptionTier = 'free' | 'insiders' | 'pro' | 'enterprise'

/**
 * Stripe price IDs for each subscription tier.
 * These must be created in the Stripe Dashboard and the IDs added to .env
 */
export const STRIPE_PRICES: Record<Exclude<SubscriptionTier, 'free'>, string> = {
  insiders: process.env.STRIPE_PRICE_INSIDERS || '',
  pro: process.env.STRIPE_PRICE_PRO || '',
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE || '',
}

/**
 * Subscription status values tracked in the database.
 * Maps to Stripe subscription statuses.
 */
export type SubscriptionStatus = 'active' | 'inactive' | 'expired' | 'past_due' | 'trial'

/**
 * Check if a tier has a valid price configured.
 */
export function hasPriceConfigured(tier: SubscriptionTier): boolean {
  if (tier === 'free') return true
  return !!STRIPE_PRICES[tier]
}

/**
 * Get the Stripe price ID for a tier.
 * Returns null for free tier or unconfigured tiers.
 */
export function getPriceId(tier: SubscriptionTier): string | null {
  if (tier === 'free') return null
  const priceId = STRIPE_PRICES[tier]
  return priceId || null
}

/**
 * Pricing information for the UI (no sensitive data).
 * This can be imported in client components safely.
 */
export const PRICING_INFO = {
  free: {
    name: 'Free',
    price: 0,
    interval: null,
    features: [
      'View demo projects',
      'Limited AI chat (5 messages/day)',
      'Basic 3D viewer',
    ],
  },
  insiders: {
    name: 'Insiders',
    price: 9.99,
    interval: 'month' as const,
    features: [
      'Unlimited AI chat',
      'Up to 5 vehicles',
      '3D schematic viewer',
      'Basic exports (PDF)',
      'Email support',
    ],
  },
  pro: {
    name: 'Pro',
    price: 29.99,
    interval: 'month' as const,
    features: [
      'Everything in Insiders',
      'Unlimited vehicles',
      'ML schematic analysis',
      'Advanced exports (CAD, Mermaid)',
      'API access',
      'Priority support',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: null, // Contact for pricing
    interval: null,
    features: [
      'Everything in Pro',
      'Custom integrations',
      'Fleet management',
      'Dedicated account manager',
      'SLA guarantees',
      'On-premise option',
    ],
  },
} as const

/**
 * Demo workspace ID that bypasses subscription checks.
 * This allows marketing demos without authentication.
 */
export const DEMO_WORKSPACE_ID = 'cde0ea8e-07aa-4c59-a72b-ba0d56020484'
