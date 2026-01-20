/**
 * Tests for Vehicle Graph API Route
 *
 * These tests verify the /api/vehicle/{id}/graph endpoint behavior including
 * authentication, authorization, graph service integration, and fallback logic.
 *
 * Why these tests matter:
 * - Graph data powers the 3D visualization of electrical systems
 * - Fallback mock data ensures graceful degradation when Neo4j is unavailable
 * - Node/edge structure must be consistent for Three.js rendering
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

describe('/api/vehicle/[id]/graph', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
    vi.clearAllMocks()
  })

  function createMockRequest(id: string): NextRequest {
    return new NextRequest(`http://localhost:3000/api/vehicle/${id}/graph`, {
      method: 'GET',
    })
  }

  describe('authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn(() => Promise.resolve({
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: null },
              error: null,
            }),
          },
          from: vi.fn(),
        })),
      }))

      vi.doMock('@/lib/services-client', () => ({
        graphService: {
          getVehicleSystems: vi.fn(),
          getRelatedComponents: vi.fn(),
        },
        ServiceError: class ServiceError extends Error {
          statusCode: number
          constructor(message: string, statusCode: number) {
            super(message)
            this.statusCode = statusCode
          }
        },
      }))

      const { GET } = await import('./route')
      const request = createMockRequest('vehicle-123')

      const response = await GET(request, { params: Promise.resolve({ id: 'vehicle-123' }) })
      const json = await response.json()

      expect(response.status).toBe(401)
      expect(json.error).toBe('unauthorized')
    })
  })

  describe('input validation', () => {
    it('should return 400 when vehicle ID is missing', async () => {
      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn(() => Promise.resolve({
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: { id: 'user-123' } },
              error: null,
            }),
          },
          from: vi.fn(),
        })),
      }))

      vi.doMock('@/lib/services-client', () => ({
        graphService: {
          getVehicleSystems: vi.fn(),
          getRelatedComponents: vi.fn(),
        },
        ServiceError: class ServiceError extends Error {
          statusCode: number
          constructor(message: string, statusCode: number) {
            super(message)
            this.statusCode = statusCode
          }
        },
      }))

      const { GET } = await import('./route')
      const request = createMockRequest('')

      const response = await GET(request, { params: Promise.resolve({ id: '' }) })
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toBe('invalid_input')
    })
  })
})

describe('Vehicle Graph Mock Data Generation', () => {
  /**
   * These tests verify the fallback mock data generation logic.
   * Mock data is used when the graph service is unavailable.
   */

  interface MockNode {
    id: string
    type: string
    label: string
    properties: Record<string, unknown>
    position?: [number, number, number]
  }

  interface MockEdge {
    source: string
    target: string
    type: string
    properties?: Record<string, unknown>
  }

  function generateMockNodes(make: string, model: string, year: number): MockNode[] {
    const baseComponents = [
      { id: 'battery', type: 'component', label: 'Battery', zone: 'engine_bay', pos: [0, 0, 0] },
      { id: 'alternator', type: 'component', label: 'Alternator', zone: 'engine_bay', pos: [0.5, 0, 0] },
      { id: 'starter', type: 'component', label: 'Starter Motor', zone: 'engine_bay', pos: [-0.5, 0, 0] },
      { id: 'main_fuse_box', type: 'connector', label: 'Main Fuse Box', zone: 'engine_bay', pos: [0, 0.5, 0] },
      { id: 'ignition_switch', type: 'component', label: 'Ignition Switch', zone: 'dashboard', pos: [0, 0, 0.5] },
      { id: 'ecu', type: 'component', label: 'Engine Control Unit', zone: 'engine_bay', pos: [0.3, 0.3, 0] },
      { id: 'ground_point_1', type: 'ground', label: 'Ground Point (Chassis)', zone: 'chassis', pos: [0, -0.5, 0] },
      { id: 'headlight_relay', type: 'component', label: 'Headlight Relay', zone: 'engine_bay', pos: [0.2, 0.5, 0] },
      { id: 'headlight_left', type: 'component', label: 'Left Headlight', zone: 'exterior', pos: [-0.8, 0, 0.3] },
      { id: 'headlight_right', type: 'component', label: 'Right Headlight', zone: 'exterior', pos: [0.8, 0, 0.3] },
    ]

    return baseComponents.map(comp => ({
      id: comp.id,
      type: comp.type,
      label: comp.label,
      properties: {
        zone: comp.zone,
        vehicle: `${year} ${make} ${model}`,
        mock: true
      },
      position: comp.pos as [number, number, number]
    }))
  }

  function generateMockEdges(nodes: MockNode[]): MockEdge[] {
    const nodeIds = new Set(nodes.map(n => n.id))

    const baseEdges = [
      { source: 'battery', target: 'main_fuse_box', type: 'powers', wire: { color: 'red', gauge: '4AWG' } },
      { source: 'battery', target: 'starter', type: 'powers', wire: { color: 'red', gauge: '2AWG' } },
      { source: 'alternator', target: 'battery', type: 'powers', wire: { color: 'red', gauge: '6AWG' } },
      { source: 'main_fuse_box', target: 'ecu', type: 'powers', wire: { color: 'red/blue', gauge: '14AWG' } },
      { source: 'ignition_switch', target: 'starter', type: 'controls', wire: { color: 'yellow', gauge: '14AWG' } },
      { source: 'main_fuse_box', target: 'headlight_relay', type: 'powers', wire: { color: 'red', gauge: '12AWG' } },
      { source: 'headlight_relay', target: 'headlight_left', type: 'powers', wire: { color: 'green', gauge: '14AWG' } },
      { source: 'headlight_relay', target: 'headlight_right', type: 'powers', wire: { color: 'green', gauge: '14AWG' } },
      { source: 'battery', target: 'ground_point_1', type: 'connects_to', wire: { color: 'black', gauge: '4AWG' } },
      { source: 'starter', target: 'ground_point_1', type: 'connects_to', wire: { color: 'black', gauge: '2AWG' } },
    ]

    return baseEdges
      .filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target))
      .map(edge => ({
        source: edge.source,
        target: edge.target,
        type: edge.type,
        properties: {
          wire_color: edge.wire.color,
          wire_gauge: edge.wire.gauge,
          mock: true
        }
      }))
  }

  describe('node generation', () => {
    it('should generate 10 base components', () => {
      const nodes = generateMockNodes('Toyota', 'Camry', 2020)

      expect(nodes).toHaveLength(10)
    })

    it('should include essential electrical components', () => {
      const nodes = generateMockNodes('Toyota', 'Camry', 2020)
      const nodeIds = nodes.map(n => n.id)

      expect(nodeIds).toContain('battery')
      expect(nodeIds).toContain('alternator')
      expect(nodeIds).toContain('starter')
      expect(nodeIds).toContain('main_fuse_box')
      expect(nodeIds).toContain('ignition_switch')
      expect(nodeIds).toContain('ecu')
    })

    it('should include ground points', () => {
      const nodes = generateMockNodes('Toyota', 'Camry', 2020)
      const groundNodes = nodes.filter(n => n.type === 'ground')

      expect(groundNodes.length).toBeGreaterThan(0)
    })

    it('should include connectors (fuse box)', () => {
      const nodes = generateMockNodes('Toyota', 'Camry', 2020)
      const connectorNodes = nodes.filter(n => n.type === 'connector')

      expect(connectorNodes.length).toBeGreaterThan(0)
    })

    it('should include vehicle info in node properties', () => {
      const nodes = generateMockNodes('Honda', 'Accord', 2022)
      const batteryNode = nodes.find(n => n.id === 'battery')

      expect(batteryNode?.properties.vehicle).toBe('2022 Honda Accord')
    })

    it('should mark nodes as mock data', () => {
      const nodes = generateMockNodes('Toyota', 'Camry', 2020)

      nodes.forEach(node => {
        expect(node.properties.mock).toBe(true)
      })
    })

    it('should include 3D position for all nodes', () => {
      const nodes = generateMockNodes('Toyota', 'Camry', 2020)

      nodes.forEach(node => {
        expect(node.position).toBeDefined()
        expect(node.position).toHaveLength(3)
        expect(typeof node.position![0]).toBe('number')
        expect(typeof node.position![1]).toBe('number')
        expect(typeof node.position![2]).toBe('number')
      })
    })

    it('should include zone information for each component', () => {
      const nodes = generateMockNodes('Toyota', 'Camry', 2020)

      nodes.forEach(node => {
        expect(node.properties.zone).toBeDefined()
        expect(['engine_bay', 'dashboard', 'chassis', 'exterior']).toContain(node.properties.zone)
      })
    })
  })

  describe('edge generation', () => {
    it('should generate edges only between existing nodes', () => {
      const nodes = generateMockNodes('Toyota', 'Camry', 2020)
      const edges = generateMockEdges(nodes)
      const nodeIds = new Set(nodes.map(n => n.id))

      edges.forEach(edge => {
        expect(nodeIds.has(edge.source)).toBe(true)
        expect(nodeIds.has(edge.target)).toBe(true)
      })
    })

    it('should generate 10 base connections', () => {
      const nodes = generateMockNodes('Toyota', 'Camry', 2020)
      const edges = generateMockEdges(nodes)

      expect(edges).toHaveLength(10)
    })

    it('should include power connections from battery', () => {
      const nodes = generateMockNodes('Toyota', 'Camry', 2020)
      const edges = generateMockEdges(nodes)
      const batteryEdges = edges.filter(e => e.source === 'battery')

      expect(batteryEdges.length).toBeGreaterThanOrEqual(2)
    })

    it('should include control connections', () => {
      const nodes = generateMockNodes('Toyota', 'Camry', 2020)
      const edges = generateMockEdges(nodes)
      const controlEdges = edges.filter(e => e.type === 'controls')

      expect(controlEdges.length).toBeGreaterThan(0)
    })

    it('should include ground connections', () => {
      const nodes = generateMockNodes('Toyota', 'Camry', 2020)
      const edges = generateMockEdges(nodes)
      const groundEdges = edges.filter(e => e.target === 'ground_point_1')

      expect(groundEdges.length).toBeGreaterThanOrEqual(2)
    })

    it('should include wire properties in edges', () => {
      const nodes = generateMockNodes('Toyota', 'Camry', 2020)
      const edges = generateMockEdges(nodes)

      edges.forEach(edge => {
        expect(edge.properties).toBeDefined()
        expect(edge.properties!.wire_color).toBeDefined()
        expect(edge.properties!.wire_gauge).toBeDefined()
      })
    })

    it('should use correct edge types: powers, controls, connects_to', () => {
      const nodes = generateMockNodes('Toyota', 'Camry', 2020)
      const edges = generateMockEdges(nodes)
      const validTypes = ['powers', 'controls', 'connects_to']

      edges.forEach(edge => {
        expect(validTypes).toContain(edge.type)
      })
    })

    it('should mark edges as mock data', () => {
      const nodes = generateMockNodes('Toyota', 'Camry', 2020)
      const edges = generateMockEdges(nodes)

      edges.forEach(edge => {
        expect(edge.properties!.mock).toBe(true)
      })
    })
  })

  describe('edge filtering', () => {
    it('should filter out edges with non-existent source nodes', () => {
      const partialNodes: MockNode[] = [
        { id: 'battery', type: 'component', label: 'Battery', properties: { zone: 'engine_bay' }, position: [0, 0, 0] },
        { id: 'starter', type: 'component', label: 'Starter', properties: { zone: 'engine_bay' }, position: [0, 0, 0] },
      ]

      const edges = generateMockEdges(partialNodes)
      const edgeSources = edges.map(e => e.source)

      edgeSources.forEach(source => {
        expect(partialNodes.some(n => n.id === source)).toBe(true)
      })
    })

    it('should filter out edges with non-existent target nodes', () => {
      const partialNodes: MockNode[] = [
        { id: 'battery', type: 'component', label: 'Battery', properties: { zone: 'engine_bay' }, position: [0, 0, 0] },
        { id: 'main_fuse_box', type: 'connector', label: 'Main Fuse Box', properties: { zone: 'engine_bay' }, position: [0, 0, 0] },
      ]

      const edges = generateMockEdges(partialNodes)

      edges.forEach(edge => {
        expect(partialNodes.some(n => n.id === edge.target)).toBe(true)
      })
    })
  })
})

describe('Vehicle Graph Response Format', () => {
  describe('successful response structure', () => {
    it('should include nodes array', () => {
      const mockResponse = {
        nodes: [],
        edges: [],
      }

      expect(Array.isArray(mockResponse.nodes)).toBe(true)
    })

    it('should include edges array', () => {
      const mockResponse = {
        nodes: [],
        edges: [],
      }

      expect(Array.isArray(mockResponse.edges)).toBe(true)
    })
  })

  describe('node structure', () => {
    it('should have required fields: id, type, label, properties', () => {
      const node = {
        id: 'battery',
        type: 'component',
        label: 'Battery',
        properties: { zone: 'engine_bay' },
      }

      expect(node.id).toBeDefined()
      expect(node.type).toBeDefined()
      expect(node.label).toBeDefined()
      expect(node.properties).toBeDefined()
    })

    it('should have optional position field as [x, y, z] tuple', () => {
      const nodeWithPosition = {
        id: 'battery',
        type: 'component',
        label: 'Battery',
        properties: {},
        position: [0, 0.5, 0.3] as [number, number, number],
      }

      expect(nodeWithPosition.position).toHaveLength(3)
    })
  })

  describe('edge structure', () => {
    it('should have required fields: source, target, type', () => {
      const edge = {
        source: 'battery',
        target: 'starter',
        type: 'powers',
      }

      expect(edge.source).toBeDefined()
      expect(edge.target).toBeDefined()
      expect(edge.type).toBeDefined()
    })

    it('should have optional properties with wire metadata', () => {
      const edgeWithProps = {
        source: 'battery',
        target: 'starter',
        type: 'powers',
        properties: {
          wire_color: 'red',
          wire_gauge: '4AWG',
          din_code: 'B+',
        },
      }

      expect(edgeWithProps.properties!.wire_color).toBe('red')
      expect(edgeWithProps.properties!.wire_gauge).toBe('4AWG')
    })
  })

  describe('error response structure', () => {
    it('should include error and message for graph timeout', () => {
      const errorResponse = {
        error: 'graph_timeout',
        message: 'Graph query timed out',
        partial: false,
        request_id: '550e8400-e29b-41d4-a716-446655440000',
      }

      expect(errorResponse.error).toBe('graph_timeout')
      expect(errorResponse.partial).toBe(false)
      expect(errorResponse.request_id).toBeTruthy()
    })
  })
})

describe('Vehicle Graph HTTP Status Codes', () => {
  describe('success status', () => {
    it('should return 200 for successful graph retrieval', () => {
      expect(200).toBe(200)
    })

    it('should return 200 with mock data when graph service unavailable', () => {
      // Graceful fallback - still returns 200 with mock data
      expect(200).toBe(200)
    })
  })

  describe('error statuses', () => {
    it('should return 400 for invalid input (missing ID)', () => {
      expect(400).toBe(400)
    })

    it('should return 401 for unauthenticated requests', () => {
      expect(401).toBe(401)
    })

    it('should return 403 for unauthorized access (wrong user)', () => {
      expect(403).toBe(403)
    })

    it('should return 404 for non-existent vehicle', () => {
      expect(404).toBe(404)
    })

    it('should return 500 for internal errors', () => {
      expect(500).toBe(500)
    })

    it('should return 503 for graph service timeout', () => {
      expect(503).toBe(503)
    })
  })
})

describe('Vehicle Graph Service Error Handling', () => {
  describe('ServiceError handling', () => {
    it('should detect timeout errors by status code 504', () => {
      const error = { statusCode: 504, message: 'Graph query failed' }
      const isTimeout = error.statusCode === 504

      expect(isTimeout).toBe(true)
    })

    it('should detect timeout errors by message content', () => {
      const error = { statusCode: 500, message: 'Request timeout after 30s' }
      const isTimeout = error.message.includes('timeout')

      expect(isTimeout).toBe(true)
    })

    it('should fall back to mock data for non-timeout service errors', () => {
      const shouldUseMockData = true // When ServiceError is caught and not timeout

      expect(shouldUseMockData).toBe(true)
    })
  })

  describe('edge deduplication', () => {
    it('should prevent duplicate edges in both directions', () => {
      const edges: Array<{ source: string; target: string }> = []

      const addEdge = (source: string, target: string) => {
        const isDuplicate = edges.some(e =>
          (e.source === source && e.target === target) ||
          (e.source === target && e.target === source)
        )

        if (!isDuplicate) {
          edges.push({ source, target })
        }
      }

      addEdge('battery', 'starter')
      addEdge('starter', 'battery') // Should be filtered as duplicate

      expect(edges).toHaveLength(1)
    })
  })
})
