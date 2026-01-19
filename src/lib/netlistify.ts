/**
 * Netlistify ML Client Library
 *
 * Provides TypeScript client for the netlistify schematic generation
 * and component detection ML service.
 *
 * API Base URL: Configurable via NETLISTIFY_URL env var
 * Default: http://localhost:8000
 */

const NETLISTIFY_URL = process.env.NETLISTIFY_URL || 'http://localhost:8000'

// Component types from the ML model
export type ComponentType =
  | 'connector'
  | 'fuse'
  | 'relay'
  | 'ground'
  | 'splice'
  | 'ecu'
  | 'node'
  | 'sensor'
  | 'actuator'
  | 'switch'
  | 'led'
  | 'motor'

export type PinRole = 'power' | 'ground' | 'signal' | 'unknown'

export interface Pin {
  id: string
  role: PinRole
  net_id?: string
  label?: string
  position?: [number, number]
}

export interface SchematicComponent {
  id: string
  type: ComponentType
  label: string
  pins?: Pin[]
  attributes?: Record<string, unknown>
  position?: [number, number]
  size?: [number, number]
}

export interface WireEndpoint {
  component_id: string
  pin_id?: string | null
}

export interface Wire {
  id: string
  from: WireEndpoint
  to: WireEndpoint
  color: string
  gauge_mm2: number
  attributes?: Record<string, unknown>
  polyline?: Array<[number, number]>
}

export interface YoloObject {
  class: string
  bbox: [number, number, number, number]  // normalized [x, y, w, h]
}

export interface YoloLabels {
  format: 'yolo'
  image_width: number
  image_height: number
  objects: YoloObject[]
}

export interface SchematicResult {
  id: string
  svg: string  // base64 encoded
  svg_raw: string  // raw SVG markup
  components: SchematicComponent[]
  wires: Wire[]
  labels: YoloLabels
}

export interface SchematicGenerateParams {
  min_connectors?: number  // 1-20, default 2
  max_connectors?: number  // 1-20, default 6
  min_wires?: number       // 1-50, default 5
  max_wires?: number       // 1-50, default 20
  allow_fuses?: boolean
  allow_relays?: boolean
  allow_splices?: boolean
  allow_ecus?: boolean
  allow_grounds?: boolean
  allow_sensors?: boolean
  allow_actuators?: boolean
  allow_switches?: boolean
  allow_leds?: boolean
  allow_motors?: boolean
  seed?: number
  width?: number   // 200-4000, default 1200
  height?: number  // 200-4000, default 960
  template?: string
}

export interface TemplateInfo {
  name: string
  description: string
  typical_use: string
  component_count: number
  wire_count: number
}

export interface TemplatesResponse {
  templates: TemplateInfo[]
}

export class NetlistifyError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorCode?: string
  ) {
    super(message)
    this.name = 'NetlistifyError'
  }
}

/**
 * Generate a synthetic schematic diagram
 */
export async function generateSchematic(
  params: SchematicGenerateParams = {}
): Promise<SchematicResult> {
  const response = await fetch(`${NETLISTIFY_URL}/api/generate-schematic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new NetlistifyError(
      error.detail || 'Failed to generate schematic',
      response.status,
      error.error
    )
  }

  return response.json()
}

/**
 * Get raw SVG output directly (no JSON wrapper)
 */
export async function getSchematicSvg(params: {
  seed?: number
  template?: string
  width?: number
  height?: number
} = {}): Promise<string> {
  const searchParams = new URLSearchParams()
  if (params.seed !== undefined) searchParams.set('seed', params.seed.toString())
  if (params.template) searchParams.set('template', params.template)
  if (params.width) searchParams.set('width', params.width.toString())
  if (params.height) searchParams.set('height', params.height.toString())

  const url = `${NETLISTIFY_URL}/api/generate-schematic/svg${searchParams.toString() ? '?' + searchParams.toString() : ''}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new NetlistifyError(
      'Failed to generate SVG',
      response.status
    )
  }

  return response.text()
}

/**
 * Get available circuit templates
 */
export async function getTemplates(): Promise<TemplateInfo[]> {
  const response = await fetch(`${NETLISTIFY_URL}/api/templates`)

  if (!response.ok) {
    throw new NetlistifyError(
      'Failed to fetch templates',
      response.status
    )
  }

  const data: TemplatesResponse = await response.json()
  return data.templates
}

/**
 * Check if netlistify service is healthy
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${NETLISTIFY_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Analyze an uploaded image for schematic detection
 * Note: This endpoint is for the ML inference pipeline (YOLOv8 detection)
 */
export async function analyzeImage(imageBase64: string): Promise<{
  components: Array<{
    id: string
    type: string
    label?: string
    bbox: [number, number, number, number]
    confidence: number
  }>
  connections: Array<{
    source_id: string
    target_id: string
    wire_type?: string
    confidence: number
  }>
  confidence: number
  warnings?: string[]
}> {
  const response = await fetch(`${NETLISTIFY_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageBase64 }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))

    if (response.status === 400) {
      throw new NetlistifyError(
        error.message || 'Image does not appear to be a schematic',
        400,
        'not_schematic'
      )
    }

    if (response.status === 422) {
      throw new NetlistifyError(
        error.message || 'Detection confidence too low',
        422,
        'low_confidence'
      )
    }

    if (response.status === 503) {
      throw new NetlistifyError(
        error.message || 'ML model temporarily unavailable',
        503,
        'model_unavailable'
      )
    }

    throw new NetlistifyError(
      error.detail || 'Analysis failed',
      response.status,
      error.error
    )
  }

  return response.json()
}
