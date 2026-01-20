import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAllServicesHealth } from '@/lib/services-client'
import { healthCheck as netlistifyHealthCheck } from '@/lib/netlistify'

interface ServiceStatus {
  status: 'up' | 'down'
  latency_ms?: number
  error?: string
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  services: {
    supabase: ServiceStatus
    semantic: ServiceStatus
    ingestion: ServiceStatus
    graph: ServiceStatus
    learning: ServiceStatus
    model3d: ServiceStatus
    netlistify: ServiceStatus
  }
  timestamp: string
  version: string
}

async function checkSupabaseHealth(): Promise<ServiceStatus> {
  const start = Date.now()
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('profiles').select('id').limit(1)
    const latency = Date.now() - start

    if (error) {
      return { status: 'down', latency_ms: latency, error: error.message }
    }
    return { status: 'up', latency_ms: latency }
  } catch (err) {
    return {
      status: 'down',
      latency_ms: Date.now() - start,
      error: err instanceof Error ? err.message : 'Unknown error'
    }
  }
}

async function checkNetlistifyHealth(): Promise<ServiceStatus> {
  const start = Date.now()
  try {
    const healthy = await netlistifyHealthCheck()
    const latency = Date.now() - start
    return {
      status: healthy ? 'up' : 'down',
      latency_ms: latency
    }
  } catch (err) {
    return {
      status: 'down',
      latency_ms: Date.now() - start,
      error: err instanceof Error ? err.message : 'Unknown error'
    }
  }
}

export async function GET() {
  const startTime = Date.now()

  try {
    const [supabaseHealth, servicesHealth, netlistifyHealth] = await Promise.all([
      checkSupabaseHealth(),
      checkAllServicesHealth(),
      checkNetlistifyHealth(),
    ])

    const services = {
      supabase: supabaseHealth,
      semantic: { status: servicesHealth.services.semantic ? 'up' : 'down' } as ServiceStatus,
      ingestion: { status: servicesHealth.services.ingestion ? 'up' : 'down' } as ServiceStatus,
      graph: { status: servicesHealth.services.graph ? 'up' : 'down' } as ServiceStatus,
      learning: { status: servicesHealth.services.learning ? 'up' : 'down' } as ServiceStatus,
      model3d: { status: servicesHealth.services.model3d ? 'up' : 'down' } as ServiceStatus,
      netlistify: netlistifyHealth,
    }

    const coreServicesUp = supabaseHealth.status === 'up' &&
                           servicesHealth.services.semantic &&
                           servicesHealth.services.ingestion

    const allServicesUp = coreServicesUp &&
                          servicesHealth.services.graph &&
                          servicesHealth.services.learning &&
                          servicesHealth.services.model3d &&
                          netlistifyHealth.status === 'up'

    let status: 'healthy' | 'degraded' | 'unhealthy'
    if (allServicesUp) {
      status = 'healthy'
    } else if (coreServicesUp) {
      status = 'degraded'
    } else {
      status = 'unhealthy'
    }

    const response: HealthResponse = {
      status,
      services,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
    }

    const httpStatus = status === 'unhealthy' ? 503 : 200

    return NextResponse.json(response, {
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'X-Response-Time': `${Date.now() - startTime}ms`,
      },
    })
  } catch (error) {
    console.error('[Health Check] Error:', error)

    return NextResponse.json({
      status: 'unhealthy',
      services: {
        supabase: { status: 'down', error: 'Health check failed' },
        semantic: { status: 'down' },
        ingestion: { status: 'down' },
        graph: { status: 'down' },
        learning: { status: 'down' },
        model3d: { status: 'down' },
        netlistify: { status: 'down' },
      },
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as HealthResponse & { error: string }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'X-Response-Time': `${Date.now() - startTime}ms`,
      },
    })
  }
}

export const dynamic = 'force-dynamic'
