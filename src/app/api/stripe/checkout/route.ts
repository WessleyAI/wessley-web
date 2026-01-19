import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe, SubscriptionTier, getPriceId } from '@/lib/stripe'

/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe Checkout Session for subscription purchase.
 * Requires authentication. Creates Stripe customer if not exists.
 *
 * Request body:
 * - tier: SubscriptionTier ('insiders' | 'pro' | 'enterprise')
 *
 * Response:
 * - url: Stripe Checkout URL to redirect the user to
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user || authError) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to subscribe.' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const { tier } = body as { tier: SubscriptionTier }

    if (!tier || tier === 'free') {
      return NextResponse.json(
        { error: 'Invalid subscription tier. Please select a paid plan.' },
        { status: 400 }
      )
    }

    // Get price ID for the tier
    const priceId = getPriceId(tier)
    if (!priceId) {
      console.error(`[Stripe Checkout] No price ID configured for tier: ${tier}`)
      return NextResponse.json(
        { error: 'This subscription tier is not available. Please contact support.' },
        { status: 400 }
      )
    }

    // Get user profile to check for existing Stripe customer
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, display_name')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('[Stripe Checkout] Failed to fetch profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch user profile.' },
        { status: 500 }
      )
    }

    let customerId = profile?.stripe_customer_id

    // Get Stripe client
    const stripe = getStripe()

    // Create Stripe customer if not exists
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: profile?.display_name || undefined,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      // Save customer ID to profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)

      if (updateError) {
        console.error('[Stripe Checkout] Failed to save customer ID:', updateError)
        // Continue anyway - customer was created, we can recover later
      }
    }

    // Get app URL for redirects
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/cancel`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      automatic_tax: {
        enabled: true,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          tier,
        },
      },
      metadata: {
        supabase_user_id: user.id,
        tier,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[Stripe Checkout] Error:', error)

    if (error instanceof Error && error.message.includes('STRIPE_SECRET_KEY')) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please contact support.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    )
  }
}
