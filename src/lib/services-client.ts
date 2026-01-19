/**
 * Unified Services Client Library
 *
 * Provides TypeScript clients for all backend RAG services:
 * - Semantic Service (port 8003) - Vector search and documentation
 * - Ingestion Service (port 8080) - PDF processing and data ingestion
 * - Graph Service (port 8002) - Neo4j knowledge graph queries
 * - Learning Service (port 8000) - ML model training and inference
 * - 3D Model Service (port 3001) - 3D visualization generation
 *
 * All services are configured via environment variables with localhost defaults.
 */

// Service URLs from environment or defaults
const SEMANTIC_SERVICE_URL = process.env.SEMANTIC_SERVICE_URL || 'http://localhost:8003'
const INGESTION_SERVICE_URL = process.env.INGESTION_SERVICE_URL || 'http://localhost:8080'
const GRAPH_SERVICE_URL = process.env.GRAPH_SERVICE_URL || 'http://localhost:8002'
const LEARNING_SERVICE_URL = process.env.LEARNING_SERVICE_URL || 'http://localhost:8000'
const MODEL_3D_SERVICE_URL = process.env.MODEL_3D_SERVICE_URL || 'http://localhost:3001'

// Timeout configuration (ms)
const DEFAULT_TIMEOUT = 30000
const INGESTION_TIMEOUT = 120000 // Longer timeout for file uploads

export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public service: string,
    public errorCode?: string
  ) {
    super(message)
    this.name = 'ServiceError'
  }
}

// =============================================================================
// SEMANTIC SERVICE - Vector search and documentation
// =============================================================================

export interface SemanticSearchParams {
  query: string
  vehicleId?: string
  collection?: 'vehicle_docs' | 'component_docs'
  limit?: number
  threshold?: number
}

export interface SemanticSearchResult {
  id: string
  content: string
  score: number
  metadata: {
    source?: string
    chapter?: string
    section?: string
    page?: number
    keywords?: string[]
    vehicle_id?: string
  }
}

export interface SemanticSearchResponse {
  results: SemanticSearchResult[]
  query: string
  total: number
  processing_time_ms: number
}

export interface ChatEnhanceParams {
  query: string
  vehicleId?: string
  conversationHistory?: Array<{ role: string; content: string }>
  maxTokens?: number
}

export interface ChatEnhanceResponse {
  enhanced_context: string
  relevant_docs: SemanticSearchResult[]
  suggested_actions?: Array<{
    type: string
    description: string
    components?: string[]
  }>
}

export interface ComponentRecommendation {
  component_id: string
  name: string
  type: string
  similarity_score: number
  reason: string
}

export const semanticService = {
  /**
   * Universal semantic search across all collections
   */
  async search(params: SemanticSearchParams): Promise<SemanticSearchResponse> {
    const response = await fetch(`${SEMANTIC_SERVICE_URL}/search/universal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: params.query,
        vehicle_id: params.vehicleId,
        collection: params.collection,
        limit: params.limit || 5,
        threshold: params.threshold || 0.7,
      }),
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }))
      throw new ServiceError(
        error.detail || 'Semantic search failed',
        response.status,
        'semantic',
        error.error
      )
    }

    return response.json()
  },

  /**
   * Search specifically for component documentation
   */
  async searchComponents(params: {
    query: string
    componentTypes?: string[]
    limit?: number
  }): Promise<SemanticSearchResponse> {
    const response = await fetch(`${SEMANTIC_SERVICE_URL}/search/components`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: params.query,
        component_types: params.componentTypes,
        limit: params.limit || 5,
      }),
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }))
      throw new ServiceError(
        error.detail || 'Component search failed',
        response.status,
        'semantic',
        error.error
      )
    }

    return response.json()
  },

  /**
   * Search documentation (vehicle manuals, repair guides)
   */
  async searchDocumentation(params: {
    query: string
    vehicleId?: string
    source?: 'chilton' | 'haynes' | 'oem' | 'user'
    limit?: number
  }): Promise<SemanticSearchResponse> {
    const response = await fetch(`${SEMANTIC_SERVICE_URL}/search/documentation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: params.query,
        vehicle_id: params.vehicleId,
        source: params.source,
        limit: params.limit || 5,
      }),
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }))
      throw new ServiceError(
        error.detail || 'Documentation search failed',
        response.status,
        'semantic',
        error.error
      )
    }

    return response.json()
  },

  /**
   * Enhance chat context with relevant documentation
   */
  async enhanceChat(params: ChatEnhanceParams): Promise<ChatEnhanceResponse> {
    const response = await fetch(`${SEMANTIC_SERVICE_URL}/search/chat/enhance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: params.query,
        vehicle_id: params.vehicleId,
        conversation_history: params.conversationHistory,
        max_tokens: params.maxTokens || 2000,
      }),
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }))
      throw new ServiceError(
        error.detail || 'Chat enhancement failed',
        response.status,
        'semantic',
        error.error
      )
    }

    return response.json()
  },

  /**
   * Get similar component recommendations
   */
  async getRecommendations(componentId: string): Promise<ComponentRecommendation[]> {
    const response = await fetch(
      `${SEMANTIC_SERVICE_URL}/search/recommendations/${encodeURIComponent(componentId)}`,
      { signal: AbortSignal.timeout(DEFAULT_TIMEOUT) }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }))
      throw new ServiceError(
        error.detail || 'Failed to get recommendations',
        response.status,
        'semantic',
        error.error
      )
    }

    return response.json()
  },

  /**
   * Check service health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${SEMANTIC_SERVICE_URL}/search/health`, {
        signal: AbortSignal.timeout(5000),
      })
      return response.ok
    } catch {
      return false
    }
  },
}

// =============================================================================
// INGESTION SERVICE - PDF processing and data ingestion
// =============================================================================

export interface IngestionJobParams {
  file_url?: string
  file_content?: string // base64 encoded
  file_name: string
  file_type: 'pdf' | 'image' | 'schematic'
  vehicle_id?: string
  metadata?: Record<string, unknown>
}

export interface IngestionJob {
  job_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
  completed_at?: string
  progress?: number
  result?: {
    chunks_created: number
    embeddings_generated: number
    errors?: string[]
  }
  error?: string
}

export interface IngestionBenchmarkResult {
  throughput_pages_per_sec: number
  avg_chunk_time_ms: number
  avg_embedding_time_ms: number
  total_time_sec: number
}

export const ingestionService = {
  /**
   * Create a new ingestion job
   */
  async createJob(params: IngestionJobParams): Promise<IngestionJob> {
    const response = await fetch(`${INGESTION_SERVICE_URL}/v1/ingestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_url: params.file_url,
        file_content: params.file_content,
        file_name: params.file_name,
        file_type: params.file_type,
        vehicle_id: params.vehicle_id,
        metadata: params.metadata,
      }),
      signal: AbortSignal.timeout(INGESTION_TIMEOUT),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }))

      if (response.status === 413) {
        throw new ServiceError(
          'File too large. Maximum size is 50MB.',
          413,
          'ingestion',
          'file_too_large'
        )
      }

      if (response.status === 415) {
        throw new ServiceError(
          'Unsupported file type.',
          415,
          'ingestion',
          'unsupported_type'
        )
      }

      throw new ServiceError(
        error.detail || 'Failed to create ingestion job',
        response.status,
        'ingestion',
        error.error
      )
    }

    return response.json()
  },

  /**
   * Get ingestion job status and results
   */
  async getJob(jobId: string): Promise<IngestionJob> {
    const response = await fetch(
      `${INGESTION_SERVICE_URL}/v1/ingestions/${encodeURIComponent(jobId)}`,
      { signal: AbortSignal.timeout(DEFAULT_TIMEOUT) }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }))

      if (response.status === 404) {
        throw new ServiceError(
          'Ingestion job not found',
          404,
          'ingestion',
          'not_found'
        )
      }

      throw new ServiceError(
        error.detail || 'Failed to get ingestion job',
        response.status,
        'ingestion',
        error.error
      )
    }

    return response.json()
  },

  /**
   * Run performance benchmarks
   */
  async runBenchmark(): Promise<IngestionBenchmarkResult> {
    const response = await fetch(`${INGESTION_SERVICE_URL}/v1/benchmarks/run`, {
      method: 'POST',
      signal: AbortSignal.timeout(INGESTION_TIMEOUT),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }))
      throw new ServiceError(
        error.detail || 'Benchmark failed',
        response.status,
        'ingestion',
        error.error
      )
    }

    return response.json()
  },

  /**
   * Check service health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${INGESTION_SERVICE_URL}/healthz`, {
        signal: AbortSignal.timeout(5000),
      })
      return response.ok
    } catch {
      return false
    }
  },

  /**
   * Check service readiness (dependencies available)
   */
  async readinessCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${INGESTION_SERVICE_URL}/readyz`, {
        signal: AbortSignal.timeout(5000),
      })
      return response.ok
    } catch {
      return false
    }
  },
}

// =============================================================================
// GRAPH SERVICE - Neo4j knowledge graph queries
// =============================================================================

export interface GraphComponent {
  id: string
  type: string
  name: string
  position?: { x: number; y: number; z: number }
  specifications?: Record<string, unknown>
}

export interface GraphWire {
  id: string
  color: string
  gauge: string
  din_code?: string
}

export interface GraphConnection {
  from_component: string
  to_component: string
  wire: GraphWire
  relationship: string
}

export interface GraphPath {
  components: GraphComponent[]
  connections: GraphConnection[]
  total_length: number
}

export interface VehicleSystem {
  id: string
  name: string
  category: string
  components: GraphComponent[]
}

export const graphService = {
  /**
   * Get all systems for a vehicle
   */
  async getVehicleSystems(vehicleId: string): Promise<VehicleSystem[]> {
    const response = await fetch(
      `${GRAPH_SERVICE_URL}/vehicles/${encodeURIComponent(vehicleId)}/systems`,
      { signal: AbortSignal.timeout(DEFAULT_TIMEOUT) }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }))
      throw new ServiceError(
        error.detail || 'Failed to get vehicle systems',
        response.status,
        'graph',
        error.error
      )
    }

    return response.json()
  },

  /**
   * Get components in a specific system
   */
  async getSystemComponents(
    vehicleId: string,
    systemName: string
  ): Promise<GraphComponent[]> {
    const response = await fetch(
      `${GRAPH_SERVICE_URL}/vehicles/${encodeURIComponent(vehicleId)}/systems/${encodeURIComponent(systemName)}/components`,
      { signal: AbortSignal.timeout(DEFAULT_TIMEOUT) }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }))
      throw new ServiceError(
        error.detail || 'Failed to get system components',
        response.status,
        'graph',
        error.error
      )
    }

    return response.json()
  },

  /**
   * Get related components and connections
   */
  async getRelatedComponents(
    vehicleId: string,
    componentId: string,
    depth?: number
  ): Promise<{
    component: GraphComponent
    related: GraphComponent[]
    connections: GraphConnection[]
  }> {
    const params = new URLSearchParams()
    if (depth) params.set('depth', depth.toString())

    const response = await fetch(
      `${GRAPH_SERVICE_URL}/vehicles/${encodeURIComponent(vehicleId)}/components/${encodeURIComponent(componentId)}/related?${params}`,
      { signal: AbortSignal.timeout(DEFAULT_TIMEOUT) }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }))
      throw new ServiceError(
        error.detail || 'Failed to get related components',
        response.status,
        'graph',
        error.error
      )
    }

    return response.json()
  },

  /**
   * Find electrical path between two components
   */
  async findPath(
    vehicleId: string,
    fromComponentId: string,
    toComponentId: string
  ): Promise<GraphPath | null> {
    const response = await fetch(
      `${GRAPH_SERVICE_URL}/vehicles/${encodeURIComponent(vehicleId)}/paths`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_component: fromComponentId,
          to_component: toComponentId,
        }),
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
      }
    )

    if (response.status === 404) {
      return null // No path found
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }))
      throw new ServiceError(
        error.detail || 'Failed to find path',
        response.status,
        'graph',
        error.error
      )
    }

    return response.json()
  },

  /**
   * Check service health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${GRAPH_SERVICE_URL}/health`, {
        signal: AbortSignal.timeout(5000),
      })
      return response.ok
    } catch {
      return false
    }
  },
}

// =============================================================================
// LEARNING SERVICE - ML model training and inference
// =============================================================================

export interface LearningPrediction {
  symptom: string
  likely_causes: Array<{
    component_id: string
    probability: number
    reasoning: string
  }>
  diagnostic_steps: string[]
  confidence: number
}

export const learningService = {
  /**
   * Predict likely causes for a symptom
   */
  async predictCauses(params: {
    vehicleId: string
    symptom: string
    context?: string[]
  }): Promise<LearningPrediction> {
    const response = await fetch(`${LEARNING_SERVICE_URL}/predict/causes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicle_id: params.vehicleId,
        symptom: params.symptom,
        context: params.context,
      }),
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }))
      throw new ServiceError(
        error.detail || 'Prediction failed',
        response.status,
        'learning',
        error.error
      )
    }

    return response.json()
  },

  /**
   * Check service health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${LEARNING_SERVICE_URL}/health`, {
        signal: AbortSignal.timeout(5000),
      })
      return response.ok
    } catch {
      return false
    }
  },
}

// =============================================================================
// 3D MODEL SERVICE - 3D visualization generation
// =============================================================================

export interface Model3DGenerateParams {
  vehicle_id: string
  components: string[]
  highlight?: string[]
  format?: 'gltf' | 'glb'
}

export interface Model3DResult {
  model_url: string
  format: string
  component_count: number
  generated_at: string
}

export const model3DService = {
  /**
   * Generate 3D model for vehicle components
   */
  async generateModel(params: Model3DGenerateParams): Promise<Model3DResult> {
    const response = await fetch(`${MODEL_3D_SERVICE_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicle_id: params.vehicle_id,
        components: params.components,
        highlight: params.highlight,
        format: params.format || 'glb',
      }),
      signal: AbortSignal.timeout(60000), // 3D generation can take longer
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }))
      throw new ServiceError(
        error.detail || '3D model generation failed',
        response.status,
        '3d-model',
        error.error
      )
    }

    return response.json()
  },

  /**
   * Get pre-generated model for a vehicle
   */
  async getModel(vehicleId: string): Promise<Model3DResult | null> {
    const response = await fetch(
      `${MODEL_3D_SERVICE_URL}/models/${encodeURIComponent(vehicleId)}`,
      { signal: AbortSignal.timeout(DEFAULT_TIMEOUT) }
    )

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }))
      throw new ServiceError(
        error.detail || 'Failed to get model',
        response.status,
        '3d-model',
        error.error
      )
    }

    return response.json()
  },

  /**
   * Check service health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${MODEL_3D_SERVICE_URL}/health`, {
        signal: AbortSignal.timeout(5000),
      })
      return response.ok
    } catch {
      return false
    }
  },
}

// =============================================================================
// AGGREGATED HEALTH CHECK
// =============================================================================

export interface ServicesHealth {
  overall: boolean
  services: {
    semantic: boolean
    ingestion: boolean
    graph: boolean
    learning: boolean
    model3d: boolean
  }
  timestamp: string
}

/**
 * Check health of all services
 */
export async function checkAllServicesHealth(): Promise<ServicesHealth> {
  const [semantic, ingestion, graph, learning, model3d] = await Promise.all([
    semanticService.healthCheck(),
    ingestionService.healthCheck(),
    graphService.healthCheck(),
    learningService.healthCheck(),
    model3DService.healthCheck(),
  ])

  return {
    overall: semantic && ingestion,  // Core services required
    services: {
      semantic,
      ingestion,
      graph,
      learning,
      model3d,
    },
    timestamp: new Date().toISOString(),
  }
}

// Re-export error class for consumers
export { ServiceError as ServicesError }
