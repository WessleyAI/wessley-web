import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Get Beehiiv API key and publication ID from environment
    // Server-only env vars - never use NEXT_PUBLIC_ for API keys
    const beehiivApiKey = process.env.BEEHIIV_API_KEY
    const publicationId = process.env.BEEHIIV_PUBLICATION_ID

    if (!beehiivApiKey || !publicationId) {
      console.error('Missing Beehiiv configuration - ensure BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID are set')
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    // Beehiiv API endpoint for adding subscribers
    const beehiivResponse = await fetch(`https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${beehiivApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        reactivate_existing: false,
        send_welcome_email: true,
        utm_source: 'waitlist',
        utm_medium: 'website',
        referring_site: 'wessley.ai'
      })
    })

    if (!beehiivResponse.ok) {
      const errorText = await beehiivResponse.text()
      console.error('Beehiiv API error:', errorText)
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
    }

    const result = await beehiivResponse.json()

    console.log('Beehiiv subscription result:', JSON.stringify(result, null, 2))

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to waitlist',
      data: result
    })

  } catch (error) {
    console.error('Waitlist subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}