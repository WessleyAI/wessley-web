'use client'

import * as React from "react"
import { useRef, useEffect } from 'react'
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useModelStore, type VehicleComponent } from '@/stores/model-store'
import { loadNDJSON, getPositionedNodes, buildSceneGraphFromNDJSON, type NDJSONNode } from '@/lib/ndjson-loader'
import { ComponentMeshes } from './ComponentMeshes'
import { HarnessesAndWires } from './HarnessesAndWires'
import { DarkRoom } from './DarkRoom'

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
    metadata: node,
    faulty: false // Default to not faulty, can be changed via scene events
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

// Camera controller - smooth animation on click, stops when user touches controls
function CameraController() {
  const { cameraView } = useModelStore()
  const controlsRef = useRef<any>(null)
  const isAnimatingRef = useRef(false)
  const targetPositionRef = useRef(new THREE.Vector3(...cameraView.position))
  const targetLookAtRef = useRef(new THREE.Vector3(...cameraView.target))

  // When cameraView changes (component clicked), start smooth animation
  React.useEffect(() => {
    targetPositionRef.current.set(...cameraView.position)
    targetLookAtRef.current.set(...cameraView.target)
    isAnimatingRef.current = true
  }, [cameraView])

  // Smooth lerp animation
  useFrame(({ camera }) => {
    if (!controlsRef.current || !isAnimatingRef.current) return

    const positionDistance = camera.position.distanceTo(targetPositionRef.current)
    const targetDistance = controlsRef.current.target.distanceTo(targetLookAtRef.current)

    // Stop animating if close enough
    if (positionDistance < 0.01 && targetDistance < 0.01) {
      isAnimatingRef.current = false
      return
    }

    // Smooth lerp
    camera.position.lerp(targetPositionRef.current, 0.1)
    controlsRef.current.target.lerp(targetLookAtRef.current, 0.1)
    controlsRef.current.update()
  })

  // Stop animation when user touches controls
  const handleControlStart = () => {
    isAnimatingRef.current = false
  }

  return (
    <OrbitControls
      ref={controlsRef}
      target={[0, 0.5, 0]}
      enablePan={false}
      enableZoom={true}
      enableRotate={true}
      minDistance={1}
      maxDistance={8}
      minPolarAngle={Math.PI / 8}
      maxPolarAngle={Math.PI - Math.PI / 8}
      enableDamping={false}
      onStart={handleControlStart}
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
      {/* Dark room environment with reflective walls */}
      <DarkRoom />

      {/* Dark fog for depth without washing out the dark room */}
      <fog attach="fog" args={['#000000', 15, 30]} />

      {/* Dramatic lighting for depth */}
      <ambientLight intensity={0.05} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      {/* Strong rim lights for edge definition */}
      <pointLight position={[-6, 4, -6]} intensity={0.5} color="#ffffff" />
      <pointLight position={[6, 2, 6]} intensity={0.4} color="#cccccc" />
      <pointLight position={[0, -2, -8]} intensity={0.3} color="#666666" />

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

      {/* Production-ready post-processing - Bloom for volumetric light glow */}
      <EffectComposer>
        <Bloom
          intensity={2.0}
          luminanceThreshold={2.0}
          luminanceSmoothing={0.025}
          mipmapBlur
        />
      </EffectComposer>
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
        style={{
          background: 'radial-gradient(circle at center, #2a2a2a 0%, #000000 70%)',
          borderRadius: '0.5rem'
        }}
      >
        <Scene />
      </Canvas>

    </div>
  )
}