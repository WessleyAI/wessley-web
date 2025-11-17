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
  const { ndjsonData, selectedComponentId, modelRotation } = useModelStore()
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

  // Build wire connections from NDJSON edges
  const wires = useMemo(() => {
    if (!ndjsonData?.edges || !ndjsonData?.nodesById) return []

    const wireData: Array<{
      id: string
      geometry: THREE.BufferGeometry
      color: string
    }> = []

    let renderedCount = 0
    let skippedCount = 0

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

      // Create line geometry for wire
      const points = [
        new THREE.Vector3(sourcePos[0], sourcePos[1], sourcePos[2]),
        new THREE.Vector3(targetPos[0], targetPos[1], targetPos[2])
      ]

      const geometry = new THREE.BufferGeometry().setFromPoints(points)

      // Determine wire color based on edge properties or relationship
      let color = '#666666' // Default gray
      if (edge.wire_color) color = edge.wire_color
      else if (edge.color) color = edge.color
      else if (edge.relationship === 'power') color = '#FF0000' // Red for power
      else if (edge.relationship === 'ground') color = '#000000' // Black for ground
      else if (edge.relationship === 'signal') color = '#00FF00' // Green for signal

      wireData.push({
        id: `${edge.source}_${edge.target}_${renderedCount}`,
        geometry,
        color
      })

      renderedCount++
    })

    console.log('[HarnessesAndWires] Rendered', renderedCount, 'wires, skipped', skippedCount)
    return wireData
  }, [ndjsonData])

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

        {/* Individual wires */}
        <group name="wires">
          {wires.map(wire => (
            <line key={wire.id} geometry={wire.geometry}>
              <lineBasicMaterial color={wire.color} linewidth={1} />
            </line>
          ))}
        </group>
      </group>
    </group>
  )
}
