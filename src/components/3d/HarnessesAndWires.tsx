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
  engine: '#FF4500',    // Orange - Engine bay
  battery: '#DC143C',   // Crimson - Battery harness
  dash: '#4169E1',      // Royal Blue - Dashboard
  floor: '#32CD32',     // Lime Green - Floor/body
  door_left: '#FFD700', // Gold - Left door
  door_right: '#FFD700', // Gold - Right door
  tailgate: '#FF6347',  // Tomato - Tailgate
  roof: '#9370DB',      // Medium Purple - Roof
  fuel: '#FF1493',      // Deep Pink - Fuel tank
  trans: '#8B4513'      // Saddle Brown - Transmission
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
        }
      } catch (error) {
        console.error('❌ Failed to load scene config:', error)
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
        // Make harnesses THICKER and more visible
        const geometry = new THREE.TubeGeometry(curve, 64, thickness, 16, false)

        // Determine color based on harness ID
        let color = HARNESS_MATERIALS.engine // Default

        if (harnessId.includes('battery')) color = HARNESS_MATERIALS.battery
        else if (harnessId.includes('dash')) color = HARNESS_MATERIALS.dash
        else if (harnessId.includes('floor')) color = HARNESS_MATERIALS.floor
        else if (harnessId.includes('Ldoor')) color = HARNESS_MATERIALS.door_left
        else if (harnessId.includes('Rdoor')) color = HARNESS_MATERIALS.door_right
        else if (harnessId.includes('tailgate')) color = HARNESS_MATERIALS.tailgate
        else if (harnessId.includes('roof')) color = HARNESS_MATERIALS.roof
        else if (harnessId.includes('fuel')) color = HARNESS_MATERIALS.fuel
        else if (harnessId.includes('trans')) color = HARNESS_MATERIALS.trans
        else if (harnessId.includes('engine')) color = HARNESS_MATERIALS.engine

        console.log('🔌 Harness:', harnessId, 'at', points[0], 'color:', color)

        harnessData.push({ id: harnessId, geometry, color })
      }
    }

    console.log('✅ Built', harnessData.length, 'harnesses')
    return harnessData
  }, [sceneConfig])

  // Build wire connections from NDJSON edges - render ALL electrical connections
  const wires = useMemo(() => {
    if (!ndjsonData?.edges || !ndjsonData?.nodesById) return []

    const wireData: Array<{
      id: string
      points: [THREE.Vector3, THREE.Vector3]
      color: string
      isHighlighted: boolean
      thickness?: number
      opacity?: number
    }> = []

    let renderedCount = 0
    let skippedCount = 0
    let highlightedWireCount = 0

    // Build a set for quick highlight lookup
    const highlightedSet = new Set(highlightedComponentIds)

    // Render ALL electrical NDJSON edges as visible wires - COMPLETE ELECTRICAL SYSTEM
    const electricalRelationships = [
      'pin_to_wire',
      'wire_to_fuse',
      'wire_to_relay',
      'wire_to_ground',
      'wire_to_splice',
      'has_pin',
      'has_connector',
      'ground_to_plane' // Add ground plane connections for REALISM
    ]

    ndjsonData.edges.forEach((edge: any) => {
      // Skip non-electrical relationships
      if (!electricalRelationships.includes(edge.relationship)) {
        skippedCount++
        return
      }

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

      // Determine wire color based on relationship and highlight state
      // REALISTIC WIRE COLORS based on automotive electrical standards
      let color = '#666666' // Default gray
      let thickness = 0.006 // Default 6mm - MORE VISIBLE
      let opacity = 0.7 // MUCH MORE VISIBLE by default (was 0.15)

      if (isHighlighted) {
        color = '#8BE196' // Accent mint green for highlighted path
        thickness = 0.018 // 18mm thick for highlighted - MAXIMUM visibility
        opacity = 1.0 // Full opacity for highlighted
      } else if (edge.relationship === 'wire_to_fuse') {
        color = '#FF0000' // BRIGHT RED for fuse power wires (hot)
        thickness = 0.010 // 10mm - thick power wire
        opacity = 0.85
      } else if (edge.relationship === 'pin_to_wire') {
        color = '#FFD700' // GOLD for pin connections
        thickness = 0.005 // 5mm
        opacity = 0.75
      } else if (edge.relationship === 'wire_to_ground' || edge.relationship === 'ground_to_plane') {
        color = '#000000' // BLACK for ground (automotive standard)
        thickness = 0.009 // 9mm thick ground wire
        opacity = 0.8
      } else if (edge.relationship === 'wire_to_relay') {
        color = '#FF6600' // ORANGE for relay control signals
        thickness = 0.007 // 7mm
        opacity = 0.75
      } else if (edge.relationship === 'has_connector') {
        color = '#00FF00' // GREEN for component-to-connector
        thickness = 0.008 // 8mm
        opacity = 0.7
      } else if (edge.relationship === 'has_pin') {
        color = '#00BFFF' // DEEP SKY BLUE for connector-to-pin
        thickness = 0.004 // 4mm
        opacity = 0.7
      } else if (edge.relationship === 'wire_to_splice') {
        color = '#FFFF00' // YELLOW for splice points
        thickness = 0.006 // 6mm
        opacity = 0.75
      }

      // Store opacity for rendering
      wireData.push({
        id: `${edge.source}_${edge.target}_${renderedCount}`,
        points,
        color,
        isHighlighted,
        thickness,
        opacity // Pass opacity through for REALISTIC visibility
      })

      if (isHighlighted) highlightedWireCount++
      renderedCount++
    })

    // Log comprehensive wire statistics
    console.log('⚡ ELECTRICAL SYSTEM:', {
      totalWires: wireData.length,
      highlightedWires: highlightedWireCount,
      skipped: skippedCount,
      relationships: {
        'wire_to_fuse': wireData.filter(w => w.color === '#FF0000' && !w.isHighlighted).length,
        'wire_to_ground': wireData.filter(w => w.color === '#000000' && !w.isHighlighted).length,
        'has_connector': wireData.filter(w => w.color === '#00FF00' && !w.isHighlighted).length,
        'has_pin': wireData.filter(w => w.color === '#00BFFF' && !w.isHighlighted).length,
        'pin_to_wire': wireData.filter(w => w.color === '#FFD700' && !w.isHighlighted).length,
        'wire_to_relay': wireData.filter(w => w.color === '#FF6600' && !w.isHighlighted).length,
        'wire_to_splice': wireData.filter(w => w.color === '#FFFF00' && !w.isHighlighted).length
      }
    })

    return wireData
  }, [ndjsonData, highlightedComponentIds])

  // NO ANIMATIONS - model stays still

  if (!sceneConfig && (!ndjsonData || !ndjsonData.edges)) {
    return null
  }

  return (
    <group ref={rotationGroupRef} name="harnesses-rotation-pivot">
      <group ref={groupRef} name="harnesses-and-wires" rotation={[-Math.PI / 2, 0, 0]}>
        {/* Harness bundles - thick visible tubes */}
        <group name="harnesses">
          {harnesses.map(harness => (
            <mesh
              key={harness.id}
              geometry={harness.geometry}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color={harness.color}
                emissive={harness.color}
                emissiveIntensity={0.05}
                metalness={0.3}
                roughness={0.5}
                opacity={1}
                transparent={false}
              />
            </mesh>
          ))}
        </group>

        {/* Individual wires - use tubes for thickness */}
        <group name="wires">
          {wires.map((wire) => {
            // Use tube geometry for ALL wires (visible electrical system)
            const curve = new THREE.LineCurve3(wire.points[0], wire.points[1])
            const radius = wire.thickness || 0.004 // Default 4mm (matches base thickness)
            // SMOOTHER tubes: increase tubular segments (2→8) and radial segments (8→12) for REALISM
            const tubeGeometry = new THREE.TubeGeometry(curve, 8, radius, 12, false)

            return (
              <mesh key={wire.id} geometry={tubeGeometry} castShadow receiveShadow>
                <meshStandardMaterial
                  color={wire.color}
                  emissive={wire.isHighlighted ? wire.color : '#000000'}
                  emissiveIntensity={wire.isHighlighted ? 0.6 : 0.2}
                  metalness={wire.isHighlighted ? 0.3 : 0.5}
                  roughness={wire.isHighlighted ? 0.4 : 0.6}
                  opacity={wire.opacity || 0.7}
                  transparent={true}
                />
              </mesh>
            )
          })}
        </group>
      </group>
    </group>
  )
}
