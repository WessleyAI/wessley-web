import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

/**
 * POST /api/stripe/portal
 *
 * Creates a Stripe Customer Portal session for subscription management.
 * Allows users to update payment methods, view invoices, and cancel subscriptions.
 *
 * Requires authentication and an existing Stripe customer.
 *
 * Response:
 * - url: Stripe Customer Portal URL to redirect the user to
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user || authError) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      )
    }

    // Get user profile with Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('[Stripe Portal] Failed to fetch profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch user profile.' },
        { status: 500 }
      )
    }

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No subscription found. Please subscribe first.' },
        { status: 404 }
      )
    }

    // Get app URL for return redirect
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Get Stripe client
    const stripe = getStripe()

    // Create Customer Portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appUrl}/dashboard`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[Stripe Portal] Error:', error)

    if (error instanceof Error && error.message.includes('STRIPE_SECRET_KEY')) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please contact support.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create portal session. Please try again.' },
      { status: 500 }
    )
  }
}
