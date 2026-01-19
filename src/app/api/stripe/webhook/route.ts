import { NextRequest, NextResponse } from 'next/server'
import { getStripe, SubscriptionTier } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'

/**
 * POST /api/stripe/webhook
 *
 * Handles Stripe webhook events for subscription lifecycle management.
 * This endpoint receives events from Stripe and updates the database accordingly.
 *
 * Events handled:
 * - checkout.session.completed: New subscription created
 * - customer.subscription.updated: Subscription status changed
 * - customer.subscription.deleted: Subscription cancelled
 * - invoice.payment_failed: Payment failed (dunning)
 */
export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('[Stripe Webhook] Missing stripe-signature header')
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    )
  }

  let event: Stripe.Event
  const stripe = getStripe()

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Stripe Webhook] Signature verification failed:', message)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Use admin client to bypass RLS
  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        const userId = session.metadata?.supabase_user_id
        const tier = session.metadata?.tier as SubscriptionTier | undefined
        const subscriptionId = session.subscription as string | null
        const customerId = session.customer as string | null

        if (!userId) {
          console.error('[Stripe Webhook] checkout.session.completed missing user ID')
          break
        }

        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_tier: tier || 'pro',
            subscription_status: 'active',
            subscription_started_at: new Date().toISOString(),
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: customerId,
          })
          .eq('id', userId)

        if (error) {
          console.error('[Stripe Webhook] Failed to activate subscription:', error)
          throw error
        }

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by Stripe customer ID
        const { data: profile, error: findError } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (findError || !profile) {
          console.error('[Stripe Webhook] Could not find user for customer:', customerId)
          break
        }

        // Map Stripe status to our status
        let status: string
        switch (subscription.status) {
          case 'active':
          case 'trialing':
            status = 'active'
            break
          case 'past_due':
            status = 'past_due'
            break
          case 'canceled':
          case 'unpaid':
            status = 'inactive'
            break
          default:
            status = 'inactive'
        }

        // Get tier from subscription metadata
        const tier = subscription.metadata?.tier as SubscriptionTier | undefined

        const updateData: Record<string, unknown> = {
          subscription_status: status,
        }

        // Update tier if present in metadata
        if (tier) {
          updateData.subscription_tier = tier
        }

        // Update expiry date if subscription is ending
        if (subscription.cancel_at_period_end && subscription.current_period_end) {
          updateData.subscription_expires_at = new Date(
            subscription.current_period_end * 1000
          ).toISOString()
        } else {
          updateData.subscription_expires_at = null
        }

        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', profile.id)

        if (error) {
          console.error('[Stripe Webhook] Failed to update subscription:', error)
          throw error
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by Stripe customer ID
        const { data: profile, error: findError } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (findError || !profile) {
          console.error('[Stripe Webhook] Could not find user for customer:', customerId)
          break
        }

        // Downgrade to free tier
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_tier: 'free',
            subscription_status: 'inactive',
            stripe_subscription_id: null,
            subscription_expires_at: null,
          })
          .eq('id', profile.id)

        if (error) {
          console.error('[Stripe Webhook] Failed to cancel subscription:', error)
          throw error
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Find user by Stripe customer ID
        const { data: profile, error: findError } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (findError || !profile) {
          console.error('[Stripe Webhook] Could not find user for customer:', customerId)
          break
        }

        // Mark as past_due (Stripe will retry automatically)
        const { error } = await supabase
          .from('profiles')
          .update({ subscription_status: 'past_due' })
          .eq('id', profile.id)

        if (error) {
          console.error('[Stripe Webhook] Failed to mark payment failed:', error)
          throw error
        }

        // TODO: Send dunning email via Beehiiv or Resend
        break
      }

      default:
        // Unhandled event type - no action needed
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Stripe Webhook] Error processing event:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
