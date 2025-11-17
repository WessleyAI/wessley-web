'use client'

import * as React from "react"
import { useRef, useEffect } from 'react'
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { useModelStore, type VehicleComponent } from '@/stores/model-store'
import { loadNDJSON, getPositionedNodes, buildSceneGraphFromNDJSON, type NDJSONNode } from '@/lib/ndjson-loader'
import { ComponentMeshes } from './ComponentMeshes'
import { HarnessesAndWires } from './HarnessesAndWires'

// Helper function to classify component type based on node_type
function classifyComponentType(nodeType: string): 'fuse' | 'relay' | 'sensor' | 'connector' | 'wire' | 'module' | 'ground_point' | 'ground_plane' | 'bus' | 'splice' | 'pin' | 'other' {
  const lower = nodeType.toLowerCase()
  if (lower === 'fuse') return 'fuse'
  if (lower === 'relay') return 'relay'
  if (lower === 'sensor') return 'sensor'
  if (lower === 'connector' || lower === 'plug') return 'connector'
  if (lower === 'wire' || lower === 'cable') return 'wire'
  if (lower === 'module' || lower === 'ecu' || lower === 'control') return 'module'
  if (lower === 'ground_point') return 'ground_point'
  if (lower === 'ground_plane') return 'ground_plane'
  if (lower === 'bus') return 'bus'
  if (lower === 'splice') return 'splice'
  if (lower === 'pin') return 'pin'
  if (lower === 'component') return 'other' // Generic component
  return 'other'
}

// Convert NDJSON node to VehicleComponent
function ndjsonNodeToComponent(node: NDJSONNode): VehicleComponent | null {
  if (!node.anchor_xyz) return null // Skip nodes without positions

  return {
    id: node.id,
    name: node.canonical_id || node.id,
    type: classifyComponentType(node.node_type || 'other'),
    position: node.anchor_xyz as [number, number, number],
    description: node.code_id || undefined,
    specifications: {
      voltage: node.voltage,
      mounting_surface: node.mounting_surface,
      service_access: node.service_access,
      anchor_zone: node.anchor_zone,
      bbox_m: node.bbox_m
    },
    metadata: node
  }
}

// NDJSON Data Loader Component
function NDJSONLoader() {
  const { setComponents, setNDJSONData, setSceneGraph } = useModelStore()
  const hasLoaded = useRef(false)

  // Load NDJSON component data
  useEffect(() => {
    if (hasLoaded.current) return
    hasLoaded.current = true

    const loadComponentData = async () => {
      try {
        console.log('[ThreeScene] Loading enhanced NDJSON data...')
        const ndjsonData = await loadNDJSON('/models/enhanced_model.ndjson')
        console.log('[ThreeScene] NDJSON data loaded:', {
          nodes: Object.keys(ndjsonData.nodesById).length,
          edges: ndjsonData.edges.length,
          zones: Object.keys(ndjsonData.byZone).length
        })

        setNDJSONData(ndjsonData)

        // Build scene graph from NDJSON
        const sceneGraph = buildSceneGraphFromNDJSON(ndjsonData)
        console.log('[ThreeScene] Scene graph built:', sceneGraph)
        setSceneGraph(sceneGraph)

        // Convert positioned nodes to VehicleComponents
        const positionedNodes = getPositionedNodes(ndjsonData)
        const components: VehicleComponent[] = positionedNodes
          .map(ndjsonNodeToComponent)
          .filter((c): c is VehicleComponent => c !== null)

        console.log(`[ThreeScene] Extracted ${components.length} positioned components`)
        console.log('[ThreeScene] Sample components:', components.slice(0, 5))
        setComponents(components)
      } catch (error) {
        console.error('[ThreeScene] Failed to load NDJSON data:', error)
      }
    }

    loadComponentData()
  }, [setComponents, setNDJSONData, setSceneGraph])

  return null
}

// Camera controller that responds to store changes
function CameraController() {
  const { cameraView } = useModelStore()
  const controlsRef = useRef<any>(null)

  useFrame(({ camera }) => {
    if (controlsRef.current) {
      const { target, position } = cameraView
      const targetVector = new THREE.Vector3(...target)
      const positionVector = new THREE.Vector3(...position)

      // Smoothly move both camera and target
      camera.position.lerp(positionVector, 0.1)
      controlsRef.current.target.lerp(targetVector, 0.1)
      controlsRef.current.update()
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={1.5}
      maxDistance={20}
      minPolarAngle={0}
      maxPolarAngle={Math.PI / 2.2}
      target={cameraView.target}
    />
  )
}

// Main scene setup
function Scene() {
  const { cameraView, resetView } = useModelStore()

  // Handle clicking on empty space to deselect
  const handleCanvasClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.eventObject.type === 'Scene') {
      resetView()
    }
  }

  return (
    <>
      {/* Camera with store-controlled position */}
      <PerspectiveCamera
        makeDefault
        position={cameraView.position}
        fov={cameraView.fov || 60}
      />

      {/* Lighting setup */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#4a90e2" />

      {/* Environment for reflections */}
      <Environment preset="studio" background={false} />

      {/* Load NDJSON data */}
      <NDJSONLoader />

      {/* Harnesses and wires (from scene config + NDJSON edges) */}
      <HarnessesAndWires />

      {/* Interactive component meshes with animation */}
      <ComponentMeshes />

      {/* Smart camera controls */}
      <CameraController />
    </>
  )
}

export function ThreeScene() {

  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [2, 1.5, 2], fov: 60 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1
        }}
        style={{ background: '#1a1a1a', borderBottomLeftRadius: '10rem', borderBottomRightRadius: '10rem' }}
      >
        <Scene />
      </Canvas>

    </div>
  )
}