import { describe, it, expect } from 'vitest'
import { traceElectricalPath, getPathSummary } from './electrical-path-tracer'
import { ParsedNDJSON, NDJSONNode, NDJSONEdge } from './ndjson-loader'

// Helper to create mock node with required 'kind' field
function createNode(id: string, node_type: string, name: string): NDJSONNode {
  return { kind: 'node', id, node_type, name }
}

// Helper to create mock edge with required 'kind' field
function createEdge(source: string, target: string): NDJSONEdge {
  return { kind: 'edge', source, target }
}

function createMockNDJSONData(
  nodes: NDJSONNode[],
  edges: NDJSONEdge[]
): ParsedNDJSON {
  const nodesById: Record<string, NDJSONNode> = {}
  const byZone: Record<string, string[]> = {}
  const byType: Record<string, string[]> = {}

  for (const node of nodes) {
    nodesById[node.id] = node

    // Index by zone if present
    if (node.anchor_zone) {
      if (!byZone[node.anchor_zone]) byZone[node.anchor_zone] = []
      byZone[node.anchor_zone].push(node.id)
    }

    // Index by type if present
    if (node.node_type) {
      if (!byType[node.node_type]) byType[node.node_type] = []
      byType[node.node_type].push(node.id)
    }
  }

  return {
    edges,
    nodesById,
    byZone,
    byType,
    metadata: null,
  }
}

describe('traceElectricalPath', () => {
  it('traces a simple linear path', () => {
    const nodes: NDJSONNode[] = [
      createNode('battery', 'battery', 'Battery'),
      createNode('fuse1', 'fuse', 'Main Fuse'),
      createNode('component', 'sensor', 'Sensor'),
      createNode('ground', 'ground', 'Ground'),
    ]

    const edges: NDJSONEdge[] = [
      createEdge('battery', 'fuse1'),
      createEdge('fuse1', 'component'),
      createEdge('component', 'ground'),
    ]

    const data = createMockNDJSONData(nodes, edges)
    const result = traceElectricalPath('component', data)

    expect(result.allHighlighted).toContain('component')
    expect(result.allHighlighted).toContain('fuse1')
    expect(result.allHighlighted).toContain('battery')
    expect(result.allHighlighted).toContain('ground')
  })

  it('handles branching circuits', () => {
    const nodes: NDJSONNode[] = [
      createNode('battery', 'battery', 'Battery'),
      createNode('junction', 'junction', 'Junction'),
      createNode('left_sensor', 'sensor', 'Left Sensor'),
      createNode('right_sensor', 'sensor', 'Right Sensor'),
      createNode('ground', 'ground', 'Ground'),
    ]

    const edges: NDJSONEdge[] = [
      createEdge('battery', 'junction'),
      createEdge('junction', 'left_sensor'),
      createEdge('junction', 'right_sensor'),
      createEdge('left_sensor', 'ground'),
      createEdge('right_sensor', 'ground'),
    ]

    const data = createMockNDJSONData(nodes, edges)
    const result = traceElectricalPath('junction', data)

    expect(result.allHighlighted).toContain('junction')
    expect(result.allHighlighted).toContain('battery')
    expect(result.allHighlighted).toContain('left_sensor')
    expect(result.allHighlighted).toContain('right_sensor')
    expect(result.allHighlighted).toContain('ground')
  })

  it('handles isolated component with no connections', () => {
    const nodes: NDJSONNode[] = [
      createNode('component', 'sensor', 'Isolated Sensor'),
      createNode('other', 'sensor', 'Other Sensor'),
    ]

    const edges: NDJSONEdge[] = []

    const data = createMockNDJSONData(nodes, edges)
    const result = traceElectricalPath('component', data)

    expect(result.allHighlighted).toContain('component')
    expect(result.allHighlighted.length).toBe(1)
  })

  it('traverses bidirectionally through edges', () => {
    const nodes: NDJSONNode[] = [
      createNode('a', 'connector', 'A'),
      createNode('b', 'connector', 'B'),
      createNode('c', 'connector', 'C'),
    ]

    const edges: NDJSONEdge[] = [
      createEdge('a', 'b'),
      createEdge('b', 'c'),
    ]

    const data = createMockNDJSONData(nodes, edges)

    // Start from middle - should find both ends
    const resultFromMiddle = traceElectricalPath('b', data)
    expect(resultFromMiddle.allHighlighted).toContain('a')
    expect(resultFromMiddle.allHighlighted).toContain('b')
    expect(resultFromMiddle.allHighlighted).toContain('c')

    // Start from end - should traverse backward
    const resultFromEnd = traceElectricalPath('c', data)
    expect(resultFromEnd.allHighlighted).toContain('a')
    expect(resultFromEnd.allHighlighted).toContain('b')
    expect(resultFromEnd.allHighlighted).toContain('c')
  })

  it('returns completeCircuit with all connected nodes', () => {
    const nodes: NDJSONNode[] = [
      createNode('battery', 'battery', 'Battery'),
      createNode('component', 'sensor', 'Sensor'),
      createNode('ground', 'ground', 'Ground'),
    ]

    const edges: NDJSONEdge[] = [
      createEdge('battery', 'component'),
      createEdge('component', 'ground'),
    ]

    const data = createMockNDJSONData(nodes, edges)
    const result = traceElectricalPath('component', data)

    expect(result.completeCircuit.length).toBe(3)
    expect(result.completeCircuit).toEqual(result.allHighlighted)
  })
})

describe('getPathSummary', () => {
  it('detects ground node in path', () => {
    const nodes: NDJSONNode[] = [
      createNode('component', 'sensor', 'Sensor'),
      createNode('ground1', 'ground_point', 'Ground'),
    ]

    const data = createMockNDJSONData(nodes, [])
    const summary = getPathSummary(['component', 'ground1'], data)

    expect(summary.hasGround).toBe(true)
    expect(summary.hasBattery).toBe(false)
  })

  it('detects battery node in path', () => {
    const nodes: NDJSONNode[] = [
      createNode('battery', 'battery_positive', 'Battery +'),
      createNode('component', 'sensor', 'Sensor'),
    ]

    const data = createMockNDJSONData(nodes, [])
    const summary = getPathSummary(['battery', 'component'], data)

    expect(summary.hasBattery).toBe(true)
    expect(summary.hasGround).toBe(false)
  })

  it('detects batt prefix for battery', () => {
    const nodes: NDJSONNode[] = [
      createNode('batt_pos', 'batt_terminal', 'Battery Terminal'),
    ]

    const data = createMockNDJSONData(nodes, [])
    const summary = getPathSummary(['batt_pos'], data)

    expect(summary.hasBattery).toBe(true)
  })

  it('counts fuses correctly', () => {
    const nodes: NDJSONNode[] = [
      createNode('fuse1', 'fuse_30A', '30A Fuse'),
      createNode('fuse2', 'fuse_15A', '15A Fuse'),
      createNode('component', 'sensor', 'Sensor'),
    ]

    const data = createMockNDJSONData(nodes, [])
    const summary = getPathSummary(['fuse1', 'fuse2', 'component'], data)

    expect(summary.fuseCount).toBe(2)
  })

  it('counts relays correctly', () => {
    const nodes: NDJSONNode[] = [
      createNode('relay1', 'relay_spdt', 'SPDT Relay'),
      createNode('relay2', 'relay_dpdt', 'DPDT Relay'),
    ]

    const data = createMockNDJSONData(nodes, [])
    const summary = getPathSummary(['relay1', 'relay2'], data)

    expect(summary.relayCount).toBe(2)
  })

  it('counts connectors correctly', () => {
    const nodes: NDJSONNode[] = [
      createNode('conn1', 'connector_2pin', '2-Pin Connector'),
      createNode('conn2', 'connector_4pin', '4-Pin Connector'),
      createNode('conn3', 'connector_8pin', '8-Pin Connector'),
    ]

    const data = createMockNDJSONData(nodes, [])
    const summary = getPathSummary(['conn1', 'conn2', 'conn3'], data)

    expect(summary.connectorCount).toBe(3)
  })

  it('extracts harness IDs', () => {
    const nodes: NDJSONNode[] = [
      createNode('harness_engine', 'harness', 'Engine Harness'),
      createNode('harness_body', 'harness', 'Body Harness'),
      createNode('component', 'sensor', 'Sensor'),
    ]

    const data = createMockNDJSONData(nodes, [])
    const summary = getPathSummary(['harness_engine', 'harness_body', 'component'], data)

    expect(summary.harnesses).toContain('harness_engine')
    expect(summary.harnesses).toContain('harness_body')
    expect(summary.harnesses.length).toBe(2)
  })

  it('handles missing nodes gracefully', () => {
    const nodes: NDJSONNode[] = [
      createNode('existing', 'sensor', 'Existing Sensor'),
    ]

    const data = createMockNDJSONData(nodes, [])
    const summary = getPathSummary(['existing', 'nonexistent'], data)

    expect(summary.fuseCount).toBe(0)
    expect(summary.relayCount).toBe(0)
    expect(summary.connectorCount).toBe(0)
  })

  it('handles empty path', () => {
    const data = createMockNDJSONData([], [])
    const summary = getPathSummary([], data)

    expect(summary.hasGround).toBe(false)
    expect(summary.hasBattery).toBe(false)
    expect(summary.fuseCount).toBe(0)
    expect(summary.relayCount).toBe(0)
    expect(summary.connectorCount).toBe(0)
    expect(summary.harnesses).toEqual([])
  })

  it('is case insensitive for node type matching', () => {
    const nodes: NDJSONNode[] = [
      createNode('ground1', 'GROUND_POINT', 'Ground'),
      createNode('battery1', 'BATTERY', 'Battery'),
      createNode('fuse1', 'FUSE', 'Fuse'),
      createNode('relay1', 'RELAY', 'Relay'),
      createNode('conn1', 'CONNECTOR', 'Connector'),
    ]

    const data = createMockNDJSONData(nodes, [])
    const summary = getPathSummary(['ground1', 'battery1', 'fuse1', 'relay1', 'conn1'], data)

    expect(summary.hasGround).toBe(true)
    expect(summary.hasBattery).toBe(true)
    expect(summary.fuseCount).toBe(1)
    expect(summary.relayCount).toBe(1)
    expect(summary.connectorCount).toBe(1)
  })
})
