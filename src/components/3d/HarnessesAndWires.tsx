'use client'

import { useMemo, useEffect, useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useModelStore } from '@/stores/model-store'

interface SceneConfig {
  harnesses?: Record<string, {
    path: [number, number, number][]
    thickness: number
    bundleCount: number
  }>
  materials?: {
    wire?: { thickness: number }
    harness?: { thickness: number }
  }
}

// Harness materials based on location
const HARNESS_MATERIALS: Record<string, string> = {
  engine: '#FF4500',    // Orange
  dash: '#4169E1',      // Royal Blue
  floor: '#32CD32',     // Lime Green
  door_left: '#FFD700', // Gold
  door_right: '#FFD700', // Gold
  tailgate: '#FF6347'   // Tomato
}

export function HarnessesAndWires() {
  const { ndjsonData, selectedComponentId, highlightedComponentIds, modelRotation } = useModelStore()
  const [sceneConfig, setSceneConfig] = useState<SceneConfig | null>(null)
  const groupRef = useRef<THREE.Group>(null)
  const rotationGroupRef = useRef<THREE.Group>(null)

  // Load scene config
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/models/enhanced_scene.config.json')
        if (response.ok) {
          const config = await response.json()
          setSceneConfig(config)
          console.log('[HarnessesAndWires] Scene config loaded:', config)
        }
      } catch (error) {
        console.error('[HarnessesAndWires] Failed to load scene config:', error)
      }
    }
    loadConfig()
  }, [])

  // Build harness geometries from scene config
  const harnesses = useMemo(() => {
    if (!sceneConfig?.harnesses) return []

    const harnessData: Array<{
      id: string
      geometry: THREE.TubeGeometry
      color: string
    }> = []

    for (const [harnessId, data] of Object.entries(sceneConfig.harnesses)) {
      const { path, thickness } = data

      if (path && path.length > 1) {
        const points = path.map(p => new THREE.Vector3(p[0], p[1], p[2]))
        const curve = new THREE.CatmullRomCurve3(points)
        const geometry = new THREE.TubeGeometry(curve, 64, thickness / 2, 8, false)

        // Determine color based on harness ID
        let color = HARNESS_MATERIALS.engine
        if (harnessId.includes('dash')) color = HARNESS_MATERIALS.dash
        else if (harnessId.includes('floor')) color = HARNESS_MATERIALS.floor
        else if (harnessId.includes('Ldoor')) color = HARNESS_MATERIALS.door_left
        else if (harnessId.includes('Rdoor')) color = HARNESS_MATERIALS.door_right
        else if (harnessId.includes('tailgate')) color = HARNESS_MATERIALS.tailgate

        harnessData.push({ id: harnessId, geometry, color })
      }
    }

    console.log('[HarnessesAndWires] Built', harnessData.length, 'harnesses')
    return harnessData
  }, [sceneConfig])

  // Build wire connections from NDJSON edges AND generate missing wires for highlighted path
  const wires = useMemo(() => {
    if (!ndjsonData?.edges || !ndjsonData?.nodesById) return []

    console.log('[HarnessesAndWires] Rebuilding wires with', highlightedComponentIds.length, 'highlighted components')
    console.log('[HarnessesAndWires] Highlighted IDs:', highlightedComponentIds.slice(0, 10))
    console.log('[HarnessesAndWires] Total NDJSON edges:', ndjsonData.edges.length)

    const wireData: Array<{
      id: string
      points: [THREE.Vector3, THREE.Vector3]
      color: string
      isHighlighted: boolean
    }> = []

    let renderedCount = 0
    let skippedCount = 0

    // 1. Generate wires for ALL highlighted component pairs (comprehensive approach)
    if (highlightedComponentIds.length > 1) {
      console.log('[HarnessesAndWires] Generating wires for', highlightedComponentIds.length, 'highlighted components')

      // Build a set for quick lookup
      const highlightedSet = new Set(highlightedComponentIds)

      // Method A: Generate wires from NDJSON edges where BOTH nodes are highlighted
      ndjsonData.edges.forEach((edge: any) => {
        if (highlightedSet.has(edge.source) && highlightedSet.has(edge.target)) {
          const sourceNode = ndjsonData.nodesById[edge.source]
          const targetNode = ndjsonData.nodesById[edge.target]

          if (!sourceNode || !targetNode) return

          const sourcePos = sourceNode.anchor_xyz
          const targetPos = targetNode.anchor_xyz

          if (!sourcePos || !targetPos) return

          const points: [THREE.Vector3, THREE.Vector3] = [
            new THREE.Vector3(sourcePos[0], sourcePos[1], sourcePos[2]),
            new THREE.Vector3(targetPos[0], targetPos[1], targetPos[2])
          ]

          console.log('[HarnessesAndWires] Edge wire:', edge.source, '->', edge.target)

          wireData.push({
            id: `edge_wire_${edge.source}_${edge.target}`,
            points,
            color: '#8BE196',
            isHighlighted: true
          })

          renderedCount++
        }
      })

      // Method B: Generate direct wires between consecutive nodes in ordered path
      const orderedPath = (window as any).currentCircuitPath as string[] | undefined
      if (orderedPath && orderedPath.length > 1) {
        console.log('[HarnessesAndWires] Also generating path sequence wires for', orderedPath.length, 'nodes')

        for (let i = 0; i < orderedPath.length - 1; i++) {
          const sourceId = orderedPath[i]
          const targetId = orderedPath[i + 1]

          const sourceNode = ndjsonData.nodesById[sourceId]
          const targetNode = ndjsonData.nodesById[targetId]

          if (!sourceNode || !targetNode) continue

          const sourcePos = sourceNode.anchor_xyz
          const targetPos = targetNode.anchor_xyz

          if (!sourcePos || !targetPos) continue

          const points: [THREE.Vector3, THREE.Vector3] = [
            new THREE.Vector3(sourcePos[0], sourcePos[1], sourcePos[2]),
            new THREE.Vector3(targetPos[0], targetPos[1], targetPos[2])
          ]

          // Check if this wire already exists
          const wireId = `path_wire_${sourceId}_${targetId}`
          const edgeWireId = `edge_wire_${sourceId}_${targetId}`
          const exists = wireData.some(w => w.id === edgeWireId || w.id === wireId)

          if (!exists) {
            console.log('[HarnessesAndWires] Path wire:', sourceId, '->', targetId, 'distance:', points[0].distanceTo(points[1]).toFixed(3))

            wireData.push({
              id: wireId,
              points,
              color: '#8BE196',
              isHighlighted: true
            })

            renderedCount++
          }
        }
      }

      console.log('[HarnessesAndWires] Generated total', renderedCount, 'highlighted wires')
    }

    // 2. Render existing NDJSON edges (if they have positions)
    ndjsonData.edges.forEach((edge: any) => {
      const sourceNode = ndjsonData.nodesById[edge.source]
      const targetNode = ndjsonData.nodesById[edge.target]

      if (!sourceNode || !targetNode) {
        skippedCount++
        return
      }

      // Get positions - use anchor_xyz if available
      const sourcePos = sourceNode.anchor_xyz
      const targetPos = targetNode.anchor_xyz

      if (!sourcePos || !targetPos) {
        skippedCount++
        return
      }

      // Store wire points for tube/line rendering
      const points: [THREE.Vector3, THREE.Vector3] = [
        new THREE.Vector3(sourcePos[0], sourcePos[1], sourcePos[2]),
        new THREE.Vector3(targetPos[0], targetPos[1], targetPos[2])
      ]

      // Check if this wire connects two highlighted components
      const isHighlighted =
        highlightedComponentIds.includes(edge.source) &&
        highlightedComponentIds.includes(edge.target)

      // Debug: Log highlighted wires
      if (isHighlighted) {
        console.log('[HarnessesAndWires] Wire highlighted:', edge.source, '->', edge.target)
      }

      // Determine wire color based on edge properties or relationship
      let color = '#666666' // Default gray
      if (isHighlighted) {
        color = '#8BE196' // Accent mint green for highlighted path
      } else if (edge.wire_color) {
        color = edge.wire_color
      } else if (edge.color) {
        color = edge.color
      } else if (edge.relationship === 'power') {
        color = '#FF0000' // Red for power
      } else if (edge.relationship === 'ground') {
        color = '#000000' // Black for ground
      } else if (edge.relationship === 'signal') {
        color = '#00FF00' // Green for signal
      }

      wireData.push({
        id: `${edge.source}_${edge.target}_${renderedCount}`,
        points,
        color,
        isHighlighted
      })

      renderedCount++
    })

    console.log('[HarnessesAndWires] ===== WIRE SUMMARY =====')
    console.log('[HarnessesAndWires] Total wires rendered:', renderedCount)
    console.log('[HarnessesAndWires] Total wires skipped:', skippedCount)
    const highlightedCount = wireData.filter(w => w.isHighlighted).length
    console.log('[HarnessesAndWires] Highlighted wires:', highlightedCount)
    console.log('[HarnessesAndWires] Total wireData array length:', wireData.length)
    console.log('[HarnessesAndWires] First 3 wires:', wireData.slice(0, 3).map(w => ({
      id: w.id,
      highlighted: w.isHighlighted,
      color: w.color
    })))
    return wireData
  }, [ndjsonData, highlightedComponentIds])

  // Gentle left to right rolling animation (stops when component is selected)
  useFrame((state) => {
    if (groupRef.current && !selectedComponentId) {
      groupRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.1
    } else if (groupRef.current && selectedComponentId) {
      // Reset to center when component is selected
      groupRef.current.position.x = 0
      groupRef.current.rotation.z = 0
    }

    // Smoothly apply model rotation from store
    if (rotationGroupRef.current) {
      const targetRotation = new THREE.Euler(modelRotation.x, modelRotation.y, modelRotation.z)
      rotationGroupRef.current.rotation.x += (targetRotation.x - rotationGroupRef.current.rotation.x) * 0.1
      rotationGroupRef.current.rotation.y += (targetRotation.y - rotationGroupRef.current.rotation.y) * 0.1
      rotationGroupRef.current.rotation.z += (targetRotation.z - rotationGroupRef.current.rotation.z) * 0.1
    }
  })

  if (!sceneConfig && (!ndjsonData || !ndjsonData.edges)) {
    return null
  }

  return (
    <group ref={rotationGroupRef} name="harnesses-rotation-pivot">
      <group ref={groupRef} name="harnesses-and-wires" rotation={[Math.PI / 2, Math.PI, 0]}>
        {/* Harness bundles */}
        <group name="harnesses">
          {harnesses.map(harness => (
            <mesh
              key={harness.id}
              geometry={harness.geometry}
              castShadow
            >
              <meshLambertMaterial
                color={harness.color}
                transparent
                opacity={0.7}
              />
            </mesh>
          ))}
        </group>

        {/* Individual wires - use tubes for thickness */}
        <group name="wires">
          {wires.map((wire, index) => {
            // Calculate wire direction and length
            const start = wire.points[0]
            const end = wire.points[1]
            const direction = new THREE.Vector3().subVectors(end, start)
            const length = direction.length()

            if (index < 3) {
              console.log('[HarnessesAndWires] Rendering wire', index, ':', wire.id, 'highlighted:', wire.isHighlighted, 'length:', length.toFixed(3))
            }

            // Use tube geometry for thick visible wires
            if (wire.isHighlighted) {
              const curve = new THREE.LineCurve3(start, end)
              const tubeGeometry = new THREE.TubeGeometry(curve, 2, 0.015, 8, false) // 15mm thick tube

              if (index < 3) {
                console.log('[HarnessesAndWires] Creating THICK TUBE for wire', wire.id)
              }

              return (
                <mesh key={wire.id} geometry={tubeGeometry} castShadow>
                  <meshStandardMaterial
                    color={wire.color}
                    emissive={wire.color}
                    emissiveIntensity={0.6}
                    metalness={0.3}
                    roughness={0.4}
                  />
                </mesh>
              )
            } else {
              // Thin line for non-highlighted wires
              const lineGeometry = new THREE.BufferGeometry().setFromPoints(wire.points)
              return (
                <line key={wire.id} geometry={lineGeometry}>
                  <lineBasicMaterial
                    color={wire.color}
                    opacity={0.4}
                    transparent
                  />
                </line>
              )
            }
          })}
        </group>
      </group>
    </group>
  )
}
