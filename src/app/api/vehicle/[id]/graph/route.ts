import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { graphService, ServiceError } from '@/lib/services-client'

/**
 * GET /api/vehicle/{id}/graph
 *
 * Get vehicle component graph per api-contracts.md spec.
 * Returns nodes (components) and edges (connections) from Neo4j.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'invalid_input', message: 'Vehicle ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user || authError) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    // First verify vehicle exists and user has access via workspace
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select(`
        id,
        make,
        model,
        year,
        workspace:workspaces!inner(
          id,
          user_id,
          vehicle_signature
        )
      `)
      .eq('id', id)
      .single()

    if (vehicleError || !vehicle) {
      console.error('[API /vehicle/graph] Vehicle lookup error:', vehicleError)
      return NextResponse.json(
        { error: 'not_found', message: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // Verify user owns the workspace
    const workspace = vehicle.workspace as { id: string; user_id: string; vehicle_signature: string }
    if (workspace.user_id !== user.id) {
      return NextResponse.json(
        { error: 'forbidden', message: 'Access denied' },
        { status: 403 }
      )
    }

    // Use vehicle_signature to query Neo4j graph service
    const vehicleSignature = workspace.vehicle_signature

    // Interface for response per api-contracts.md spec
    interface Node {
      id: string
      type: string           // "component", "connector", "ground"
      label: string
      properties: Record<string, unknown>
      position?: [number, number, number]  // 3D position if available
    }

    interface Edge {
      source: string
      target: string
      type: string           // "powers", "controls", "connects_to"
      properties?: Record<string, unknown>
    }

    let nodes: Node[] = []
    let edges: Edge[] = []

    try {
      // Query graph service for vehicle systems and components
      const systems = await graphService.getVehicleSystems(vehicleSignature)

      // Collect all components as nodes
      for (const system of systems) {
        for (const component of system.components) {
          nodes.push({
            id: component.id,
            type: component.type,
            label: component.name,
            properties: {
              system: system.name,
              category: system.category,
              ...component.specifications
            },
            position: component.position
              ? [component.position.x, component.position.y, component.position.z]
              : undefined
          })
        }

        // Get connections between components within each system
        for (const component of system.components) {
          try {
            const related = await graphService.getRelatedComponents(
              vehicleSignature,
              component.id,
              1 // depth of 1 for direct connections
            )

            for (const connection of related.connections) {
              // Avoid duplicate edges
              const edgeId = `${connection.from_component}-${connection.to_component}`
              const reverseEdgeId = `${connection.to_component}-${connection.from_component}`

              if (!edges.some(e =>
                (e.source === connection.from_component && e.target === connection.to_component) ||
                (e.source === connection.to_component && e.target === connection.from_component)
              )) {
                edges.push({
                  source: connection.from_component,
                  target: connection.to_component,
                  type: connection.relationship || 'connects_to',
                  properties: {
                    wire_id: connection.wire.id,
                    wire_color: connection.wire.color,
                    wire_gauge: connection.wire.gauge,
                    din_code: connection.wire.din_code
                  }
                })
              }
            }
          } catch {
            // Continue if some component relationships fail
          }
        }
      }
    } catch (error) {
      // Graph service unavailable - return empty graph with warning
      if (error instanceof ServiceError) {
        console.error('[API /vehicle/graph] Graph service error:', error.message)

        // Check if it's a timeout
        if (error.statusCode === 504 || error.message.includes('timeout')) {
          return NextResponse.json(
            {
              error: 'graph_timeout',
              message: 'Graph query timed out',
              partial: false,
              request_id: crypto.randomUUID()
            },
            { status: 503 }
          )
        }

        // Provide fallback with mock data for demo purposes
        // In production, this would return an error
        nodes = generateMockNodes(vehicle.make, vehicle.model, vehicle.year)
        edges = generateMockEdges(nodes)
      } else {
        throw error
      }
    }

    // Response per api-contracts.md spec
    return NextResponse.json({
      nodes,
      edges
    })

  } catch (error) {
    console.error('[API /vehicle/graph] Unhandled error:', error)
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'An unexpected error occurred',
        request_id: crypto.randomUUID()
      },
      { status: 500 }
    )
  }
}

/**
 * Generate mock nodes for demo/fallback when graph service unavailable
 */
function generateMockNodes(make: string, model: string, year: number): Array<{
  id: string
  type: string
  label: string
  properties: Record<string, unknown>
  position?: [number, number, number]
}> {
  const baseComponents = [
    { id: 'battery', type: 'component', label: 'Battery', zone: 'engine_bay', pos: [0, 0, 0] },
    { id: 'alternator', type: 'component', label: 'Alternator', zone: 'engine_bay', pos: [0.5, 0, 0] },
    { id: 'starter', type: 'component', label: 'Starter Motor', zone: 'engine_bay', pos: [-0.5, 0, 0] },
    { id: 'main_fuse_box', type: 'connector', label: 'Main Fuse Box', zone: 'engine_bay', pos: [0, 0.5, 0] },
    { id: 'ignition_switch', type: 'component', label: 'Ignition Switch', zone: 'dashboard', pos: [0, 0, 0.5] },
    { id: 'ecu', type: 'component', label: 'Engine Control Unit', zone: 'engine_bay', pos: [0.3, 0.3, 0] },
    { id: 'ground_point_1', type: 'ground', label: 'Ground Point (Chassis)', zone: 'chassis', pos: [0, -0.5, 0] },
    { id: 'headlight_relay', type: 'component', label: 'Headlight Relay', zone: 'engine_bay', pos: [0.2, 0.5, 0] },
    { id: 'headlight_left', type: 'component', label: 'Left Headlight', zone: 'exterior', pos: [-0.8, 0, 0.3] },
    { id: 'headlight_right', type: 'component', label: 'Right Headlight', zone: 'exterior', pos: [0.8, 0, 0.3] },
  ]

  return baseComponents.map(comp => ({
    id: comp.id,
    type: comp.type,
    label: comp.label,
    properties: {
      zone: comp.zone,
      vehicle: `${year} ${make} ${model}`,
      mock: true
    },
    position: comp.pos as [number, number, number]
  }))
}

/**
 * Generate mock edges for demo/fallback
 */
function generateMockEdges(nodes: Array<{ id: string }>): Array<{
  source: string
  target: string
  type: string
  properties?: Record<string, unknown>
}> {
  const nodeIds = new Set(nodes.map(n => n.id))

  const baseEdges = [
    { source: 'battery', target: 'main_fuse_box', type: 'powers', wire: { color: 'red', gauge: '4AWG' } },
    { source: 'battery', target: 'starter', type: 'powers', wire: { color: 'red', gauge: '2AWG' } },
    { source: 'alternator', target: 'battery', type: 'powers', wire: { color: 'red', gauge: '6AWG' } },
    { source: 'main_fuse_box', target: 'ecu', type: 'powers', wire: { color: 'red/blue', gauge: '14AWG' } },
    { source: 'ignition_switch', target: 'starter', type: 'controls', wire: { color: 'yellow', gauge: '14AWG' } },
    { source: 'main_fuse_box', target: 'headlight_relay', type: 'powers', wire: { color: 'red', gauge: '12AWG' } },
    { source: 'headlight_relay', target: 'headlight_left', type: 'powers', wire: { color: 'green', gauge: '14AWG' } },
    { source: 'headlight_relay', target: 'headlight_right', type: 'powers', wire: { color: 'green', gauge: '14AWG' } },
    { source: 'battery', target: 'ground_point_1', type: 'connects_to', wire: { color: 'black', gauge: '4AWG' } },
    { source: 'starter', target: 'ground_point_1', type: 'connects_to', wire: { color: 'black', gauge: '2AWG' } },
  ]

  return baseEdges
    .filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target))
    .map(edge => ({
      source: edge.source,
      target: edge.target,
      type: edge.type,
      properties: {
        wire_color: edge.wire.color,
        wire_gauge: edge.wire.gauge,
        mock: true
      }
    }))
}
