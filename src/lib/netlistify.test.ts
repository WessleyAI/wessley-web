/**
 * Tests for Netlistify ML Client Library
 *
 * Tests cover:
 * - generateSchematic() - Synthetic schematic generation
 * - getSchematicSvg() - SVG output generation
 * - getTemplates() - Circuit templates fetching
 * - healthCheck() - Service health monitoring
 * - analyzeImage() - ML image analysis
 * - NetlistifyError - Custom error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  generateSchematic,
  getSchematicSvg,
  getTemplates,
  healthCheck,
  analyzeImage,
  NetlistifyError,
  type SchematicResult,
  type TemplateInfo,
  type SchematicGenerateParams,
} from './netlistify'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('netlistify client library', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('NetlistifyError', () => {
    it('creates error with message and status code', () => {
      const error = new NetlistifyError('Test error', 500)
      expect(error.message).toBe('Test error')
      expect(error.statusCode).toBe(500)
      expect(error.name).toBe('NetlistifyError')
      expect(error.errorCode).toBeUndefined()
    })

    it('creates error with optional error code', () => {
      const error = new NetlistifyError('Bad request', 400, 'validation_error')
      expect(error.message).toBe('Bad request')
      expect(error.statusCode).toBe(400)
      expect(error.errorCode).toBe('validation_error')
    })

    it('is instanceof Error', () => {
      const error = new NetlistifyError('Test', 500)
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(NetlistifyError)
    })
  })

  describe('generateSchematic', () => {
    const mockSchematicResult: SchematicResult = {
      id: 'test-schematic-123',
      svg: 'base64encodedsvg==',
      svg_raw: '<svg>...</svg>',
      components: [
        {
          id: 'conn-1',
          type: 'connector',
          label: 'Main Connector',
          pins: [
            { id: 'pin-1', role: 'power', label: 'VCC' },
            { id: 'pin-2', role: 'ground', label: 'GND' },
          ],
          position: [100, 100],
          size: [50, 30],
        },
        {
          id: 'fuse-1',
          type: 'fuse',
          label: '15A Fuse',
          position: [200, 100],
        },
      ],
      wires: [
        {
          id: 'wire-1',
          from: { component_id: 'conn-1', pin_id: 'pin-1' },
          to: { component_id: 'fuse-1', pin_id: null },
          color: 'red',
          gauge_mm2: 2.5,
        },
      ],
      labels: {
        format: 'yolo',
        image_width: 1200,
        image_height: 960,
        objects: [
          { class: 'connector', bbox: [0.1, 0.1, 0.05, 0.03] },
          { class: 'fuse', bbox: [0.2, 0.1, 0.04, 0.02] },
        ],
      },
    }

    it('generates schematic with default parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSchematicResult),
      })

      const result = await generateSchematic()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/generate-schematic',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }
      )
      expect(result).toEqual(mockSchematicResult)
    })

    it('generates schematic with custom parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSchematicResult),
      })

      const params: SchematicGenerateParams = {
        min_connectors: 3,
        max_connectors: 8,
        min_wires: 10,
        max_wires: 25,
        allow_fuses: true,
        allow_relays: true,
        allow_splices: false,
        allow_ecus: true,
        seed: 42,
        width: 1600,
        height: 1200,
        template: 'headlight_circuit',
      }

      await generateSchematic(params)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/generate-schematic',
        expect.objectContaining({
          body: JSON.stringify(params),
        })
      )
    })

    it('throws NetlistifyError on HTTP error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ detail: 'Server overloaded' }),
      })

      try {
        await generateSchematic()
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(NetlistifyError)
        const netError = error as NetlistifyError
        expect(netError.statusCode).toBe(500)
        expect(netError.message).toBe('Server overloaded')
      }
    })

    it('handles non-JSON error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        json: () => Promise.reject(new Error('Invalid JSON')),
      })

      await expect(generateSchematic()).rejects.toMatchObject({
        statusCode: 502,
        message: 'Bad Gateway',
      })
    })

    it('parses error code from response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ detail: 'Invalid params', error: 'validation_failed' }),
      })

      try {
        await generateSchematic({ min_connectors: 100 })
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(NetlistifyError)
        const netError = error as NetlistifyError
        expect(netError.errorCode).toBe('validation_failed')
      }
    })
  })

  describe('getSchematicSvg', () => {
    const mockSvgContent = '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="960">...</svg>'

    it('fetches SVG with no parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockSvgContent),
      })

      const result = await getSchematicSvg()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/generate-schematic/svg'
      )
      expect(result).toBe(mockSvgContent)
    })

    it('appends query parameters correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockSvgContent),
      })

      await getSchematicSvg({
        seed: 123,
        template: 'power_window',
        width: 1600,
        height: 1200,
      })

      const calledUrl = mockFetch.mock.calls[0][0]
      expect(calledUrl).toContain('seed=123')
      expect(calledUrl).toContain('template=power_window')
      expect(calledUrl).toContain('width=1600')
      expect(calledUrl).toContain('height=1200')
    })

    it('handles partial parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockSvgContent),
      })

      await getSchematicSvg({ seed: 42 })

      const calledUrl = mockFetch.mock.calls[0][0]
      expect(calledUrl).toContain('seed=42')
      expect(calledUrl).not.toContain('template=')
      expect(calledUrl).not.toContain('width=')
    })

    it('throws NetlistifyError on failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
      })

      try {
        await getSchematicSvg()
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(NetlistifyError)
        const netError = error as NetlistifyError
        expect(netError.statusCode).toBe(503)
        expect(netError.message).toBe('Failed to generate SVG')
      }
    })
  })

  describe('getTemplates', () => {
    const mockTemplates: TemplateInfo[] = [
      {
        name: 'headlight_circuit',
        description: 'Basic headlight circuit with relay',
        typical_use: 'Testing headlight wiring',
        component_count: 5,
        wire_count: 8,
      },
      {
        name: 'power_window',
        description: 'Power window motor circuit',
        typical_use: 'Window regulator diagnostics',
        component_count: 7,
        wire_count: 12,
      },
      {
        name: 'starter_circuit',
        description: 'Starter motor and solenoid circuit',
        typical_use: 'Starting system troubleshooting',
        component_count: 6,
        wire_count: 10,
      },
    ]

    it('fetches templates successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ templates: mockTemplates }),
      })

      const result = await getTemplates()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/templates'
      )
      expect(result).toEqual(mockTemplates)
      expect(result).toHaveLength(3)
    })

    it('returns empty array when no templates', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ templates: [] }),
      })

      const result = await getTemplates()
      expect(result).toEqual([])
    })

    it('throws NetlistifyError on failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      try {
        await getTemplates()
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(NetlistifyError)
        const netError = error as NetlistifyError
        expect(netError.statusCode).toBe(500)
        expect(netError.message).toBe('Failed to fetch templates')
      }
    })
  })

  describe('healthCheck', () => {
    it('returns true when service is healthy', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      })

      const result = await healthCheck()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/health',
        expect.objectContaining({
          method: 'GET',
        })
      )
      expect(result).toBe(true)
    })

    it('returns false when service returns error status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
      })

      const result = await healthCheck()
      expect(result).toBe(false)
    })

    it('returns false when network error occurs', async () => {
      mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'))

      const result = await healthCheck()
      expect(result).toBe(false)
    })

    it('returns false when timeout occurs', async () => {
      mockFetch.mockRejectedValueOnce(new Error('AbortError: Signal timed out'))

      const result = await healthCheck()
      expect(result).toBe(false)
    })

    it('uses AbortSignal for timeout', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true })

      await healthCheck()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/health',
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      )
    })
  })

  describe('analyzeImage', () => {
    const mockAnalysisResult = {
      components: [
        {
          id: 'detected-1',
          type: 'fuse',
          label: '20A Fuse',
          bbox: [0.15, 0.25, 0.05, 0.03] as [number, number, number, number],
          confidence: 0.95,
        },
        {
          id: 'detected-2',
          type: 'relay',
          bbox: [0.35, 0.25, 0.06, 0.04] as [number, number, number, number],
          confidence: 0.88,
        },
      ],
      connections: [
        {
          source_id: 'detected-1',
          target_id: 'detected-2',
          wire_type: 'power',
          confidence: 0.82,
        },
      ],
      confidence: 0.87,
      warnings: ['Low light conditions detected'],
    }

    it('analyzes image successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAnalysisResult),
      })

      const imageBase64 = 'data:image/jpeg;base64,/9j/4AAQ...'
      const result = await analyzeImage(imageBase64)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/analyze',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageBase64 }),
        }
      )
      expect(result).toEqual(mockAnalysisResult)
      expect(result.components).toHaveLength(2)
      expect(result.connections).toHaveLength(1)
    })

    it('throws with error code not_schematic for 400 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Image does not appear to be a schematic' }),
      })

      try {
        await analyzeImage('invalid_image_data')
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(NetlistifyError)
        const netError = error as NetlistifyError
        expect(netError.statusCode).toBe(400)
        expect(netError.errorCode).toBe('not_schematic')
      }
    })

    it('throws with error code low_confidence for 422 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: () => Promise.resolve({ message: 'Detection confidence too low' }),
      })

      try {
        await analyzeImage('blurry_image_data')
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(NetlistifyError)
        const netError = error as NetlistifyError
        expect(netError.statusCode).toBe(422)
        expect(netError.errorCode).toBe('low_confidence')
      }
    })

    it('throws with error code model_unavailable for 503 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: () => Promise.resolve({ message: 'ML model temporarily unavailable' }),
      })

      try {
        await analyzeImage('valid_image_data')
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(NetlistifyError)
        const netError = error as NetlistifyError
        expect(netError.statusCode).toBe(503)
        expect(netError.errorCode).toBe('model_unavailable')
      }
    })

    it('handles generic server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ detail: 'Unexpected error occurred' }),
      })

      await expect(analyzeImage('valid_data')).rejects.toMatchObject({
        statusCode: 500,
        message: 'Unexpected error occurred',
      })
    })

    it('handles non-JSON error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        json: () => Promise.reject(new Error('Not JSON')),
      })

      await expect(analyzeImage('valid_data')).rejects.toMatchObject({
        statusCode: 502,
        message: 'Bad Gateway',
      })
    })
  })

  describe('type exports', () => {
    it('exports ComponentType type correctly', () => {
      const componentTypes: import('./netlistify').ComponentType[] = [
        'connector',
        'fuse',
        'relay',
        'ground',
        'splice',
        'ecu',
        'node',
        'sensor',
        'actuator',
        'switch',
        'led',
        'motor',
      ]
      expect(componentTypes).toHaveLength(12)
    })

    it('exports PinRole type correctly', () => {
      const pinRoles: import('./netlistify').PinRole[] = [
        'power',
        'ground',
        'signal',
        'unknown',
      ]
      expect(pinRoles).toHaveLength(4)
    })
  })
})
