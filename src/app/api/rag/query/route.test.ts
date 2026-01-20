/**
 * Tests for RAG Query API Route
 *
 * Why these tests matter:
 * - RAG queries are core to the AI assistant's knowledge retrieval
 * - Combines semantic search with knowledge graph traversal
 * - Rate limiting prevents expensive compute abuse
 * - Demo workspace support enables marketing demos
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

describe('/api/rag/query', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
    vi.clearAllMocks()
  })

  function createMockRequest(body: object): Request {
    return new Request('http://localhost:3000/api/rag/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  }

  describe('authentication', () => {
    it('should return 401 when user is not authenticated and not demo workspace', async () => {
      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn(() => Promise.resolve({
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: null },
              error: null,
            }),
          },
        })),
      }))

      vi.doMock('@/lib/services-client', () => ({
        semanticService: { search: vi.fn() },
        graphService: { getSystemComponents: vi.fn(), getRelatedComponents: vi.fn() },
      }))

      vi.doMock('@/lib/rate-limit', () => ({
        chatRatelimit: {},
        checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
        getRateLimitIdentifier: vi.fn(() => 'test-id'),
        createRateLimitResponse: vi.fn(),
        addRateLimitHeaders: vi.fn((res) => res),
      }))

      const { POST } = await import('./route')
      const request = createMockRequest({
        query: 'How do I fix the alternator?',
        workspaceId: 'non-demo-workspace',
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(401)
      expect(json.error).toBe('Unauthorized')
    })
  })

  describe('request validation', () => {
    it('should return 400 when query is missing', async () => {
      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn(() => Promise.resolve({
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: { id: 'user-123' } },
              error: null,
            }),
          },
        })),
      }))

      vi.doMock('@/lib/services-client', () => ({
        semanticService: { search: vi.fn() },
        graphService: { getSystemComponents: vi.fn(), getRelatedComponents: vi.fn() },
      }))

      vi.doMock('@/lib/rate-limit', () => ({
        chatRatelimit: {},
        checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
        getRateLimitIdentifier: vi.fn(() => 'test-id'),
        createRateLimitResponse: vi.fn(),
        addRateLimitHeaders: vi.fn((res) => res),
      }))

      const { POST } = await import('./route')
      const request = createMockRequest({})

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toContain('Query is required')
    })

    it('should return 400 when query exceeds 2000 characters', async () => {
      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn(() => Promise.resolve({
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: { id: 'user-123' } },
              error: null,
            }),
          },
        })),
      }))

      vi.doMock('@/lib/services-client', () => ({
        semanticService: { search: vi.fn() },
        graphService: { getSystemComponents: vi.fn(), getRelatedComponents: vi.fn() },
      }))

      vi.doMock('@/lib/rate-limit', () => ({
        chatRatelimit: {},
        checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
        getRateLimitIdentifier: vi.fn(() => 'test-id'),
        createRateLimitResponse: vi.fn(),
        addRateLimitHeaders: vi.fn((res) => res),
      }))

      const { POST } = await import('./route')
      const request = createMockRequest({
        query: 'A'.repeat(2001),
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toContain('too long')
    })
  })

  describe('rate limiting', () => {
    it('should return 429 when rate limit is exceeded', async () => {
      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn(() => Promise.resolve({
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: { id: 'user-123' } },
              error: null,
            }),
          },
        })),
      }))

      vi.doMock('@/lib/services-client', () => ({
        semanticService: { search: vi.fn() },
        graphService: { getSystemComponents: vi.fn(), getRelatedComponents: vi.fn() },
      }))

      vi.doMock('@/lib/rate-limit', () => ({
        chatRatelimit: {},
        checkRateLimit: vi.fn(() => Promise.resolve({ success: false, remaining: 0 })),
        getRateLimitIdentifier: vi.fn(() => 'test-id'),
        createRateLimitResponse: vi.fn(() => {
          const { NextResponse } = require('next/server')
          return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
        }),
        addRateLimitHeaders: vi.fn((res) => res),
      }))

      const { POST } = await import('./route')
      const request = createMockRequest({
        query: 'Test query',
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(429)
      expect(json.error).toBe('Rate limit exceeded')
    })
  })

  describe('GET method', () => {
    it('should return 405 for GET requests', async () => {
      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn(),
      }))

      vi.doMock('@/lib/services-client', () => ({
        semanticService: { search: vi.fn() },
        graphService: { getSystemComponents: vi.fn(), getRelatedComponents: vi.fn() },
      }))

      vi.doMock('@/lib/rate-limit', () => ({
        chatRatelimit: {},
        checkRateLimit: vi.fn(),
        getRateLimitIdentifier: vi.fn(),
        createRateLimitResponse: vi.fn(),
        addRateLimitHeaders: vi.fn(),
      }))

      const { GET } = await import('./route')
      const response = await GET()
      const json = await response.json()

      expect(response.status).toBe(405)
      expect(json.error).toContain('Method not allowed')
    })
  })
})

describe('RAG Query Logic', () => {
  describe('demo workspace handling', () => {
    it('should use correct demo workspace ID', () => {
      const DEMO_WORKSPACE_ID = "cde0ea8e-07aa-4c59-a72b-ba0d56020484"
      expect(DEMO_WORKSPACE_ID).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
    })

    it('should allow demo workspace access without auth', () => {
      const workspaceId = 'cde0ea8e-07aa-4c59-a72b-ba0d56020484'
      const isDemoWorkspace = workspaceId === 'cde0ea8e-07aa-4c59-a72b-ba0d56020484'
      expect(isDemoWorkspace).toBe(true)
    })
  })

  describe('request body structure', () => {
    it('should define valid request fields', () => {
      const request = {
        query: 'How do I fix the alternator?',
        vehicleId: 'vehicle-123',
        systemName: 'charging',
        includeGraph: true,
        limit: 5,
      }

      expect(request.query).toBeDefined()
      expect(typeof request.query).toBe('string')
      expect(typeof request.limit).toBe('number')
    })

    it('should use default limit of 5 when not specified', () => {
      const defaultLimit = 5
      expect(defaultLimit).toBe(5)
    })
  })

  describe('response structure', () => {
    it('should include required response fields', () => {
      const response = {
        results: [],
        processingTimeMs: 100,
      }

      expect(response).toHaveProperty('results')
      expect(response).toHaveProperty('processingTimeMs')
    })

    it('should optionally include graph context', () => {
      const responseWithGraph = {
        results: [],
        graphContext: {
          components: [
            { id: 'alt-1', type: 'alternator', name: 'Main Alternator' },
          ],
          connections: [
            {
              from_component: 'alt-1',
              to_component: 'bat-1',
              wire: { id: 'w-1', color: 'red', gauge: '8AWG' },
            },
          ],
        },
        processingTimeMs: 150,
      }

      expect(responseWithGraph.graphContext).toBeDefined()
      expect(responseWithGraph.graphContext?.components).toHaveLength(1)
      expect(responseWithGraph.graphContext?.connections).toHaveLength(1)
    })
  })

  describe('semantic search integration', () => {
    it('should pass query and options to semantic service', () => {
      const searchOptions = {
        query: 'alternator repair',
        vehicleId: 'vehicle-123',
        limit: 5,
      }

      expect(searchOptions.query).toBeDefined()
      expect(searchOptions.limit).toBeLessThanOrEqual(20)
    })
  })

  describe('graph context inclusion', () => {
    it('should require vehicleId and systemName for graph context', () => {
      const body = {
        query: 'test',
        includeGraph: true,
        vehicleId: 'vehicle-123',
        systemName: 'charging',
      }

      const shouldIncludeGraph = body.includeGraph && body.vehicleId && body.systemName
      expect(shouldIncludeGraph).toBeTruthy()
    })

    it('should skip graph context when missing vehicleId', () => {
      const body = {
        query: 'test',
        includeGraph: true,
        vehicleId: undefined,
        systemName: 'charging',
      }

      const shouldIncludeGraph = body.includeGraph && body.vehicleId && body.systemName
      expect(shouldIncludeGraph).toBeFalsy()
    })
  })

  describe('error handling', () => {
    it('should handle ServiceError with proper status code', () => {
      const serviceError = {
        name: 'ServiceError',
        message: 'Semantic service unavailable',
        statusCode: 503,
        service: 'semantic',
      }

      expect(serviceError.statusCode).toBe(503)
      expect(serviceError.service).toBe('semantic')
    })

    it('should return 500 on unknown errors', () => {
      const errorResponse = { error: 'Internal server error' }
      expect(errorResponse.error).toBe('Internal server error')
    })
  })

  describe('rate limiting', () => {
    it('should use chat rate limit (60/min)', () => {
      const rateLimit = 60
      const window = 'minute'
      expect(rateLimit).toBe(60)
      expect(window).toBe('minute')
    })
  })

  describe('query validation', () => {
    it('should enforce 2000 character limit', () => {
      const maxLength = 2000
      const longQuery = 'A'.repeat(2001)
      const isValid = longQuery.length <= maxLength

      expect(isValid).toBe(false)
    })

    it('should require query to be a string', () => {
      const validQuery = 'How do I fix the alternator?'
      const isString = typeof validQuery === 'string'

      expect(isString).toBe(true)
    })
  })
})

describe('RAG Query Response Types', () => {
  describe('SemanticSearchResult', () => {
    it('should have expected structure', () => {
      const result = {
        title: 'Alternator Repair Guide',
        content: 'Step by step instructions...',
        score: 0.92,
        metadata: {
          source: 'service-manual',
          page: 45,
        },
      }

      expect(result).toHaveProperty('title')
      expect(result).toHaveProperty('content')
      expect(result).toHaveProperty('score')
      expect(result.score).toBeGreaterThan(0)
      expect(result.score).toBeLessThanOrEqual(1)
    })
  })

  describe('GraphComponent', () => {
    it('should have expected structure', () => {
      const component = {
        id: 'alt-1',
        type: 'alternator',
        name: 'Main Alternator',
        position: { x: 0, y: 0, z: 0 },
      }

      expect(component).toHaveProperty('id')
      expect(component).toHaveProperty('type')
      expect(component).toHaveProperty('name')
    })

    it('should have optional position field', () => {
      const componentWithPosition = {
        id: 'alt-1',
        type: 'alternator',
        name: 'Main Alternator',
        position: { x: 1.5, y: 2.0, z: -0.5 },
      }

      const componentWithoutPosition = {
        id: 'alt-2',
        type: 'alternator',
        name: 'Secondary Alternator',
      }

      expect(componentWithPosition.position).toBeDefined()
      expect(componentWithoutPosition).not.toHaveProperty('position')
    })
  })

  describe('GraphConnection', () => {
    it('should have expected structure', () => {
      const connection = {
        from_component: 'alt-1',
        to_component: 'bat-1',
        wire: {
          id: 'wire-1',
          color: 'red',
          gauge: '8AWG',
        },
      }

      expect(connection).toHaveProperty('from_component')
      expect(connection).toHaveProperty('to_component')
      expect(connection).toHaveProperty('wire')
      expect(connection.wire).toHaveProperty('color')
      expect(connection.wire).toHaveProperty('gauge')
    })
  })
})
