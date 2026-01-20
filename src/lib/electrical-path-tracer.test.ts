import { describe, it, expect } from 'vitest'
import { traceElectricalPath, getPathSummary, TracedPaths } from './electrical-path-tracer'
import { ParsedNDJSON, NDJSONNode, NDJSONEdge } from './ndjson-loader'

function createMockNDJSONData(
  nodes: NDJSONNode[],
  edges: NDJSONEdge[]
): ParsedNDJSON {
  const nodesById: Record<string, NDJSONNode> = {}
  for (const node of nodes) {
    nodesById[node.id] = node
  }

  return {
    nodes,
    edges,
    nodesById,
    metadata: {},
  }
}

describe('traceElectricalPath', () => {
  it('traces a simple linear path', () => {
    const nodes: NDJSONNode[] = [
      { id: 'battery', node_type: 'battery', name: 'Battery' },
      { id: 'fuse1', node_type: 'fuse', name: 'Main Fuse' },
      { id: 'component', node_type: 'sensor', name: 'Sensor' },
      { id: 'ground', node_type: 'ground', name: 'Ground' },
    ]

    const edges: NDJSONEdge[] = [
      { source: 'battery', target: 'fuse1' },
      { source: 'fuse1', target: 'component' },
      { source: 'component', target: 'ground' },
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
      { id: 'battery', node_type: 'battery', name: 'Battery' },
      { id: 'junction', node_type: 'junction', name: 'Junction' },
      { id: 'left_sensor', node_type: 'sensor', name: 'Left Sensor' },
      { id: 'right_sensor', node_type: 'sensor', name: 'Right Sensor' },
      { id: 'ground', node_type: 'ground', name: 'Ground' },
    ]

    const edges: NDJSONEdge[] = [
      { source: 'battery', target: 'junction' },
      { source: 'junction', target: 'left_sensor' },
      { source: 'junction', target: 'right_sensor' },
      { source: 'left_sensor', target: 'ground' },
      { source: 'right_sensor', target: 'ground' },
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
      { id: 'component', node_type: 'sensor', name: 'Isolated Sensor' },
      { id: 'other', node_type: 'sensor', name: 'Other Sensor' },
    ]

    const edges: NDJSONEdge[] = []

    const data = createMockNDJSONData(nodes, edges)
    const result = traceElectricalPath('component', data)

    expect(result.allHighlighted).toContain('component')
    expect(result.allHighlighted.length).toBe(1)
  })

  it('traverses bidirectionally through edges', () => {
    const nodes: NDJSONNode[] = [
      { id: 'a', node_type: 'connector', name: 'A' },
      { id: 'b', node_type: 'connector', name: 'B' },
      { id: 'c', node_type: 'connector', name: 'C' },
    ]

    const edges: NDJSONEdge[] = [
      { source: 'a', target: 'b' },
      { source: 'b', target: 'c' },
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
      { id: 'battery', node_type: 'battery', name: 'Battery' },
      { id: 'component', node_type: 'sensor', name: 'Sensor' },
      { id: 'ground', node_type: 'ground', name: 'Ground' },
    ]

    const edges: NDJSONEdge[] = [
      { source: 'battery', target: 'component' },
      { source: 'component', target: 'ground' },
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
      { id: 'component', node_type: 'sensor', name: 'Sensor' },
      { id: 'ground1', node_type: 'ground_point', name: 'Ground' },
    ]

    const data = createMockNDJSONData(nodes, [])
    const summary = getPathSummary(['component', 'ground1'], data)

    expect(summary.hasGround).toBe(true)
    expect(summary.hasBattery).toBe(false)
  })

  it('detects battery node in path', () => {
    const nodes: NDJSONNode[] = [
      { id: 'battery', node_type: 'battery_positive', name: 'Battery +' },
      { id: 'component', node_type: 'sensor', name: 'Sensor' },
    ]

    const data = createMockNDJSONData(nodes, [])
    const summary = getPathSummary(['battery', 'component'], data)

    expect(summary.hasBattery).toBe(true)
    expect(summary.hasGround).toBe(false)
  })

  it('detects batt prefix for battery', () => {
    const nodes: NDJSONNode[] = [
      { id: 'batt_pos', node_type: 'batt_terminal', name: 'Battery Terminal' },
    ]

    const data = createMockNDJSONData(nodes, [])
    const summary = getPathSummary(['batt_pos'], data)

    expect(summary.hasBattery).toBe(true)
  })

  it('counts fuses correctly', () => {
    const nodes: NDJSONNode[] = [
      { id: 'fuse1', node_type: 'fuse_30A', name: '30A Fuse' },
      { id: 'fuse2', node_type: 'fuse_15A', name: '15A Fuse' },
      { id: 'component', node_type: 'sensor', name: 'Sensor' },
    ]

    const data = createMockNDJSONData(nodes, [])
    const summary = getPathSummary(['fuse1', 'fuse2', 'component'], data)

    expect(summary.fuseCount).toBe(2)
  })

  it('counts relays correctly', () => {
    const nodes: NDJSONNode[] = [
      { id: 'relay1', node_type: 'relay_spdt', name: 'SPDT Relay' },
      { id: 'relay2', node_type: 'relay_dpdt', name: 'DPDT Relay' },
    ]

    const data = createMockNDJSONData(nodes, [])
    const summary = getPathSummary(['relay1', 'relay2'], data)

    expect(summary.relayCount).toBe(2)
  })

  it('counts connectors correctly', () => {
    const nodes: NDJSONNode[] = [
      { id: 'conn1', node_type: 'connector_2pin', name: '2-Pin Connector' },
      { id: 'conn2', node_type: 'connector_4pin', name: '4-Pin Connector' },
      { id: 'conn3', node_type: 'connector_8pin', name: '8-Pin Connector' },
    ]

    const data = createMockNDJSONData(nodes, [])
    const summary = getPathSummary(['conn1', 'conn2', 'conn3'], data)

    expect(summary.connectorCount).toBe(3)
  })

  it('extracts harness IDs', () => {
    const nodes: NDJSONNode[] = [
      { id: 'harness_engine', node_type: 'harness', name: 'Engine Harness' },
      { id: 'harness_body', node_type: 'harness', name: 'Body Harness' },
      { id: 'component', node_type: 'sensor', name: 'Sensor' },
    ]

    const data = createMockNDJSONData(nodes, [])
    const summary = getPathSummary(['harness_engine', 'harness_body', 'component'], data)

    expect(summary.harnesses).toContain('harness_engine')
    expect(summary.harnesses).toContain('harness_body')
    expect(summary.harnesses.length).toBe(2)
  })

  it('handles missing nodes gracefully', () => {
    const nodes: NDJSONNode[] = [
      { id: 'existing', node_type: 'sensor', name: 'Existing Sensor' },
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
      { id: 'ground1', node_type: 'GROUND_POINT', name: 'Ground' },
      { id: 'battery1', node_type: 'BATTERY', name: 'Battery' },
      { id: 'fuse1', node_type: 'FUSE', name: 'Fuse' },
      { id: 'relay1', node_type: 'RELAY', name: 'Relay' },
      { id: 'conn1', node_type: 'CONNECTOR', name: 'Connector' },
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
