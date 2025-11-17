/**
 * NDJSON Electrical System Loader
 * Loads and parses enhanced electrical component data from NDJSON format
 */

export interface NDJSONNode {
  kind: 'node' | 'edge' | 'meta'
  id: string
  node_type?: string
  canonical_id?: string
  code_id?: string
  anchor_zone?: string | null
  anchor_xyz?: [number, number, number] | null
  bbox_m?: [number, number, number] | null
  voltage?: string | null
  mounting_surface?: string | null
  service_access?: string | null
  [key: string]: any
}

export interface NDJSONEdge {
  kind: 'edge'
  source: string
  target: string
  [key: string]: any
}

export interface NDJSONMetadata {
  kind: 'meta'
  model: string
  version: string
  units?: {
    length?: string
    angle?: string
    voltage?: string
    current?: string
  }
  coord_frame?: {
    x: string
    y: string
    z: string
    origin: string
  }
  vehicle_specs?: {
    length: number
    width: number
    height: number
    wheelbase: number
    ground_clearance: number
  }
  [key: string]: any
}

export interface ParsedNDJSON {
  nodesById: Record<string, NDJSONNode>
  edges: NDJSONEdge[]
  byZone: Record<string, string[]>
  byType: Record<string, string[]>
  metadata: NDJSONMetadata | null
}

/**
 * Parse NDJSON text into structured data
 */
export function parseNDJSON(ndjsonText: string): ParsedNDJSON {
  const lines = ndjsonText.trim().split('\n')
  const nodesById: Record<string, NDJSONNode> = {}
  const edges: NDJSONEdge[] = []
  const byZone: Record<string, string[]> = {}
  const byType: Record<string, string[]> = {}
  let metadata: NDJSONMetadata | null = null

  for (const line of lines) {
    if (!line.trim()) continue

    const record = JSON.parse(line)

    if (record.kind === 'meta') {
      metadata = record as NDJSONMetadata
    } else if (record.kind === 'node') {
      const node = record as NDJSONNode
      nodesById[node.id] = node

      // Index by zone
      if (node.anchor_zone) {
        if (!byZone[node.anchor_zone]) byZone[node.anchor_zone] = []
        byZone[node.anchor_zone].push(node.id)
      }

      // Index by type
      if (node.node_type) {
        if (!byType[node.node_type]) byType[node.node_type] = []
        byType[node.node_type].push(node.id)
      }
    } else if (record.kind === 'edge') {
      edges.push(record as NDJSONEdge)
    }
  }

  return { nodesById, edges, byZone, byType, metadata }
}

/**
 * Load NDJSON file from URL
 */
export async function loadNDJSON(url: string): Promise<ParsedNDJSON> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load NDJSON: ${response.status}`)
  }

  const ndjsonText = await response.text()
  return parseNDJSON(ndjsonText)
}

/**
 * Filter nodes with valid 3D positions
 */
export function getPositionedNodes(parsed: ParsedNDJSON): NDJSONNode[] {
  return Object.values(parsed.nodesById).filter(
    node => node.anchor_xyz && node.anchor_xyz.every(v => v !== null)
  )
}

/**
 * Get nodes by type
 */
export function getNodesByType(parsed: ParsedNDJSON, nodeType: string): NDJSONNode[] {
  const nodeIds = parsed.byType[nodeType] || []
  return nodeIds.map(id => parsed.nodesById[id])
}

/**
 * Get nodes by zone
 */
export function getNodesByZone(parsed: ParsedNDJSON, zone: string): NDJSONNode[] {
  const nodeIds = parsed.byZone[zone] || []
  return nodeIds.map(id => parsed.nodesById[id])
}

/**
 * Build a hierarchical scene graph from NDJSON data, organized by anchor zones
 */
export function buildSceneGraphFromNDJSON(parsed: ParsedNDJSON): any {
  const zoneNodes: any[] = []

  // Get all unique zones
  const zones = Object.keys(parsed.byZone)

  zones.forEach(zone => {
    const nodesInZone = getNodesByZone(parsed, zone)
    const positionedNodes = nodesInZone.filter(node => node.anchor_xyz)

    if (positionedNodes.length === 0) return // Skip empty zones

    // Create a zone node
    const zoneNode = {
      id: `zone_${zone}`,
      name: zone,
      type: 'Zone',
      position: [0, 0, 0] as [number, number, number],
      children: positionedNodes.map(node => ({
        id: node.id,
        name: node.canonical_id || node.id,
        type: node.node_type || 'Unknown',
        position: node.anchor_xyz as [number, number, number],
        children: []
      }))
    }

    zoneNodes.push(zoneNode)
  })

  // Create root node
  return {
    id: 'root',
    name: 'Pajero Electrical System',
    type: 'Root',
    position: [0, 0, 0] as [number, number, number],
    children: zoneNodes
  }
}
