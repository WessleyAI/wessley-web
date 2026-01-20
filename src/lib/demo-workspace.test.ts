/**
 * Tests for Demo Workspace utilities
 *
 * The demo workspace allows users to explore the app without authentication.
 * Critical for marketing demos and onboarding new users.
 *
 * Why these tests matter:
 * - Demo workspace must always be available (no auth required)
 * - Data integrity affects the demo experience
 * - ID matching is security-critical (bypasses auth checks)
 */

import { describe, it, expect } from 'vitest'
import {
  DEMO_WORKSPACE_ID,
  DEMO_WORKSPACE,
  DEMO_VEHICLE,
  isDemoWorkspace,
  getDemoWorkspace,
  getDemoVehicle,
} from './demo-workspace'

describe('demo-workspace', () => {
  describe('DEMO_WORKSPACE_ID', () => {
    it('should be a valid UUID format', () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      expect(DEMO_WORKSPACE_ID).toMatch(uuidRegex)
    })

    it('should be the expected demo workspace ID', () => {
      expect(DEMO_WORKSPACE_ID).toBe('cde0ea8e-07aa-4c59-a72b-ba0d56020484')
    })

    it('should be a non-empty string', () => {
      expect(typeof DEMO_WORKSPACE_ID).toBe('string')
      expect(DEMO_WORKSPACE_ID.length).toBeGreaterThan(0)
    })
  })

  describe('DEMO_WORKSPACE', () => {
    it('should have correct id matching DEMO_WORKSPACE_ID', () => {
      expect(DEMO_WORKSPACE.id).toBe(DEMO_WORKSPACE_ID)
    })

    it('should have a dummy user_id', () => {
      expect(DEMO_WORKSPACE.user_id).toBe('00000000-0000-0000-0000-000000000000')
    })

    it('should have workspace name "Scarlet"', () => {
      expect(DEMO_WORKSPACE.name).toBe('Scarlet')
    })

    it('should be marked as active', () => {
      expect(DEMO_WORKSPACE.status).toBe('active')
    })

    it('should be publicly visible', () => {
      expect(DEMO_WORKSPACE.visibility).toBe('public')
    })

    it('should have vehicle settings', () => {
      expect(DEMO_WORKSPACE.settings).toBeDefined()
      expect(DEMO_WORKSPACE.settings?.vehicle).toBeDefined()

      const vehicle = DEMO_WORKSPACE.settings?.vehicle as {
        make: string
        model: string
        year: number
        nickname: string
        engine: string
      }

      expect(vehicle.make).toBe('Hyundai')
      expect(vehicle.model).toBe('Galloper')
      expect(vehicle.year).toBe(2000)
      expect(vehicle.nickname).toBe('Scarlet')
      expect(vehicle.engine).toBe('3.0L V6')
    })

    it('should have a description', () => {
      expect(DEMO_WORKSPACE.description).toBeDefined()
      expect(DEMO_WORKSPACE.description!.length).toBeGreaterThan(0)
      expect(DEMO_WORKSPACE.description).toContain('Hyundai Galloper')
    })

    it('should have valid timestamps', () => {
      expect(DEMO_WORKSPACE.created_at).toBeDefined()
      expect(DEMO_WORKSPACE.updated_at).toBeDefined()

      // Verify they are valid ISO date strings
      expect(() => new Date(DEMO_WORKSPACE.created_at!)).not.toThrow()
      expect(() => new Date(DEMO_WORKSPACE.updated_at!)).not.toThrow()
    })

    it('should not be a home workspace', () => {
      expect(DEMO_WORKSPACE.is_home).toBe(false)
    })
  })

  describe('DEMO_VEHICLE', () => {
    it('should have a valid UUID format id', () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      expect(DEMO_VEHICLE.id).toMatch(uuidRegex)
    })

    it('should belong to the demo workspace', () => {
      expect(DEMO_VEHICLE.workspace_id).toBe(DEMO_WORKSPACE_ID)
    })

    it('should have correct make, model, and year', () => {
      expect(DEMO_VEHICLE.make).toBe('Hyundai')
      expect(DEMO_VEHICLE.model).toBe('Galloper')
      expect(DEMO_VEHICLE.year).toBe(2000)
    })

    it('should have engine type matching workspace settings', () => {
      const workspaceEngine = (DEMO_WORKSPACE.settings?.vehicle as Record<string, unknown>)?.engine
      expect(DEMO_VEHICLE.engine_type).toBe(workspaceEngine)
    })

    it('should have a valid VIN format', () => {
      // VINs are 17 characters
      expect(DEMO_VEHICLE.vin).toHaveLength(17)
    })

    it('should have nickname "Scarlet"', () => {
      expect(DEMO_VEHICLE.nickname).toBe('Scarlet')
    })

    it('should be active', () => {
      expect(DEMO_VEHICLE.is_active).toBe(true)
    })

    it('should have mileage information', () => {
      expect(DEMO_VEHICLE.mileage).toBeDefined()
      expect(DEMO_VEHICLE.mileage).toContain('145')
    })

    it('should have color "Red" (matching nickname "Scarlet")', () => {
      expect(DEMO_VEHICLE.color).toBe('Red')
    })

    it('should have transmission information', () => {
      expect(DEMO_VEHICLE.transmission).toBe('Manual')
    })

    it('should have fuel type', () => {
      expect(DEMO_VEHICLE.fuel_type).toBe('Gasoline')
    })

    it('should have drive type', () => {
      expect(DEMO_VEHICLE.drive_type).toBe('4WD')
    })

    it('should have notes about the vehicle', () => {
      expect(DEMO_VEHICLE.notes).toBeDefined()
      expect(DEMO_VEHICLE.notes!.length).toBeGreaterThan(0)
    })

    it('should have valid timestamps', () => {
      expect(DEMO_VEHICLE.created_at).toBeDefined()
      expect(DEMO_VEHICLE.updated_at).toBeDefined()

      expect(() => new Date(DEMO_VEHICLE.created_at)).not.toThrow()
      expect(() => new Date(DEMO_VEHICLE.updated_at)).not.toThrow()
    })
  })

  describe('isDemoWorkspace()', () => {
    it('should return true for the demo workspace ID', () => {
      expect(isDemoWorkspace(DEMO_WORKSPACE_ID)).toBe(true)
    })

    it('should return false for a random UUID', () => {
      expect(isDemoWorkspace('12345678-1234-1234-1234-123456789012')).toBe(false)
    })

    it('should return false for an empty string', () => {
      expect(isDemoWorkspace('')).toBe(false)
    })

    it('should return false for a similar but different ID', () => {
      // Change just one character
      const similarId = DEMO_WORKSPACE_ID.replace('c', 'd')
      expect(isDemoWorkspace(similarId)).toBe(false)
    })

    it('should be case-sensitive', () => {
      // UUIDs are case-insensitive by spec but our function does exact match
      expect(isDemoWorkspace(DEMO_WORKSPACE_ID.toUpperCase())).toBe(false)
    })

    it('should handle whitespace', () => {
      expect(isDemoWorkspace(` ${DEMO_WORKSPACE_ID}`)).toBe(false)
      expect(isDemoWorkspace(`${DEMO_WORKSPACE_ID} `)).toBe(false)
      expect(isDemoWorkspace(` ${DEMO_WORKSPACE_ID} `)).toBe(false)
    })
  })

  describe('getDemoWorkspace()', () => {
    it('should return the demo workspace object', () => {
      const workspace = getDemoWorkspace()
      expect(workspace).toEqual(DEMO_WORKSPACE)
    })

    it('should return the same reference each time', () => {
      const workspace1 = getDemoWorkspace()
      const workspace2 = getDemoWorkspace()
      expect(workspace1).toBe(workspace2)
    })

    it('should have all required workspace properties', () => {
      const workspace = getDemoWorkspace()

      expect(workspace.id).toBeDefined()
      expect(workspace.user_id).toBeDefined()
      expect(workspace.name).toBeDefined()
      expect(workspace.status).toBeDefined()
      expect(workspace.visibility).toBeDefined()
    })
  })

  describe('getDemoVehicle()', () => {
    it('should return the demo vehicle object', () => {
      const vehicle = getDemoVehicle()
      expect(vehicle).toEqual(DEMO_VEHICLE)
    })

    it('should return the same reference each time', () => {
      const vehicle1 = getDemoVehicle()
      const vehicle2 = getDemoVehicle()
      expect(vehicle1).toBe(vehicle2)
    })

    it('should have all required vehicle properties', () => {
      const vehicle = getDemoVehicle()

      expect(vehicle.id).toBeDefined()
      expect(vehicle.workspace_id).toBeDefined()
      expect(vehicle.make).toBeDefined()
      expect(vehicle.model).toBeDefined()
      expect(vehicle.year).toBeDefined()
    })
  })

  describe('Data consistency', () => {
    it('should have matching workspace ID between workspace and vehicle', () => {
      expect(DEMO_VEHICLE.workspace_id).toBe(DEMO_WORKSPACE.id)
    })

    it('should have matching vehicle data between workspace settings and vehicle', () => {
      const settings = DEMO_WORKSPACE.settings?.vehicle as {
        make: string
        model: string
        year: number
        nickname: string
      }

      expect(settings.make).toBe(DEMO_VEHICLE.make)
      expect(settings.model).toBe(DEMO_VEHICLE.model)
      expect(settings.year).toBe(DEMO_VEHICLE.year)
      expect(settings.nickname).toBe(DEMO_VEHICLE.nickname)
    })

    it('should have demo workspace ID match stripe.ts DEMO_WORKSPACE_ID', async () => {
      // This ensures the demo workspace ID is consistent across the codebase
      const { DEMO_WORKSPACE_ID: stripeDemoId } = await import('./stripe')
      expect(DEMO_WORKSPACE_ID).toBe(stripeDemoId)
    })
  })

  describe('Schema compliance', () => {
    it('workspace should have Tables<"workspaces"> compatible structure', () => {
      const workspace = getDemoWorkspace()

      // Check all expected properties exist
      const requiredKeys = ['id', 'user_id', 'name', 'status', 'visibility', 'is_home', 'created_at', 'updated_at']
      for (const key of requiredKeys) {
        expect(workspace).toHaveProperty(key)
      }
    })

    it('vehicle should have Tables<"vehicles"> compatible structure', () => {
      const vehicle = getDemoVehicle()

      // Check all expected properties exist
      const requiredKeys = ['id', 'workspace_id', 'make', 'model', 'year', 'is_active', 'created_at', 'updated_at']
      for (const key of requiredKeys) {
        expect(vehicle).toHaveProperty(key)
      }
    })
  })
})
