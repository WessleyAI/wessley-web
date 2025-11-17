'use client'

import * as React from "react"
import { useEffect, useRef } from 'react'
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber'
import { OrbitControls, Grid, Environment, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useModelStore, type VehicleComponent } from '@/stores/model-store'
import { loadNDJSON, getPositionedNodes, buildSceneGraphFromNDJSON, type NDJSONNode } from '@/lib/ndjson-loader'
import { ComponentMeshes } from './ComponentMeshes'
import { HarnessesAndWires } from './HarnessesAndWires'
import { DarkRoom } from './DarkRoom'
import { Chassis } from './Chassis'

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
        const ndjsonData = await loadNDJSON('/models/enhanced_model.ndjson')
        setNDJSONData(ndjsonData)

        const sceneGraph = buildSceneGraphFromNDJSON(ndjsonData)
        setSceneGraph(sceneGraph)

        const positionedNodes = getPositionedNodes(ndjsonData)
        const components: VehicleComponent[] = positionedNodes
          .map(ndjsonNodeToComponent)
          .filter((c): c is VehicleComponent => c !== null)

        setComponents(components)
        console.log('✅ Scene loaded:', components.length, 'components')
      } catch (error) {
        console.error('❌ Failed to load NDJSON data:', error)
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
      target={[0, 1.0, 0]}
      enablePan={false}
      enableZoom={true}
      enableRotate={true}
      minDistance={2}
      maxDistance={8}
      minPolarAngle={Math.PI / 4}
      maxPolarAngle={Math.PI * 2 / 3}
      enableDamping={false}
      onStart={handleControlStart}
    />
  )
}

// Simplified scene setup for chat interface
function ChatSceneContent() {
  const { resetView } = useModelStore()

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

      {/* Minimal lighting - only enough to see shapes */}
      <ambientLight intensity={0.01} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.2}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      />
      {/* Minimal rim lights */}
      <pointLight position={[-6, 4, -6]} intensity={0.1} color="#ffffff" />
      <pointLight position={[6, 2, 6]} intensity={0.1} color="#cccccc" />
      <pointLight position={[0, -2, -8]} intensity={0.05} color="#666666" />

      {/* Ground Grid */}
      <Grid
        position={[0, 0, 0]}
        args={[50, 50]}
        cellSize={2}
        cellThickness={0.8}
        cellColor="#555"
        sectionSize={10}
        sectionThickness={1.5}
        sectionColor="#777"
        fadeDistance={100}
        fadeStrength={1}
        infiniteGrid={true}
      />

      {/* Load NDJSON data */}
      <NDJSONLoader />

      {/* Vehicle chassis frame */}
      <Chassis />

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
          luminanceThreshold={5.0}
          luminanceSmoothing={0.025}
          mipmapBlur
        />
      </EffectComposer>
    </>
  )
}

interface ChatSceneProps {
  isExtended?: boolean
}

export function ChatScene({ isExtended = false }: ChatSceneProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [2, 1.5, 2], fov: 50 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
        style={{
          background: 'radial-gradient(circle at center, #2a2a2a 0%, #000000 70%)',
          borderRadius: '8px'
        }}
      >
        <ChatSceneContent />
      </Canvas>
    </div>
  )
}