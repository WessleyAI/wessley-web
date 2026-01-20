/**
 * Tests for Unified Services Client Library
 *
 * Tests cover all service clients:
 * - Semantic Service - Vector search and documentation
 * - Ingestion Service - PDF processing and data ingestion
 * - Graph Service - Neo4j knowledge graph queries
 * - Learning Service - ML model training and inference
 * - 3D Model Service - 3D visualization generation
 * - Aggregated Health Check - All services health monitoring
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  semanticService,
  ingestionService,
  graphService,
  learningService,
  model3DService,
  checkAllServicesHealth,
  ServiceError,
  type SemanticSearchParams,
  type SemanticSearchResponse,
  type IngestionJobParams,
  type IngestionJob,
  type GraphPath,
  type ServicesHealth,
} from './services-client'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('services-client library', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('ServiceError', () => {
    it('creates error with all properties', () => {
      const error = new ServiceError('Test error', 500, 'semantic', 'internal_error')
      expect(error.message).toBe('Test error')
      expect(error.statusCode).toBe(500)
      expect(error.service).toBe('semantic')
      expect(error.errorCode).toBe('internal_error')
      expect(error.name).toBe('ServiceError')
    })

    it('is instanceof Error', () => {
      const error = new ServiceError('Test', 500, 'graph')
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(ServiceError)
    })
  })

  describe('semanticService', () => {
    describe('search', () => {
      const mockSearchResponse: SemanticSearchResponse = {
        results: [
          {
            id: 'doc-1',
            content: 'Battery terminal connection specifications...',
            score: 0.95,
            metadata: {
              source: 'haynes',
              chapter: 'Electrical System',
              page: 45,
              vehicle_id: 'vehicle-123',
            },
          },
          {
            id: 'doc-2',
            content: 'Alternator charging circuit diagram...',
            score: 0.88,
            metadata: {
              source: 'oem',
              section: 'Charging System',
            },
          },
        ],
        query: 'battery terminal',
        total: 2,
        processing_time_ms: 45,
      }

      it('performs universal search with default params', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSearchResponse),
        })

        const result = await semanticService.search({ query: 'battery terminal' })

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8003/search/universal',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: 'battery terminal',
              vehicle_id: undefined,
              collection: undefined,
              limit: 5,
              threshold: 0.7,
            }),
          })
        )
        expect(result).toEqual(mockSearchResponse)
      })

      it('performs search with custom parameters', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSearchResponse),
        })

        const params: SemanticSearchParams = {
          query: 'headlight relay',
          vehicleId: 'vehicle-456',
          collection: 'component_docs',
          limit: 10,
          threshold: 0.8,
        }

        await semanticService.search(params)

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8003/search/universal',
          expect.objectContaining({
            body: JSON.stringify({
              query: 'headlight relay',
              vehicle_id: 'vehicle-456',
              collection: 'component_docs',
              limit: 10,
              threshold: 0.8,
            }),
          })
        )
      })

      it('throws ServiceError on failure', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: () => Promise.resolve({ detail: 'Qdrant connection failed' }),
        })

        try {
          await semanticService.search({ query: 'test' })
          expect.fail('Should have thrown')
        } catch (error) {
          expect(error).toBeInstanceOf(ServiceError)
          const svcError = error as ServiceError
          expect(svcError.service).toBe('semantic')
          expect(svcError.statusCode).toBe(500)
        }
      })
    })

    describe('searchComponents', () => {
      it('searches components with filters', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ results: [], query: 'fuse', total: 0, processing_time_ms: 10 }),
        })

        await semanticService.searchComponents({
          query: 'fuse',
          componentTypes: ['fuse', 'relay'],
          limit: 20,
        })

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8003/search/components',
          expect.objectContaining({
            body: JSON.stringify({
              query: 'fuse',
              component_types: ['fuse', 'relay'],
              limit: 20,
            }),
          })
        )
      })
    })

    describe('searchDocumentation', () => {
      it('searches documentation with source filter', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ results: [], query: 'wiring', total: 0, processing_time_ms: 15 }),
        })

        await semanticService.searchDocumentation({
          query: 'wiring diagram',
          vehicleId: 'vehicle-789',
          source: 'haynes',
          limit: 15,
        })

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8003/search/documentation',
          expect.objectContaining({
            body: JSON.stringify({
              query: 'wiring diagram',
              vehicle_id: 'vehicle-789',
              source: 'haynes',
              limit: 15,
            }),
          })
        )
      })
    })

    describe('enhanceChat', () => {
      it('enhances chat with context', async () => {
        const mockEnhanceResponse = {
          enhanced_context: 'Based on documentation...',
          relevant_docs: [],
          suggested_actions: [
            {
              type: 'inspect',
              description: 'Check fuse box',
              components: ['fuse-1', 'fuse-2'],
            },
          ],
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockEnhanceResponse),
        })

        const result = await semanticService.enhanceChat({
          query: 'car won\'t start',
          vehicleId: 'v-123',
          conversationHistory: [
            { role: 'user', content: 'My car won\'t start' },
          ],
          maxTokens: 3000,
        })

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8003/search/chat/enhance',
          expect.any(Object)
        )
        expect(result.suggested_actions).toHaveLength(1)
      })
    })

    describe('getRecommendations', () => {
      it('gets component recommendations', async () => {
        const mockRecommendations = [
          {
            component_id: 'alt-123',
            name: 'Alternator',
            type: 'charging',
            similarity_score: 0.92,
            reason: 'Related to charging system',
          },
        ]

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockRecommendations),
        })

        const result = await semanticService.getRecommendations('battery-456')

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8003/search/recommendations/battery-456',
          expect.any(Object)
        )
        expect(result).toEqual(mockRecommendations)
      })
    })

    describe('healthCheck', () => {
      it('returns true when healthy', async () => {
        mockFetch.mockResolvedValueOnce({ ok: true })
        const result = await semanticService.healthCheck()
        expect(result).toBe(true)
      })

      it('returns false on error', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Connection refused'))
        const result = await semanticService.healthCheck()
        expect(result).toBe(false)
      })
    })
  })

  describe('ingestionService', () => {
    describe('createJob', () => {
      const mockJob: IngestionJob = {
        job_id: 'job-123',
        status: 'pending',
        created_at: '2026-01-20T10:00:00Z',
      }

      it('creates ingestion job from URL', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockJob),
        })

        const params: IngestionJobParams = {
          file_url: 'https://example.com/manual.pdf',
          file_name: 'manual.pdf',
          file_type: 'pdf',
          vehicle_id: 'vehicle-123',
          metadata: { source: 'user_upload' },
        }

        const result = await ingestionService.createJob(params)

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/v1/ingestions',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              file_url: params.file_url,
              file_content: undefined,
              file_name: params.file_name,
              file_type: params.file_type,
              vehicle_id: params.vehicle_id,
              metadata: params.metadata,
            }),
          })
        )
        expect(result).toEqual(mockJob)
      })

      it('creates ingestion job from base64 content', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockJob),
        })

        await ingestionService.createJob({
          file_content: 'base64encodedpdf...',
          file_name: 'schematic.pdf',
          file_type: 'pdf',
        })

        expect(mockFetch).toHaveBeenCalled()
      })

      it('throws ServiceError for file too large (413)', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 413,
          json: () => Promise.resolve({ detail: 'File too large' }),
        })

        await expect(
          ingestionService.createJob({
            file_content: 'huge_file_data',
            file_name: 'large.pdf',
            file_type: 'pdf',
          })
        ).rejects.toMatchObject({
          statusCode: 413,
          errorCode: 'file_too_large',
          message: 'File too large. Maximum size is 50MB.',
        })
      })

      it('throws ServiceError for unsupported type (415)', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 415,
          json: () => Promise.resolve({ detail: 'Unsupported media type' }),
        })

        await expect(
          ingestionService.createJob({
            file_name: 'file.xyz',
            file_type: 'pdf',
          })
        ).rejects.toMatchObject({
          statusCode: 415,
          errorCode: 'unsupported_type',
        })
      })
    })

    describe('getJob', () => {
      it('gets job status', async () => {
        const completedJob: IngestionJob = {
          job_id: 'job-123',
          status: 'completed',
          created_at: '2026-01-20T10:00:00Z',
          completed_at: '2026-01-20T10:02:00Z',
          progress: 100,
          result: {
            chunks_created: 45,
            embeddings_generated: 45,
          },
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(completedJob),
        })

        const result = await ingestionService.getJob('job-123')

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/v1/ingestions/job-123',
          expect.any(Object)
        )
        expect(result.status).toBe('completed')
      })

      it('throws ServiceError for not found (404)', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ detail: 'Not found' }),
        })

        await expect(ingestionService.getJob('nonexistent')).rejects.toMatchObject({
          statusCode: 404,
          errorCode: 'not_found',
        })
      })
    })

    describe('runBenchmark', () => {
      it('runs benchmark and returns results', async () => {
        const benchmarkResult = {
          throughput_pages_per_sec: 2.5,
          avg_chunk_time_ms: 150,
          avg_embedding_time_ms: 200,
          total_time_sec: 30,
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(benchmarkResult),
        })

        const result = await ingestionService.runBenchmark()
        expect(result.throughput_pages_per_sec).toBe(2.5)
      })
    })

    describe('healthCheck and readinessCheck', () => {
      it('healthCheck returns true when healthy', async () => {
        mockFetch.mockResolvedValueOnce({ ok: true })
        const result = await ingestionService.healthCheck()
        expect(result).toBe(true)
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/healthz',
          expect.any(Object)
        )
      })

      it('readinessCheck returns true when ready', async () => {
        mockFetch.mockResolvedValueOnce({ ok: true })
        const result = await ingestionService.readinessCheck()
        expect(result).toBe(true)
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/readyz',
          expect.any(Object)
        )
      })
    })
  })

  describe('graphService', () => {
    describe('getVehicleSystems', () => {
      it('gets vehicle systems', async () => {
        const mockSystems = [
          {
            id: 'sys-1',
            name: 'Charging System',
            category: 'electrical',
            components: [],
          },
          {
            id: 'sys-2',
            name: 'Starting System',
            category: 'electrical',
            components: [],
          },
        ]

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSystems),
        })

        const result = await graphService.getVehicleSystems('vehicle-123')

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8002/vehicles/vehicle-123/systems',
          expect.any(Object)
        )
        expect(result).toHaveLength(2)
      })
    })

    describe('getSystemComponents', () => {
      it('gets components in a system', async () => {
        const mockComponents = [
          { id: 'comp-1', type: 'alternator', name: 'Alternator' },
          { id: 'comp-2', type: 'battery', name: 'Battery' },
        ]

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockComponents),
        })

        const result = await graphService.getSystemComponents('v-123', 'Charging System')

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8002/vehicles/v-123/systems/Charging%20System/components',
          expect.any(Object)
        )
        expect(result).toHaveLength(2)
      })
    })

    describe('getRelatedComponents', () => {
      it('gets related components with depth', async () => {
        const mockRelated = {
          component: { id: 'comp-1', type: 'fuse', name: 'Main Fuse' },
          related: [{ id: 'comp-2', type: 'relay', name: 'Relay' }],
          connections: [],
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockRelated),
        })

        await graphService.getRelatedComponents('v-123', 'comp-1', 3)

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8002/vehicles/v-123/components/comp-1/related?depth=3',
          expect.any(Object)
        )
      })
    })

    describe('findPath', () => {
      it('finds path between components', async () => {
        const mockPath: GraphPath = {
          components: [
            { id: 'c1', type: 'battery', name: 'Battery' },
            { id: 'c2', type: 'fuse', name: 'Fuse' },
            { id: 'c3', type: 'motor', name: 'Starter' },
          ],
          connections: [],
          total_length: 2,
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockPath),
        })

        const result = await graphService.findPath('v-123', 'c1', 'c3')

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8002/vehicles/v-123/paths',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              from_component: 'c1',
              to_component: 'c3',
            }),
          })
        )
        expect(result?.components).toHaveLength(3)
      })

      it('returns null when no path found (404)', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
        })

        const result = await graphService.findPath('v-123', 'a', 'z')
        expect(result).toBeNull()
      })

      it('throws on other errors', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ detail: 'Database error' }),
        })

        await expect(graphService.findPath('v-123', 'a', 'b')).rejects.toThrow(ServiceError)
      })
    })

    describe('healthCheck', () => {
      it('returns true when healthy', async () => {
        mockFetch.mockResolvedValueOnce({ ok: true })
        const result = await graphService.healthCheck()
        expect(result).toBe(true)
      })
    })
  })

  describe('learningService', () => {
    describe('predictCauses', () => {
      it('predicts causes for symptoms', async () => {
        const mockPrediction = {
          symptom: 'Engine won\'t start',
          likely_causes: [
            {
              component_id: 'battery-1',
              probability: 0.75,
              reasoning: 'Most common cause of no-start conditions',
            },
            {
              component_id: 'starter-1',
              probability: 0.15,
              reasoning: 'Starter motor may be failing',
            },
          ],
          diagnostic_steps: [
            'Check battery voltage',
            'Test starter motor',
          ],
          confidence: 0.85,
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockPrediction),
        })

        const result = await learningService.predictCauses({
          vehicleId: 'v-123',
          symptom: 'Engine won\'t start',
          context: ['Battery is 3 years old'],
        })

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8000/predict/causes',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              vehicle_id: 'v-123',
              symptom: 'Engine won\'t start',
              context: ['Battery is 3 years old'],
            }),
          })
        )
        expect(result.likely_causes).toHaveLength(2)
      })
    })

    describe('healthCheck', () => {
      it('returns true when healthy', async () => {
        mockFetch.mockResolvedValueOnce({ ok: true })
        const result = await learningService.healthCheck()
        expect(result).toBe(true)
      })
    })
  })

  describe('model3DService', () => {
    describe('generateModel', () => {
      it('generates 3D model', async () => {
        const mockResult = {
          model_url: 'https://storage/models/v-123.glb',
          format: 'glb',
          component_count: 5,
          generated_at: '2026-01-20T10:00:00Z',
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResult),
        })

        const result = await model3DService.generateModel({
          vehicle_id: 'v-123',
          components: ['battery', 'alternator', 'starter'],
          highlight: ['battery'],
          format: 'glb',
        })

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3001/generate',
          expect.objectContaining({
            method: 'POST',
          })
        )
        expect(result.model_url).toBeDefined()
      })
    })

    describe('getModel', () => {
      it('gets existing model', async () => {
        const mockResult = {
          model_url: 'https://storage/models/v-123.glb',
          format: 'glb',
          component_count: 5,
          generated_at: '2026-01-20T10:00:00Z',
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResult),
        })

        const result = await model3DService.getModel('v-123')
        expect(result?.model_url).toBeDefined()
      })

      it('returns null when model not found (404)', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
        })

        const result = await model3DService.getModel('nonexistent')
        expect(result).toBeNull()
      })
    })

    describe('healthCheck', () => {
      it('returns true when healthy', async () => {
        mockFetch.mockResolvedValueOnce({ ok: true })
        const result = await model3DService.healthCheck()
        expect(result).toBe(true)
      })
    })
  })

  describe('checkAllServicesHealth', () => {
    it('returns overall true when core services healthy', async () => {
      // Mock all health checks
      mockFetch
        .mockResolvedValueOnce({ ok: true })  // semantic
        .mockResolvedValueOnce({ ok: true })  // ingestion
        .mockResolvedValueOnce({ ok: true })  // graph
        .mockResolvedValueOnce({ ok: true })  // learning
        .mockResolvedValueOnce({ ok: true })  // model3d

      const result = await checkAllServicesHealth()

      expect(result.overall).toBe(true)
      expect(result.services.semantic).toBe(true)
      expect(result.services.ingestion).toBe(true)
      expect(result.services.graph).toBe(true)
      expect(result.services.learning).toBe(true)
      expect(result.services.model3d).toBe(true)
      expect(result.timestamp).toBeDefined()
    })

    it('returns overall false when semantic service down', async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: false })  // semantic - down
        .mockResolvedValueOnce({ ok: true })   // ingestion
        .mockResolvedValueOnce({ ok: true })   // graph
        .mockResolvedValueOnce({ ok: true })   // learning
        .mockResolvedValueOnce({ ok: true })   // model3d

      const result = await checkAllServicesHealth()

      expect(result.overall).toBe(false)
      expect(result.services.semantic).toBe(false)
      expect(result.services.ingestion).toBe(true)
    })

    it('returns overall false when ingestion service down', async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: true })   // semantic
        .mockResolvedValueOnce({ ok: false })  // ingestion - down
        .mockResolvedValueOnce({ ok: true })   // graph
        .mockResolvedValueOnce({ ok: true })   // learning
        .mockResolvedValueOnce({ ok: true })   // model3d

      const result = await checkAllServicesHealth()

      expect(result.overall).toBe(false)
      expect(result.services.semantic).toBe(true)
      expect(result.services.ingestion).toBe(false)
    })

    it('returns overall true when non-core services down', async () => {
      // Only semantic and ingestion are core services
      mockFetch
        .mockResolvedValueOnce({ ok: true })   // semantic - up
        .mockResolvedValueOnce({ ok: true })   // ingestion - up
        .mockResolvedValueOnce({ ok: false })  // graph - down
        .mockResolvedValueOnce({ ok: false })  // learning - down
        .mockResolvedValueOnce({ ok: false })  // model3d - down

      const result = await checkAllServicesHealth()

      expect(result.overall).toBe(true)
      expect(result.services.graph).toBe(false)
      expect(result.services.learning).toBe(false)
      expect(result.services.model3d).toBe(false)
    })

    it('handles network errors gracefully', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))  // semantic
        .mockRejectedValueOnce(new Error('Network error'))  // ingestion
        .mockRejectedValueOnce(new Error('Network error'))  // graph
        .mockRejectedValueOnce(new Error('Network error'))  // learning
        .mockRejectedValueOnce(new Error('Network error'))  // model3d

      const result = await checkAllServicesHealth()

      expect(result.overall).toBe(false)
      expect(result.services.semantic).toBe(false)
      expect(result.services.ingestion).toBe(false)
    })
  })
})
