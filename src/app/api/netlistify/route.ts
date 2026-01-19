import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  netlistifyRatelimit,
  checkRateLimit,
  getRateLimitIdentifier,
  createRateLimitResponse,
  addRateLimitHeaders,
} from '@/lib/rate-limit'
import {
  generateSchematic,
  analyzeImage,
  getTemplates,
  healthCheck,
  NetlistifyError,
  type SchematicGenerateParams,
} from '@/lib/netlistify'

// Demo workspace ID for limited unauthenticated access
const DEMO_WORKSPACE_ID = "cde0ea8e-07aa-4c59-a72b-ba0d56020484"

/**
 * POST /api/netlistify
 *
 * Proxy endpoint for netlistify ML service.
 * Supports two modes:
 * - action: "generate" - Generate synthetic schematic
 * - action: "analyze" - Analyze uploaded image for components
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, workspaceId, ...params } = body

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Only allow unauthenticated requests for demo workspace
    const isDemoWorkspace = workspaceId === DEMO_WORKSPACE_ID

    if (!user && !isDemoWorkspace) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check subscription for non-demo users
    if (user && !isDemoWorkspace) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', user.id)
        .single()

      if (profile?.subscription_status !== 'active') {
        return NextResponse.json({
          error: 'Subscription required',
          upgrade_url: '/pricing'
        }, { status: 402 })
      }
    }

    // Apply rate limiting (30 requests per minute for netlistify)
    const rateLimitIdentifier = getRateLimitIdentifier(user?.id, request)
    const rateLimitResult = await checkRateLimit(netlistifyRatelimit, rateLimitIdentifier)

    if (!rateLimitResult.success) {
      console.log('[API /netlistify] Rate limit exceeded for:', rateLimitIdentifier)
      return createRateLimitResponse(rateLimitResult)
    }

    let result: unknown

    switch (action) {
      case 'generate': {
        // Generate synthetic schematic
        const generateParams: SchematicGenerateParams = {
          min_connectors: params.min_connectors,
          max_connectors: params.max_connectors,
          min_wires: params.min_wires,
          max_wires: params.max_wires,
          allow_fuses: params.allow_fuses,
          allow_relays: params.allow_relays,
          allow_splices: params.allow_splices,
          allow_ecus: params.allow_ecus,
          allow_grounds: params.allow_grounds,
          allow_sensors: params.allow_sensors,
          allow_actuators: params.allow_actuators,
          allow_switches: params.allow_switches,
          allow_leds: params.allow_leds,
          allow_motors: params.allow_motors,
          seed: params.seed,
          width: params.width,
          height: params.height,
          template: params.template,
        }

        // Remove undefined values
        Object.keys(generateParams).forEach(key => {
          if ((generateParams as Record<string, unknown>)[key] === undefined) {
            delete (generateParams as Record<string, unknown>)[key]
          }
        })

        result = await generateSchematic(generateParams)
        break
      }

      case 'analyze': {
        // Analyze uploaded image
        if (!params.image) {
          return NextResponse.json({ error: 'Image required for analysis' }, { status: 400 })
        }
        result = await analyzeImage(params.image)
        break
      }

      case 'templates': {
        // Get available templates
        result = await getTemplates()
        break
      }

      case 'health': {
        // Health check
        const healthy = await healthCheck()
        result = { healthy, service: 'netlistify' }
        break
      }

      default:
        return NextResponse.json({
          error: 'Invalid action',
          message: 'Action must be one of: generate, analyze, templates, health'
        }, { status: 400 })
    }

    const response = NextResponse.json(result)
    return addRateLimitHeaders(response, rateLimitResult)

  } catch (error) {
    console.error('[API /netlistify] Error:', error)

    if (error instanceof NetlistifyError) {
      return NextResponse.json({
        error: error.errorCode || 'netlistify_error',
        message: error.message,
      }, { status: error.statusCode })
    }

    // Check if netlistify service is unavailable
    if (error instanceof Error && error.message.includes('fetch')) {
      return NextResponse.json({
        error: 'service_unavailable',
        message: 'Netlistify service is temporarily unavailable'
      }, { status: 503 })
    }

    return NextResponse.json({
      error: 'internal_error',
      message: 'An unexpected error occurred'
    }, { status: 500 })
  }
}

/**
 * GET /api/netlistify
 *
 * Get service status and available templates
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'status'

    switch (action) {
      case 'templates': {
        const templates = await getTemplates()
        return NextResponse.json({ templates })
      }

      case 'health':
      case 'status': {
        const healthy = await healthCheck()
        return NextResponse.json({
          service: 'netlistify',
          healthy,
          version: '1.0.0',
        })
      }

      default:
        return NextResponse.json({
          error: 'Invalid action',
          message: 'Action must be one of: templates, health, status'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('[API /netlistify] GET Error:', error)

    return NextResponse.json({
      service: 'netlistify',
      healthy: false,
      error: 'Service unavailable'
    }, { status: 503 })
  }
}
