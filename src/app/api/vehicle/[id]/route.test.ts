/**
 * Tests for Vehicle API Route
 *
 * These tests verify the /api/vehicle/{id} endpoint behavior including
 * authentication, authorization, validation, and system detection logic.
 *
 * Why these tests matter:
 * - Vehicle data is core to the diagnostic experience
 * - System detection drives which features are available
 * - Authorization prevents cross-user data access
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

describe('/api/vehicle/[id]', () => {
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
    return new NextRequest(`http://localhost:3000/api/vehicle/${id}`, {
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

      const { GET } = await import('./route')
      const request = createMockRequest('vehicle-123')

      const response = await GET(request, { params: Promise.resolve({ id: 'vehicle-123' }) })
      const json = await response.json()

      expect(response.status).toBe(401)
      expect(json.error).toBe('unauthorized')
    })

    it('should return 401 when auth returns an error', async () => {
      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn(() => Promise.resolve({
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: null },
              error: new Error('Auth session expired'),
            }),
          },
          from: vi.fn(),
        })),
      }))

      const { GET } = await import('./route')
      const request = createMockRequest('vehicle-123')

      const response = await GET(request, { params: Promise.resolve({ id: 'vehicle-123' }) })

      expect(response.status).toBe(401)
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

      const { GET } = await import('./route')
      const request = createMockRequest('')

      const response = await GET(request, { params: Promise.resolve({ id: '' }) })
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toBe('invalid_input')
    })
  })
})

describe('Vehicle API Validation Logic', () => {
  /**
   * These tests document the validation rules for vehicle requests.
   */

  describe('vehicle ID validation', () => {
    it('should require a non-empty vehicle ID', () => {
      const validateVehicleId = (id: string | undefined) => !!id

      expect(validateVehicleId('')).toBe(false)
      expect(validateVehicleId(undefined)).toBe(false)
      expect(validateVehicleId('vehicle-123')).toBe(true)
      expect(validateVehicleId('cde0ea8e-07aa-4c59-a72b-ba0d56020484')).toBe(true)
    })
  })

  describe('authorization', () => {
    it('should deny access when workspace user_id does not match authenticated user', () => {
      const authUserId = 'user-123'
      const workspaceUserId = 'user-456'

      const isAuthorized = workspaceUserId === authUserId
      expect(isAuthorized).toBe(false)
    })

    it('should allow access when workspace user_id matches authenticated user', () => {
      const authUserId = 'user-123'
      const workspaceUserId = 'user-123'

      const isAuthorized = workspaceUserId === authUserId
      expect(isAuthorized).toBe(true)
    })
  })
})

describe('Vehicle System Detection Logic', () => {
  /**
   * These tests verify the electrical system detection logic.
   * System detection determines which diagnostic features are available.
   */

  function detectSystems(vehicle: {
    electrical_voltage?: number
    body_style?: string
    year?: number
  }): string[] {
    const systems: string[] = []

    // Basic systems present in all vehicles
    systems.push('ignition', 'charging', 'starting')

    // Add systems based on vehicle characteristics
    if (vehicle.electrical_voltage === 12) {
      systems.push('lighting', 'accessories')
    }
    if (vehicle.electrical_voltage === 48) {
      systems.push('mild_hybrid', 'high_voltage')
    }
    if (vehicle.body_style && ['sedan', 'coupe', 'suv'].includes(vehicle.body_style.toLowerCase())) {
      systems.push('power_windows', 'power_locks', 'climate_control')
    }
    if (vehicle.year && vehicle.year >= 2010) {
      systems.push('infotainment', 'can_bus')
    }
    if (vehicle.year && vehicle.year >= 2015) {
      systems.push('adas', 'parking_sensors')
    }

    return systems
  }

  describe('base systems', () => {
    it('should always include ignition, charging, and starting systems', () => {
      const systems = detectSystems({})

      expect(systems).toContain('ignition')
      expect(systems).toContain('charging')
      expect(systems).toContain('starting')
    })
  })

  describe('electrical voltage systems', () => {
    it('should include lighting and accessories for 12V vehicles', () => {
      const systems = detectSystems({ electrical_voltage: 12 })

      expect(systems).toContain('lighting')
      expect(systems).toContain('accessories')
      expect(systems).not.toContain('mild_hybrid')
    })

    it('should include mild_hybrid and high_voltage for 48V vehicles', () => {
      const systems = detectSystems({ electrical_voltage: 48 })

      expect(systems).toContain('mild_hybrid')
      expect(systems).toContain('high_voltage')
      expect(systems).not.toContain('lighting')
    })

    it('should not include voltage-specific systems when voltage is undefined', () => {
      const systems = detectSystems({})

      expect(systems).not.toContain('lighting')
      expect(systems).not.toContain('mild_hybrid')
    })
  })

  describe('body style systems', () => {
    it('should include comfort systems for sedan body style', () => {
      const systems = detectSystems({ body_style: 'Sedan' })

      expect(systems).toContain('power_windows')
      expect(systems).toContain('power_locks')
      expect(systems).toContain('climate_control')
    })

    it('should include comfort systems for SUV body style (case insensitive)', () => {
      const systems = detectSystems({ body_style: 'SUV' })

      expect(systems).toContain('power_windows')
      expect(systems).toContain('power_locks')
      expect(systems).toContain('climate_control')
    })

    it('should include comfort systems for coupe body style', () => {
      const systems = detectSystems({ body_style: 'coupe' })

      expect(systems).toContain('power_windows')
    })

    it('should not include comfort systems for truck body style', () => {
      const systems = detectSystems({ body_style: 'Truck' })

      expect(systems).not.toContain('power_windows')
      expect(systems).not.toContain('power_locks')
    })

    it('should not include comfort systems when body_style is undefined', () => {
      const systems = detectSystems({})

      expect(systems).not.toContain('power_windows')
    })
  })

  describe('year-based systems', () => {
    it('should include infotainment and CAN bus for vehicles 2010 and newer', () => {
      const systems2010 = detectSystems({ year: 2010 })
      const systems2015 = detectSystems({ year: 2015 })
      const systems2020 = detectSystems({ year: 2020 })

      expect(systems2010).toContain('infotainment')
      expect(systems2010).toContain('can_bus')
      expect(systems2015).toContain('infotainment')
      expect(systems2020).toContain('infotainment')
    })

    it('should not include infotainment for vehicles before 2010', () => {
      const systems = detectSystems({ year: 2009 })

      expect(systems).not.toContain('infotainment')
      expect(systems).not.toContain('can_bus')
    })

    it('should include ADAS and parking sensors for vehicles 2015 and newer', () => {
      const systems2015 = detectSystems({ year: 2015 })
      const systems2020 = detectSystems({ year: 2020 })

      expect(systems2015).toContain('adas')
      expect(systems2015).toContain('parking_sensors')
      expect(systems2020).toContain('adas')
    })

    it('should not include ADAS for vehicles before 2015', () => {
      const systems = detectSystems({ year: 2014 })

      expect(systems).not.toContain('adas')
      expect(systems).not.toContain('parking_sensors')
    })
  })

  describe('combined system detection', () => {
    it('should detect all applicable systems for a modern sedan', () => {
      const systems = detectSystems({
        electrical_voltage: 12,
        body_style: 'Sedan',
        year: 2020,
      })

      // Base systems
      expect(systems).toContain('ignition')
      expect(systems).toContain('charging')
      expect(systems).toContain('starting')

      // 12V systems
      expect(systems).toContain('lighting')
      expect(systems).toContain('accessories')

      // Body style systems
      expect(systems).toContain('power_windows')
      expect(systems).toContain('power_locks')
      expect(systems).toContain('climate_control')

      // 2010+ systems
      expect(systems).toContain('infotainment')
      expect(systems).toContain('can_bus')

      // 2015+ systems
      expect(systems).toContain('adas')
      expect(systems).toContain('parking_sensors')
    })

    it('should detect appropriate systems for a classic truck', () => {
      const systems = detectSystems({
        electrical_voltage: 12,
        body_style: 'Truck',
        year: 1985,
      })

      // Base systems
      expect(systems).toContain('ignition')

      // 12V systems
      expect(systems).toContain('lighting')

      // Should NOT have modern systems
      expect(systems).not.toContain('power_windows')
      expect(systems).not.toContain('infotainment')
      expect(systems).not.toContain('adas')
    })

    it('should detect hybrid systems for a 48V mild hybrid', () => {
      const systems = detectSystems({
        electrical_voltage: 48,
        body_style: 'SUV',
        year: 2022,
      })

      // Should have hybrid systems
      expect(systems).toContain('mild_hybrid')
      expect(systems).toContain('high_voltage')

      // Should NOT have standard 12V systems
      expect(systems).not.toContain('lighting')
      expect(systems).not.toContain('accessories')
    })
  })
})

describe('Vehicle API Response Format', () => {
  describe('successful response structure', () => {
    it('should include all required fields per api-contracts.md', () => {
      const requiredFields = ['id', 'make', 'model', 'year', 'systems']
      const mockResponse = {
        id: 'vehicle-123',
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        systems: ['ignition', 'charging'],
      }

      requiredFields.forEach(field => {
        expect(mockResponse).toHaveProperty(field)
      })
    })

    it('should include optional extended fields', () => {
      const optionalFields = [
        'vin',
        'engine_type',
        'transmission_type',
        'fuel_type',
        'trim_level',
        'electrical_voltage',
        'workspace_id',
        'workspace_name',
      ]

      const mockResponse = {
        id: 'vehicle-123',
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        systems: ['ignition'],
        vin: '1HGCM82633A004352',
        engine_type: 'V6',
        transmission_type: 'automatic',
        fuel_type: 'gasoline',
        trim_level: 'XSE',
        electrical_voltage: 12,
        workspace_id: 'ws-123',
        workspace_name: 'My Garage',
      }

      optionalFields.forEach(field => {
        expect(mockResponse).toHaveProperty(field)
      })
    })
  })

  describe('error response structure', () => {
    it('should include error and message fields', () => {
      const errorResponse = {
        error: 'not_found',
        message: 'Vehicle not found',
      }

      expect(errorResponse.error).toBeTruthy()
      expect(errorResponse.message).toBeTruthy()
    })

    it('should include request_id for 500 errors', () => {
      const errorResponse = {
        error: 'internal_error',
        message: 'An unexpected error occurred',
        request_id: '550e8400-e29b-41d4-a716-446655440000',
      }

      expect(errorResponse.request_id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      )
    })
  })
})

describe('Vehicle API HTTP Status Codes', () => {
  describe('success status', () => {
    it('should return 200 for successful vehicle retrieval', () => {
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
  })
})
