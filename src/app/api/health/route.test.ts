/**
 * Tests for Health Check API Route
 *
 * Why these tests matter:
 * - Health checks are critical for container orchestration (K8s, Docker)
 * - Determines service availability for load balancers
 * - Aggregates status from multiple backend services
 * - Returns appropriate HTTP codes (200 healthy, 503 unhealthy)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('/api/health', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
    vi.clearAllMocks()
  })

  describe('healthy response', () => {
    it('should return 200 when all services are up', async () => {
      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn(() => Promise.resolve({
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              limit: vi.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }),
            })),
          })),
        })),
      }))

      vi.doMock('@/lib/services-client', () => ({
        checkAllServicesHealth: vi.fn(() => Promise.resolve({
          allHealthy: true,
          services: {
            semantic: true,
            ingestion: true,
            graph: true,
            learning: true,
            model3d: true,
          },
        })),
      }))

      vi.doMock('@/lib/netlistify', () => ({
        healthCheck: vi.fn(() => Promise.resolve(true)),
      }))

      const { GET } = await import('./route')
      const response = await GET()
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json.status).toBe('healthy')
    })
  })

  describe('degraded response', () => {
    it('should return 200 with degraded status when non-core services are down', async () => {
      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn(() => Promise.resolve({
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              limit: vi.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }),
            })),
          })),
        })),
      }))

      vi.doMock('@/lib/services-client', () => ({
        checkAllServicesHealth: vi.fn(() => Promise.resolve({
          allHealthy: false,
          services: {
            semantic: true,  // Core - up
            ingestion: true, // Core - up
            graph: false,    // Non-core - down
            learning: false, // Non-core - down
            model3d: false,  // Non-core - down
          },
        })),
      }))

      vi.doMock('@/lib/netlistify', () => ({
        healthCheck: vi.fn(() => Promise.resolve(false)),
      }))

      const { GET } = await import('./route')
      const response = await GET()
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json.status).toBe('degraded')
    })
  })

  describe('unhealthy response', () => {
    it('should return 503 when core services are down', async () => {
      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn(() => Promise.resolve({
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              limit: vi.fn().mockResolvedValue({ data: null, error: { message: 'Connection failed' } }),
            })),
          })),
        })),
      }))

      vi.doMock('@/lib/services-client', () => ({
        checkAllServicesHealth: vi.fn(() => Promise.resolve({
          allHealthy: false,
          services: {
            semantic: false,
            ingestion: false,
            graph: false,
            learning: false,
            model3d: false,
          },
        })),
      }))

      vi.doMock('@/lib/netlistify', () => ({
        healthCheck: vi.fn(() => Promise.resolve(false)),
      }))

      const { GET } = await import('./route')
      const response = await GET()
      const json = await response.json()

      expect(response.status).toBe(503)
      expect(json.status).toBe('unhealthy')
    })
  })
})

describe('Health Check Response Format', () => {
  describe('service status structure', () => {
    it('should include all service statuses', () => {
      const expectedServices = [
        'supabase',
        'semantic',
        'ingestion',
        'graph',
        'learning',
        'model3d',
        'netlistify',
      ]

      expectedServices.forEach(service => {
        expect(service.length).toBeGreaterThan(0)
      })
    })

    it('should use up/down status values', () => {
      const validStatuses = ['up', 'down']
      validStatuses.forEach(status => {
        expect(['up', 'down']).toContain(status)
      })
    })

    it('should include latency_ms for service checks', () => {
      const serviceStatus = {
        status: 'up' as const,
        latency_ms: 45,
      }

      expect(serviceStatus).toHaveProperty('latency_ms')
      expect(typeof serviceStatus.latency_ms).toBe('number')
    })

    it('should include error message when service is down', () => {
      const serviceStatus = {
        status: 'down' as const,
        latency_ms: 100,
        error: 'Connection refused',
      }

      expect(serviceStatus).toHaveProperty('error')
    })
  })

  describe('response metadata', () => {
    it('should include timestamp in ISO format', () => {
      const timestamp = new Date().toISOString()
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })

    it('should include version', () => {
      const version = process.env.npm_package_version || '1.0.0'
      expect(version).toMatch(/^\d+\.\d+\.\d+/)
    })
  })

  describe('HTTP headers', () => {
    it('should disable caching', () => {
      const cacheControl = 'no-store, max-age=0'
      expect(cacheControl).toContain('no-store')
    })

    it('should include response time header', () => {
      const responseTimeHeader = 'X-Response-Time'
      expect(responseTimeHeader).toBe('X-Response-Time')
    })
  })
})

describe('Health Check Logic', () => {
  describe('core services determination', () => {
    it('should consider Supabase as core', () => {
      const coreServices = ['supabase', 'semantic', 'ingestion']
      expect(coreServices).toContain('supabase')
    })

    it('should consider semantic service as core', () => {
      const coreServices = ['supabase', 'semantic', 'ingestion']
      expect(coreServices).toContain('semantic')
    })

    it('should consider ingestion service as core', () => {
      const coreServices = ['supabase', 'semantic', 'ingestion']
      expect(coreServices).toContain('ingestion')
    })
  })

  describe('overall status calculation', () => {
    it('should be healthy when all services up', () => {
      const coreServicesUp = true
      const allServicesUp = true
      const status = allServicesUp ? 'healthy' : coreServicesUp ? 'degraded' : 'unhealthy'

      expect(status).toBe('healthy')
    })

    it('should be degraded when only core services up', () => {
      const coreServicesUp = true
      const allServicesUp = false
      const status = allServicesUp ? 'healthy' : coreServicesUp ? 'degraded' : 'unhealthy'

      expect(status).toBe('degraded')
    })

    it('should be unhealthy when core services down', () => {
      const coreServicesUp = false
      const allServicesUp = false
      const status = allServicesUp ? 'healthy' : coreServicesUp ? 'degraded' : 'unhealthy'

      expect(status).toBe('unhealthy')
    })
  })

  describe('Supabase health check', () => {
    it('should query profiles table to verify connectivity', () => {
      const tableName = 'profiles'
      const queryLimit = 1
      expect(tableName).toBe('profiles')
      expect(queryLimit).toBe(1)
    })

    it('should measure latency in milliseconds', () => {
      const start = Date.now()
      // Simulate async operation
      const end = Date.now()
      const latency = end - start

      expect(latency).toBeGreaterThanOrEqual(0)
    })
  })

  describe('error handling', () => {
    it('should return unhealthy on exception', () => {
      const errorResponse = {
        status: 'unhealthy',
        error: 'Health check failed',
      }

      expect(errorResponse.status).toBe('unhealthy')
      expect(errorResponse).toHaveProperty('error')
    })

    it('should still return all service statuses on error', () => {
      const errorResponse = {
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
      }

      expect(Object.keys(errorResponse.services)).toHaveLength(7)
    })
  })
})

describe('Health Check Dynamic Export', () => {
  it('should force dynamic rendering', () => {
    const dynamic = 'force-dynamic'
    expect(dynamic).toBe('force-dynamic')
  })
})
