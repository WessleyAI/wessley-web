/**
 * Electrical Path Tracer
 * Traces electrical connections from a component to ground, battery, and through fusebox/relays
 */

import { type ParsedNDJSON, type NDJSONEdge, type NDJSONNode } from './ndjson-loader'

interface PathNode {
  id: string
  node: NDJSONNode
  depth: number
  pathType: 'upstream' | 'downstream' | 'related'
}

/**
 * Build adjacency list from edges for faster traversal
 */
function buildAdjacencyList(edges: NDJSONEdge[]): {
  forward: Map<string, string[]>
  backward: Map<string, string[]>
} {
  const forward = new Map<string, string[]>()
  const backward = new Map<string, string[]>()

  for (const edge of edges) {
    // Forward: source -> target
    if (!forward.has(edge.source)) forward.set(edge.source, [])
    forward.get(edge.source)!.push(edge.target)

    // Backward: target -> source
    if (!backward.has(edge.target)) backward.set(edge.target, [])
    backward.get(edge.target)!.push(edge.source)
  }

  return { forward, backward }
}

/**
 * BFS to find all connected nodes within maxDepth
 */
function bfsTraverse(
  startId: string,
  adjacency: Map<string, string[]>,
  maxDepth: number
): Set<string> {
  const visited = new Set<string>()
  const queue: { id: string; depth: number }[] = [{ id: startId, depth: 0 }]

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!

    if (visited.has(id) || depth > maxDepth) continue
    visited.add(id)

    const neighbors = adjacency.get(id) || []
    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        queue.push({ id: neighborId, depth: depth + 1 })
      }
    }
  }

  return visited
}

/**
 * Find path from component to specific target types (battery, ground, etc.)
 */
function findPathToType(
  startId: string,
  targetTypes: string[],
  ndjsonData: ParsedNDJSON,
  adjacency: Map<string, string[]>,
  maxDepth: number = 10
): string[] {
  const visited = new Set<string>()
  const queue: { id: string; path: string[] }[] = [{ id: startId, path: [startId] }]

  while (queue.length > 0) {
    const { id, path } = queue.shift()!

    if (visited.has(id) || path.length > maxDepth) continue
    visited.add(id)

    const node = ndjsonData.nodesById[id]
    if (node && targetTypes.some(type => node.node_type?.toLowerCase().includes(type.toLowerCase()))) {
      return path
    }

    const neighbors = adjacency.get(id) || []
    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        queue.push({ id: neighborId, path: [...path, neighborId] })
      }
    }
  }

  return []
}

/**
 * Find SHORTEST path between two nodes using BFS
 * Returns the path as an array of node IDs
 */
function findShortestPath(
  startId: string,
  targetTest: (nodeId: string, node: NDJSONNode) => boolean,
  adjacency: Map<string, string[]>,
  ndjsonData: ParsedNDJSON,
  maxDepth: number = 15
): string[] {
  const visited = new Set<string>()
  const queue: { id: string; path: string[] }[] = [{ id: startId, path: [startId] }]

  while (queue.length > 0) {
    const { id, path } = queue.shift()!

    if (visited.has(id) || path.length > maxDepth) continue
    visited.add(id)

    const node = ndjsonData.nodesById[id]
    if (node && targetTest(id, node)) {
      // Found target! Return the complete path
      return path
    }

    const neighbors = adjacency.get(id) || []
    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        queue.push({ id: neighborId, path: [...path, neighborId] })
      }
    }
  }

  return [] // No path found
}

/**
 * Merge adjacency lists for bidirectional search
 */
function mergeAdjacency(
  forward: Map<string, string[]>,
  backward: Map<string, string[]>
): Map<string, string[]> {
  const merged = new Map<string, string[]>()

  // Add all forward connections
  for (const [key, values] of forward.entries()) {
    merged.set(key, [...values])
  }

  // Add all backward connections
  for (const [key, values] of backward.entries()) {
    if (merged.has(key)) {
      merged.get(key)!.push(...values)
    } else {
      merged.set(key, [...values])
    }
  }

  return merged
}

/**
 * Trace SPECIFIC electrical paths for a component
 * Returns ordered arrays for sequential wire generation
 */
export interface TracedPaths {
  allHighlighted: string[]        // All unique node IDs to highlight
  groundPath: string[]            // Ordered path from component to ground
  batteryPath: string[]           // Ordered path from component to battery
  completeCircuit: string[]       // Combined ordered path for wire generation
}

export function traceElectricalPath(
  componentId: string,
  ndjsonData: ParsedNDJSON
): TracedPaths {
  const { forward, backward } = buildAdjacencyList(ndjsonData.edges)
  const bidirectional = mergeAdjacency(forward, backward)

  // Simple BFS: traverse ALL connected nodes via electrical edges
  const visited = new Set<string>()
  const queue: string[] = [componentId]
  const allConnected: string[] = []

  while (queue.length > 0) {
    const currentId = queue.shift()!

    if (visited.has(currentId)) continue
    visited.add(currentId)
    allConnected.push(currentId)

    // Get all neighbors (bidirectional)
    const neighbors = bidirectional.get(currentId) || []
    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        queue.push(neighborId)
      }
    }
  }

  return {
    allHighlighted: allConnected,
    groundPath: allConnected, // Use all connected as path for wire generation
    batteryPath: [],
    completeCircuit: allConnected
  }
}

/**
 * Get summary of path for display
 */
export function getPathSummary(highlightedIds: string[], ndjsonData: ParsedNDJSON): {
  hasGround: boolean
  hasBattery: boolean
  fuseCount: number
  relayCount: number
  connectorCount: number
  harnesses: string[]
} {
  let hasGround = false
  let hasBattery = false
  let fuseCount = 0
  let relayCount = 0
  let connectorCount = 0
  const harnesses: string[] = []

  for (const id of highlightedIds) {
    const node = ndjsonData.nodesById[id]
    if (!node) continue

    const nodeType = node.node_type?.toLowerCase() || ''

    if (nodeType.includes('ground')) hasGround = true
    if (nodeType.includes('battery') || nodeType.includes('batt')) hasBattery = true
    if (nodeType.includes('fuse')) fuseCount++
    if (nodeType.includes('relay')) relayCount++
    if (nodeType.includes('connector')) connectorCount++

    // Extract harness IDs
    if (id.startsWith('harness_')) {
      harnesses.push(id)
    }
  }

  return { hasGround, hasBattery, fuseCount, relayCount, connectorCount, harnesses }
}
